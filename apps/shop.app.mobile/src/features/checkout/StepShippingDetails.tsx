import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useEffect } from 'react';
import { setCheckoutShipping, setCheckoutShippingDirty } from '../../app/reducers/checkOutReducer';
import { Card, HelperText, TextInput } from 'react-native-paper';
import { View } from 'react-native';
import NavigationButtons from './NavigationButtons';
import { StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';

type FormData = {
  address: string;
  city: string;
  country: string;
  state: string;
  zip: string;
  name: string;
  phoneNumber: string;
};

const ERROR_MESSAGES = {
  REQUIRED: 'This Field Is Required',
  NAME_INVALID: 'Not a Valid Name',
  TERMS: 'Terms Must Be Accepted To Continue',
  EMAIL_INVALID: 'Not a Valid Email',
};

export function StepShippingDetails() {
  const dispatch = useAppDispatch();
  const { shipmentDirty } = useAppSelector((state) => state.checkout);

  useEffect(() => {
    return () => {
      dispatch(setCheckoutShippingDirty(getValues()));
    };
  }, []);

  const {
    control,
    formState: { errors, isValid, isDirty },
    handleSubmit,
    getValues,
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: shipmentDirty,
    reValidateMode: 'onBlur',
  });

  const submit = (data: FormData) => dispatch(setCheckoutShipping(data));

  const styles = StyleSheet.create({
    container: {
      margin: 10,
    },
    formContainer: {
      flexDirection: 'column',
      marginTop: 20,
      alignItems: 'stretch',
    },
    total: {},
  });

  function ControlledInput({
    name,
    label,
    required = true,
    pattern,
  }: {
    name: keyof FormData;
    label: string;
    required?: boolean;
    pattern?: { message: string; value: RegExp };
  }) {
    return (
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? { value: true, message: ERROR_MESSAGES.REQUIRED } : undefined,
          pattern: pattern ? { message: pattern.message, value: pattern.value } : undefined,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              label={label}
              value={value}
              onBlur={onBlur}
              onChangeText={(text) => onChange(text)}
              returnKeyType="next"
              error={errors[name] && true}
            />
            <HelperText type="error">{errors[name]?.message}</HelperText>
          </View>
        )}
      />
    );
  }

  return (
    <>
      <Card style={styles.container}>
        <Card.Title title="" style={{ display: 'none' }} />
        <Card.Content style={styles.formContainer}>
          <ControlledInput name="name" label="Contact Name" />
          <ControlledInput name="phoneNumber" label="Contact Phone Number" />
          <ControlledInput name="address" label="Street" />
          <ControlledInput
            name="zip"
            label="Zip"
            pattern={{ value: /^\d+$/, message: 'Invalid Zip format' }}
          />
          <ControlledInput name="city" label="City" />
          <ControlledInput name="country" label="Country" />
          <ControlledInput name="state" label="State" />
        </Card.Content>
      </Card>
      <NavigationButtons nextAction={handleSubmit(submit)} canNavigateForward={isValid} />
    </>
  );
}
