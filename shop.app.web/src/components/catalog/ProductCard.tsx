import { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Menu,
  MenuItem,
  Grid,
  InputLabel,
  Select,
  ButtonGroup,
} from '@mui/material';
import { ProductItem } from '../../model';

const ProductCard = ({ item }: { item: ProductItem }) => {
  const { id, title, description, price, currency } = item;
  const [anchorEl, setAnchorEl] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const handleOpenMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    handleCloseMenu();
  };

  const addToCart = () => {
    // Add logic to add the product to the cart with the selected quantity
    console.log(`Added ${quantity} ${title} to the cart`);
  };

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
            <ButtonGroup size='small' sx={{ maxHeight: 35}}>
              <Select
                value={quantity}
                label="Quantity"
                onChange={(e) => setQuantity(Number.parseInt(e.target.value as string))}
              >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
              </Select>
              <Button variant="contained" onClick={addToCart}>
                Add {quantity} to Cart
              </Button>
            </ButtonGroup>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
};

export default ProductCard;
