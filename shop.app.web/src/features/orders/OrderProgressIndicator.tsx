import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

export function OrderProgressIndicator({ orderStatus }: { orderStatus: string }) {
  return (
    <Stepper activeStep={0}>
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
        <StepLabel>Dispatched</StepLabel>
      </Step>
      <Step>
        <StepLabel>Delivered</StepLabel>
      </Step>
    </Stepper>
  );
}
