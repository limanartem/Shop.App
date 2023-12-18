/* eslint-disable @typescript-eslint/no-unused-vars */
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';

type OrderNotificationType = {
  changedOrderIds: string[];
};

interface NotificationsState {
  ordersNotification: OrderNotificationType;
}

const initialState: NotificationsState = {
  ordersNotification: {
    changedOrderIds: [],
  },
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setChangedOrders: (state, action: PayloadAction<string[]>) => {
      state.ordersNotification.changedOrderIds = action.payload;
    },
  },
});

export const { setChangedOrders } = notificationsSlice.actions;
export const selectChangedOrderIds = (state: RootState) => state.notifications.ordersNotification.changedOrderIds;
export default notificationsSlice.reducer;
