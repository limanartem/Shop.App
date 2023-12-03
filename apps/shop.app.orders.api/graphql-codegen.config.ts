import type { CodegenConfig } from '@graphql-codegen/cli';
import { typeDefs as scalarTypeDefs } from 'graphql-scalars';

const config: CodegenConfig = {
  overwrite: true,
  config: {
    contextType: '../index#SessionContext',
  },
  schema: [...scalarTypeDefs, './src/express/graphql/schema.graphql'],
  generates: {
    './src/express/graphql/__generated__/resolver-types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        scalars: {
          DateTime: 'string',
        },
      },
    },
  },
};

export default config;
