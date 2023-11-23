import Session from 'supertokens-node/recipe/session';
import ThirdPartyEmailPassword from 'supertokens-node/recipe/thirdpartyemailpassword';
import supertokens from 'supertokens-node';
import UserRoles from 'supertokens-node/recipe/userroles';

const {
  AUTH_CORE_URL = 'localhost:3567',
  WEB_API_PORT = 3003,
  WEB_API_URL = 'localhost',
  PUBLIC_WEB_UI_DOMAIN = 'localhost:3000',
  API_USER_EMAIL = 'apiUser@shop.app',
  API_USER_PASSWORD = 'Qwerty123',
} = process.env;

type SignUpInResponseType = {
  status: 'OK' | 'FIELD_ERROR' | 'WRONG_CREDENTIALS_ERROR';
  user: {
    id: string;
    tenantIds: string[];
  };
};

export const initAuth = () => {
  console.log('Configuring auth api', process.env);

  supertokens.init({
    framework: 'express',
    supertokens: {
      connectionURI: `http://${AUTH_CORE_URL!}`,
      // apiKey: <API_KEY(if configured)>,
    },
    appInfo: {
      // learn more about this on https://supertokens.com/docs/thirdpartyemailpassword/appinfo
      appName: 'Shop.App',
      apiDomain: `${WEB_API_URL}:${WEB_API_PORT}`,
      websiteDomain: PUBLIC_WEB_UI_DOMAIN,
      apiBasePath: '/auth',
      websiteBasePath: '/auth',
    },
    recipeList: [
      ThirdPartyEmailPassword.init({
        /*TODO: See next step*/
      }),
      Session.init(), // initializes session features
      UserRoles.init()
    ],
  });
};

export const initApiUser = async () => {
  const AUTH_TENANT = 'public';

  console.log('Creating api user role..');

  const API_USER_ROLE = 'api';
  const result = await UserRoles.createNewRoleOrAddPermissions(API_USER_ROLE, ['read', 'write']);
  

  console.log('Signing up api user..');

  const apiUserPayload = {
    formFields: [
      { id: 'email', value: API_USER_EMAIL },
      { id: 'password', value: API_USER_PASSWORD },
    ],
  };

  let apiUser: SignUpInResponseType;

  const signUpResult = await fetch(`http://localhost:${WEB_API_PORT}/auth/signup`, {
    method: 'POST',
    body: JSON.stringify(apiUserPayload),
  });

  if (signUpResult.ok) {
    const signUpResponse = (await signUpResult.json()) as SignUpInResponseType;

    console.log('User sign up response', signUpResponse);

    if (signUpResponse.status === 'FIELD_ERROR') {
      console.log('User already existed', signUpResponse);

      const signInResult = await fetch(`http://localhost:${WEB_API_PORT}/auth/signin`, {
        method: 'POST',
        body: JSON.stringify(apiUserPayload),
      });

      if (signInResult.ok) {
        const signInResponse = (await signInResult.json()) as SignUpInResponseType;
        console.log('User sign in response', signInResponse);
        if (signInResponse.status === 'OK') {
          apiUser = signInResponse;
        }
      }
    } else if (signUpResponse.status === 'OK') {
      apiUser = signUpResponse;
    }

    if (apiUser == null || apiUser.status !== 'OK') {
      throw new Error(`Not able to sign in/up with "${API_USER_EMAIL}" email`);
    }

    console.log(`Adding api user ${apiUser.user.id} tp ${API_USER_ROLE} role..`);
    const addRoleResult = await UserRoles.addRoleToUser(
      apiUser.user.tenantIds[0],
      apiUser.user.id,
      API_USER_ROLE,
    );

    if (addRoleResult.status !== 'OK') {
      throw new Error(
        `Not able to add role "${API_USER_ROLE}" to user with "${API_USER_EMAIL}" email`,
      );
    }

    console.log(`User added to the role role. Validating`);
    const roles = await UserRoles.getRolesForUser(AUTH_TENANT, apiUser.user.id);
    console.log('Roles', roles);

    if ((roles).roles.indexOf(API_USER_ROLE) === -1) {
      throw new Error(`Not able to add role "${API_USER_ROLE}" to user with "${API_USER_EMAIL}" email`);
    }
  } else {
    throw new Error(`Not able to create api user with "${API_USER_EMAIL}" email`);
  }

  

  console.log('Done creating initial roles and API user...');
};
