import SuperTokensWeb from 'supertokens-web-js';
import { Platform } from 'react-native';
import SuperTokensRN from 'supertokens-react-native';
import env from '../config/environment';
import Session from 'supertokens-web-js/recipe/session';
import EmailPassword from 'supertokens-web-js/recipe/thirdpartyemailpassword';
import { authServiceClient } from '../services';

const { REACT_APP_AUTH_API_URL } = env;

export const initSuperTokens = () => {
  if (Platform.OS === 'web') {
    SuperTokensWeb.init({
      appInfo: {
        appName: 'Shop.App.Mobile',
        apiDomain: REACT_APP_AUTH_API_URL,
        apiBasePath: '/auth',
      },
      recipeList: [
        EmailPassword.init(),
        Session.init({
          tokenTransferMethod: 'header',
        }),
      ],
    });
  } else {
    SuperTokensRN.init({
      apiDomain: REACT_APP_AUTH_API_URL,
      apiBasePath: '/auth',
    });
  }
};

export const doesSessionExist = async () => {
  if (Platform.OS === 'web') {
    return await Session.doesSessionExist();
  } else {
    return await SuperTokensRN.doesSessionExist();
  }
};

export const signOutSession = async () => {
  if (Platform.OS === 'web') {
    await Session.signOut();
  } else {
    await SuperTokensRN.signOut();
  }
};

export const signIn = async (email: string, password: string) => {
  if (Platform.OS === 'web') {
    const response = await EmailPassword.emailPasswordSignIn({
      formFields: [
        {
          id: 'email',
          value: email,
        },
        {
          id: 'password',
          value: password,
        },
      ],
    });
    if (response.status === 'OK') {
      //EmailPassword.thirdPartySignInAndUp()
      return { user: response.user, success: true };
    }
  } else {
    const loginResponse = await authServiceClient.signInAsync(email, password);

    if (loginResponse.status === 'OK' && loginResponse.user) {
      return { user: loginResponse.user, success: true };
    }
    return { success: false };
  }
};

export const getAccessToken = async () => {
  if (Platform.OS === 'web') {
    return await Session.getAccessToken();
  }
  return await SuperTokensRN.getAccessToken();
};
