import { screen, within, fireEvent, waitFor } from '@testing-library/react';

export const delay = (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
};

export const mockImpl = (target: any, mock: (...args: any) => {}) => {
  (target as jest.Mock).mockImplementation(mock);
};

export const mockResolved = (target: any, value: any) => {
  (target as jest.Mock).mockResolvedValue(value);
};


export const setSelectValue = async (container: HTMLElement, selectTestId: string, valueToSet: string) => {
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


export const  addProductToCart = async (expectedProductId: string, quantity: number) => {
  const productsList = await screen.findByTestId('list-products');
  const productItem = await within(productsList).findByTestId(`product-${expectedProductId}`);
  expect(productItem).toBeInTheDocument();
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
}