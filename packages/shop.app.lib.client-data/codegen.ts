import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: '../../apps/shop.app.shopping-cart.api/src/schema.graphql',
  generates: {
    'src/generated/shopping-cart/': {
      preset: 'client',
    },
  },
  ignoreNoDocuments: true,
  documents: ['src/**/*.{ts}'],
};

export default config;
