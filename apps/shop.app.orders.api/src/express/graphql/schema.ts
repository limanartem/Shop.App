import path from 'path';
import fs from 'fs';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs as scalarTypeDefs, resolvers as scalarResolvers } from 'graphql-scalars';
import resolvers from './resolvers';

export const graphqlSchema = () => {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.graphql')).toString();
  return makeExecutableSchema({
    typeDefs: [...scalarTypeDefs, schema],
    resolvers: { ...resolvers, ...scalarResolvers },
  });
};
