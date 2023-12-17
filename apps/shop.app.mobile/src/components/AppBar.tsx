import * as React from 'react';
import { Appbar, Badge, useTheme } from 'react-native-paper';
import { StyleSheet, Image, View } from 'react-native';
import { useAppSelector } from '../app/hooks';

const AppBar = ({ title }: { title: string }) => {
  const itemsCount = useAppSelector((state) =>
    state.shoppingCart.items.reduce((count, item) => count + item.quantity, 0),
  );
  const theme = useTheme();
  const styles = StyleSheet.create({
    appBar: {},
    badge: {
      position: 'absolute',
      top: 4,
      right: 0,
      backgroundColor: theme.colors.primary,
    },
  });

  return (
    <Appbar.Header style={styles.appBar}>
      <Appbar.Action icon="menu" onPress={() => {}} />
      <Image source={require('../../assets/logo/shop.app.logo.png')} style={{ width: 40, height: 40 }} />
      <Appbar.Content title={title} />
      <Appbar.Action icon="magnify" onPress={() => {}} />
      <View>
        <Appbar.Action icon="cart" onPress={() => {}} />
        <Badge style={styles.badge} visible={itemsCount > 0}>{itemsCount}</Badge>
      </View>
      <Appbar.Action icon="account-circle" onPress={() => {}} />
    </Appbar.Header>
  );
};

export default AppBar;
