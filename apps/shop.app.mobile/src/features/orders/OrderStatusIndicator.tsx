import { Chip, ProgressBar } from 'react-native-paper';
import { useAppTheme } from '../../theme';
import { View, Animated } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useEffect, useRef } from 'react';

const statusStyle = (status: string | undefined, theme: ReturnType<typeof useAppTheme>) => {
  switch (status) {
    case 'pending':
      return {
        backgroundColor: theme.colors.warning,
        color: theme.colors.onWarning,
        progress: 0.2,
        icon: 'clock-outline',
      };
    case 'confirmed':
      return {
        backgroundColor: theme.colors.primary,
        color: theme.colors.onPrimary,
        progress: 0.4,
        icon: 'store-check-outline',
      };
    case 'paid':
      return {
        backgroundColor: theme.colors.primary,
        color: theme.colors.onPrimary,
        progress: 0.6,
        icon: 'credit-card-check-outline',
      };
    case 'dispatched':
      return {
        backgroundColor: theme.colors.primary,
        color: theme.colors.onPrimary,
        progress: 0.8,
        icon: 'truck-delivery-outline',
      };
    case 'delivered':
      return {
        backgroundColor: theme.colors.success,
        color: theme.colors.onSuccess,
        progress: 1,
        icon: 'truck-check-outline',
      };
    case 'rejected':
      return {
        backgroundColor: theme.colors.error,
        color: theme.colors.onError,
        progress: 1,
        icon: 'cancel',
      };
    default:
      return {
        backgroundColor: theme.colors.warning,
        color: theme.colors.onWarning,
        progress: 0.2,
      };
  }
};

export function OrderStatusIndicator({ status }: { status?: string }) {
  const theme = useAppTheme();

  const { backgroundColor, color } = statusStyle(status, theme);
  return (
    /*<Chip compact={true} style={{ backgroundColor }} textStyle={{ color }} >*/
      <Text>{status}</Text>
    /*</Chip>*/
  );
}

export function OrderStatusProgress({ status }: { status?: string }) {
  const { progress, backgroundColor, icon } = statusStyle(status, useAppTheme());
  const marginAnimated = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(marginAnimated, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [marginAnimated]);
  const margin = marginAnimated.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '90%'],
  });

  return (
    <View>
      <Animated.View style={{ marginLeft: margin }}>
        <Icon source={icon} size={30} color={backgroundColor} />
      </Animated.View>
      <ProgressBar
        progress={progress}
        color={backgroundColor}
        style={{ height: 5, borderRadius: 5, marginVertical: 10 }}
      />
    </View>
  );
}
