import path from 'path';
import fs from 'fs';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs as scalarTypeDefs, resolvers as scalarResolvers } from 'graphql-scalars';
import resolvers from './resolvers';

/**
 * Returns the GraphQL schema for the application.
 * @returns {GraphQLSchema} The GraphQL schema.
 */
export const graphqlSchema = () => {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.graphql')).toString();
  return makeExecutableSchema({
    typeDefs: [...scalarTypeDefs, schema],
    resolvers: { ...resolvers, ...scalarResolvers },
  });
};
