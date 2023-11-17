import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Box, Button, ButtonGroup, Grid, TextField, makeStyles } from '@mui/material';
import { ChangeEventHandler, FormEventHandler, useState } from 'react';
import { previousStep, setCheckoutShipping } from '../../app/reducers/checkOutReducer';
import { CheckoutShippingInfo } from '../../model';

export function StepShippingDetails() {
  const dispatch = useAppDispatch();
  const { shipment: checkoutShipment } = useAppSelector((state) => state.checkout);
  const [shipment, setShipment] = useState<CheckoutShippingInfo>(checkoutShipment);
  const [errors, setErrors] = useState({
    address: false,
    city: false,
    country: false,
    state: false,
    zip: false,
    name: false,
  });

  const handleBack = () => {
    dispatch(previousStep());
  };
  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;
    setShipment({ ...shipment, [name]: value });
  };

  const handleFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    // Destructure fields from shipment
    const { address, city, country, state, zip, name } = shipment;
    // Perform validation before proceeding
    const updatedErrors = {
      address: !address,
      city: !city,
      country: !country,
      state: !state,
      zip: !zip?.match(/^\d+$/),
      name: !name,
    };

    setErrors(updatedErrors);

    if (Object.values(updatedErrors).some((error) => error)) {
      // Handle incomplete or incorrect form
      return;
    }

    dispatch(setCheckoutShipping(shipment));
    return false;
  };
  return (
      <form onSubmit={handleFormSubmit}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6}>
            <TextField
              label="Contact Name"
              fullWidth
              required
              name="name"
              value={shipment.name}
              onChange={handleInputChange}
              error={errors.name}
              helperText={errors.name && 'Please enter a name'}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Contact Phone Number"
              fullWidth
              name="phoneNumber"
              onChange={handleInputChange}
             
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              label="Street"
              fullWidth
              required
              name="address"
              value={shipment.address}
              onChange={handleInputChange}
              error={errors.address}
              helperText={errors.address && 'Please enter an address'}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Zip"
              fullWidth
              required
              name="zip"
              value={shipment.zip}
              onChange={handleInputChange}
              error={errors.zip}
              helperText={errors.zip && 'Please enter a valid Zip code (digits only)'}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              label="City"
              fullWidth
              required
              name="city"
              value={shipment.city}
              onChange={handleInputChange}
              error={errors.city}
              helperText={errors.city && 'Please enter a city'}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Country"
              fullWidth
              required
              name="country"
              value={shipment.country}
              onChange={handleInputChange}
              error={errors.country}
              helperText={errors.country && 'Please enter a country'}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="State"
              fullWidth
              required
              name="state"
              value={shipment.state}
              onChange={handleInputChange}
              error={errors.state}
              helperText={errors.state && 'Please enter a state'}
            />
          </Grid>
        </Grid>
        <Box textAlign="right" padding={2}>
          <ButtonGroup size="large">
            <Button variant="contained" type="submit" color="primary" style={{ minWidth: '120px' }}>
              Continue
            </Button>
            <Button disabled={false} onClick={handleBack} style={{ minWidth: '120px' }}>
              Back
            </Button>
          </ButtonGroup>
        </Box>
      </form>
  );
}
