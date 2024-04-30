import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import App from '../../App';
import { MemoryRouter } from 'react-router';
import { catalogServiceClient } from '../../services/';
import { randomUUID } from 'crypto';
import { addProductToCart } from '../../test-helpers';
import { buildStore } from '../../app/store';
import { Provider } from 'react-redux';
import { SessionAuth } from 'supertokens-auth-react/recipe/session';

jest.mock('../../services/', () => ({
  catalogServiceClient: {
    getProductsAsync: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock('../../components/AuthWrapper', () => ({
  AuthWrapper: ({ children }: { children: React.ReactNode; onAuthInitialized: () => void }) => {
    return <>{children}</>;
  },
}));

// Avoid loading store from the local storage
jest.mock('../../app/persistance/local-storage');

jest.mock('supertokens-auth-react/recipe/session', () => ({
  SessionAuth: jest.fn(),
}));

describe('Feature Shopping Cart', () => {
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
      <MemoryRouter initialEntries={['/catalog']}>
        <Provider store={store}>
          <App />
        </Provider>
      </MemoryRouter>,
    );
    await expect(await screen.findByTestId('appBar-shoppingCart')).toBeInTheDocument();
    await expect(await screen.findByTestId('feature-catalog')).toBeInTheDocument();
    await expect(await screen.findByTestId('list-products')).toBeInTheDocument();
  });

  describe('for list of products', () => {
    let expectedProductId: ReturnType<typeof randomUUID>;
    const itemPrice = 10.99;

    beforeEach(() => {
      expectedProductId = randomUUID();
      jest
        .spyOn(catalogServiceClient, 'getProductsAsync')
        .mockResolvedValue([
          { id: expectedProductId, title: 'Some nice product', price: itemPrice } as any,
        ]);

      render(
        <MemoryRouter initialEntries={['/catalog']}>
          <Provider store={store}>
            <App />
          </Provider>
        </MemoryRouter>,
      ).container;
    });

    describe.each([1, 2, 3])('when %s item(s) added to the cart', (quantity: number) => {
      beforeEach(async () => {
        await addProductToCart(expectedProductId, quantity);
      });

      it('should display count in an app bar icon', async () => {
        const shoppingCartElement = await screen.findByTestId('appBar-shoppingCart');
        const itemsCountBadge = within(shoppingCartElement).getByTestId(
          'appBar-shoppingCart-badge',
        );
        expect(itemsCountBadge).toHaveTextContent(quantity.toString());
      });

      it('should not show shopping cart popup initially', async () => {
        expect(await screen.queryByTestId('shoppingCart-popup')).not.toBeInTheDocument();
      });

      describe('and clicked on shopping cart icon', () => {
        beforeEach(async () => {
          const shoppingCartElement = await screen.findByTestId('appBar-shoppingCart');
          fireEvent.click(shoppingCartElement);
        });

        describe('should show shopping cart', () => {
          let shoppingCartPopup: HTMLElement;

          beforeEach(async () => {
            shoppingCartPopup = await screen.findByTestId('shoppingCart-popup');
          });

          it('and should display added product in the cart', async () => {
            const cartItem = within(shoppingCartPopup).getByTestId(
              `shoppingCart-popup-orderedProduct-${expectedProductId}`,
            );

            expect(cartItem).toBeInTheDocument();
          });

          it('and should display total price', async () => {
            const totalPrice = within(shoppingCartPopup).getByTestId('shoppingCart-popup-total');
            expect(totalPrice).toBeInTheDocument();
            expect(totalPrice).toHaveTextContent((quantity * itemPrice).toFixed(2));
          });

          describe('and when "Checkout" button clicked', () => {
            describe('and user is not authenticated', () => {
              beforeEach(() => {
                // Mock user is not authenticated
                (SessionAuth as jest.Mock).mockImplementation(() => (
                  <div data-testid="login-page"></div>
                ));
              });

              it('should navigate to the login page', async () => {
                const checkoutButton = within(shoppingCartPopup).getByRole('button', {
                  name: /Checkout/i,
                });
                fireEvent.click(checkoutButton);

                expect(screen.getByTestId('login-page')).toBeInTheDocument();
              });
            });

            describe('and user is authenticated', () => {
              beforeEach(() => {
                // Mock user is authenticated
                (SessionAuth as jest.Mock).mockImplementation(
                  ({ children }: { children?: React.ReactNode }) => <>{children}</>,
                );
              });

              it('should navigate to the checkout page', async () => {
                const checkoutButton = within(shoppingCartPopup).getByRole('button', {
                  name: /Checkout/i,
                });
                fireEvent.click(checkoutButton);

                expect(screen.getByTestId('feature-checkout')).toBeInTheDocument();
              });
            });
          });

          describe('and when "Clear All" button clicked', () => {
            beforeEach(async () => {
              const clearAllButton = within(shoppingCartPopup).getByRole('button', {
                name: /Clear All/i,
              });
              fireEvent.click(clearAllButton);
            });

            it('should show "The Cart is Empty"', async () => {
              expect(
                await within(shoppingCartPopup).findByText('The Cart is Empty'),
              ).toBeInTheDocument();
            });
          });
        });
      });
    });
  });
});
