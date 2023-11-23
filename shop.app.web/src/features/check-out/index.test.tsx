import '@testing-library/jest-dom';
import { render, screen, cleanup, within, fireEvent, waitFor } from '@testing-library/react';
import CheckOut from '.';
import { Provider } from 'react-redux';
import { randomUUID } from 'crypto';
import { addToCart } from '../../app/reducers/shoppingCartReducer';
import { buildStore } from '../../app/store';
import { ShoppingCartItem } from '../../model';

jest.mock('../../services/catalog-service', () => ({
  getProductsAsync: jest.fn().mockResolvedValue([]),
  getCategoriesAsync: jest.fn().mockResolvedValue([]),
}));

// Avoid loading store from the local storage
jest.mock('../../app/persistance/local-storage');

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

describe('<CheckOut />', () => {
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

    it('should be on the first step of the checkout', async () => {});

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
  });
});
