import { StyleSheet, Image } from 'react-native';
import { ShoppingCartItem } from '../model';
import { ProductFallbackImage, getProductImage } from '../utils/product-utils';
import { Card, IconButton, Text } from 'react-native-paper';
import { useAppDispatch } from '../app/hooks';
import { removeFromCart } from '../app/reducers/shoppingCartReducer';
import { useState } from 'react';

type Props = {
  item: ShoppingCartItem;
  flow: 'shoppingCart' | 'checkout' | 'orderDetails';
};

const OrderedProductCard = ({ item, flow }: Props) => {
  const { title, description, price, currency } = item.product;
  const product = item.product;
  const [imageUrl, setImageUrl] = useState(getProductImage(product));

  const dispatch = useAppDispatch();

  const handleRemoveFromCart = () => {
    dispatch(removeFromCart(item.product));
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

  return (
    <Card style={styles.container}>
      <Card.Title
        title={title}
        subtitle={description}
        left={(props) => (
          <Image
            source={{ uri: imageUrl }}
            onError={() => setImageUrl(ProductFallbackImage)}
            style={{ width: 40, height: 40 }}
          />
        )}
        right={(props) => (
          <IconButton icon="cart-minus" mode="outlined" onPress={handleRemoveFromCart} />
        )}
      />
      <Card.Content>
        <Text style={styles.price}>
          {item.product.price.toFixed(2)} x {item.quantity} (
          {(item.product.price * item.quantity).toFixed(2)})
          <Text>&nbsp;{item.product.currency}</Text>
        </Text>
      </Card.Content>
    </Card>
  );
};

export default OrderedProductCard;
