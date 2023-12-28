import React, { useRef, useState } from 'react';
import valid from 'card-validator';
import { isValidIBAN } from 'ibantools';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setCheckoutPayment } from '../../app/reducers/checkOutReducer';
import { useForm } from 'react-hook-form';
import { Card, List } from 'react-native-paper';
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

  const [paymentType, setPaymentType] = useState('creditCard');
  const formRefs = getFormRefs();

  const dispatch = useAppDispatch();

  const isValidCreditCard = (cardNumber: string) => valid.number(cardNumber).isValid;
  const isValidExpiryDate = (expiryDate: string) => new Date(expiryDate) > new Date();
  const isValidCvc = (cvc: string) => valid.cvv(cvc).isValid;

  const form = useForm<FormData>({
    mode: 'onChange',
    defaultValues: paymentDirty,
    reValidateMode: 'onBlur',
  });

  console.log(paymentDirty);

  const {
    formState: { isValid },
    handleSubmit,
    getValues,
  } = form;

  const submit = (data: FormData) =>
    isValid &&
    dispatch(
      setCheckoutPayment(
        paymentType === 'creditCard' ? { creditCard: data.creditCard } : { bank: data.bank },
      ),
    );

  return (
    <>
      <List.AccordionGroup
        expandedId={paymentType}
        onAccordionPress={(expandedId) => setPaymentType(expandedId as string)}
      >
        <List.Accordion
          id="creditCard"
          title="Credit Card"
          right={() => <></>}
          left={(props) => <List.Icon {...props} icon="credit-card-outline" />}
          style={{ marginLeft: 20 }}
        >
          <Card style={styles.container}>
            <Card.Title title="" style={{ display: 'none' }} />
            <Card.Content style={styles.formContainer}>
              <ControlledInput
                name="creditCard.number"
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
                  name="creditCard.cvc"
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
                  name="creditCard.expire"
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
                name="creditCard.name"
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
                name="bank.iban"
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    paddingLeft: 0,
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
