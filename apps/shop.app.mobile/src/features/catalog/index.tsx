import { useEffect, useState } from 'react';
import { View, VirtualizedList, StyleSheet } from 'react-native';
import ProductCard from './ProductCard';
import { ProductPlaceholder } from './ProductPlaceholder';
import { Badge, FAB, Icon, MD2Colors, Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../app/hooks';
import { ProductItem } from '@shop.app/lib.client-data/dist/model';
import { catalogServiceClient } from '../../services';

function Catalog() {
  const [productsLoading, setProductsLoading] = useState(true);
  const [products, setProducts] = useState<ProductItem[]>(
    [...Array(4).keys()].map((i) => ({id: i} as any)),
  );
  const [state, setState] = useState({ open: false });

  const onStateChange = ({ open }: { open: boolean }) => setState({ open });
  const { open } = state;
  const theme = useTheme();
  const navigation = useNavigation();
  const itemsCount = useAppSelector((state) =>
    state.shoppingCart.items.reduce((count, item) => count + item.quantity, 0),
  );

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'column', // inner items will be added vertically
      flexGrow: 1, // all the available vertical space will be occupied by it
      justifyContent: 'space-between', // will create the gutter between body and footer
      flexBasis: 1,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      overflow: 'visible',
      //backgroundColor: theme.colors.primary,
      //color: '#0000',
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

  useEffect(() => {
    console.log('Catalog:fetching products');
    setProductsLoading(true);
    catalogServiceClient
      .getProductsAsync({})
      .then((products) => {
        setProducts(products);
      })
      .catch((error) => {
        console.error('Catalog:fetching products', error);
        setProducts([]);
      })
      .finally(() => {
        setProductsLoading(false);
      });
  }, []);

  return (
    <>
      <View style={styles.container}>
        {products.length > 0 ? (
          <VirtualizedList
            initialNumToRender={4}
            renderItem={({ item }: { item: ProductItem }) =>
              productsLoading ? <ProductPlaceholder /> : <ProductCard product={item} />
            }
            keyExtractor={(item) => item.id}
            getItemCount={() => products.length}
            getItem={(_, index) => products[index]}
          />
        ) : (
          <Text variant="bodyLarge" style={{ textAlign: 'center', margin: 20 }}>
            No products
          </Text>
        )}
      </View>
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
            onPress: () => navigation.navigate({ name: 'ShoppingCart' }),
          },
          {
            icon: 'cart-check',
            label: 'Checkout',
            color: MD2Colors.green900,
            onPress: () => console.log('Pressed remove from cart'),
          },
          {
            icon: 'cart-remove',
            label: 'Remove All',
            color: MD2Colors.redA700,
            onPress: () => console.log('Pressed remove from cart'),
          },
        ]}
      />
    </>
  );
}

export default Catalog;
