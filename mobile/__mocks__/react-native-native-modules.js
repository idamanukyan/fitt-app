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

// jest-expo >= 54 imports this module's `.default` (ESM interop)
module.exports = NativeModules;
module.exports.default = NativeModules;
