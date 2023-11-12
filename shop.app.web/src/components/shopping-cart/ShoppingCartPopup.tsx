import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardMedia,
  Grid,
  List,
  ListItem,
  Popover,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getProductImage, ProductFallbackImage } from '../../utils/product-utils';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { clearCart, removeFromCart } from '../../app/reducers/shoppingCartReducer';
import { ProductItem } from '../../model';

interface ShoppingCartPopupProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose?: (event: React.UIEvent<HTMLElement>) => void;
}

export function ShoppingCartPopup({ open, anchorEl, onClose }: ShoppingCartPopupProps) {
  const items = useAppSelector((state) => state.shoppingCart.items);
  const dispatch = useAppDispatch();

  const handleRemoveFromCart = (product: ProductItem) => {
    dispatch(removeFromCart(product));
    console.log(`Removed ${product.title} from the cart`);
  };

  const hasItems = useCallback(() => items.length > 0, [items]);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <Box style={{ minWidth: 360 }}>
        {hasItems() && (
          <List sx={{ width: '100%' }}>
            {items &&
              items?.map((item) => (
                  <ListItem alignItems="flex-start" key={item.product.id}>
                    <Card style={{ display: 'flex', width: '100%' }}>
                      <Grid container direction="row" justifyContent="flex-end" alignItems="center">
                        <Grid item xs={12} md={2}>
                          <CardMedia
                            component="img"
                            height="56"
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
                              {(item.product.price * item.quantity).toFixed(2)}){' '}
                              {item.product.currency}
                            </Typography>
                          </CardContent>
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <Tooltip title="Remove from Cart">
                            <Button
                              variant="outlined"
                              style={{ height: '24px', minWidth: '24px', maxWidth: '24px' }}
                              onClick={() => handleRemoveFromCart(item.product)}
                            >
                              <RemoveShoppingCartIcon fontSize="small" />
                            </Button>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Card>
                  </ListItem>
              ))}
          </List>
        )}
        {!hasItems() && (
          <Typography variant="subtitle1" textAlign="center" margin={3}>
            The Cart is Empty
          </Typography>
        )}
        {hasItems() && (
          <Grid container direction="column" padding={1}>
            <Grid item justifyContent="flex-end" textAlign="right">
              <Typography>
                <strong>Total:</strong>
                {items
                  ?.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
                  .toFixed(2)}{' '}
                {items?.[0]?.product.currency}{' '}
              </Typography>
            </Grid>
            <Grid item textAlign="right" marginTop={1}>
              <ButtonGroup size="small" variant="text" disabled={items.length === 0}>
                <Button variant="contained">
                  <ShoppingCartCheckoutIcon fontSize="small" />
                  Checkout
                </Button>{' '}
                <Button onClick={() => dispatch(clearCart())} variant="outlined">
                  <RemoveShoppingCartIcon fontSize="small" />
                  Clear All
                </Button>{' '}
              </ButtonGroup>
            </Grid>
          </Grid>
        )}
      </Box>
    </Popover>
  );
}
