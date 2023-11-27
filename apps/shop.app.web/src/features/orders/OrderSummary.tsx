import { Order } from '../../model';
import { Typography, Grid } from '@mui/material';
import { StatusIndicator } from '../shopping-cart/StatusIndicator';
import { DateTime } from '../../components';

const calculateTotal = (order: Order) => {
  return (
    order.items.reduce(
      (total: number, item) => total + (item.product?.price || 0) * item.quantity,
      0,
    ) || 0
  ).toFixed(2);
};

export function OrderSummary({ order }: { order: Order }) {
  return (
    <Grid container>
      <Grid item textAlign="left">
        <Typography color="text.secondary" gutterBottom variant="body2">
          <StatusIndicator status={order.status} />
          &nbsp;Order placed on <DateTime date={order.createdAt} />
        </Typography>
      </Grid>
      <Grid item textAlign="right" xs>
        <Typography color="text.secondary" variant="body2">
          <strong>Total:</strong> {calculateTotal(order)} USD
        </Typography>
      </Grid>
    </Grid>
  );
}
