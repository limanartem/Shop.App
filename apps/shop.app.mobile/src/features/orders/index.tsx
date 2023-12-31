import { Text } from 'react-native-paper';  
import { View, VirtualizedList, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useEffect, useState } from 'react';
import { fetchOrdersAsync, setOrders } from '../../app/reducers/ordersReducer';
import { DataLoadingState } from '../../app/reducers/categoriesReducer';
import LoadingIndicator from '../../components/LoadingIndicator';
import { ProductPlaceholder } from '../catalog/ProductPlaceholder';
import { Order } from '@shop.app/lib.client-data/dist/model';
import OrderedItem from './OrderedItem';
import { OrderItemPlaceholder } from './OrderItemPlaceholder';

function sortOrdersDesc(o2: Order, o1: Order): number {
  const o1Date = new Date(o1.createdAt).getTime();
  const o2Date = new Date(o2.createdAt).getTime();
  return o1Date - o2Date;
}

export default function Orders() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state) => state.orders.orders);
  const [sortedOrders, setSortedOrders] = useState<Order[]>([]);
  const ordersLoading = useAppSelector(
    (state) => state.orders.ordersState === DataLoadingState.loading,
  );

  function fetchOrders() {
    dispatch(fetchOrdersAsync());
  }
  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setSortedOrders([...orders].sort(sortOrdersDesc));
  }, [orders]);

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'column', // inner items will be added vertically
      flexGrow: 1, // all the available vertical space will be occupied by it
      justifyContent: 'space-between', // will create the gutter between body and footer
      flexBasis: 1,
    },
  });

  return (
    <View style={styles.container}>
      {sortedOrders.length > 0 || ordersLoading ? (
        <VirtualizedList
          refreshing={ordersLoading}
          onRefresh={() => fetchOrders()}
          initialNumToRender={4}
          renderItem={({ item }: { item: Order }) =>
            ordersLoading ? <OrderItemPlaceholder /> : <OrderedItem order={item} />
          }
          keyExtractor={(item) => item.id}
          getItemCount={() => sortedOrders.length}
          getItem={(_, index) => sortedOrders[index]}
        />
      ) : (
        <Text variant="bodyLarge" style={{ textAlign: 'center', margin: 20 }}>
          No orders
        </Text>
      )}
    </View>
  );
}
