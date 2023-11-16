import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  Grid,
  List,
  ListItem,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import {
  confirmCheckoutItems,
  CHECKOUT_FLOW_STEPS,
} from '../../app/reducers/checkOutReducer';
import { StepShippingDetails } from './StepShippingDetails';
import { StepPaymentDetails } from './StepPaymentDetails';
import { StepReview } from './StepReview';
import { MainContentContainer, OrderedProductCard } from '../../components';



export function CheckOut() {
  const [activeStep, setActiveStep] = useState(0);
  const dispatch = useAppDispatch();

  const items = useAppSelector((state) => state.shoppingCart.items);
  const { flowStep } = useAppSelector((state) => state.checkout);
  const hasItems = useCallback(() => items.length > 0, [items]);

  useEffect(() => {
    setActiveStep(flowStep != null ? CHECKOUT_FLOW_STEPS.indexOf(flowStep) : 0);
  }, [flowStep]);

  return (
    <>
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
                    <StepContent>
                      <List sx={{ width: '100%' }}>
                        {items?.map((item) => (
                          <ListItem alignItems="flex-start" key={item.product.id}>
                            <OrderedProductCard item={item} flow="checkout" />
                          </ListItem>
                        ))}
                      </List>
                      <Box textAlign="right" padding={2}>
                        <ButtonGroup size="large">
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => dispatch(confirmCheckoutItems())}
                            style={{ minWidth: 80 }}
                          >
                            Continue
                          </Button>
                        </ButtonGroup>
                      </Box>
                    </StepContent>
                  </Step>
                  <Step key="shipping">
                    <StepLabel>Shipping Address</StepLabel>
                    <StepContent>
                      <StepShippingDetails />
                    </StepContent>
                  </Step>
                  <Step key="payment">
                    <StepLabel>Payment</StepLabel>
                    <StepContent>
                      <StepPaymentDetails />
                    </StepContent>
                  </Step>
                  <Step key="review">
                    <StepLabel>Review</StepLabel>
                    <StepContent>
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
    </>
  );
}
