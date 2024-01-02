import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import path from 'path';
import { GraphQLError } from 'graphql';
import { decodeToken } from '@shop.app/lib.server-utils/dist/auth';
import { StatusCodes } from 'http-status-codes';
import resolvers from './resolvers';
import { RequestContext } from './types';

const { WEB_SERVER_PORT } = process.env;


const typeDefs = readFileSync(path.join(__dirname, 'schema.graphql'), { encoding: 'utf-8' });

export default async function createApolloServer() {
  const server = new ApolloServer<RequestContext>({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: Number.parseInt(WEB_SERVER_PORT!) },
    context: async ({ req }) => {
      const authentication = req.headers.authorization;
      if (authentication == null) {
        throw UnauthenticatedError();
      }
      const [, token] = authentication.split(' ');
      const jwtToken = await decodeToken(token);
      if (!jwtToken?.sub) {
        throw UnauthenticatedError();
      }

      return { userId: jwtToken.sub };
    },
  });

  console.log(`🚀  Server ready at: ${url}`);

  return { server, url };
}
function UnauthenticatedError() {
  return new GraphQLError('User is not authenticated', {
    extensions: {
      code: 'UNAUTHENTICATED',
      http: { status: StatusCodes.UNAUTHORIZED },
    },
  });
}
