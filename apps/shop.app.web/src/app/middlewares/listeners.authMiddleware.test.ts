import { setUser } from '../reducers/authReducer';
import { graphQlWsClient } from '../../services';
import { buildStore } from '../store';
import { merge, clearCart } from '../reducers/shoppingCartReducer';

jest.mock('../../services', () => ({
  ...jest.requireActual('../../services'),
  graphQlWsClient: {
    ...jest.requireActual('../../services').graphQlWsClient,
    startListening: jest.fn((f: () => void) => () => f()),
    stopListening: jest.fn(),
  },
}));

jest.mock('../reducers/notificationsReducer', () => ({
  ...jest.requireActual('../reducers/notificationsReducer'),
  setChangedOrders: jest.fn(() => ({ type: 'setChangedOrders' })),
}));

jest.mock('../reducers/shoppingCartReducer', () => ({
  ...jest.requireActual('../reducers/shoppingCartReducer'),
  merge: jest.fn(() => ({ type: 'merge' })),
  clearCart: jest.fn(() => ({ type: 'clearCart' })),
}));

describe('authMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should stop WS listening when action payload is null', async () => {
    const store = buildStore();

    const stopListeningMock = jest.spyOn(graphQlWsClient, 'stopListening');

    await store.dispatch(setUser(null));

    expect(stopListeningMock).toHaveBeenCalled();
  });

  it('should start WS listening when action payload is not null', async () => {
    const store = buildStore();

    const startListeningClientMock = jest.spyOn(graphQlWsClient, 'startListening');
    const stopListeningMock = jest.spyOn(graphQlWsClient, 'stopListening');

    await store.dispatch(setUser({} as any));

    expect(startListeningClientMock).toHaveBeenCalled();
    expect(stopListeningMock).not.toHaveBeenCalled();
  });

  it('should merge shopping cart when user has signed in', async () => {
    const store = buildStore();

    await store.dispatch(setUser({ hasSignedIn: true } as any));

    expect(merge).toHaveBeenCalled();
  });

  it('should clear shopping cart when user has signed out', async () => {
    const store = buildStore();

    await store.dispatch(setUser(null));

    expect(merge).not.toHaveBeenCalled();
    expect(clearCart).toHaveBeenCalled();
  });

  it('should not merge shopping cart when user was signed in before', async () => {
    const store = buildStore();

    await store.dispatch(setUser({ hasSignedIn: false } as any));

    expect(merge).not.toHaveBeenCalled();
  });
});
