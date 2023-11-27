import { useCallback, useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  MenuItem,
  Select,
  ButtonGroup,
  Tooltip,
  Badge,
  styled,
  Stack,
  Rating,
  Box,
} from '@mui/material';
import { ProductItem } from '../../model';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { addToCart, removeFromCart, selectItems } from '../../app/reducers/shoppingCartReducer';
import AddShoppingCart from '@mui/icons-material/AddShoppingCart';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { ProductFallbackImage, getProductImage } from '../../utils/product-utils';
import Carousel from 'react-material-ui-carousel';
import { CarouselProps } from 'react-material-ui-carousel/dist/components/types';

const ProductCard = ({ product }: { product: ProductItem }) => {
  const { title, description, price, currency } = product;
  const [quantity, setQuantity] = useState(1);
  const items = useAppSelector(selectItems);
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

  const CarouselExt = styled((props: CarouselProps) => <Carousel {...props} />)(({ theme }) => ({
    width: 60,
    hight: 60,
    maxHeight: 60,
    [theme.breakpoints.up('sm')]: {
      width: 160,
      minHeight: 160,
      maxHeight: 160,
    },
  }));

  return (
    <Card style={{ display: 'flex', width: '100%' }}>
      <CarouselExt autoPlay={false} indicators={false}>
        {[0, 1, 2].map((i) => (
          <CardMedia
            key={i}
            component="img"
            image={getProductImage(product, i)}
            onError={(e: any) => (e.target.src = ProductFallbackImage)}
          />
        ))}
      </CarouselExt>

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
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ width: '100%', display: 'flex' }}
        >
          <Rating
            name="size-small"
            defaultValue={2}
            size="small"
            readOnly={true}
            value={Math.random() * 5 + 1}
            precision={0.5}
          />
          <Box sx={{ maxHeight: 35, flex: '1 0 auto', textAlign: 'right' }}>
            <ButtonGroup size="small" sx={{ maxHeight: 35 }}>
              <Select
                value={quantity}
                label="Quantity"
                aria-label="quantity"
                style={{ minWidth: '56px' }}
                onChange={(e) => setQuantity(Number.parseInt(e.target.value as string))}
                data-testid="quantity-select"
                inputProps={{ 'data-testid': 'quantity-select-input' }}
              >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
              </Select>
              <Tooltip title={`Add ${quantity} to Cart`}>
                <Button
                  variant="contained"
                  style={{ width: '56px' }}
                  onClick={handleAddToCart}
                  aria-label="add"
                >
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
                      aria-label="remove"
                    >
                      <RemoveShoppingCartIcon fontSize="small" />
                    </Button>
                  </Badge>
                </Tooltip>
              )}
            </ButtonGroup>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
