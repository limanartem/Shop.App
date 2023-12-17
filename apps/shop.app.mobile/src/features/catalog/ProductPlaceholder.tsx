import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { Card } from 'react-native-paper';

export function ProductPlaceholder() {
  const colorAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateColors = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(colorAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(colorAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ]),
      ).start();
    };

    animateColors();

    return () => {
      colorAnimation.setValue(0);
    };
  }, [colorAnimation]);

  const backgroundColor = colorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#eee', '#ddd'],
  });

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Animated.View style={[styles.placeholder, { backgroundColor }]} />
        <Animated.View style={[styles.placeholder, { backgroundColor }]} />
        <Animated.View style={[styles.imagePlaceholder, { backgroundColor }]} />
        <Animated.View style={[styles.placeholder, { backgroundColor }]} />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginVertical: 5,
    marginHorizontal: 10,
  },
  placeholder: {
    backgroundColor: '#eee',
    marginBottom: 10,
    borderRadius: 5,
    height: 10,
  },
  loader: {
    marginTop: 10,
  },
  imagePlaceholder: {
    backgroundColor: '#eee',
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
});
