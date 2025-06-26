const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure proper resolver configuration
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add web-specific configurations
config.resolver.alias = {
  'react-native$': 'react-native-web',
};

// Ensure proper transformer configuration
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: false,
  },
});

// Add resolver configuration for better module resolution
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

module.exports = config;