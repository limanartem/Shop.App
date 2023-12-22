import { Chip, ProgressBar } from 'react-native-paper';
import { useAppTheme } from '../../theme';

const statusStyle = (status: string | undefined, theme: ReturnType<typeof useAppTheme>) => {
  switch (status) {
    case 'pending':
      return {
        backgroundColor: theme.colors.warning,
        color: theme.colors.onWarning,
        progress: 0.2,
      };
    case 'paid':
      return {
        backgroundColor: theme.colors.primary,
        color: theme.colors.onPrimary,
        progress: 0.6,
      };
    case 'dispatched':
      return {
        backgroundColor: theme.colors.primary,
        color: theme.colors.onPrimary,
        progress: 0.8,
      };
    case 'delivered':
      return { backgroundColor: theme.colors.success, color: theme.colors.onSuccess, progress: 1 };
    case 'rejected':
      return { backgroundColor: theme.colors.error, color: theme.colors.onError, progress: 1 };
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
    <Chip compact={true} style={{ backgroundColor }} textStyle={{ color }}>
      {status}
    </Chip>
  );
}

export function OrderStatusProgress({ status }: { status?: string }) {
  const { progress, backgroundColor } = statusStyle(status, useAppTheme());
  return (
    <ProgressBar
      progress={progress}
      color={backgroundColor}
      style={{ height: 5, borderRadius: 5,  marginVertical: 10 }}
    />
  );
}
