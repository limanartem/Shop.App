import { useAppDispatch } from '../../app/hooks';
import { placeOrder } from '../../app/reducers/checkOutReducer';
import { useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import NavigationButtons from './NavigationButtons';

export function StepReview() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>();
  const submit = () => {
    setLoading(true);
    dispatch(placeOrder())
      .unwrap()
      .then((result) => {
        if (result?.id != null) {
          setSuccess(true);
        }
      })
      .catch((error) => {
        setError(`Something went wrong: ${error}`);
        setSuccess(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <View>
      {!success && (
        <NavigationButtons nextAction={submit} loading={loading} canNavigateForward={true} />
      )}
      <View>
        <View>
          {error != null && <Text>{error}</Text>}
          {success && (
            <Text>Order has been successfully placed and is being processed! Thank You!</Text>
          )}
        </View>
      </View>
    </View>
  );
}
