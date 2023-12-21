import * as React from 'react';
import { Appbar, useTheme, Menu, Divider } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useNavigation } from '@react-navigation/native';
import { signOut } from '../app/reducers/authReducer';
import { useState } from 'react';

const AppBar = ({ title }: { title: string }) => {
  const navigation = useNavigation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [menuVisible, setMenuVisible] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const isLoggedIn = React.useCallback(() => user != null, [user]);

  const closeMenu = () => setMenuVisible(false);

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
      {navigation.canGoBack() ? (
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      ) : (
        <Appbar.Action icon="menu" onPress={() => {}} />
      )}
      {/* 
      <Image
        source={require('../../assets/logo/shop.app.logo.png')}
        style={{ width: 40, height: 40 }}
      />
      */}
      <Appbar.Content title={title} />
      {/* <Appbar.Action icon="magnify" onPress={() => {}} /> */}
      {/*
      <View>
        <Appbar.Action icon="cart" onPress={() => {}} />  
        <Appbar.Action
          icon="cart"
          onPress={() => {}}
          onPressOut={() => navigation.navigate({ name: 'ShoppingCart' })}
        />
        <Badge style={styles.badge} visible={itemsCount > 0}>
          {itemsCount}
        </Badge>
      </View>
      */}

      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        anchorPosition="bottom"
        anchor={
          <Appbar.Action
            icon="account-circle"
            color={isLoggedIn() ? theme.colors.primary : undefined}
            onPress={() => {
              setMenuVisible(true);
            }}
          />
        }
      >
        {!isLoggedIn() ? (
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('SignIn' as never);
            }}
            title="Sign-in"
          />
        ) : (
          <>
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                dispatch(signOut());
              }}
              title="Sign out"
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Orders' as never);
              }}
              title="Orders"
            />
          </>
        )}
      </Menu>
    </Appbar.Header>
  );
};

export default AppBar;
