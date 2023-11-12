import {
  Box,
  Button,
  ButtonGroup,
  Grid,
  List,
  ListItem,
  Popover,
  Typography,
} from '@mui/material';
import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { clearCart } from '../../app/reducers/shoppingCartReducer';
import { useNavigate } from 'react-router-dom';
import { CartProductCard } from './CartProductCard';

interface ShoppingCartPopupProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose?: (event: React.UIEvent<HTMLElement>) => void;
}

export function ShoppingCartPopup({ open, anchorEl, onClose }: ShoppingCartPopupProps) {
  const items = useAppSelector((state) => state.shoppingCart.items);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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
                  <CartProductCard item={item} flow="shoppingCart" />
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
                <Button
                  variant="contained"
                  onClick={(e) => {
                    navigate('checkout');
                    onClose?.(e);
                  }}
                >
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
