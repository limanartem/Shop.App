import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { useState } from 'react';

export function OrderProgressIndicator({ orderStatus }: { orderStatus: string }) {
  const mapStatusToStep = () => {
    switch (orderStatus) {
      case 'pending':
        return 0;
      case 'processing':
      case 'confirmed':
        return 1;
      case 'paid':
        return 2;
      case 'dispatched':
        return 3;
      case 'delivered':
        return 4;
    }
    return 0;
  
  }

  const [ activeStep ] = useState(mapStatusToStep());

  return (
    <Stepper activeStep={activeStep}>
      <Step>
        <StepLabel>New</StepLabel>
      </Step>
      <Step>
        <StepLabel>Processing</StepLabel>
      </Step>
      <Step>
        <StepLabel>Paid</StepLabel>
      </Step>
      <Step>
        <StepLabel>Out for delivery</StepLabel>
      </Step>
      <Step>
        <StepLabel>Delivered</StepLabel>
      </Step>
    </Stepper>
  );
}
