import React from 'react';
import { Text, View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';
import { Card, Paragraph } from 'react-native-paper';

const thirdLayout = [
  {
    width: 220,
    height: 20,
    marginBottom: 8,
  },
  {
    width: 180,
    height: 20,
  },
];

export function ProductPlaceholder() {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.imagePlaceholder} />
        <Paragraph style={styles.placeholder}>&nbsp;</Paragraph>
        <Paragraph style={styles.placeholder}>&nbsp;</Paragraph>
        <Paragraph style={styles.placeholder}>&nbsp;</Paragraph>
        <ActivityIndicator animating={true} color="#000" style={styles.loader} />
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
    height: 200, // Set the height of the placeholder image
    borderRadius: 5,
    marginBottom: 10,
  },
});
