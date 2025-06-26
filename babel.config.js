module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Ensure proper module interop
      ['@babel/plugin-transform-modules-commonjs', {
        allowTopLevelThis: true
      }],
      // Add react-native-dotenv plugin to load environment variables
      ['module:react-native-dotenv', {
        'moduleName': '@env',
        'path': '.env',
        'blocklist': null,
        'allowlist': null,
        'safe': false,
        'allowUndefined': true
      }],
      // Add reanimated plugin
      'react-native-reanimated/plugin',
    ],
  };
};