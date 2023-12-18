import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { PersistentState } from '../persistance/local-storage';
import { CheckoutPaymentInfo, CheckoutShippingInfo } from '@shop.app/lib.client-data/dist/model';

export type FlowStep = 'confirmItems' | 'shipping' | 'payment' | 'review';
export const CHECKOUT_FLOW_STEPS: FlowStep[] = ['confirmItems', 'shipping', 'payment', 'review'];

interface CheckOutState extends PersistentState {
  flowStep?: FlowStep;
  payment: CheckoutPaymentInfo;
  shipment: CheckoutShippingInfo;
}

const initialState: CheckOutState = {
  persistent: true,
  flowStep: 'confirmItems',
  payment: {},
  shipment: {},
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
    confirmCheckoutItems: (state) => {
      state.flowStep = 'shipping';
    },
    setCheckoutPayment: (state, action: PayloadAction<CheckoutPaymentInfo>) => {
      state.payment = action.payload;
      state.flowStep = 'review';
    },
    setCheckoutShipping: (state, action: PayloadAction<CheckoutShippingInfo>) => {
      state.shipment = action.payload;
      state.flowStep = 'payment';
    },
    resetCheckout: (state) => {
      state.flowStep = 'confirmItems';
      state.payment = {};
      state.shipment = {};
    },
    placeOrder: (state) => {
      state.flowStep = 'confirmItems';
      state.payment = {};
      state.shipment = {};
    },
  },
});

export const selectPayment = (state: RootState) => state.checkout.payment;
export const selectShipping = (state: RootState) => state.checkout.shipment;
export const {
  previousStep,
  confirmCheckoutItems,
  setCheckoutPayment,
  setCheckoutShipping,
  placeOrder,
  resetCheckout,
} = checkOutSlice.actions;
export default checkOutSlice.reducer;
