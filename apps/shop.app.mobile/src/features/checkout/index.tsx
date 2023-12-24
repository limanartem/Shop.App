import React, { useState } from 'react';
import { List, Text } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  placeOrder,
  setCheckoutPayment,
  setCheckoutShipping,
} from '../../app/reducers/checkOutReducer';
import { StepConfirmItems } from './StepConfirmItems';
import NavigationButtons from './NavigationButtons';
import { StepShippingDetails } from './StepShippingDetails';
import { View, ScrollView } from 'react-native';

export default function Checkout() {
  const dispatch = useAppDispatch();
  const { flowStep } = useAppSelector((state) => state.checkout);
  const [paymentType, setPaymentType] = useState('credit-card');

  return (
    <ScrollView>
      <List.AccordionGroup expandedId={flowStep}>
        <List.Accordion
          id="confirmItems"
          title="Items in shopping cart"
          onPress={(e) => e.stopPropagation()}
          right={() => <></>}
          left={(props) => <List.Icon {...props} icon="cart-variant" />}
        >
          <StepConfirmItems />
        </List.Accordion>
        <List.Accordion
          id="shipping"
          title="Shipping details"
          right={() => <></>}
          left={(props) => <List.Icon {...props} icon="truck-delivery-outline" />}
        >
          <StepShippingDetails />
        </List.Accordion>
        <List.Accordion
          id="payment"
          title="Payment details"
          right={() => <></>}
          left={(props) => <List.Icon {...props} icon="credit-card-check-outline" />}
        >
          <List.AccordionGroup
            expandedId={paymentType}
            onAccordionPress={(expandedId) => setPaymentType(expandedId as string)}
          >
            <List.Accordion
              id="credit-card"
              title="Credit Card"
              right={() => <></>}
              left={(props) => <List.Icon {...props} icon="credit-card-outline" />}
              style={{ marginLeft: 20 }}
            >
              <Text>Credit card</Text>
            </List.Accordion>
            <List.Accordion
              id="bank"
              title="Bank"
              right={() => <></>}
              left={(props) => <List.Icon {...props} icon="bank-outline" />}
              style={{ marginLeft: 20 }}
            >
              <Text>Bank</Text>
            </List.Accordion>
          </List.AccordionGroup>

          <NavigationButtons nextAction={() => dispatch(setCheckoutPayment({}))} />
        </List.Accordion>
        <List.Accordion
          id="review"
          title="Review"
          right={() => <></>}
          left={(props) => <List.Icon {...props} icon="cart-check" />}
        >
          <Text>Confirm</Text>
          <NavigationButtons nextAction={() => dispatch(placeOrder())} />
        </List.Accordion>
      </List.AccordionGroup>
    </ScrollView>
  );
}
