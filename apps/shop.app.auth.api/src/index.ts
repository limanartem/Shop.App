import express from 'express';
import cors from 'cors';
import supertokens, { getUser } from 'supertokens-node';
import { SessionRequest, middleware } from 'supertokens-node/framework/express';
import { errorHandler } from 'supertokens-node/framework/express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { initApiUser, initAuth } from './init-auth';
import { useLogging, useTracing } from '@shop.app/lib.express';
import { userInfo } from 'os';

const { WEB_API_PORT, PUBLIC_WEB_UI_DOMAINS } = process.env;

initAuth();

const app = express();
app.use(express.json({ limit: '500kb'}));
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

const server = app.listen(WEB_API_PORT, async () => {
  console.log(
    `🚀  Server is running on port ${WEB_API_PORT} under "${userInfo().username}" user context`,
  );

  await initApiUser();
});

const closeGracefully = async (signal: string) => {
  console.log(`🚪 Received signal to terminate: ${signal}.`);
  console.log('Closing server...');

  server.close();
  process.exit();
};

process.on('SIGINT', closeGracefully);
process.on('SIGTERM', closeGracefully);
