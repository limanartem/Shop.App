import { MD3LightTheme as DefaultTheme, PaperProvider, useTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF5733',
    secondary: '#FFECB3',
    success:  '#4CAF50',
    onSuccess: '#E8F5E9',
    warning: '#FF9800',
    onWarning: '#FFF3E0',
  },
};

export type AppTheme = typeof theme;
export const useAppTheme = () => useTheme<AppTheme>();