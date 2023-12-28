import express from 'express';
import cors from 'cors';
import supertokens, { getUser } from 'supertokens-node';
import { SessionRequest, middleware } from 'supertokens-node/framework/express';
import { errorHandler } from 'supertokens-node/framework/express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { initApiUser, initAuth } from './init-auth';
import { useLogging, useTracing } from '@shop.app/lib.express';

const { WEB_API_PORT, PUBLIC_WEB_UI_DOMAINS } = process.env;

initAuth();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: PUBLIC_WEB_UI_DOMAINS.split(','),
    allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    credentials: true,
  }),
);
useLogging(app);
useTracing(app);

app.use(middleware());

app.get('/user', verifySession(), async (req: SessionRequest, res) => {
  const userId = req.session!.getUserId();
  const user = await getUser(userId);
  res.send(user);
});

app.use(errorHandler());

app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error occurred!');
  console.error(err.stack);
  if (res.headersSent) {
    return next(err);
  }
  res.setHeader('Content-Type', 'application/json').status(500).send({ error: err });
});

app.listen(WEB_API_PORT, async () => {
  console.log(`Server is running on port ${WEB_API_PORT}`);

  await initApiUser();
});
