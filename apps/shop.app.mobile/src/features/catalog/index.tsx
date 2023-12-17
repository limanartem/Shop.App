import { useEffect, useState } from 'react';
import { ProductItem } from '../../model';
import { getProductsAsync } from '../../services/catalog-service';
import { View, VirtualizedList, StyleSheet, Text } from 'react-native';
import ProductCard from './ProductCard';
import { ProductPlaceholder } from './ProductPlaceholder';
import { Badge, FAB, Icon, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../app/hooks';

function Catalog() {
  const [productsLoading, setProductsLoading] = useState(true);
  const [products, setProducts] = useState<ProductItem[]>(
    [...Array(4).keys()].map(() => ({} as any)),
  );
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
      overflow: 'visible'
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
    getProductsAsync({})
      .then((products) => {
        setProducts(products);
      })
      .catch((error) => {
        console.error('Catalog:fetching products', error);
      })
      .finally(() => {
        setProductsLoading(false);
      });
  }, []);

  return (
    <>
      <View style={styles.container}>
        <VirtualizedList
          initialNumToRender={4}
          renderItem={({ item }: { item: ProductItem }) =>
            productsLoading ? <ProductPlaceholder /> : <ProductCard product={item} />
          }
          keyExtractor={(item) => item.id}
          getItemCount={() => products.length}
          getItem={(_, index) => products[index]}
        />
      </View>
      <FAB
        icon={(props) => (
          <View>
            <Icon source="cart" size={props.size} color={props.color} />
            <Badge style={styles.badge} size={17}>
              {itemsCount}
            </Badge>
          </View>
        )}
        style={styles.fab}
        onPress={() => navigation.navigate({ name: 'ShoppingCart' })}
        variant="surface"
        visible={itemsCount > 0}
      />
    </>
  );
}

export default Catalog;
