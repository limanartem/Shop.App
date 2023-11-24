/* eslint-disable testing-library/no-node-access */
import '@testing-library/jest-dom';
import { render, screen, cleanup, within, fireEvent, waitFor } from '@testing-library/react';
import CheckOut from '.';
import { Provider } from 'react-redux';
import { randomUUID } from 'crypto';
import { addToCart } from '../../app/reducers/shoppingCartReducer';
import { buildStore } from '../../app/store';
import { ShoppingCartItem } from '../../model';
import { FlowStep } from '../../app/reducers/checkOutReducer';
import { DateTime } from 'luxon';
import { createOrdersAsync } from '../../services/order-service';

jest.mock('../../services/catalog-service', () => ({
  getProductsAsync: jest.fn().mockResolvedValue([]),
  getCategoriesAsync: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../services/order-service', () => ({
  createOrdersAsync: jest.fn().mockResolvedValue([]),
}));

// Avoid loading store from the local storage
jest.mock('../../app/persistance/local-storage');
jest.mock('react-router-dom');

const assertTotal = async (containerElement: HTMLElement, itemsInCart: ShoppingCartItem[]) => {
  // eslint-disable-next-line testing-library/no-node-access
  const totalElement = (await within(containerElement).findByText(/Total:/i)).closest('p')!;
  expect(totalElement).toBeInTheDocument();
  console.log(totalElement.textContent);
  let [, total] = totalElement.textContent!.split(':');
  total = total?.trim().split(' ')[0];
  expect(total).toBeDefined();
  expect(total).toBe(
    itemsInCart.reduce((acc, item) => acc + item.product.price * item.quantity, 0).toFixed(2),
  );
};

