const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

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