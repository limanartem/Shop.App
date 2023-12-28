import React, { useEffect } from 'react';
import { List } from 'react-native-paper';
import { useAppSelector } from '../../app/hooks';
import { StepConfirmItems } from './StepConfirmItems';
import { StepShippingDetails } from './StepShippingDetails';
import { ScrollView } from 'react-native';
import { StepPaymentDetails } from './StepPaymentDetails';
import { StepReview } from './StepReview';
import StepCompleted from './StepCompleted';

export default function Checkout() {
  const { flowStep } = useAppSelector((state) => state.checkout);

  return flowStep === 'complete' ? (
    <StepCompleted />
  ) : (
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
          <StepPaymentDetails />
        </List.Accordion>
        <List.Accordion
          id="review"
          title="Review"
          right={() => <></>}
          left={(props) => <List.Icon {...props} icon="cart-check" />}
        >
          <StepReview />
        </List.Accordion>
      </List.AccordionGroup>
    </ScrollView>
  );
}
