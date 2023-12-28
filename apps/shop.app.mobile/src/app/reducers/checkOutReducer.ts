import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '../store';
import { PersistentState } from '../persistance/local-storage';
import {
  CheckoutPaymentInfo,
  CheckoutShippingInfo,
} from '@shop.app/lib.client-data/dist/model';
import { createOrderAsync } from './ordersReducer';

export type FlowStep = 'confirmItems' | 'shipping' | 'payment' | 'review' | 'complete';
export const CHECKOUT_FLOW_STEPS: FlowStep[] = ['confirmItems', 'shipping', 'payment', 'review'];

interface CheckOutState extends PersistentState {
  flowStep?: FlowStep;
  payment: CheckoutPaymentInfo;
  paymentDirty: CheckoutPaymentInfo;
  shipment: CheckoutShippingInfo;
  shipmentDirty: CheckoutShippingInfo;
}

const initialState: CheckOutState = {
  persistent: true,
  flowStep: 'confirmItems',
  payment: {},
  paymentDirty: {
    creditCard: {
      number: '4242424242424242',
      name: 'John Doe',
      cvc: '123',
      expire: '01/2022',
    },
    bank: {
      iban: 'DE89370400440532013000',
    },
  },
  shipment: {},
  shipmentDirty: {
    address: '123 Main St',
    country: 'US',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    name: 'John Doe',
  },
};

export const placeOrder = createAsyncThunk('checkOut/placeOrder', async (_, options) => {
  const { checkout, shoppingCart } = options.getState() as RootState;
  const result = options.dispatch(
    createOrderAsync({
      items: shoppingCart.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      payment: checkout.payment,
      shipping: checkout.shipment,
    }),
  );
  return result.unwrap();
});

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
    setCheckoutPaymentDirty: (state, action: PayloadAction<CheckoutPaymentInfo>) => {
      state.paymentDirty = action.payload;
    },
    setCheckoutShipping: (state, action: PayloadAction<CheckoutShippingInfo>) => {
      state.shipment = action.payload;
      state.flowStep = 'payment';
    },
    setCheckoutShippingDirty: (state, action: PayloadAction<CheckoutShippingInfo>) => {
      state.shipmentDirty = action.payload;
    },
    resetCheckout: (state) => {
      state.flowStep = 'confirmItems';
      state.payment = {};
      state.shipment = {};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(placeOrder.fulfilled, (state) => {
      state.flowStep = 'complete';
      state.payment = {};
      state.shipment = {};
    });
  },
});

export const selectPayment = (state: RootState) => state.checkout.payment;
export const selectShipping = (state: RootState) => state.checkout.shipment;
export const selectShippingDirty = (state: RootState) => state.checkout.shipmentDirty;
export const {
  previousStep,
  confirmCheckoutItems,
  setCheckoutPayment,
  setCheckoutPaymentDirty,
  setCheckoutShipping,
  setCheckoutShippingDirty,
  resetCheckout,
} = checkOutSlice.actions;
export default checkOutSlice.reducer;
