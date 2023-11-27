
/*
  Source from https://github.com/NiGhTTraX/ts-monorepo/blob/master/apps/cra/craco.config.js
*/

import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import ForkTSCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.paths.json';

export const eslint = { enable: false };
export const webpack = {
  configure: (config: any) => {
    // Remove ModuleScopePlugin which throws when we try to import something
    // outside of src/.
    config.resolve.plugins.pop();

    // Resolve the path aliases.
    config.resolve.plugins.push(new TsconfigPathsPlugin());

    // Let Babel compile outside of src/.
    const oneOfRule = config.module.rules.find((rule: any) => rule.oneOf);
    const tsRule = oneOfRule.oneOf.find((rule: any) => rule.test.toString().includes('ts|tsx'));

    tsRule.include = undefined;
    tsRule.exclude = /node_modules/;

    return config;
  },
  plugins: {
    remove: [
      // This plugin is too old and causes problems in monorepos. We'll
      // replace it with a newer version.
      'ForkTsCheckerWebpackPlugin',
    ],
    add: [
      // Use newer version of ForkTSCheckerWebpackPlugin to type check
      // files across the monorepo.
      new ForkTSCheckerWebpackPlugin({
        issue: {
          // The exclude rules are copied from CRA.
          exclude: [
            {
              file: '**/src/**/__tests__/**',
            },
            {
              file: '**/src/**/?(*.)(spec|test).*',
            },
            {
              file: '**/src/setupProxy.*',
            },
            {
              file: '**/src/setupTests.*',
            },
          ],
        },
      }),
    ],
  },
};
export const jest = {
  configure: {
    preset: 'ts-jest',

    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
      // This has to match the baseUrl defined in tsconfig.json.
      prefix: '<rootDir>/',
    }),
  },
};
