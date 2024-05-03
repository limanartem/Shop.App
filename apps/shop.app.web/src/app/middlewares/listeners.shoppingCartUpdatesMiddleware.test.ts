import { setUser } from '../reducers/authReducer';
import { buildStore } from '../store';
import {
  addToCart,
  removeFromCart,
  addToRemoteCart,
  removeFromRemoteCart,
  clearCart,
  deleteRemoteCart,
} from '../reducers/shoppingCartReducer';
import { resetCheckout } from '../reducers/checkOutReducer';

jest.mock('../reducers/checkOutReducer', () => ({
  ...jest.requireActual('../reducers/checkOutReducer'),
  resetCheckout: jest.fn(() => ({ type: 'resetCheckout' })),
}));

jest.mock('../reducers/shoppingCartReducer', () => ({
  ...jest.requireActual('../reducers/shoppingCartReducer'),
  addToRemoteCart: jest.fn(() => ({ type: 'addToRemoteCart' })),
  removeFromRemoteCart: jest.fn(() => ({ type: 'removeFromRemoteCart' })),
  deleteRemoteCart: jest.fn(() => ({ type: 'deleteRemoteCart' })),
}));

describe('shoppingCartUpdatesMiddleware', () => {
  let store: ReturnType<typeof buildStore>;

  beforeEach(() => {
    jest.clearAllMocks();

    store = buildStore();
  });

  it('should reset checkout when item added to cart', async () => {
    await store.dispatch(addToCart({} as any));

    expect(resetCheckout).toHaveBeenCalled();
  });

  it('should reset checkout when item removed from cart', async () => {
    await store.dispatch(removeFromCart({} as any));

    expect(resetCheckout).toHaveBeenCalled();
  });

  it('should reset checkout when cart is cleared', async () => {
    await store.dispatch(clearCart());

    expect(resetCheckout).toHaveBeenCalled();
  });

  describe('when user is logged in', () => {
    beforeEach(async () => {
      await store.dispatch(setUser({ hasSignedIn: true } as any));
    });

    it('and item added to cart, should add item to remote cart', async () => {
      await store.dispatch(addToCart({} as any));

      expect(addToRemoteCart).toHaveBeenCalled();
    });

    it('and item removed from cart, should remove item from remote cart', async () => {
      await store.dispatch(removeFromCart({} as any));

      expect(removeFromRemoteCart).toHaveBeenCalled();
    });

    it('and cart is cleared, should remove remote cart', async () => {
      await store.dispatch(clearCart({} as any));

      expect(deleteRemoteCart).toHaveBeenCalled();
    });
  });

  describe('when user is not logged in', () => {
    beforeEach(async () => {
      await store.dispatch(setUser(null));
    });

    it('and item added to cart, should note add item to remote cart', async () => {
      await store.dispatch(addToCart({} as any));

      expect(addToRemoteCart).not.toHaveBeenCalled();
    });

    it('and item removed from cart, should not remove item from remote cart', async () => {
      await store.dispatch(removeFromCart({} as any));

      expect(removeFromRemoteCart).not.toHaveBeenCalled();
    });

    it('and cart is cleared, should not remove remote cart', async () => {
      await store.dispatch(clearCart());

      expect(deleteRemoteCart).not.toHaveBeenCalled();
    });
  });
});
