'use strict';

// Fix: jest-expo's setup.js calls Object.defineProperty on UIManager,
// but UIManager may not be a plain object yet. Ensure it's a writable object.
const NativeModules = require('react-native/Libraries/BatchedBridge/NativeModules');
if (!NativeModules.UIManager || typeof NativeModules.UIManager !== 'object') {
  Object.defineProperty(NativeModules, 'UIManager', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: {},
  });
}
