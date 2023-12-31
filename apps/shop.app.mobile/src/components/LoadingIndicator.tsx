import { useTheme, ActivityIndicator } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

export default function LoadingIndicator({ size = 'small' }: { size?: 'small' | 'large' }) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    loadingContainer: {
      position: 'absolute',
      zIndex: 1,
      width: '100%',
      height: '100%',
      alignContent: 'center',
      backgroundColor: 'rgba(255, 251, 254, 0.5)',
    },
    loading: {
      height: '100%',
      width: '100%',
    },
  });

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator style={styles.loading} size={size} color={theme.colors.primary} />
    </View>
  );
}
