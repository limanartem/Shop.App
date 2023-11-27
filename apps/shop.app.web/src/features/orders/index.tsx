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
  Backdrop,
  CircularProgress,
  Button,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MainContentContainer } from '../../components';
import { OrderDetails } from './OrderDetails';
import { OrderSummary } from './OrderSummary';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useNavigate } from 'react-router-dom';

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

  const toggleAccordion = (orderId: any) => {
    setExpandedOrderId(expandedOrderId === orderId ? '' : orderId);
  };

  useEffect(() => {
    setLoading(true);

    const getOrders = async () => {
      const result = await getOrdersAsync();
      setOrders(result.orders);
      setLoading(false);
    };

    getOrders();
  }, []);

  return (
    <Grid container justifyContent="center" data-testid="feature-orders">
      <MainContentContainer>
        <Card style={{ width: '100%' }}>
          <CardHeader title="Orders Archive" subheader="Your previously placed orders" />
          <CardContent style={{ paddingTop: 0 }}>
            <Backdrop
              sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={loading}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
            {orders.sort(sortOrdersDesc).map((order, index) => (
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
                      <Box  sx={{ flex: '1 0 auto', textAlign: 'right' }}>
                        <Button
                          variant="text"
                          onClick={() => navigate(`/orders/${order.id}`)}
                         
                        >
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
            ))}
          </CardContent>
        </Card>
      </MainContentContainer>
    </Grid>
  );
}
