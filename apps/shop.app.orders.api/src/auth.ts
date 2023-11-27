import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import supertokens from 'supertokens-node';
import { SessionRequest } from 'supertokens-node/framework/express';
import Session from 'supertokens-node/recipe/session';
import UserRoles from 'supertokens-node/recipe/userroles';

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
      connectionURI: `http://${AUTH_CORE_URL!}`,
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
      UserRoles.init(),
    ],
  });
};

export const verifyUserRole = (
  role: string,
): ((req: SessionRequest, res: Response, next: NextFunction) => Promise<void>) => {
  return async (req, res, next) => {
    if (req.session == null){
      res.status(StatusCodes.UNAUTHORIZED).json({error: 'User is not logged in'});
      return;
    }
    
    const roles = await UserRoles.getRolesForUser(req.session.getTenantId(), req.session?.getUserId());
    if (roles.roles.indexOf(role) > -1) {
      next();
    } else {
      res.status(StatusCodes.FORBIDDEN).json({error: 'Action is not allowed for this user'});
    }
  };
};
