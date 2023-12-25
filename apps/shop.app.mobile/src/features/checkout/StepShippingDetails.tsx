import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useEffect, useRef } from 'react';
import { setCheckoutShipping, setCheckoutShippingDirty } from '../../app/reducers/checkOutReducer';
import { Card } from 'react-native-paper';
import { View } from 'react-native';
import NavigationButtons from './NavigationButtons';
import { StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import ControlledInput from '../../components/ControlledInput';

type FormData = {
  address: string;
  city: string;
  country: string;
  state: string;
  zip: string;
  name: string;
  phoneNumber: string;
};

type FormRefs = {
  [key in keyof FormData]: React.MutableRefObject<any>;
};

const getFormRefs = (): FormRefs => ({
  address: useRef(),
  city: useRef(),
  country: useRef(),
  state: useRef(),
  zip: useRef(),
  name: useRef(),
  phoneNumber: useRef(),
});

export function StepShippingDetails() {
  const dispatch = useAppDispatch();
  const { shipmentDirty } = useAppSelector((state) => state.checkout);
  const formRefs = getFormRefs();

  useEffect(() => {
    return () => {
      dispatch(setCheckoutShippingDirty(getValues()));
    };
  }, []);

  const form = useForm<FormData>({
    mode: 'onChange',
    defaultValues: shipmentDirty,
    reValidateMode: 'onBlur',
  });

  const {
    formState: { isValid },
    handleSubmit,
    getValues,
  } = form;

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
    row: {
      flexDirection: 'row',
      columnGap: 10,
      justifyContent: 'flex-start',
    },
  });

  return (
    <>
      <Card style={styles.container}>
        <Card.Title title="" style={{ display: 'none' }} />
        <Card.Content style={styles.formContainer}>
          <ControlledInput
            name="name"
            label="Contact Name"
            form={form}
            ref={formRefs.name}
            nextRef={formRefs.phoneNumber}
          />
          <ControlledInput
            ref={formRefs.phoneNumber}
            nextRef={formRefs.address}
            name="phoneNumber"
            label="Contact Phone Number"
            required={false}
            form={form}
          />
          <ControlledInput
            name="address"
            label="Street"
            form={form}
            ref={formRefs.address}
            nextRef={formRefs.zip}
          />
          <View style={styles.row}>
            <ControlledInput
              form={form}
              name="zip"
              label="Zip"
              ref={formRefs.zip}
              nextRef={formRefs.city}
              pattern={{ value: /^\d+$/, message: 'Invalid Zip format' }}
              style={{ width: 80 }}
            />
            <ControlledInput
              name="city"
              label="City"
              style={{ flexGrow: 1 }}
              form={form}
              ref={formRefs.city}
              nextRef={formRefs.country}
            />
          </View>
          <ControlledInput
            name="country"
            label="Country"
            form={form}
            ref={formRefs.country}
            nextRef={formRefs.state}
          />
          <ControlledInput
            name="state"
            label="State"
            required={false}
            form={form}
            ref={formRefs.state}
          />
        </Card.Content>
      </Card>
      <NavigationButtons nextAction={handleSubmit(submit)} canNavigateForward={isValid} />
    </>
  );
}
