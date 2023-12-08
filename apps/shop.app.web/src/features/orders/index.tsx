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
  CardHeader,
  Backdrop,
  CircularProgress,
  Button,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { OrderDetails } from './OrderDetails';
import { OrderSummary } from './OrderSummary';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useNavigate } from 'react-router-dom';
import { OrderProductPlaceholder } from './OrderProductPlaceholder';
import { useAppSelector } from '../../app/hooks';
import { selectChangedOrderIds } from '../../app/reducers/notificationsReducer';

function sortOrdersDesc(o2: Order, o1: Order): number {
  const o1Date = new Date(o1.createdAt).getTime();
  const o2Date = new Date(o2.createdAt).getTime();
  return o1Date - o2Date;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const changedOrderIds = useAppSelector(selectChangedOrderIds);

  const toggleAccordion = (orderId: any) => {
    setExpandedOrderId(expandedOrderId === orderId ? '' : orderId);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    // Check if changedOrderIds contained in orders
    const orderIds = orders.map((order) => order.id);
    console.info('changedOrderIds and orderIds', changedOrderIds, orderIds);
    const hasChangedOrders = changedOrderIds?.some((changedOrderId) =>
      orderIds.includes(changedOrderId),
    );
    if (hasChangedOrders) {
      fetchOrders();
    }
  }, [changedOrderIds]);

  function fetchOrders() {
    setLoading(true);

    const getOrders = async () => {
      try {
        const result = await getOrdersAsync();
        setOrders(result.orders);
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }

  return (
    <Card style={{ width: '100%' }} data-testid="feature-orders">
      <CardHeader title="Orders Archive" subheader="Your previously placed orders" />
      <CardContent style={{ paddingTop: 0 }}>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        {!loading
          ? orders.sort(sortOrdersDesc).map((order) => (
              <Accordion
                key={order.id}
                expanded={expandedOrderId === order.id}
                onChange={() => toggleAccordion(order.id)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  {!(expandedOrderId === order.id) && <OrderSummary order={order} />}
                  {expandedOrderId === order.id && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <Typography variant="subtitle1">Order Details</Typography>
                      <Box sx={{ flex: '1 0 auto', textAlign: 'right' }}>
                        <Button variant="text" onClick={() => navigate(`/orders/${order.id}`)}>
                          Open <KeyboardArrowRightIcon />
                        </Button>
                      </Box>
                    </Box>
                  )}
                </AccordionSummary>
                <AccordionDetails>
                  <OrderDetails order={order} />
                </AccordionDetails>
              </Accordion>
            ))
          : [...Array(3).keys()].map((i) => (
              <Accordion disableGutters={true} key={i}>
                <AccordionSummary>
                  <OrderProductPlaceholder />
                </AccordionSummary>
              </Accordion>
            ))}
      </CardContent>
    </Card>
  );
}
