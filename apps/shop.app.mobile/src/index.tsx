import { registerRootComponent } from 'expo';
import * as React from 'react';
import { MD3LightTheme as DefaultTheme, PaperProvider, useTheme } from 'react-native-paper';


import App from './App';
import { theme } from './theme';


export default function Main() {
  return (
    <PaperProvider theme={theme}>
      <App />
    </PaperProvider>
  );
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Main);
