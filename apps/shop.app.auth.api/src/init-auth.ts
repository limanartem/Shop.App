import Session from 'supertokens-node/recipe/session';
import ThirdPartyEmailPassword from 'supertokens-node/recipe/thirdpartyemailpassword';
import supertokens from 'supertokens-node';
import UserRoles from 'supertokens-node/recipe/userroles';

const {
  AUTH_CORE_DOMAIN,
  WEB_API_PORT,
  WEB_API_DOMAIN,
  PUBLIC_WEB_UI_DOMAINS,
  API_USER_EMAIL,
  API_USER_PASSWORD,
  ADMIN_USER_EMAIL,
  ADMIN_USER_PASSWORD,
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
      connectionURI: `http://${AUTH_CORE_DOMAIN!}`,
      // apiKey: <API_KEY(if configured)>,
    },
    appInfo: {
      // learn more about this on https://supertokens.com/docs/thirdpartyemailpassword/appinfo
      appName: 'Shop.App',
      apiDomain: `${WEB_API_DOMAIN}:${WEB_API_PORT}`,
      websiteDomain: PUBLIC_WEB_UI_DOMAINS.split(',')[0],
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

export const initSuperAdminUser = async () => {
  const AUTH_TENANT = 'public';

  console.log('Creating admin role..');

  const ADMIN_ROLE = 'admin';
  await UserRoles.createNewRoleOrAddPermissions(ADMIN_ROLE, [
    'read',
    'write',
    'manage-users',
    'manage-products',
    'manage-orders',
    'admin-access'
  ]);

  console.log('Signing up super admin user..');

  const adminUserPayload = {
    formFields: [
      { id: 'email', value: ADMIN_USER_EMAIL },
      { id: 'password', value: ADMIN_USER_PASSWORD },
    ],
  };

  let adminUser: SignUpInResponseType;

  const signUpResult = await fetch(`http://localhost:${WEB_API_PORT}/auth/signup`, {
    method: 'POST',
    body: JSON.stringify(adminUserPayload),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (signUpResult.ok) {
    const signUpResponse = (await signUpResult.json()) as SignUpInResponseType;

    console.log('Admin user sign up response', signUpResponse);

    if (signUpResponse.status === 'FIELD_ERROR') {
      console.log('Admin user already existed', signUpResponse);

      const signInResult = await fetch(`http://localhost:${WEB_API_PORT}/auth/signin`, {
        method: 'POST',
        body: JSON.stringify(adminUserPayload),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (signInResult.ok) {
        const signInResponse = (await signInResult.json()) as SignUpInResponseType;
        console.log('Admin user sign in response', signInResponse);
        if (signInResponse.status === 'OK') {
          adminUser = signInResponse;
        }
      }
    } else if (signUpResponse.status === 'OK') {
      adminUser = signUpResponse;
    }

    if (adminUser == null || adminUser.status !== 'OK') {
      throw new Error(`Not able to sign in/up admin with "${ADMIN_USER_EMAIL}" email`);
    }

    console.log(`Adding admin user ${adminUser.user.id} to ${ADMIN_ROLE} role..`);
    const addRoleResult = await UserRoles.addRoleToUser(
      adminUser.user.tenantIds[0],
      adminUser.user.id,
      ADMIN_ROLE,
    );

    if (addRoleResult.status !== 'OK') {
      throw new Error(
        `Not able to add role "${ADMIN_ROLE}" to admin user with "${ADMIN_USER_EMAIL}" email`,
      );
    }

    console.log(`Admin user added to the admin role. Validating`);
    const roles = await UserRoles.getRolesForUser(AUTH_TENANT, adminUser.user.id);
    console.log('Admin Roles', roles);

    if ((roles).roles.indexOf(ADMIN_ROLE) === -1) {
      throw new Error(`Not able to add role "${ADMIN_ROLE}" to admin user with "${ADMIN_USER_EMAIL}" email`);
    }
    
    console.log('Successfully created super admin user:', ADMIN_USER_EMAIL);
  } else {
    throw new Error(`Not able to create admin user with "${ADMIN_USER_EMAIL}" email`);
  }
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
