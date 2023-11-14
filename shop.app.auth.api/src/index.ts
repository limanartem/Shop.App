import express from 'express';
import Session from 'supertokens-node/recipe/session';
import ThirdPartyEmailPassword from 'supertokens-node/recipe/thirdpartyemailpassword';
import cors from 'cors';
import supertokens, { getUser } from 'supertokens-node';
import { SessionRequest, middleware } from 'supertokens-node/framework/express';
import { errorHandler } from 'supertokens-node/framework/express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';

const {
  AUTH_CORE_URL = 'localhost:3567',
  WEB_API_PORT = 3003,
  WEB_API_URL = 'localhost',
  PUBLIC_WEB_UI_URL = 'localhost:3002',
} = process.env;

console.log('Configuring auth api', process.env);

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
    websiteDomain: PUBLIC_WEB_UI_URL,
    apiBasePath: '/auth',
    websiteBasePath: '/auth',
  },
  recipeList: [
    ThirdPartyEmailPassword.init({
      /*TODO: See next step*/
    }),
    Session.init(), // initializes session features
  ],
});

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: `http://${PUBLIC_WEB_UI_URL}`,
    allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    credentials: true,
  }),
);

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

app.listen(WEB_API_PORT, () => {
  console.log(`Server is running on port ${WEB_API_PORT}`);
});
