import { useAppSelector } from '../../app/hooks';
import { Box, Button, ButtonGroup, List, ListItem, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import { CartProductCard } from '../shopping-cart/CartProductCard';

export function CheckOut() {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const items = useAppSelector((state) => state.shoppingCart.items);
  const hasItems = useCallback(() => items.length > 0, [items]);

  return (
    <>
      {!hasItems() && (
        <Typography variant="subtitle1" textAlign="center" margin={3}>
          The Cart is Empty
        </Typography>
      )}
      {hasItems() && (
        <Box>
          <Stepper activeStep={activeStep} orientation="vertical">
            <Step key="items">
              <StepLabel>Confirm items to check-out</StepLabel>
              <StepContent>
                <List sx={{ width: '100%' }}>
                  {items?.map((item) => (
                    <ListItem alignItems="flex-start" key={item.product.id}>
                      <CartProductCard item={item} flow="checkout" />
                    </ListItem>
                  ))}
                </List>
                <Box textAlign="right" padding={2}>
                  <ButtonGroup size="large">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      style={{ minWidth: 80 }}
                    >
                      Continue
                    </Button>
                  </ButtonGroup>
                </Box>
              </StepContent>
            </Step>
            <Step key="shippingAddress">
              <StepLabel>Shipping Address</StepLabel>
              <StepContent>
                <Typography>Shipping Address</Typography>
                <Box textAlign="right" padding={2}>
                  <ButtonGroup size="large">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      style={{ minWidth: '120px' }}
                    >
                      Continue
                    </Button>
                    <Button disabled={false} onClick={handleBack} style={{ minWidth: '120px' }}>
                      Back
                    </Button>
                  </ButtonGroup>
                </Box>
              </StepContent>
            </Step>
            <Step key="payment">
              <StepLabel>Payment</StepLabel>
              <StepContent>
                <Typography>Payment</Typography>
                <Box textAlign="right" padding={2}>
                  <ButtonGroup size="large">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      style={{ minWidth: 80 }}
                    >
                      Continue
                    </Button>
                    <Button disabled={false} onClick={handleBack} style={{ minWidth: '80px' }}>
                      Back
                    </Button>
                  </ButtonGroup>
                </Box>
              </StepContent>
            </Step>
            <Step key="review">
              <StepLabel>Review</StepLabel>
              <StepContent>
                <Typography>Review</Typography>
                <Box textAlign="right" padding={2}>
                  <ButtonGroup size="large">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      style={{ minWidth: 80 }}
                    >
                      Complete
                    </Button>
                    <Button disabled={false} onClick={handleBack} style={{ minWidth: '80px' }}>
                      Back
                    </Button>
                  </ButtonGroup>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </Box>
      )}
    </>
  );
}
