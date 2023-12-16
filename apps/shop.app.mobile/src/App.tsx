import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Image, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppBar from './components/AppBar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Catalog from './features/catalog';
import { getHeaderTitle } from '@react-navigation/elements';
import { Provider } from 'react-redux';
import { store } from './app/store';

const Stack = createNativeStackNavigator();

function AppBarHeader({ route, options }) {
  const title = getHeaderTitle(options, route.name);

  return <AppBar title={title} />;
}

export default function App() {
  const theme = useTheme();
  //const Drawer = createDrawerNavigator();

  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Catalog"
          screenOptions={{
            header: (props) => <AppBarHeader {...props} />,
          }}
        >
          <Stack.Screen name="Catalog" component={Catalog} options={{ title: 'Products' }} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
