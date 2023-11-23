import { ShoppingCartItem } from '../model';
import { Button, Card, CardContent, CardMedia, Grid, Tooltip, Typography } from '@mui/material';
import { useAppDispatch } from '../app/hooks';
import { getProductImage, ProductFallbackImage } from '../utils/product-utils';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { removeFromCart } from '../app/reducers/shoppingCartReducer';
import { ProductItem } from '../model';
import { StatusIndicator } from '../features/shopping-cart/StatusIndicator';

type Props = {
  item: ShoppingCartItem;
  flow: 'shoppingCart' | 'checkout' | 'orderDetails';
};

function ItemImage({ item, flow }: Props) {
  const height = flow === 'shoppingCart' || flow === 'orderDetails' ? 56 : 100;

  return (
    <CardMedia
      component="img"
      height={height}
      style={{ width: 'inherit' }}
      image={getProductImage(item.product)}
      alt={item.product.title}
      onError={(e: any) => (e.target.src = ProductFallbackImage)}
    />
  );
}

function ItemAction({ item, flow }: Props) {
  const dispatch = useAppDispatch();

  const handleRemoveFromCart = (product: ProductItem) => {
    dispatch(removeFromCart(product));
    console.log(`Removed ${product.title} from the cart`);
  };

  return (
    <>
      {flow !== 'orderDetails' && (
        <Tooltip title="Remove from Cart">
          <Button
            variant="outlined"
            aria-label='remove'
            style={
              flow === 'shoppingCart'
                ? { height: '24px', minWidth: '24px', maxWidth: '24px' }
                : undefined
            }
            onClick={() => handleRemoveFromCart(item.product)}
          >
            <RemoveShoppingCartIcon fontSize="small" />
          </Button>
        </Tooltip>
      )}
      {flow === 'orderDetails' && <StatusIndicator status={item.status || 'pending'} />}
    </>
  );
}

export function OrderedProductCard({ item, flow }: Props) {
  return (
    <Card style={{ display: 'flex', width: '100%' }}>
      <Grid container direction="row" justifyContent="flex-end" alignItems="center">
        <Grid item xs="auto">
          <ItemImage item={item} flow={flow} />
        </Grid>
        <Grid item xs={8}>
          <CardContent style={{ flex: 1, padding: '5px' }}>
            <Typography variant="caption" component="div">
              {item.product.title}
            </Typography>
            <Typography variant="body2">
              {item.product.price.toFixed(2)} x {item.quantity} (
              {(item.product.price * item.quantity).toFixed(2)})
              <strong>&nbsp;{item.product.currency}</strong>
            </Typography>
          </CardContent>
        </Grid>
        <Grid item md textAlign="right" paddingRight={2}>
          <ItemAction item={item} flow={flow} />
        </Grid>
      </Grid>
    </Card>
  );
}
