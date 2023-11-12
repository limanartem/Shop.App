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
      signInAndUpFeature: {
        providers: [Google.init(), Facebook.init(), Apple.init()],
      },
    }),
    Session.init(),
  ],
});

export function AuthWrapper({ children }: { children?: React.ReactNode }) {
  return <SuperTokensWrapper>{children}</SuperTokensWrapper>;
}

export function AuthRoutes() {
  return getSuperTokensRoutesForReactRouterDom(reactRouterDom, [ThirdPartyEmailPasswordPreBuiltUI]);
}
