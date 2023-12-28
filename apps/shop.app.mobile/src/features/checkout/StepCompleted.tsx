import { useRef, useEffect, useState } from 'react';
import { Animated, View, UIManager, LayoutAnimation, Platform, StyleSheet } from 'react-native';
import { Button, Card, Icon, Text } from 'react-native-paper';
import { AnimatedProgressBar } from '../../components/AnimatedProgressBar';
import { useNavigation, CommonActions } from '@react-navigation/native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function StepCompleted() {
  const navigation = useNavigation();
  const marginAnimated = useRef(new Animated.Value(0));
  const [showMessage, setShowMessage] = useState(false);

  function navigateToOrders() {
    navigation.dispatch(CommonActions.reset({ routes: [{ name: 'Catalog' }, { name: 'Orders' }] }));
  }

  useEffect(() => {
    Animated.timing(marginAnimated.current, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start();
    marginAnimated.current.addListener(({ value }) => {
      if (value === 1) {
        navigateToOrders();
      }
      if (value > 0.7 && !showMessage) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowMessage(true);
      }
    });
  }, [marginAnimated]);

  return (
    <View style={styles.container}>
      <Card contentStyle={styles.cardContent} style={{ minHeight: 200 }} mode="outlined">
        <Card.Title title="" style={styles.cardTitle} />
        <Card.Content style={{ gap: 20 }}>
          <View style={styles.contentItem}>
            <Icon source="check-circle" size={80} color="#4caf50" />
          </View>
          <Text variant="titleSmall" style={styles.contentItem}>
            Your order has been placed and will appear in the list of orders where you can check
            status updates. Thank you!
          </Text>
          {showMessage && (
            <View style={styles.contentItem}>
              <Button mode="text" onPress={navigateToOrders}>
                Go to Orders...
              </Button>
            </View>
          )}
          <View>
            <AnimatedProgressBar
              animatedValue={marginAnimated.current}
              style={styles.progressBar}
            />
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    justifyContent: 'center',
    height: '100%',
  },
  card: {
    margin: 20,
    justifyContent: 'center',
    minHeight: 200,
  },
  cardTitle: {
    display: 'none',
  },
  cardContent: {
    alignItems: 'center',
    margin: 20,
    justifyContent: 'center',
    minHeight: 200,
  },
  contentItem: {
    alignItems: 'center',
    textAlign: 'center',
  },
  progressBar: {
    height: 5,
    borderRadius: 5,
    marginVertical: 10,
  },
});
