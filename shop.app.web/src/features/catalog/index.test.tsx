import '@testing-library/jest-dom';
import { render, screen, cleanup, within, fireEvent, waitFor } from '@testing-library/react';
import Catalog from '.';
import { Provider } from 'react-redux';
import { getProductsAsync } from '../../services/catalog-service';
import { randomUUID } from 'crypto';
import { buildStore } from '../../app/store';

jest.mock('../../services/catalog-service', () => ({
  getProductsAsync: jest.fn().mockResolvedValue([]),
  getCategoriesAsync: jest.fn().mockResolvedValue([]),
}));

// Avoid loading store from the local storage
jest.mock('../../app/persistance/local-storage');

const setSelectValue = async (container: HTMLElement, selectTestId: string, valueToSet: string) => {
  const selectElement = await within(container).findByTestId(selectTestId);
  expect(selectElement).toBeInTheDocument();
  const selectInputValue = (await within(selectElement).findByTestId(
    `${selectTestId}-input`,
  )) as HTMLInputElement;
  const selectButton = await within(selectElement).findByRole('combobox');
  fireEvent.mouseDown(selectButton);
  const listbox = await within(await screen.findByRole('presentation')).findByRole('listbox');
  const options = within(listbox).getAllByRole('option');
  const option = options.find((o) => o.getAttribute('data-value') === valueToSet);
  expect(option).not.toBeUndefined();
  fireEvent.click(option!);
  await waitFor(() => selectInputValue.value === valueToSet);
};

describe('<Catalog />', () => {
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
        <Catalog />
      </Provider>,
    );
    await expect(await screen.findByTestId('feature-catalog')).toBeInTheDocument();
    await expect(await screen.findByTestId('list-products')).toBeInTheDocument();
  });

  describe('for list of products should render items', () => {
    let expectedProductId: ReturnType<typeof randomUUID>;

    beforeEach(() => {
      expectedProductId = randomUUID();
      (getProductsAsync as jest.Mock).mockResolvedValue([
        { id: expectedProductId, title: 'Some nice product' },
      ]);
    });

    async function ensureProductAddedToCart(expectedProductId: string, quantity: Number) {
      const productsList = await screen.findByTestId('list-products');
      const productItem = await within(productsList).findByTestId(`product-${expectedProductId}`);
      const addToCartButton = await within(productItem).findByRole('button', { name: /add/i });
      expect(addToCartButton).toBeInTheDocument();
      await setSelectValue(productItem, 'quantity-select', quantity.toString());

      expect(
        fireEvent(
          addToCartButton,
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
          }),
        ),
      ).toBeTruthy();

      await waitFor(() => {
        expect(store.getState().shoppingCart.items.length).toEqual(1);
      });
      await waitFor(() => {
        expect(store.getState().shoppingCart.items).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              product: expect.objectContaining({ id: expectedProductId }),
              quantity,
            }),
          ]),
        );
      });
    }

    it('has list item for product', async () => {
      render(
        <Provider store={store}>
          <Catalog />
        </Provider>,
      );

      const productsList = await screen.findByTestId('list-products');
      await expect(productsList).toBeInTheDocument();
      const productItem = await within(productsList).findByTestId(`product-${expectedProductId}`);
      await expect(productItem).toBeInTheDocument();
    });

    it.each([1, 2, 3])('adds %s item(s) to the cart', async (quantity: Number) => {
      render(
        <Provider store={store}>
          <Catalog />
        </Provider>,
      );

      await ensureProductAddedToCart(expectedProductId, quantity);
    });

    it.each([1, 2, 3])('removes %s items from the cart', async (quantity: Number) => {
      render(
        <Provider store={store}>
          <Catalog />
        </Provider>,
      );

      await ensureProductAddedToCart(expectedProductId, quantity);

      const productsList = await screen.findByTestId('list-products');
      const productItem = await within(productsList).findByTestId(`product-${expectedProductId}`);
      const removeFromCartButton = await within(productItem).findByRole('button', {
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

      await waitFor(() => {
        expect(store.getState().shoppingCart.items.length).toEqual(0);
      });
    });
  });
});
