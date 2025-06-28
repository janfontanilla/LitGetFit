const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add minimal customizations that don't interfere with the serializer
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

module.exports = config;