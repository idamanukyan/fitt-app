'use strict';

module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|uuid)',
  ],
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
  ],
  moduleNameMapper: {
    '@react-native-async-storage/async-storage':
      '@react-native-async-storage/async-storage/jest/async-storage-mock',
    'react-native/Libraries/BatchedBridge/NativeModules':
      '<rootDir>/__mocks__/react-native-native-modules.js',
    'expo-modules-core/src/Refs':
      '<rootDir>/__mocks__/expo-modules-core-refs.js',
    'expo-modules-core/src/web/index.web':
      '<rootDir>/__mocks__/expo-modules-core-web.js',
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.setup.js',
  ],
};
