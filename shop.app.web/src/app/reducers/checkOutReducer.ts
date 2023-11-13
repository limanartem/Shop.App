import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { PersistentState } from '../persistance/local-storage';

type OrderPaymentInfo = {};
type ShippingAddress = {};
type FlowStep = 'confirmItems' | 'shipping' | 'payment' | 'review';
export const CHECKOUT_FLOW_STEPS: FlowStep[] = ['confirmItems', 'shipping', 'payment', 'review'];

interface CheckOutState extends PersistentState {
  flowStep?: FlowStep;
  payment: OrderPaymentInfo;
  shipping: ShippingAddress;
}

const initialState: CheckOutState = {
  persistent: true,
  flowStep: 'confirmItems',
  payment: {},
  shipping: {},
};

export const checkOutSlice = createSlice({
  name: 'checkOut',
  initialState,
  reducers: {
    previousStep: (state) => {
      const currentIndex = CHECKOUT_FLOW_STEPS.indexOf(state.flowStep as FlowStep);
      if (currentIndex === 0) return;
      state.flowStep = CHECKOUT_FLOW_STEPS[currentIndex - 1];
    },
    confirmItems: (state) => {
      state.flowStep = 'shipping';
    },
    setPayment: (state, action: PayloadAction<OrderPaymentInfo>) => {
      state.payment = action.payload;
      state.flowStep = 'payment';
    },
    setShipping: (state, action: PayloadAction<ShippingAddress>) => {
      state.shipping = action.payload;
      state.flowStep = 'review';
    },
    resetCheckout: (state) => {
      state.flowStep = 'confirmItems';
      state.payment = {};
      state.shipping = {};
    },
    placeOrder: (state) => {
      state.flowStep = 'confirmItems';
      state.payment = {};
      state.shipping = {};
    },
  },
});

export const selectPayment = (state: RootState) => state.checkout.payment;
export const selectShipping = (state: RootState) => state.checkout.shipping;
export const { previousStep, confirmItems, setPayment, setShipping, placeOrder, resetCheckout } =
  checkOutSlice.actions;
export default checkOutSlice.reducer;
