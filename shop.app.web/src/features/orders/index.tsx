import { useEffect, useState } from 'react';
import { getOrdersAsync } from '../../services/order-service';
import { Order } from '../../model';
import { DateTime } from '../../components/DateTime';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  Box,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CartProductCard } from '../../components/shopping-cart/CartProductCard';
import { StatusIndicator } from '../../components/shopping-cart/StatusIndicator';
import { OrderProgressIndicator } from './OrderProgressIndicator';

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState('');

  const toggleAccordion = (orderId: any) => {
    setExpandedOrderId(expandedOrderId === orderId ? '' : orderId);
  };

  const calculateTotal = (order: Order) => {
    return order.items
      .reduce((total: number, item) => total + item.product.price * item.quantity, 0)
      .toFixed(2);
  };

  const maskCreditCardNumber = (creditCardNumber: string) => {
    if (creditCardNumber.length > 8) {
      const maskedDigits = creditCardNumber.slice(0, -4).replace(/\d/g, '*');
      const visibleDigits = creditCardNumber.slice(-4);

      return maskedDigits + visibleDigits;
    }
    return creditCardNumber;
  };

  const maskIban = (iban: string) => {
    if (iban.length > 4) {
      const maskedCharacters = iban.slice(4, -4).replace(/[A-Z0-9]/g, '*');
      const visibleCharacters = iban.slice(-4);

      return iban.slice(0, 4) + maskedCharacters + visibleCharacters;
    }
    return iban;
  };

  useEffect(() => {
    const getOrders = async () => {
      const result = await getOrdersAsync();
      setOrders(result.orders);
    };

    getOrders();
  }, []);

  function SummaryCard({
    children,
    title,
    fixedHight = true,
  }: {
    children?: React.ReactNode;
    title: string;
    fixedHight?: boolean;
  }) {
    return (
      <Card style={{ height: fixedHight ? 120 : undefined }}>
        <CardContent>
          <Typography color="text.secondary" gutterBottom variant="subtitle2">
            {title}
          </Typography>
          {children}
        </CardContent>
      </Card>
    );
  }

  function SummaryItem({ children, title }: { children: React.ReactNode; title?: string }) {
    return (
      <Typography variant="body2">
        {title != null && <strong>{title}: </strong>}
        {children}
      </Typography>
    );
  }

  return (
    <Box>
      {orders.map((order, index) => (
        <Accordion
          key={order.id}
          expanded={expandedOrderId === order.id}
          onChange={() => toggleAccordion(order.id)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {!(expandedOrderId === order.id) && (
              <>
                <Grid container justifyContent="flex-end">
                  <Grid item xs={12} sm={10} textAlign="left">
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      <StatusIndicator status={order.status} />
                      &nbsp;Order placed on <DateTime date={order.createdAt} />
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={2} textAlign="right">
                    <Typography color="text.secondary" variant="body2">
                      <strong>Total:</strong> {calculateTotal(order)} USD
                    </Typography>
                  </Grid>
                </Grid>
              </>
            )}
            {(expandedOrderId === order.id) && <Typography variant="subtitle1">Order Details</Typography>}
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <OrderProgressIndicator orderStatus={order.status} />
              </Grid>
              <Grid item xs={4}>
                <SummaryCard title="Summary">
                  <SummaryItem title="Placed">
                    <DateTime date={order.createdAt} />
                  </SummaryItem>
                  <SummaryItem title="Status">
                    <StatusIndicator status={order.status} />
                  </SummaryItem>
                </SummaryCard>
              </Grid>
              <Grid item xs={4}>
                <SummaryCard title="Delivery Information">
                  <SummaryItem title="Address">
                    {order.shipping.address}, {order.shipping.city}, {order.shipping.zip},
                    {order.shipping.country}
                  </SummaryItem>
                </SummaryCard>
              </Grid>
              <Grid item xs={4}>
                <SummaryCard title="Payment Information">
                  <SummaryItem title={order.payment.creditCard ? 'Credit card' : 'IBAN'}>
                    {order.payment.creditCard != null && (
                      <>{maskCreditCardNumber(order.payment.creditCard.number)}</>
                    )}
                    {order.payment.bank != null && <>{maskIban(order.payment.bank.iban)}</>}
                  </SummaryItem>
                </SummaryCard>
              </Grid>
              <Grid item xs={12}>
                <SummaryCard title="Items summary" fixedHight={false}>
                  <SummaryItem>
                    <>
                      <List>
                        {order.items.map((item, index) => (
                          <ListItem alignItems="flex-start" key={item.product.id}>
                            <CartProductCard flow="orderDetails" item={item} />
                          </ListItem>
                        ))}
                      </List>
                      <Box style={{ marginTop: 2 }}>
                        <Typography color="text.secondary" variant="subtitle2">
                          <strong>Total:</strong> {calculateTotal(order)} USD
                        </Typography>
                      </Box>
                    </>
                  </SummaryItem>
                </SummaryCard>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
