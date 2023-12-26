import { MutableRefObject, Ref, forwardRef } from 'react';
import { Controller, RegisterOptions, UseFormReturn } from 'react-hook-form';
import { StyleProp, ViewStyle, View, TextInput as RNTextInput } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';
import { Props as TextInputProps} from 'react-native-paper/lib/typescript/components/TextInput/TextInput';

const ERROR_MESSAGES = {
  REQUIRED: 'This Field Is Required',
  EMAIL_INVALID: 'Not a Valid Email',
};

type Props = {
  form: UseFormReturn<any, any, undefined>;
  name: string;
  label: string;
  required?: boolean;
  pattern?: {
    message: string;
    value: RegExp;
  };
  moreRules?: RegisterOptions;
  style?: StyleProp<ViewStyle>;
  nextRef?: MutableRefObject<RNTextInput | undefined>;
} & TextInputProps;

const ControlledInput = forwardRef(function (props: Props, ref: Ref<any>) {
  const { form, name, label, required = true, pattern, style, nextRef, moreRules } = props;
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
        ...moreRules
      }}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={style}>
          <TextInput
            ref={ref}
            value={value}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text)}
            returnKeyType="next"
            error={errors[name] && true}
            onSubmitEditing={(e) => {
              nextRef?.current?.focus();
            }}
            {...props}
            //placeholderTextColor={'#ddd'}
          />
          <HelperText type="error">{errors[name]?.message as string}</HelperText>
        </View>
      )}
    />
  );
});

export default ControlledInput;
