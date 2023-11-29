export const presets = [
  ['@babel/preset-env', { targets: { node: '16' } }],
  '@babel/preset-typescript',
];
export const plugins = [
  '@babel/plugin-transform-runtime',
];
