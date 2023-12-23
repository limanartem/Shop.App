import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { View, VirtualizedList, StyleSheet } from 'react-native';
import OrderedProductCard from '../../components/OrderedProductCard';
import { Button, Divider, Text } from 'react-native-paper';
import { ShoppingCartItem } from '@shop.app/lib.client-data/dist/model';

export default function ShoppingCart() {
  const items = useAppSelector((state) => state.shoppingCart.items);
  const navigate = useNavigation();
  const hasItems = useCallback(() => items.length > 0, [items]);

  return (
    <View style={styles.container}>
      <VirtualizedList
        initialNumToRender={4}
        renderItem={({ item }: { item: ShoppingCartItem }) => (
          <OrderedProductCard item={item} flow="shoppingCart" />
        )}
        keyExtractor={(item) => item.product.id}
        getItemCount={() => items.length}
        getItem={(_, index) => items[index]}
      />
      <Divider />
      <View style={styles.footer}>
        <View>
          <Text style={{ fontWeight: '600' }}>
            Total: &nbsp; 
            <Text>
              {items?.reduce((acc, item) => acc + item.product.price * item.quantity, 0).toFixed(2)}
              &nbsp;{items?.[0]?.product.currency}
            </Text>
          </Text>
        </View>
        <View style={{}}>
          <Button mode="contained" onPress={() => navigate.navigate('Checkout' as never)}>
            Checkout
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column', // inner items will be added vertically
    flexGrow: 1, // all the available vertical space will be occupied by it
    justifyContent: 'space-between', // will create the gutter between body and footer
    flexBasis: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 100,
  },
});
