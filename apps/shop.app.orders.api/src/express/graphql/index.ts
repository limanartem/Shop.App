import { Express } from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import { SessionRequest } from 'supertokens-node/framework/express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import expressPlayground from 'graphql-playground-middleware-express';
import { graphqlSchema } from './schema';
import resolvers from './resolvers';

export const useGraphql = (app: Express) => {
  console.log('Configuring graphql..');
  app.use(
    '/graphql',
    verifySession(),
    createHandler({
      schema: graphqlSchema(),
      rootValue: resolvers,
      context: (req) => {
        console.log('context init');
        return {
          session: (req.raw as SessionRequest).session,
        };
      },
    }),
  );

  app.get('/playground', expressPlayground({ endpoint: '/graphql' }));
};
