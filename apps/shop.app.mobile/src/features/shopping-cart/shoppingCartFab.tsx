import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Badge, FAB, Icon, MD2Colors, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { clearCart } from '../../app/reducers/shoppingCartReducer';

export default function ShoppingCartFAB() {
  const onStateChange = ({ open }: { open: boolean }) => setState({ open });
  const [state, setState] = useState({ open: false });
  const { open } = state;
  const navigation = useNavigation();
  const itemsCount = useAppSelector((state) =>
    state.shoppingCart.items.reduce((count, item) => count + item.quantity, 0),
  );
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const styles = StyleSheet.create({
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      overflow: 'visible',
    },
    badge: {
      position: 'absolute',
      zIndex: 1,
      top: -8,
      right: -8,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.primary,
      borderWidth: 1,
      color: theme.colors.primary,
    },
  });

  return (
    <FAB.Group
      open={open}
      label={open ? 'Shopping Cart' : ''}
      icon={(props) => (
        <View>
          <Icon source="cart" size={props.size} color={props.color} />
          <Badge style={styles.badge} size={17}>
            {itemsCount}
          </Badge>
        </View>
      )}
      onStateChange={onStateChange}
      variant="surface"
      visible={itemsCount > 0}
      actions={[
        {
          icon: 'cart-variant',
          label: 'View cart',
          color: theme.colors.primary,
          onPress: () => navigation.navigate('ShoppingCart' as never),
        },
        {
          icon: 'cart-check',
          label: 'Checkout',
          color: MD2Colors.green900,
          onPress: () => navigation.navigate('Checkout' as never),
        },
        {
          icon: 'cart-remove',
          label: 'Remove All',
          color: MD2Colors.redA700,
          onPress: () => dispatch(clearCart()),
        },
      ]}
    />
  );
}
