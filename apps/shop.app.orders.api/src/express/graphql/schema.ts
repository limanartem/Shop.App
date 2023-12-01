import path from 'path';
import fs from 'fs';
import { buildSchema } from 'graphql';

export const graphqlSchema = () => {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.graphql')).toString();
  return buildSchema(schema);
};
