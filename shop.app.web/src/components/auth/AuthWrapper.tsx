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

const initAuth = (onHandleEvent: (context: OnHandleEventContext) => void) =>
  SuperTokens.init({
    appInfo: {
      // TODO: use env vars
      appName: 'Shop.App',
      apiDomain: 'localhost:3003',
      websiteDomain: 'localhost:3002',
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
      Session.init(),
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

    onAuthInitialized();
    setAuthInitialized(true);
  }, []);

  return <>{authInitialized && <SuperTokensWrapper>{children}</SuperTokensWrapper>}</>;
}

export function AuthRoutes() {
  return getSuperTokensRoutesForReactRouterDom(reactRouterDom, [ThirdPartyEmailPasswordPreBuiltUI]);
}
