import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Alert, Box, Button, ButtonGroup, Grid } from '@mui/material';
import { previousStep, placeOrder } from '../../app/reducers/checkOutReducer';
import { createOrdersAsync } from '../../services/order-service';
import CircularProgress from '@mui/material/CircularProgress';
import { FormEventHandler, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';

export function StepReview() {
  const dispatch = useAppDispatch();
  const { shipment, payment } = useAppSelector((state) => state.checkout);
  const { items } = useAppSelector((state) => state.shoppingCart);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>();
  const navigate = useNavigate();

  const handleBack = () => {
    dispatch(previousStep());
  };

  const handleComplete: FormEventHandler = (e) => {
    e.preventDefault();

    setSuccess(false);
    setLoading(true);
    setError(null);

    const createOrder = async () => {
      try {
        const result = await createOrdersAsync({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          shipping: shipment,
          payment,
        });

        if (result?.id != null) {
          setSuccess(true);
          setLoading(false);
          setTimeout(() => {
            dispatch(placeOrder());
            navigate(`/orders/${result.id}`);
          }, config.checkout.DelayAfterCompletion);
        } else {
          setError('Something went wrong');
        }
      } catch (error) {
        setError(`Something went wrong: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    createOrder();
  };

  return (
    <Box textAlign="right" padding={2}>
      {!success && (
        <form onSubmit={handleComplete}>
          <ButtonGroup size="large" sx={{ m: 1, position: 'relative' }}>
            <Button
              variant="contained"
              color="primary"
              type={success ? undefined : 'submit'}
              style={{ minWidth: '120px' }}
              disabled={loading}
            >
              Submit
            </Button>
            {loading && (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
            <Button
              disabled={loading || success}
              onClick={handleBack}
              style={{ minWidth: '120px' }}
            >
              Back
            </Button>
          </ButtonGroup>
        </form>
      )}
      <Grid container spacing={2} alignContent="center" textAlign="center">
        <Grid item xs={12}>
          {error != null && <Alert severity="error">{error}</Alert>}
          {success && (
            <Alert severity="success">
              Order has been successfully placed and is being processed! Thank You!
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
