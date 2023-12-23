import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, useTheme, Icon, Card, HelperText } from 'react-native-paper';
import { TextInput as RNTextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signIn, signUp } from '../../app/reducers/authReducer';
import { unwrapResult } from '@reduxjs/toolkit';
import { useAppDispatch } from '../../app/hooks';

type Mode = 'login' | 'register';

const LoginForm = ({ route }) => {
  const { mode, redirectTo = 'Catalog' }: { mode: Mode; redirectTo?: string } = route.params;
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const nameRef = useRef<RNTextInput>(null);
  const emailRef = useRef<RNTextInput>(null);
  const passwordRef = useRef<RNTextInput>(null);

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('abc@dot.com');
  const [password, setPassword] = React.useState('Qwerty123');
  const [isEmailValid, setEmailValid] = React.useState(false);
  const [emailInputFocused, setEmailInputFocused] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const validateEmail = (email: string) => {
    // TODO: use a library for more comprehensive validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleLogin = async () => {
    setLoginError(null);
    setIsLoggingIn(true);

    dispatch(signIn({ email, password }))
      .then(unwrapResult)
      .then((result) => {
        if (result.success) {
          navigation.navigate(redirectTo as never);
        } else {
          setLoginError('Invalid credentials');
        }
      })
      .catch((error) => {
        console.error(error);
        setLoginError('Error occurred while logging in. Please try again');
      })
      .finally(() => {
        setIsLoggingIn(false);
      });
  };

  const handleRegister = async () => {
    setLoginError(null);
    setIsLoggingIn(true);

    dispatch(signUp({ email, password, name }))
      .then(unwrapResult)
      .then((result) => {
        if (result.success) {
          navigation.navigate(redirectTo as never);
        } else {
          setLoginError('Cannot register');
        }
      })
      .catch((error) => {
        console.error(error);
        setLoginError('Error occurred while registering. Please try again');
      })
      .finally(() => {
        setIsLoggingIn(false);
      });
  };

  const onBlurEmail = () => {
    setEmailInputFocused(false);
    setEmailValid(validateEmail(email));
  };

  const onChangeEmail = (text: string) => {
    setLoginError(null);
    setEmail(text);
    setEmailValid(validateEmail(email));
  };

  const handleNameSubmit = () => {
    emailRef.current?.focus();
  };
  const handleEmailSubmit = () => {
    if (validateEmail(email)) {
      passwordRef.current?.focus();
    }
  };

  const handlePasswordSubmit = () => {
    switch (mode) {
      case 'login':
        if (isEmailValid && password !== '') {
          handleLogin();
          break;
        }
      case 'register':
        if (isEmailValid && password !== '' && name !== '') {
          handleRegister();
          break;
        }
    }
  };

  const hasErrors = () => isEmailValid === false && email !== '' && !emailInputFocused;
  const nameHasErrors = () => name === '' && mode == 'register';

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    loginForm: {
      alignItems: 'stretch',
      justifyContent: 'center',
      width: '100%',
    },
    input: {
      width: '100%',
      marginBottom: 10,
    },
    button: {
      width: '100%',
      marginBottom: 10,
    },
    googleButton: {
      width: 192,
      height: 48,
      marginBottom: 10,
    },
    errorText: {
      color: theme.colors.error,
      marginBottom: 10,
    },
    userSkeleton: {
      padding: 20,
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Card style={styles.loginForm}>
        <Card.Content>
          <View style={styles.userSkeleton}>
            <Icon source="account-circle-outline" size={80} color={theme.colors.primary} />
          </View>
          {mode == 'register' && (
            <>
              <TextInput
                ref={nameRef}
                autoFocus
                label="Name"
                value={name}
                onChangeText={(text) => setName(text)}
                onSubmitEditing={handleNameSubmit}
                returnKeyType="next"
                style={styles.input}
                error={nameHasErrors()}
                disabled={isLoggingIn}
              />
              {nameHasErrors() && (
                <HelperText type="error" padding="none">
                  Name is required!
                </HelperText>
              )}
            </>
          )}
          <TextInput
            ref={emailRef}
            autoFocus={mode == 'login'}
            label="Email"
            value={email}
            onChangeText={onChangeEmail}
            onBlur={onBlurEmail}
            onFocus={() => {
              setEmailInputFocused(true);
              setEmailValid(validateEmail(email)); // Reset validation when the field is focused
            }}
            onSubmitEditing={handleEmailSubmit}
            returnKeyType="next"
            style={styles.input}
            error={hasErrors()}
            disabled={isLoggingIn}
          />
          {hasErrors() && (
            <HelperText type="error" padding="none">
              Email address is invalid!
            </HelperText>
          )}
          <TextInput
            ref={passwordRef}
            label="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            onSubmitEditing={handlePasswordSubmit}
            returnKeyType="done"
            secureTextEntry
            style={styles.input}
            disabled={isLoggingIn}
          />
          {loginError && (
            <HelperText type="error" padding="none" style={{ textAlign: 'center' }}>
              {loginError}
            </HelperText>
          )}
          {mode == 'login' && (
            <>
              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.button}
                disabled={isLoggingIn || !isEmailValid || password === ''}
                loading={isLoggingIn}
              >
                Login
              </Button>
              <Button
                mode="text"
                disabled={isLoggingIn}
                onPress={() => navigation.navigate('SignUp' as never)}
              >
                Register
              </Button>
            </>
          )}
          {mode == 'register' && (
            <>
              <Button
                mode="contained"
                onPress={handleRegister}
                style={styles.button}
                disabled={isLoggingIn || !isEmailValid || password === '' || name === ''}
                loading={isLoggingIn}
              >
                Register
              </Button>
              <Button
                mode="text"
                disabled={isLoggingIn}
                onPress={() => navigation.navigate('SignIn' as never)}
              >
                Login
              </Button>
            </>
          )}
        </Card.Content>
      </Card>
    </View>
  );
};

export default LoginForm;
