'use strict';

// Provide UIManager as an object so jest-expo setup.js can call
// Object.defineProperty on it (for ViewManagerAdapter_ properties).
const NativeModules = {
  UIManager: {},
  NativeUnimoduleProxy: {
    viewManagersMetadata: {},
    modulesConstants: {},
    exportedMethods: {},
  },
};

module.exports = NativeModules;
