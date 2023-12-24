import { StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { FormEventHandler, useCallback } from 'react';
import { confirmCheckoutItems } from '../../app/reducers/checkOutReducer';
import { View, VirtualizedList } from 'react-native';
import OrderedProductCard from '../../components/OrderedProductCard';
import { Text } from 'react-native-paper';
import { ShoppingCartItem } from '@shop.app/lib.client-data/dist/model';
import NavigationButtons from './NavigationButtons';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-start'
  },
  list: {
    //maxHeight: '80%',
    //height: 100,
  },
  footer: {
    marginTop: 'auto',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 10,
  },
  total: {},
});

export function StepConfirmItems() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.shoppingCart.items);

  const calculateTotal = useCallback(() => {
    return items
      .reduce((total: number, item) => total + (item.product?.price || 0) * item.quantity, 0)
      .toFixed(2);
  }, [items]);

  const handleFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    dispatch(confirmCheckoutItems());
  };

  return (
    <View style={styles.container}>
      <VirtualizedList
        style={styles.list}
        initialNumToRender={4}
        scrollEnabled={false}
        nestedScrollEnabled={true}
        renderItem={({ item }: { item: ShoppingCartItem }) => (
          <OrderedProductCard item={item} flow="shoppingCart" />
        )}
        keyExtractor={(item) => item.product.id}
        getItemCount={() => items.length}
        getItem={(_, index) => items[index]}
      />
      <View style={styles.footer}>
        <NavigationButtons
          nextAction={() => dispatch(confirmCheckoutItems())}
          canNavigateBack={false}
        />
        <Text style={styles.total}>
          <Text style={{ fontWeight: '800' }}>Total:</Text> {calculateTotal()} USD
        </Text>
      </View>
    </View>
  );
}
