import { ShoppingCartItem } from '../../model';
import { Button, Card, CardContent, CardMedia, Grid, Tooltip, Typography } from '@mui/material';
import { useAppDispatch } from '../../app/hooks';
import { getProductImage, ProductFallbackImage } from '../../utils/product-utils';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { removeFromCart } from '../../app/reducers/shoppingCartReducer';
import { ProductItem } from '../../model';

export function CartProductCard({
  item,
  flow,
}: {
  item: ShoppingCartItem;
  flow: 'shoppingCart' | 'checkout';
}) {
  const dispatch = useAppDispatch();

  const handleRemoveFromCart = (product: ProductItem) => {
    dispatch(removeFromCart(product));
    console.log(`Removed ${product.title} from the cart`);
  };

  return (
    <Card style={{ display: 'flex', width: '100%' }}>
      <Grid container direction="row" justifyContent="flex-end" alignItems="center">
        <Grid item xs={12} md={2}>
          <CardMedia
            component="img"
            height={flow === 'shoppingCart' ? 56 : 100}
            image={getProductImage(item.product)}
            alt={item.product.title}
            onError={(e: any) => (e.target.src = ProductFallbackImage)}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <CardContent style={{ flex: 1, padding: '5px' }}>
            <Typography variant="caption" component="div">
              {item.product.title}
            </Typography>
            <Typography variant="body2">
              {item.product.price.toFixed(2)} x {item.quantity} (
              {(item.product.price * item.quantity).toFixed(2)}) {item.product.currency}
            </Typography>
          </CardContent>
        </Grid>
        <Grid item xs={12} md={2} textAlign="right" paddingRight={2}>
          <Tooltip title="Remove from Cart">
            <Button
              variant="outlined"
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
        </Grid>
      </Grid>
    </Card>
  );
}
