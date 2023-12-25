import { MutableRefObject, Ref, forwardRef } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { StyleProp, ViewStyle, View, TextInput as RNTextInput } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';

const ERROR_MESSAGES = {
  REQUIRED: 'This Field Is Required',
  EMAIL_INVALID: 'Not a Valid Email',
};

interface Props {
  form: UseFormReturn<any, any, undefined>;
  name: string;
  label: string;
  required?: boolean;
  pattern?: {
    message: string;
    value: RegExp;
  };
  style?: StyleProp<ViewStyle>;
  nextRef?: MutableRefObject<RNTextInput | undefined>;
}

const ControlledInput = forwardRef(function (props: Props, ref: Ref<any>) {
  const { form, name, label, required = true, pattern, style, nextRef } = props;
  const {
    control,
    formState: { errors },
  } = form;

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: required ? { value: true, message: ERROR_MESSAGES.REQUIRED } : undefined,
        pattern: pattern ? { message: pattern.message, value: pattern.value } : undefined,
      }}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={style}>
          <TextInput
            ref={ref}
            label={label}
            value={value}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text)}
            returnKeyType="next"
            error={errors[name] && true}
            onSubmitEditing={(e) => {
              nextRef?.current?.focus();
            }}
          />
          <HelperText type="error">{errors[name]?.message as string}</HelperText>
        </View>
      )}
    />
  );
});

export default ControlledInput;
