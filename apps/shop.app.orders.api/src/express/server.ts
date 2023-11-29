import express from 'express';
import { middleware, errorHandler } from 'supertokens-node/framework/express';
import { initAuth } from '../auth';
import { routerFactory } from './order-routes';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import { useGraphql } from './graphql';
import { useTracing, useLogging} from '@shop.app/lib.express/dist';


export const start = () => {
  initAuth();

  const app = express();
  app.use(express.json());
  app.use(
    cors({
      origin: '*',
      methods: '*',
      allowedHeaders: '*',
      credentials: true,
    }),
  );
  app.use(middleware());
  useTracing(app);
  useLogging(app);
  
  app.use('/', routerFactory());
  app.use(errorHandler());
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
