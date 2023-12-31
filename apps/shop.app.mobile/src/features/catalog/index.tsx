import { useEffect, useState } from 'react';
import { View, VirtualizedList, StyleSheet } from 'react-native';
import ProductCard from './ProductCard';
import { ProductPlaceholder } from './ProductPlaceholder';
import { Text } from 'react-native-paper';
import { ProductItem } from '@shop.app/lib.client-data/dist/model';
import { catalogServiceClient } from '../../services';
import ShoppingCartFAB from '../shopping-cart/shoppingCartFab';

function Catalog() {
  const [productsLoading, setProductsLoading] = useState(true);
  const [products, setProducts] = useState<ProductItem[]>(
    [...Array(4).keys()].map((i) => ({ id: i } as any)),
  );

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'column',
      flexGrow: 1,
      justifyContent: 'space-between',
      flexBasis: 1,
    },
  });

  function fetchProducts() {
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
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <>
      <View style={styles.container}>
        {products.length > 0 ? (
          <VirtualizedList
            refreshing={productsLoading}
            onRefresh={() => fetchProducts()}
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
      <ShoppingCartFAB />
    </>
  );
}

export default Catalog;
