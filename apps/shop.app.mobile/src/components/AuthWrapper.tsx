import { useAppDispatch, useAppSelector } from '../app/hooks';
import { initAuth, refreshAuthSession } from '../app/reducers/authReducer';
import { useEffect, useRef, useState } from 'react';
import { Icon, Snackbar, useTheme } from 'react-native-paper';
import { View } from 'react-native';

type AuthWrapperProps = {
  children?: React.ReactNode;
  onAuthInitialized?: () => void;
};

function LogInSnakeBar({ user }: { user: any }) {
  const isLoggedIn = user != null;
  const previous = useRef(user);
  const [visible, setVisible] = useState(false);

  const theme = useTheme();

  useEffect(() => {
    setVisible(previous.current != user);
    previous.current = user;
  }, [user]);

  return (
    <View>
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        icon={() => (
          <Icon
            source={isLoggedIn ? 'check-circle' : 'cancel'}
            size={20}
            color={theme.colors.primary}
          />
        )}
        onIconPress={() => setVisible(false)}
        duration={5000}
      >
        {isLoggedIn ? `Logged in as ${user.emails?.[0]}` : 'Logged out'}
      </Snackbar>
    </View>
  );
}

export function AuthWrapper({ children, onAuthInitialized }: AuthWrapperProps) {
  const dispatch = useAppDispatch();
  const [authInitialized, setAuthInitialized] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(initAuth());
    dispatch(refreshAuthSession());
    onAuthInitialized?.();
    setAuthInitialized(true);
  }, []);

  return (
    <>
      {authInitialized && (
        <>
          {children}
          <LogInSnakeBar user={user} />
        </>
      )}
    </>
  );
}
