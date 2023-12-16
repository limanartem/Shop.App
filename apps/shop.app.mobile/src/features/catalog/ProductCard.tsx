import { useCallback, useState } from 'react';
import { View, VirtualizedList, StyleSheet } from 'react-native';
import { ProductItem } from '../../model';
import { ProductFallbackImage, getProductImage } from '../../utils/product-utils';
import { Button, Card, IconButton, Text } from 'react-native-paper';

const ProductCard = ({ product }: { product: ProductItem }) => {
  const { title, description, price, currency } = product;

  return (
    <Card style={styles.container}>
      <Card.Title title={title} subtitle={description} />
      <Card.Cover source={{ uri: getProductImage(product) }} style={styles.cardCover} />
      <Card.Actions>
        <View>
          <Text variant="titleMedium">
            {price.toFixed(2)} {currency}
          </Text>
        </View>
        <Button icon="cart-plus" mode="contained">
          Add
        </Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    marginHorizontal: 10,
  },
  cardCover: {
    borderRadius: 0,
  },
  price: {
    textAlign: 'left',
  },
});

export default ProductCard;
