import { useEffect, useState } from 'react';
import { ProductItem } from '../../model';
import { getProductsAsync } from '../../services/catalog-service';
import { View, VirtualizedList, StyleSheet, Text } from 'react-native';
import ProductCard from './ProductCard';
import { ProductPlaceholder } from './ProductPlaceholder';

function Catalog() {
  const [productsLoading, setProductsLoading] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);

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
    <View>
      {productsLoading ? (
        <ProductPlaceholder />
      ) : (
        <VirtualizedList
          initialNumToRender={4}
          renderItem={({ item }: { item: ProductItem }) => <ProductCard product={item} />}
          keyExtractor={(item) => item.id}
          getItemCount={() => products.length}
          getItem={(_, index) => products[index]}
        />
      )}
    </View>
  );
}




export default Catalog;
