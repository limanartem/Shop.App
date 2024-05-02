import { createListenerMiddleware } from '@reduxjs/toolkit';
import { setUser } from '../reducers/authReducer';
import { graphQlWsClient } from '../../services';
import { buildStore } from '../store';

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
  setChangedOrders: jest.fn(),
}));

describe('authMiddleware', () => {
  it('should stop WS listening when action payload is null', async () => {
    const store = buildStore();

    const startListeningMock = jest.spyOn(createListenerMiddleware(), 'startListening');
    const stopListeningMock = jest.spyOn(graphQlWsClient, 'stopListening');

    store.dispatch(setUser(null));

    expect(stopListeningMock).toHaveBeenCalled();
    expect(startListeningMock).not.toHaveBeenCalled();
  });

  it('should start WS listening when action payload is not null', async () => {
    const store = buildStore();

    const startListeningClientMock = jest.spyOn(graphQlWsClient, 'startListening');
    const stopListeningMock = jest.spyOn(graphQlWsClient, 'stopListening');

    store.dispatch(setUser({} as any));

    expect(startListeningClientMock).toHaveBeenCalled();
    expect(stopListeningMock).not.toHaveBeenCalled();
  });

  
  it('should merge shopping cart when action payload is not null', async () => {
    const store = buildStore();

    store.dispatch(setUser({} as any));

  });
});
