'use strict';

// Stub for expo-modules-core/src/Refs (not exported in expo-modules-core@3.x)
// jest-expo@52 attempts to mock this path for snapshot-friendly refs.
module.exports = {
  createSnapshotFriendlyRef: () => {
    const ref = { current: null };
    return ref;
  },
};
