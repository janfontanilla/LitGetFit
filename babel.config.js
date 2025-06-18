module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Ensure proper module interop
      ['@babel/plugin-transform-modules-commonjs', {
        allowTopLevelThis: true
      }],
      // Add reanimated plugin
      'react-native-reanimated/plugin',
    ],
  };
};