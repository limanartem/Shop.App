/**
 * Utility functions for authentication.
 */

import JsonWebToken, { JwtHeader, JwtPayload, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const { AUTH_API_URL } = process.env;

const jwtClient = jwksClient({
  jwksUri: `${AUTH_API_URL}/auth/jwt/jwks.json`,
});

/**
 * Decodes a JSON Web Token (JWT).
 * @param token - The JWT to be decoded.
 * @returns A promise that resolves to the decoded payload of the JWT, or null if the token is invalid.
 */
export const decodeToken = (token: string): Promise<JwtPayload | null> =>
  new Promise<JwtPayload | null>((resolve) => {
    JsonWebToken.verify(token, getSigningKey, {}, (err, decoded) => {
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
