/**
 * This file contains authentication-related functions and middleware for the Shop.App Orders API.
 */

import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import supertokens from 'supertokens-node';
import { SessionRequest } from 'supertokens-node/framework/express';
import Session from 'supertokens-node/recipe/session';
import UserRoles from 'supertokens-node/recipe/userroles';

const { AUTH_API_URL } = process.env;


/**
 * Initializes the authentication configuration for the Shop.App Orders API.
 */
export const initAuth = () => {
  const { AUTH_CORE_DOMAIN, WEB_SERVER_PORT, WEB_UI_URL } = process.env;

  if (!AUTH_CORE_DOMAIN || !AUTH_API_URL || !WEB_SERVER_PORT) {
    console.error('One or more required environment variables are not defined', {
      AUTH_CORE_DOMAIN,
      WEB_SERVER_PORT,
      WEB_UI_URL,
    });
    throw new Error('One or more required environment variables are not defined');
  }

  supertokens.init({
    framework: 'express',
    supertokens: {
      connectionURI: `http://${AUTH_CORE_DOMAIN!}`,
      // apiKey: <API_KEY(if configured)>,
    },
    appInfo: {
      // learn more about this on https://supertokens.com/docs/thirdpartyemailpassword/appinfo
      appName: 'Shop.App',
      apiDomain: `http://localhost:${WEB_SERVER_PORT}`,
      websiteDomain: 'localhost',
      apiBasePath: '/auth',
    },
    recipeList: [
      Session.init(), // initializes session features 
      UserRoles.init(),
    ],
  });
};

/**
 * Middleware function to verify the user's role.
 * @param role - The role to be verified.
 * @returns A middleware function that checks if the user has the specified role.
 */
export const verifyUserRole = (
  role: string,
): ((req: SessionRequest, res: Response, next: NextFunction) => Promise<void>) => {
  return async (req, res, next) => {
    if (req.session == null) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User is not logged in' });
      return;
    }

    const roles = await UserRoles.getRolesForUser(
      req.session.getTenantId(),
      req.session?.getUserId(),
    );

    if (roles.roles.indexOf(role) > -1) {
      next();
    } else {
      res.status(StatusCodes.FORBIDDEN).json({ error: 'Action is not allowed for this user' });
    }
  };
};