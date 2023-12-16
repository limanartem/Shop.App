import * as React from 'react';
import { Appbar } from 'react-native-paper';
import { StyleSheet, Image, View } from 'react-native';

const AppBar = ({ title }: { title: string }) => (
  <Appbar.Header style={styles.appBar}>
    <Appbar.Action icon="menu" onPress={() => {}} />
    <Image source={require('assets/logo/shop.app.logo.png')} style={{ width: 40, height: 40 }} />
    <Appbar.Content title={title} />
    <Appbar.Action icon="magnify" onPress={() => {}} />
    <Appbar.Action icon="cart" onPress={() => {}} />
    <Appbar.Action icon="account-circle" onPress={() => {}} />
  </Appbar.Header>
);

const styles = StyleSheet.create({
  appBar: {
      
    },
});

export default AppBar;
