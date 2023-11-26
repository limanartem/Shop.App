import { useEffect, useState } from 'react';
import { getOrdersAsync } from '../../services/order-service';
import { Order } from '../../model';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Card,
  CardContent,
  Grid,
  CardHeader,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MainContentContainer } from '../../components';
import { OrderDetails } from './OrderDetails';
import { OrderSummary } from './OrderSummary';

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

  useEffect(() => {
    const getOrders = async () => {
      const result = await getOrdersAsync();
      setOrders(result.orders);
    };

    getOrders();
  }, []);

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
                  {!(expandedOrderId === order.id) && <OrderSummary order={order} />}
                  {expandedOrderId === order.id && (
                    <Typography variant="subtitle1">Order Details</Typography>
                  )}
                </AccordionSummary>
                <AccordionDetails>
                  <OrderDetails order={order} />
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      </MainContentContainer>
    </Grid>
  );
}
