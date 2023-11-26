import { useEffect, useState } from 'react';
import { getOrdersAsync } from '../../services/order-service';
import { Order } from '../../model';
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
  CardHeader,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { StatusIndicator } from '../shopping-cart/StatusIndicator';
import { OrderProgressIndicator } from './OrderProgressIndicator';
import { DateTime, MainContentContainer, OrderedProductCard } from '../../components';

function sortOrdersDesc(o2: Order, o1: Order): number {
  const o1Date = new Date(o1.createdAt).getTime();
  const o2Date = new Date(o2.createdAt).getTime();
  return o1Date - o2Date;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState('');

  const toggleAccordion = (orderId: any) => {
    setExpandedOrderId(expandedOrderId === orderId ? '' : orderId);
  };

  const calculateTotal = (order: Order) => {
    return order.items
      .reduce((total: number, item) => total + (item.product?.price || 0) * item.quantity, 0)
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
    children?: React.ReactElement<typeof SummaryItem> | React.ReactElement<typeof SummaryItem>[];
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

  function SummaryItem({
    children,
    title,
    wrapInContainer,
  }: {
    children: React.ReactNode;
    title?: string;
    wrapInContainer?: boolean;
  }) {
    console.log(children);
    return (
      <Stack direction={{ xs: 'column', sm: 'row' }}  spacing={1}>
        {title != null && (
          <Typography variant="body2">{title != null && <strong>{title}: </strong>}</Typography>
        )}
        {wrapInContainer === true && <Box width="100%">{children}</Box>}
        {!wrapInContainer && <Typography variant="body2">{children}</Typography>}
      </Stack>
    );
  }

  return (
    <Grid container justifyContent="center" data-testid="feature-orders">
      <MainContentContainer>
        <Card style={{ width: '100%' }}>
          <CardHeader title="Orders Archive" subheader="Your previously placed orders" />
          <CardContent style={{ paddingTop: 0 }}>
            {orders.sort(sortOrdersDesc).map((order, index) => (
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
                  {expandedOrderId === order.id && (
                    <Typography variant="subtitle1">Order Details</Typography>
                  )}
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <OrderProgressIndicator orderStatus={order.status} />
                    </Grid>
                    <Grid item md={4} xs={12}>
                      <SummaryCard title="Summary">
                        <SummaryItem title="Placed">
                          <DateTime date={order.createdAt} />
                        </SummaryItem>
                        <SummaryItem title="Status">
                          <StatusIndicator status={order.status} />
                        </SummaryItem>
                      </SummaryCard>
                    </Grid>
                    <Grid item md={4} xs={12}>
                      <SummaryCard title="Delivery Information">
                        <SummaryItem title="Address">
                          {order.shipping.address}, {order.shipping.city}, {order.shipping.zip},
                          {order.shipping.country}
                        </SummaryItem>
                      </SummaryCard>
                    </Grid>
                    <Grid item md={4} xs={12}>
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
                        <SummaryItem wrapInContainer={true}>
                          <>
                            <List style={{ width: '100%'}}>
                              {order.items.map((item, index) => (
                                <ListItem alignItems="flex-start" key={item.product?.id}>
                                  {item.product != null && (
                                    <OrderedProductCard flow="orderDetails" item={item} />
                                  )}
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
          </CardContent>
        </Card>
      </MainContentContainer>
    </Grid>
  );
}
