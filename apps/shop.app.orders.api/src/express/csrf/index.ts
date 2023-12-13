/**
 * Express middleware for CSRF protection.
 * Generates and validates CSRF tokens using the double submit cookie pattern.
 *
 * @remarks
 * This middleware uses the `csrf-csrf` library to handle CSRF protection.
 * It generates a CSRF token and attaches it to the response as a JSON object.
 * The token can then be used to validate subsequent requests.
 *
 * @example
 * // Generate CSRF token
 * router.get('/csrf-token', (req, res) => {
 *   const csrfToken = generateToken(req, res);
 *   res.json({ csrfToken });
 * });
 *
 * // Validate CSRF token
 * router.post('/csrf-token-check', doubleCsrfProtection, (req, res) => {
 *   res.json({ message: 'CSRF token accepted' });
 * });
 *
 * @returns The router middleware for CSRF protection.
 */
import express from 'express';
import 'csrf-csrf';
import { doubleCsrf } from 'csrf-csrf';
import { randomUUID } from 'crypto';

const CSRF_SECRET = randomUUID();

const {
  generateToken,
  //validateRequest,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => CSRF_SECRET,
  cookieOptions: {
    secure: false,
    signed: false,
  },
});

/**
 * Creates and returns an Express router for CSRF token generation and verification.
 * @returns The Express router.
 */
export const routerFactory = () => {
  const router = express.Router();

  router.get('/csrf-token', (req, res) => {
    const csrfToken = generateToken(req, res);

    console.log({ CSRF_SECRET });
    res.json({ csrfToken });
  });

  router.post('/csrf-token-check', doubleCsrfProtection, (req, res) => {
    res.json({ message: 'CSRF token accepted' });
  });

  return router;
};

export { doubleCsrfProtection as csrfMiddleware };
