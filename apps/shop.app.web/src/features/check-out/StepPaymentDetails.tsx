import React, { ChangeEventHandler, FormEventHandler, useState } from 'react';
import { Tabs, Tab, TextField, Button, Grid, Box, ButtonGroup } from '@mui/material';
import valid from 'card-validator';
import { isValidIBAN } from 'ibantools';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { previousStep, setCheckoutPayment } from '../../app/reducers/checkOutReducer';
import { CreditCardDetails, BankDetails } from '../../model';

export function StepPaymentDetails() {
  const { payment } = useAppSelector((state) => state.checkout);
  const initialPaymentMethod =
    payment.creditCard != null || payment.bank == null ? 'creditCard' : 'bank';

  const [paymentMethod, setPaymentMethod] = useState<'creditCard' | 'bank'>(initialPaymentMethod);
  const [creditCardDetails, setCreditCardDetails] = useState<CreditCardDetails | undefined>(
    payment.creditCard,
  );
  const [bankDetails, setBankDetails] = useState<BankDetails | undefined>({
    ...payment.bank,
    iban: 'DE89370400440532013000', // For ease of testing
  });
  const [errors, setErrors] = useState({
    number: false,
    cvc: false,
    expire: false,
    iban: false,
    bankName: false,
    name: false,
  });
  const dispatch = useAppDispatch();

  const handleBack = () => {
    dispatch(previousStep());
  };

  const handleTabChange: (event: React.SyntheticEvent, value: any) => void = (event, newValue) => {
    setPaymentMethod(newValue);
  };

  const handleCreditCardChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;
    setCreditCardDetails({ ...creditCardDetails, [name]: value });
    setErrors({ ...errors, [name]: false });
  };

  const handleIbanChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;
    setBankDetails({ ...bankDetails, [name]: value });
    setErrors({ ...errors, [name]: false });
  };

  const handleFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    let updatedErrors = { ...errors };

    if (paymentMethod === 'creditCard') {
      const { number, cvc, expire } = creditCardDetails ?? {} as CreditCardDetails;

      // Credit card validation
      updatedErrors = {
        number: !number || !isValidCreditCard(number),
        cvc: !cvc || !isValidCvc(cvc),
        expire: !expire || !isValidExpiryDate(expire),
        iban: false,
        bankName: false,
        name: false,
      };
    } else  {
      const { iban } = bankDetails ?? {} as BankDetails;

      // IBAN validation
      updatedErrors = {
        iban: !iban || !isValidIBAN(iban),
        bankName: false,
        number: false,
        cvc: false,
        expire: false,
        name: false,
      };
    }

    setErrors(updatedErrors);

    if (Object.values(updatedErrors).some((error) => error)) {
      // Handle incomplete or incorrect form
      return;
    }

    dispatch(
      setCheckoutPayment(
        paymentMethod === 'creditCard' ? { creditCard: creditCardDetails } : { bank: bankDetails },
      ),
    );
  };

  const isValidCreditCard = (cardNumber: string) => valid.number(cardNumber).isValid;
  const isValidExpiryDate = (expiryDate: string) => new Date(expiryDate) > new Date();
  const isValidCvc = (cvc: string) => valid.cvv(cvc).isValid;

  return (
    <form onSubmit={handleFormSubmit}>
      <Tabs value={paymentMethod} onChange={handleTabChange} style={{ marginBottom: 10 }}>
        <Tab label="Credit Card" value="creditCard" />
        <Tab label="Bank" value="bank" />
      </Tabs>
      {paymentMethod === 'creditCard' ? (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Card Number"
              fullWidth
              required
              name="number"
              value={creditCardDetails?.number || ''}
              onChange={handleCreditCardChange}
              error={errors.number}
              helperText={errors.number && 'Please enter a valid card number'}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="CVC"
              fullWidth
              required
              name="cvc"
              value={creditCardDetails?.cvc || ''}
              onChange={handleCreditCardChange}
              error={errors.cvc}
              helperText={errors.cvc && 'Please enter a valid CVC (3 digits)'}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Expiry Date (MM/YYYY)"
              fullWidth
              required
              name="expire"
              value={creditCardDetails?.expire || ''}
              onChange={handleCreditCardChange}
              error={errors.expire}
              helperText={errors.expire && 'Please enter a valid expiry date'}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Card Holder"
              fullWidth
              required
              name="name"
              value={creditCardDetails?.name || ''}
              onChange={handleCreditCardChange}
              error={errors.name}
              helperText={errors.name && 'Please enter a valid card holder'}
            />
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="IBAN"
              fullWidth
              required
              name="iban"
              value={bankDetails?.iban || ''}
              onChange={handleIbanChange}
              error={errors.iban}
              helperText={errors.iban && 'Please enter a valid IBAN'}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Bank Name"
              fullWidth
              required
              name="bankName"
              onChange={handleIbanChange}
              error={errors.bankName}
              helperText={errors.bankName && 'Please enter the bank name'}
            />
          </Grid>
        </Grid>
      )}
      <Grid item xs={12}>
        <Box textAlign="right" padding={2}>
          <ButtonGroup size="large">
            <Button type="submit" variant="contained" color="primary" style={{ minWidth: 80 }}>
              Continue
            </Button>
            <Button disabled={false} onClick={handleBack} style={{ minWidth: '80px' }}>
              Back
            </Button>
          </ButtonGroup>
        </Box>
      </Grid>
    </form>
  );
}
