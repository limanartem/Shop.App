import { Order } from '@shop.app/lib.client-data/dist/model';
import { StyleSheet, View } from 'react-native';
import { Card, Icon, Text, useTheme } from 'react-native-paper';
import { DateTime } from '../../components/DateTime';
import { OrderStatusIndicator, OrderStatusProgress } from './OrderStatusIndicator';

const calculateTotal = (order: Order) => {
  return (
    order.items.reduce(
      (total: number, item) => total + (item.product?.price || 0) * item.quantity,
      0,
    ) || 0
  ).toFixed(2);
};

export default function OrderedItem({ order }: { order: Order }) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginVertical: 5,
      marginHorizontal: 10,
      paddingVertical: 10,
    },
    cardCover: {
      borderRadius: 0,
    },
    price: {
      textAlign: 'left',
    },
    label: {
      fontWeight: '800',
    },
    rowsContainer: {},
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 30,
    },
    contentStyle: {
      margin: 0,
      padding: 0,
    },
  });

  return (
    <Card style={styles.container} contentStyle={styles.contentStyle}>
      <Card.Title
        titleVariant="bodyMedium"
        title={
          <>
            <Text style={styles.label}>Placed on: </Text>
            <DateTime date={order.createdAt} />
          </>
        }
        left={(props) => <Icon source="cart-variant" size={20} color={theme.colors.primary} />}
        leftStyle={{ marginRight: 0, marginLeft: 0, marginTop: 50 }}
        rightStyle={{ marginRight: 10, marginTop: 50 }}
        right={(props) => <Icon source="dots-vertical" size={20} />}
        subtitleNumberOfLines={2}
        subtitleVariant="bodyMedium"
        subtitleStyle={styles.rowsContainer}
        subtitle={
          <View>
            <View style={styles.row}>
              <Text style={styles.price}>
                <Text style={styles.label}>Total: </Text>
                {calculateTotal(order)}
                <Text>&nbsp;{order.items[0]?.product?.currency}</Text>
              </Text>
            </View>
            <View style={styles.row}>
              <Text>
                <Text style={styles.label}>Status: </Text>
              </Text>
              <View>
                <OrderStatusIndicator status={order.status} />
              </View>
            </View>
          </View>
        }
      />
      <Card.Content>
        <View style={{ marginLeft: 40, marginRight: 14 }}>
          <OrderStatusProgress status={order.status} />
        </View>
      </Card.Content>
    </Card>
  );
}
