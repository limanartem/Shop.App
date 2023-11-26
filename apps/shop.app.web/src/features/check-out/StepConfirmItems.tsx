import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Box, Button, ButtonGroup, List, ListItem, Typography } from '@mui/material';
import { FormEventHandler, useCallback } from 'react';
import { confirmCheckoutItems } from '../../app/reducers/checkOutReducer';
import { OrderedProductCard } from '../../components';

export function StepConfirmItems() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.shoppingCart.items);

  const calculateTotal = useCallback(() => {
    return items
      .reduce((total: number, item) => total + (item.product?.price || 0) * item.quantity, 0)
      .toFixed(2);
  }, [items]);

  const handleFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    dispatch(confirmCheckoutItems());
  };

  return (
    <Box>
      <List sx={{ width: '100%' }} data-testid="list-products">
        {items?.map((item) => (
          <ListItem
            alignItems="flex-start"
            key={item.product.id}
            data-testid={`product-${item.product.id}`}
          >
            <OrderedProductCard item={item} flow="checkout" />
          </ListItem>
        ))}
      </List>
      <Typography color="text.secondary" variant="body2">
        <strong>Total:</strong> {calculateTotal()} USD
      </Typography>
      <Box textAlign="right" padding={2}>
        <form onSubmit={handleFormSubmit}>
          <ButtonGroup size="large">
            <Button variant="contained" color="primary" style={{ minWidth: 80 }} type="submit">
              Continue
            </Button>
          </ButtonGroup>
        </form>
      </Box>
    </Box>
  );
}
