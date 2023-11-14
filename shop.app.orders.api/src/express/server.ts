import express from 'express';
import { middleware, errorHandler } from 'supertokens-node/framework/express';
import { initAuth } from '../auth';
import { routerFactory } from './routes';

export const start = () => {
  initAuth();

  const app = express();
  app.use(express.json());
  app.use(middleware());

  app.use('/', routerFactory());

  app.use(errorHandler());

  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Error occurred!');
    console.error(err.stack);
    if (res.headersSent) {
      return next(err);
    }
    res.setHeader('Content-Type', 'application/json').status(500).send({ error: err });
  });

  return app;
};
