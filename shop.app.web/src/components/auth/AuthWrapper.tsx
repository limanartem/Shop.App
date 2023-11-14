/* eslint-disable react-hooks/exhaustive-deps */
import SuperTokens, { SuperTokensWrapper } from 'supertokens-auth-react';
import ThirdPartyEmailPassword, {
  Google,
  Facebook,
  Apple,
} from 'supertokens-auth-react/recipe/thirdpartyemailpassword';
import Session from 'supertokens-auth-react/recipe/session';
import { getSuperTokensRoutesForReactRouterDom } from 'supertokens-auth-react/ui';
import { ThirdPartyEmailPasswordPreBuiltUI } from 'supertokens-auth-react/recipe/thirdpartyemailpassword/prebuiltui';
import * as reactRouterDom from 'react-router-dom';
import { OnHandleEventContext } from 'supertokens-auth-react/lib/build/recipe/emailpassword';
import { useAppDispatch } from '../../app/hooks';
import { setUser } from '../../app/reducers/authReducer';
import { useEffect, useState } from 'react';
import { getUserAsync } from '../../services/auth';

const { REACT_APP_AUTH_API_URL = 'http://localhost:3003' } = process.env;

const initAuth = (onHandleEvent: (context: OnHandleEventContext) => void) =>
  SuperTokens.init({
    appInfo: {
      // TODO: use env vars
      appName: 'Shop.App',
      apiDomain: REACT_APP_AUTH_API_URL,
      websiteDomain: window.location.host,
      apiBasePath: '/auth',
      websiteBasePath: '/auth',
    },
    recipeList: [
      ThirdPartyEmailPassword.init({
        onHandleEvent: onHandleEvent,
        signInAndUpFeature: {
          providers: [Google.init(), Facebook.init(), Apple.init()],
        },
      }),
      Session.init({
        tokenTransferMethod: 'header'
      }),
    ],
  });

type AuthWrapperProps = {
  children?: React.ReactNode;
  onAuthInitialized: () => void;
};

export function AuthWrapper({ children, onAuthInitialized }: AuthWrapperProps) {
  const dispatch = useAppDispatch();
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    initAuth((context) => {
      if (context.action === 'SUCCESS') {
        dispatch(setUser(context.user));
      }
    });

    const checkAuthentication = async () => {
      const isLogged = await Session.doesSessionExist();

      if (isLogged) {
        const user = await getUserAsync();
        dispatch(setUser(user));
      }
    };

    checkAuthentication();
    onAuthInitialized();
    setAuthInitialized(true);
  }, []);

  return <>{authInitialized && <SuperTokensWrapper>{children}</SuperTokensWrapper>}</>;
}

export function AuthRoutes() {
  return getSuperTokensRoutesForReactRouterDom(reactRouterDom, [ThirdPartyEmailPasswordPreBuiltUI]);
}
