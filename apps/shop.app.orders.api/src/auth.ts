/**
 * This file contains authentication-related functions and middleware for the Shop.App Orders API.
 */

import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import supertokens from 'supertokens-node';
import { SessionRequest } from 'supertokens-node/framework/express';
import Session from 'supertokens-node/recipe/session';
import UserRoles from 'supertokens-node/recipe/userroles';
import JsonWebToken, { JwtHeader, JwtPayload, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const { AUTH_API_URL } = process.env;

const jwtClient = jwksClient({
  jwksUri: `${AUTH_API_URL}/auth/jwt/jwks.json`,
});

/**
 * Initializes the authentication configuration for the Shop.App Orders API.
 */
export const initAuth = () => {
  const {
    AUTH_CORE_URL,
    WEB_API_PORT,
    WEB_API_URL,
    WEB_UI_URL,
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

/**
 * Decodes a JSON Web Token (JWT).
 * @param token - The JWT to be decoded.
 * @returns A promise that resolves to the decoded payload of the JWT, or null if the token is invalid.
 */
export const decodeToken = (token: string): Promise<JwtPayload | null> =>
  new Promise<JwtPayload | null>((resolve) => {
    JsonWebToken.verify(token, getSigningKey, {}, (err, decoded) => {
      console.log({ err, decoded });
      if (err || decoded == null) {
        console.error('Invalid token: ' + err?.message);
        resolve(null);
      } else {
        resolve(decoded as JwtPayload);
      }
    });
  });

/**
 * Retrieves the signing key for verifying a JWT.
 * @param header - The header of the JWT.
 * @param callback - The callback function to be called with the signing key.
 */
const getSigningKey = (header: JwtHeader, callback: SigningKeyCallback) => {
  jwtClient.getSigningKey(header.kid, function (err, key) {
    const signingKey = key?.getPublicKey();
    callback(err, signingKey);
  });
};
