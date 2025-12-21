module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Disable React Compiler to fix buildComponentSchema error
      // with react-native-safe-area-context
    ],
  };
};
