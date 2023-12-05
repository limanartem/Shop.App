import { Order } from '../../model';
import {
  Typography,
  List,
  ListItem,
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  CardHeader,
  Button,
} from '@mui/material';
import { StatusIndicator } from '../shopping-cart/StatusIndicator';
import { OrderProgressIndicator } from './OrderProgressIndicator';
import { DateTime, MainContentContainer, OrderedProductCard } from '../../components';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getOrderAsync } from '../../services/order-service';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const calculateTotal = (order: Order) => {
  return (
    order.items.reduce(
      (total: number, item) => total + (item.product?.price || 0) * item.quantity,
      0,
    ) || 0
  ).toFixed(2);
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
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      {title != null && (
        <Typography variant="body2">{title != null && <strong>{title}: </strong>}</Typography>
      )}
      {wrapInContainer === true && <Box width="100%">{children}</Box>}
      {!wrapInContainer && <Typography variant="body2">{children}</Typography>}
    </Stack>
  );
}

export function OrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | undefined | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getOrder = async () => {
      if (id != null) {
        const result = await getOrderAsync(id);
        setOrder(result);
      }
    };

    getOrder();
  }, [id]);

  return (
    <>
      {order != null && (
        <Grid container justifyContent="center" data-testid="feature-orderPage">
          <MainContentContainer>
            <Card style={{ width: '100%' }}>
              <CardHeader
                title="Order Summary"
                action={
                  <Button variant="text" onClick={() => navigate('/orders')}>
                    All Orders <KeyboardArrowRightIcon />
                  </Button>
                }
              />
              <CardContent style={{ paddingTop: 0 }}>
                <OrderDetails order={order} />
              </CardContent>
            </Card>
          </MainContentContainer>
        </Grid>
      )}
    </>
  );
}

export function OrderDetails({ order }: { order: Order }) {
  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <OrderProgressIndicator orderStatus={order.status} />
      </Grid>
      <Grid item md={4} xs={12}>
        <SummaryCard title="Summary">
          <SummaryItem title="Placed">
            <DateTime date={order.createdAt} />
          </SummaryItem>
          <SummaryItem title="Status" wrapInContainer={true}>
            <StatusIndicator status={order.status} />
          </SummaryItem>
        </SummaryCard>
      </Grid>
      <Grid item md={4} xs={12}>
        <SummaryCard title="Delivery Information">
          <SummaryItem title="Address">
            {order.shipping != null && (
              <>
                {order.shipping.address}, {order.shipping.city}, {order.shipping.zip},
                {order.shipping.country}
              </>
            )}
          </SummaryItem>
        </SummaryCard>
      </Grid>
      <Grid item md={4} xs={12}>
        <SummaryCard title="Payment Information">
          <SummaryItem title={order.payment?.creditCard ? 'Credit card' : 'IBAN'}>
            {order.payment != null && (
              <>
                {order.payment.creditCard != null && (
                  <>{maskCreditCardNumber(order.payment.creditCard.number)}</>
                )}
                {order.payment.bank != null && <>{maskIban(order.payment.bank.iban)}</>}
              </>
            )}
          </SummaryItem>
        </SummaryCard>
      </Grid>
      <Grid item xs={12}>
        <SummaryCard title="Items summary" fixedHight={false}>
          <SummaryItem wrapInContainer={true}>
            {order.items?.length > 0 && (
              <>
                <List style={{ width: '100%' }}>
                  {order.items.map((item, index) => (
                    <ListItem alignItems="flex-start" key={index}>
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
            )}
          </SummaryItem>
        </SummaryCard>
      </Grid>
    </Grid>
  );
}
