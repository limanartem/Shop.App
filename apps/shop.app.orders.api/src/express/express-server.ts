import express from 'express';
import {
  middleware as authMiddleware,
  errorHandler as authErrorHandler,
} from 'supertokens-node/framework/express';
import { initAuth } from '../utils/auth';
import { routerFactory as ordersRouterFactory } from './order-routes';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import { useGraphql } from './graphql';
import { useTracing, useLogging } from '@shop.app/lib.express/dist';
import { routerFactory as csrfRouterFactory } from './csrf';
import cookeParser from 'cookie-parser';
import toobusy from 'toobusy-js';
/**
 * Starts the server.
 * @returns {express.Express} The Express app instance.
 */
export const start = () => {
  initAuth();

  const app = express();
  app.use(function (req, res, next) {
    if (toobusy()) {
      res.status(503).send('Server Too Busy');
    } else {
      next();
    }
  });
  app.use(express.json());
  app.use(
    cors({
      origin: '*',
      methods: '*',
      allowedHeaders: '*',
      credentials: true,
    }),
  );
  app.disable('x-powered-by');
  app.use(authMiddleware());
  useTracing(app);
  useLogging(app);

  app.use(cookeParser());
  app.use('/', ordersRouterFactory());
  app.use('/', csrfRouterFactory());
  app.use(authErrorHandler());
  useGraphql(app);

  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Error occurred!');
    console.error(err.stack);
    if (res.headersSent) {
      return next(err);
    }
    res
      .setHeader('Content-Type', 'application/json')
      .status(StatusCodes.BAD_REQUEST)
      .send({ error: err });
  });

  return app;
};
