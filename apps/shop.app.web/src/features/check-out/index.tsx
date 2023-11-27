import { useAppSelector } from '../../app/hooks';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import { CHECKOUT_FLOW_STEPS } from '../../app/reducers/checkOutReducer';
import { StepShippingDetails } from './StepShippingDetails';
import { StepPaymentDetails } from './StepPaymentDetails';
import { StepReview } from './StepReview';
import { MainContentContainer } from '../../components';
import { StepConfirmItems } from './StepConfirmItems';

export default function CheckOut() {
  const [activeStep, setActiveStep] = useState(0);

  const items = useAppSelector((state) => state.shoppingCart.items);
  const hasItems = useCallback(() => items.length > 0, [items]);
  const { flowStep } = useAppSelector((state) => state.checkout);

  useEffect(() => {
    setActiveStep(flowStep != null ? CHECKOUT_FLOW_STEPS.indexOf(flowStep) : 0);
  }, [flowStep]);

 

  return (
    <Box data-testid="feature-checkout">
      {!hasItems() && (
        <Typography variant="subtitle1" textAlign="center" margin={3}>
          The Cart is Empty
        </Typography>
      )}
      {hasItems() && (
        <Grid container justifyContent="center">
          <MainContentContainer>
            <Card style={{ width: '100%' }}>
              <CardHeader title="Checkout" subheader="Complete all steps to place an order" />
              <CardContent style={{ paddingTop: 0 }}>
                <Stepper activeStep={activeStep} orientation="vertical">
                  <Step key="confirmItems">
                    <StepLabel>Confirm items to check-out</StepLabel>
                    <StepContent data-testid="checkoutStep-confirmItems">
                      <StepConfirmItems />
                    </StepContent>
                  </Step>
                  <Step key="shipping">
                    <StepLabel>Shipping Address</StepLabel>
                    <StepContent data-testid="checkoutStep-shipping">
                      <StepShippingDetails />
                    </StepContent>
                  </Step>
                  <Step key="payment">
                    <StepLabel>Payment</StepLabel>
                    <StepContent data-testid="checkoutStep-payment">
                      <StepPaymentDetails />
                    </StepContent>
                  </Step>
                  <Step key="review">
                    <StepLabel>Review</StepLabel>
                    <StepContent data-testid="checkoutStep-review">
                      <Typography>Review</Typography>
                      <StepReview />
                    </StepContent>
                  </Step>
                </Stepper>
              </CardContent>
            </Card>
          </MainContentContainer>
        </Grid>
      )}
    </Box>
  );
}
