// Learn more https://docs.expo.io/guides/customizing-metro
const { mergeConfig, getDefaultConfig } = require('@react-native/metro-config');
//const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
// This can be replaced with `find-yarn-workspace-root`
const workspaceRoot = path.resolve(projectRoot, '../..');
const config = mergeConfig(getDefaultConfig(projectRoot), {
  // 1. Watch all files within the monorepo
  watchFolders: [workspaceRoot],

  // 2. Let Metro know where to resolve packages and in what order
  resolver: {
    platforms: ['ios', 'android', 'web'],
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    //nodeModulesPaths: ['react-native', 'browser', 'main', 'module'],
    //resolverMainFields: ['main', 'module'],
    //console.log('config.resolver.nodeModulesPaths', config.resolver.resolverMainFields);
    //config.resolver.resolverMainFields = ['main', 'module'];
    //console.log({ resolveRequest: config.resolver.resolveRequest });
/* 
    resolveRequest: (context, moduleName, platform) => {
      // Additional logic here
      //throw new Error('Test');

      //console.log(context);
      const defaultResolveResult = context.resolveRequest(context, moduleName, platform);
      if (platform === 'web') {
        if (
          moduleName === 'punycode' &&
          defaultResolveResult.type === 'sourceFile' &&
          defaultResolveResult.filePath?.endsWith('punycode.es6.js')
        ) {
          defaultResolveResult.filePath = defaultResolveResult.filePath.replace(
            'punycode.es6.js',
            'punycode.js',
          );
        }
      }
      return defaultResolveResult;
    }, */
  },
});

//console.log(config.resolver.resolveRequest);

module.exports = config;
