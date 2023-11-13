import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';

export const initAuth = () => {
  const {
    AUTH_CORE_URL = 'localhost:3567',
    WEB_API_PORT = 3003,
    WEB_API_URL = 'localhost',
    WEB_UI_URL = 'localhost:3002',
  } = process.env;

  supertokens.init({
    framework: 'express',
    supertokens: {
      connectionURI: AUTH_CORE_URL!,
      // apiKey: <API_KEY(if configured)>,
    },
    appInfo: {
      // learn more about this on https://supertokens.com/docs/thirdpartyemailpassword/appinfo
      appName: 'Shop.App',
      apiDomain: `${WEB_API_URL}:${WEB_API_PORT}`,
      websiteDomain: WEB_UI_URL,
      apiBasePath: '/auth',
    },
    recipeList: [
      Session.init(), // initializes session features
    ],
  });
};
