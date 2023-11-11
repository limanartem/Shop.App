import { useCallback, useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  MenuItem,
  Grid,
  Select,
  ButtonGroup,
  Tooltip,
  Badge,
} from '@mui/material';
import { ProductItem } from '../../model';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { addToCart, removeFromCart } from '../../app/shopping-cart/shoppingCartReducer';
import AddShoppingCart from '@mui/icons-material/AddShoppingCart';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';

const ProductCard = ({ product }: { product: ProductItem }) => {
  const { id, title, description, price, currency } = product;
  const [quantity, setQuantity] = useState(1);
  const items = useAppSelector((state) => state.shoppingCart.items);
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
    console.log(`Added ${quantity} ${title} to the cart`);
  };
  const handleRemoveFromCart = () => {
    dispatch(removeFromCart(product));
    console.log(`Removed ${title} from the cart`);
  };

  const isProductInCart = useCallback(
    () => items.some((item) => item.productId === product.id),
    [items, product],
  );

  const itemsInCart = useCallback(
    () =>
      items
        .filter((item) => item.productId === product.id)
        .reduce((acc, curr) => acc + curr.quantity, 0),
    [items, product],
  );

  return (
    <Card style={{ display: 'flex', width: '100%' }}>
      <Grid container>
        <Grid item xs={12} md={2}>
          <CardMedia
            component="img"
            height="160"
            image={`/shop-assets/products/thumbnails/${id}-1.png`}
            alt={title}
            onError={(e: any) => (e.target.src = '/shop-assets/products/no-product-image.png')}
          />
        </Grid>
        <Grid item xs={12} md={10}>
          <CardContent style={{ flex: 1 }}>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              dangerouslySetInnerHTML={{ __html: description }}
            />
            <Typography variant="h6">
              {price} {currency}
            </Typography>
            <ButtonGroup size="small" sx={{ maxHeight: 35 }}>
              <Select
                value={quantity}
                label="Quantity"
                style={{ minWidth: '56px' }}
                onChange={(e) => setQuantity(Number.parseInt(e.target.value as string))}
              >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
              </Select>
              <Tooltip title={`Add ${quantity} to Cart`}>
                <Button variant="contained" style={{ width: '56px' }} onClick={handleAddToCart}>
                  <AddShoppingCart fontSize="small" />
                </Button>
              </Tooltip>
              {isProductInCart() && (
                <Tooltip title="Remove from Cart">
                  <Badge badgeContent={itemsInCart()} color="success">
                    <Button
                      variant="outlined"
                      style={{ width: '56px' }}
                      onClick={handleRemoveFromCart}
                    >
                      <RemoveShoppingCartIcon fontSize="small" />
                    </Button>
                  </Badge>
                </Tooltip>
              )}
            </ButtonGroup>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
};

export default ProductCard;
