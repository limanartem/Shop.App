import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getHeaderTitle } from '@react-navigation/elements';
import { useAppSelector } from '../app/hooks';
import LoginForm from '../features/auth/signIn';
import Catalog from '../features/catalog';
import Checkout from '../features/checkout';
import Orders from '../features/orders';
import ShoppingCart from '../features/shopping-cart';
import AppBar from './AppBar';

function AppBarHeader({ route, options }: { route: any; options: any }) {
  const title = getHeaderTitle(options, route.name);

  return <AppBar title={title} />;
}

const Stack = createNativeStackNavigator();

export default function Router() {
  const user = useAppSelector((state) => state.auth.user);

  return (
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
        {user == null && (
          <>
            <Stack.Screen
              name="SignIn"
              component={LoginForm}
              initialParams={{ mode: 'login' }}
              options={{ title: 'Sign In' }}
            />
            <Stack.Screen
              name="SignUp"
              component={LoginForm}
              initialParams={{ mode: 'register' }}
              options={{ title: 'Sign Up' }}
            />
            <Stack.Screen
              name="Checkout"
              component={LoginForm}
              options={{ title: 'Sign In' }}
              initialParams={{ redirectTo: 'Checkout', mode: 'login' }}
            />
          </>
        )}
        {user != null && (
          <>
            <Stack.Screen name="Orders" component={Orders} options={{ title: 'Orders' }} />
            <Stack.Screen name="Checkout" component={Checkout} options={{ title: 'Checkout' }} />
          </>
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
