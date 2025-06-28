const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Force single React instance
config.resolver.alias = {
  'react': path.resolve(__dirname, 'node_modules/react'),
  'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
  'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
  'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime')
};

// Ensure Metro resolves modules correctly
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Ensure proper resolver configuration
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'mjs'],
  platforms: ['ios', 'android', 'native', 'web'],
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
  }
};

// Configure transformer
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Add serializer configuration
config.serializer = {
  ...config.serializer,
  customSerializer: null,
};

module.exports = config;