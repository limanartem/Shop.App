import { Express } from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import { SessionRequest } from 'supertokens-node/framework/express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import expressPlayground from 'graphql-playground-middleware-express';
import { graphqlSchema } from './schema';
import { SessionContainerInterface } from 'supertokens-node/lib/build/recipe/session/types';
import { OperationContext } from 'graphql-http';

export type SessionContext = {
  session?: SessionContainerInterface;
} & OperationContext;

export const useGraphql = async (app: Express) => {
  console.log('Configuring graphql with Express..');
  
  /* 
    
  // TODO: alternative we can configure Apollo server as below
  console.log('Configuring graphql with Apollo server for Express..');

  const schema = fs.readFileSync(path.join(__dirname, 'schema.graphql')).toString();

  const server = new ApolloServer<SessionContext>({
    //schema: graphqlSchema(),

    resolvers,
    typeDefs: [...scalarTypeDefs, schema],
  });

  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    verifySession(),
    expressMiddleware(server, {
      context: async (req) => {
        console.log((req.req as SessionRequest).session);
        return {
          session: (req.req as SessionRequest).session,
        };
      },
    }),
  ); */

  app.use(
    '/graphql',
    verifySession(),
    createHandler<SessionContext>({
      schema: graphqlSchema(),
      context: (req) => {
        return {
          session: (req.raw as SessionRequest).session,
        };
      },
    }),
  );

  app.get('/playground', expressPlayground({ endpoint: '/graphql' }));
};
