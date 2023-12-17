import { useEffect, useState } from 'react';
import { ProductItem } from '../../model';
import { getProductsAsync } from '../../services/catalog-service';
import { View, VirtualizedList, StyleSheet, Text } from 'react-native';
import ProductCard from './ProductCard';
import { ProductPlaceholder } from './ProductPlaceholder';

function Catalog() {
  const [productsLoading, setProductsLoading] = useState(true);
  const [products, setProducts] = useState<ProductItem[]>(
    [...Array(4).keys()].map(() => ({} as any)),
  );

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
  );
}

export default Catalog;
