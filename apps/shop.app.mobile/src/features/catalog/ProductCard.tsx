import { useCallback, useState } from 'react';
import { View, VirtualizedList, StyleSheet } from 'react-native';
import { ProductFallbackImage, getProductImage } from '../../utils/product-utils';
import { Badge, Button, Card, IconButton, Text, useTheme } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectItems, addToCart, removeFromCart } from '../../app/reducers/shoppingCartReducer';
import { Rating, AirbnbRating } from 'react-native-ratings';
import { ProductItem } from '@shop.app/lib.client-data/dist/model';

const ProductCard = ({ product }: { product: ProductItem }) => {
  const theme = useTheme();
  const { title, description, price, currency } = product;
  const [imageUrl, setImageUrl] = useState(getProductImage(product));
  const items = useAppSelector(selectItems);
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity: 1 }));
    console.log(`Added ${1} ${title} to the cart`);
  };

  const handleRemoveFromCart = () => {
    dispatch(removeFromCart(product));
    console.log(`Removed ${title} from the cart`);
  };

  const isProductInCart = useCallback(
    () => items.some((item) => item.product.id === product.id),
    [items, product],
  );

  const itemsInCart = useCallback(
    () =>
      items
        .filter((item) => item.product.id === product.id)
        .reduce((acc, curr) => acc + curr.quantity, 0),
    [items, product],
  );

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
    badge: {
      position: 'absolute',
      top: 4,
      right: 0,
      backgroundColor: theme.colors.primary,
    },
  });

  return (
    <Card style={styles.container}>
      <Card.Title title={title} subtitle={description} />
      <Card.Cover
        source={{ uri: imageUrl }}
        style={styles.cardCover}
        onError={() => {
          if (imageUrl != ProductFallbackImage) setImageUrl(ProductFallbackImage);
        }}
      />
      <Card.Actions>
        {/*
        <View>
          <Rating readonly={true} imageSize={15} startingValue={Math.random() * 5 + 1} />
        </View>
         */}
        <View>
          <Text variant="titleMedium">
            {price.toFixed(2)} {currency}
          </Text>
        </View>
        <Button icon="cart-plus" mode="contained" onPress={handleAddToCart}>
          Add
        </Button>
        {isProductInCart() && (
          <View>
            <IconButton
              icon="cart-minus"
              mode="outlined"
              onPress={handleRemoveFromCart}
            ></IconButton>
            <Badge style={styles.badge}>{itemsInCart()}</Badge>
          </View>
        )}
      </Card.Actions>
    </Card>
  );
};

export default ProductCard;