describe('Feature Checkout', () => {
  let store: ReturnType<typeof buildStore>;

  beforeEach(async () => {
    store = buildStore();
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('should contain main elements', async () => {
    render(
      <Provider store={store}>
        <CheckOut />
      </Provider>,
    );
    await expect(await screen.findByTestId('feature-checkout')).toBeInTheDocument();
  });

  describe('when no items added to cart', () => {
    it('should render empty cart', async () => {
      render(
        <Provider store={store}>
          <CheckOut />
        </Provider>,
      );
      await expect(await screen.findByText('The Cart is Empty')).toBeInTheDocument();
    });
  });

  describe('when items added to shopping cart', () => {
    const itemsInCart = [...Array(5).keys()].map((n) => ({
      product: {
        id: randomUUID(),
        title: `Product ${n + 1}`,
        description: `Product description ${n + 1}`,
        price: (n + 1) * (Math.round(Math.random() * 10000) / 100) || 1,
        currency: 'USD',
      },
      quantity: Math.round(Math.random() * 5 * (n + 1)) || 1,
    }));

    beforeEach(() => {
      itemsInCart.forEach((i) => store.dispatch(addToCart(i)));
    });

    it('should show items in the cart and total', async () => {
      render(
        <Provider store={store}>
          <CheckOut />
        </Provider>,
      );

      const stepElement = await screen.findByTestId('checkoutStep-confirmItems');
      expect(stepElement).toBeInTheDocument();
      const productsList = await within(stepElement).findByTestId('list-products');
      await expect(productsList).toBeInTheDocument();

      await Promise.allSettled(
        itemsInCart.map(async (item) => {
          const expectedProductId = item.product.id;
          const productItem = await within(productsList).findByTestId(
            `product-${expectedProductId}`,
          );
          await expect(productItem).toBeInTheDocument();
        }),
      );

      await assertTotal(stepElement, itemsInCart);
    });

    it('should be able to remove item from the cart during checkout and total is recalculated', async () => {
      render(
        <Provider store={store}>
          <CheckOut />
        </Provider>,
      );

      const productsList = await screen.findByTestId('list-products');

      const itemToRemove = itemsInCart[0];
      const productItemElement = await within(productsList).findByTestId(
        `product-${itemToRemove.product.id}`,
      );
      const removeFromCartButton = await within(productItemElement).findByRole('button', {
        name: /remove/i,
      });
      expect(removeFromCartButton).toBeInTheDocument();

      expect(
        fireEvent(
          removeFromCartButton,
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
          }),
        ),
      ).toBeTruthy();

      await waitFor(async () => {
        expect(store.getState().shoppingCart.items.length).toEqual(itemsInCart.length - 1);
      });
      await waitFor(() => {
        expect(
          store.getState().shoppingCart.items.find((i) => i.product.id === itemToRemove.product.id),
        ).toBeUndefined();
      });
      await waitFor(
        async () => {
          await expect(
            within(productsList).findByTestId(`product-${itemToRemove.product.id}`),
          ).rejects.toThrow();
        },
        {
          timeout: 2000,
        },
      );
      await waitFor(async () => {
        const stepElement = await screen.findByTestId('checkoutStep-confirmItems');
        await assertTotal(stepElement, store.getState().shoppingCart.items);
      });
    });

    describe('checkout flow', () => {
      const submit = async (currentStep: FlowStep) => {
        const stepElement = await screen.findByTestId(`checkoutStep-${currentStep}`);
        const proceedButton = (
          await within(stepElement).findAllByRole<HTMLButtonElement>('button')
        ).find((b) => b.type === 'submit');
        expect(proceedButton).toBeInTheDocument();
        expect(proceedButton).toBeEnabled();
        fireEvent.submit(proceedButton!);
        return { stepElement, proceedButton };
      };

      const proceedToStep = async (fromStep: FlowStep, toStep?: FlowStep) => {
        await submit(fromStep);

        await waitFor(() => {
          expect(store.getState().checkout.flowStep).toEqual(toStep);
        });

        await waitFor(async () => {
          const stepElement = await screen.findByTestId(`checkoutStep-${toStep}`);
          expect(stepElement).toBeInTheDocument();
        });
      };
      const proceedToShipping = async () => proceedToStep('confirmItems', 'shipping');
      const proceedToPayment = async () => proceedToStep('shipping', 'payment');
      const proceedToReview = async () => proceedToStep('payment', 'review');

      const setInputValue = (input: HTMLInputElement, value: string) => {
        fireEvent.change(input, {
          target: {
            value,
          },
        });
      };
      const formInputs = (container: HTMLElement) => {
        const result: Map<string, HTMLInputElement> = new Map();

        container.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
          if (input.type !== 'text') return;
          result.set(input.name, input);
        });

        return result;
      };

      const fillInShipping = async () => {
        const stepElement = await screen.findByTestId('checkoutStep-shipping');

        formInputs(stepElement).forEach((input, name) => {
          const value = name === 'zip' ? '12345' : 'Test';
          setInputValue(input, value);
        });
      };

      const fillInPayment = async () => {
        const stepElement = await screen.findByTestId('checkoutStep-payment');
        const { number, cvc, expire, name } = Object.fromEntries(formInputs(stepElement));
        setInputValue(number, '378282246310005');
        setInputValue(cvc, '123');
        setInputValue(expire, DateTime.now().plus({ months: 1 }).toJSDate().toString());
        setInputValue(name, 'Test');
      };

      it('can proceed to shipping step', async () => {
        render(
          <Provider store={store}>
            <CheckOut />
          </Provider>,
        );

        await proceedToShipping();
      });

      it('should require filling in shipping details before proceeding to payment', async () => {
        render(
          <Provider store={store}>
            <CheckOut />
          </Provider>,
        );

        await proceedToShipping();
        await expect(proceedToPayment()).rejects.toThrow();
      });

      it('should allow proceeding to payment when details are filled', async () => {
        render(
          <Provider store={store}>
            <CheckOut />
          </Provider>,
        );

        await proceedToShipping();
        await fillInShipping();
        await proceedToPayment();
      });

      it('should not allow proceeding to review when payment details are not filled', async () => {
        render(
          <Provider store={store}>
            <CheckOut />
          </Provider>,
        );

        await proceedToShipping();
        await fillInShipping();
        await proceedToPayment();
        await expect(proceedToReview()).rejects.toThrow();
      });

      it('should allow proceeding to review when payment details are filled', async () => {
        render(
          <Provider store={store}>
            <CheckOut />
          </Provider>,
        );

        await proceedToShipping();
        await fillInShipping();
        await proceedToPayment();
        await fillInPayment();
        await proceedToReview();
      });

      it('if checkout successfully complete should show message', async () => {
        render(
          <Provider store={store}>
            <CheckOut />
          </Provider>,
        );

        await proceedToShipping();
        await fillInShipping();
        await proceedToPayment();
        await fillInPayment();
        await proceedToReview();
        (createOrdersAsync as jest.Mock).mockResolvedValue({ id: randomUUID() });
        const { stepElement } = await submit('review');
        await waitFor(() => expect(createOrdersAsync).toHaveBeenCalled());
        const successText = await within(stepElement).findByText(
          'Order has been successfully placed and is being processed!', {
            exact: false,
          }
        );
        expect(successText).toBeInTheDocument();
      });
    });
  });
});
