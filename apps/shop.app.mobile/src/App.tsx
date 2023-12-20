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
import ShoppingCart from './features/shopping-cart';
import LoginForm from './features/auth/signIn';
import { AuthWrapper } from './components/AuthWrapper';
import Orders from './features/orders';

const Stack = createNativeStackNavigator();

function AppBarHeader({ route, options }: { route: any; options: any }) {
  const title = getHeaderTitle(options, route.name);

  return <AppBar title={title} />;
}

export default function App() {
  const theme = useTheme();

  return (
    <Provider store={store}>
      <AuthWrapper>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Catalog"
            screenOptions={{
              header: (props) => <AppBarHeader {...props} />,
            }}
          >
            <Stack.Screen name="Catalog" component={Catalog} options={{ title: 'Products' }} />
            <Stack.Screen
              name="ShoppingCart"
              component={ShoppingCart}
              options={{ title: 'Shopping Cart' }}
            />
            <Stack.Screen name="SignIn" component={LoginForm} options={{ title: 'Sign In' }} />
            <Stack.Screen name="Orders" component={Orders} options={{ title: 'Orders' }} />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </AuthWrapper>
    </Provider>
  );
}
