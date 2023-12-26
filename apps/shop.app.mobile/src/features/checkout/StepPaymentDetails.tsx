import React, { ChangeEventHandler, FormEventHandler, useRef, useState } from 'react';
import valid from 'card-validator';
import { isValidIBAN } from 'ibantools';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  previousStep,
  setCheckoutPayment,
  setCheckoutShipping,
} from '../../app/reducers/checkOutReducer';
import { CreditCardDetails, BankDetails } from '@shop.app/lib.client-data/dist/model';
import { useForm } from 'react-hook-form';
import { Card, List, Text } from 'react-native-paper';
import ControlledInput from '../../components/ControlledInput';
import NavigationButtons from './NavigationButtons';
import { StyleSheet, View } from 'react-native';

type FormData = {
  creditCard: {
    name: string;
    number: string;
    cvc: string;
    expire: string;
  };
  bank: {
    iban: string;
    bankName: string;
  };
};

const getFormRefs = () => ({
  creditCard: {
    name: useRef(),
    number: useRef(),
    cvc: useRef(),
    expire: useRef(),
  },
  bank: {
    iban: useRef(),
    bankName: useRef(),
  },
});

export function StepPaymentDetails() {
  const { paymentDirty } = useAppSelector((state) => state.checkout);
  const initialPaymentMethod =
    paymentDirty.creditCard != null || paymentDirty.bank == null ? 'creditCard' : 'bank';

  const [paymentMethod, setPaymentMethod] = useState<'creditCard' | 'bank'>(initialPaymentMethod);
  const [creditCardDetails, setCreditCardDetails] = useState<CreditCardDetails | undefined>(
    paymentDirty.creditCard,
  );
  const [bankDetails, setBankDetails] = useState<BankDetails | undefined>({
    ...paymentDirty.bank,
    iban: 'DE89370400440532013000', // For ease of testing
  });
  const [paymentType, setPaymentType] = useState('credit-card');
  const formRefs = getFormRefs();

  const dispatch = useAppDispatch();


  const handleFormSubmit = () => {
    dispatch(
      setCheckoutPayment(
        paymentMethod === 'creditCard' ? { creditCard: creditCardDetails } : { bank: bankDetails },
      ),
    );
  };

  const isValidCreditCard = (cardNumber: string) => valid.number(cardNumber).isValid;
  const isValidExpiryDate = (expiryDate: string) => new Date(expiryDate) > new Date();
  const isValidCvc = (cvc: string) => valid.cvv(cvc).isValid;

  const form = useForm<FormData>({
    mode: 'onChange',
    defaultValues: paymentDirty,
    reValidateMode: 'onBlur',
  });

  const {
    formState: { isValid },
    handleSubmit,
    getValues,
  } = form;

  const submit = (data: FormData) => isValid && dispatch(setCheckoutPayment(data));

  return (
    <>
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
          <Card style={styles.container}>
            <Card.Title title="" style={{ display: 'none' }} />
            <Card.Content style={styles.formContainer}>
              <ControlledInput
                name="number"
                label="Card Number"
                form={form}
                ref={formRefs.creditCard.number}
                nextRef={formRefs.creditCard.cvc}
                moreRules={{
                  validate: (value) =>
                    isValidCreditCard(value) ? true : 'Invalid credit card number',
                }}
              />
              <View style={styles.row}>
                <ControlledInput
                  form={form}
                  name="cvc"
                  label="CVC"
                  placeholder="123"
                  ref={formRefs.creditCard.cvc}
                  nextRef={formRefs.creditCard.expire}
                  style={{ width: 80 }}
                  moreRules={{
                    validate: (value) => (isValidCvc(value) ? true : 'Invalid CVC'),
                  }}
                />
                <ControlledInput
                  name="expire"
                  label="Expire"
                  style={{ flexGrow: 1 }}
                  form={form}
                  ref={formRefs.creditCard.expire}
                  nextRef={formRefs.creditCard.name}
                  moreRules={{
                    validate: (value) => (isValidExpiryDate(value) ? true : 'Invalid expiry date'),
                  }}
                  placeholder="DD/MM/YYYY"
                />
              </View>
              <ControlledInput
                name="name"
                label="Card Holder"
                form={form}
                ref={formRefs.creditCard.name}
              />
            </Card.Content>
          </Card>
        </List.Accordion>
        <List.Accordion
          id="bank"
          title="Bank"
          right={() => <></>}
          left={(props) => <List.Icon {...props} icon="bank-outline" />}
          style={{ marginLeft: 20 }}
        >
          <Card style={styles.container}>
            <Card.Title title="" style={{ display: 'none' }} />
            <Card.Content style={styles.formContainer}>
              <ControlledInput
                name="iban"
                label="IBAN"
                form={form}
                ref={formRefs.bank.iban}
                moreRules={{
                  validate: (value) => (isValidIBAN(value) ? true : 'Invalid IBAN'),
                }}
              />
            </Card.Content>
          </Card>
        </List.Accordion>
      </List.AccordionGroup>

      <NavigationButtons nextAction={handleSubmit(submit)} canNavigateForward={isValid} />
      {/*
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
              <TextField label="Bank Name" fullWidth helperText={'Please enter the bank name'} />
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
       */}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  formContainer: {
    flexDirection: 'column',
    marginTop: 20,
    alignItems: 'stretch',
  },
  row: {
    flexDirection: 'row',
    columnGap: 10,
    justifyContent: 'flex-start',
  },
});
