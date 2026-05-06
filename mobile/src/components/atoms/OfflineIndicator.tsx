import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useOfflineSyncStore } from '../../stores/offlineSyncStore';

type ToastType = 'offline' | 'synced' | 'failed';

interface ToastConfig {
  message: string;
  duration: number;
  type: ToastType;
}

const TOAST_CONFIGS: Record<ToastType, ToastConfig> = {
  offline: { message: "You're offline — workouts will sync when you're back", duration: 3000, type: 'offline' },
  synced: { message: 'Workout synced', duration: 2000, type: 'synced' },
  failed: { message: "Couldn't sync workout — will retry later", duration: 4000, type: 'failed' },
};

export function OfflineIndicator() {
  const isOnline = useOfflineSyncStore((s) => s.isOnline);
  const lastSyncedAt = useOfflineSyncStore((s) => s.lastSyncedAt);
  const queue = useOfflineSyncStore((s) => s.queue);
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const prevOnline = useRef(isOnline);
  const prevLastSynced = useRef(lastSyncedAt);

  // Show toast on state transitions
  useEffect(() => {
    if (prevOnline.current && !isOnline) {
      showToast('offline');
    }
    prevOnline.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    if (lastSyncedAt && lastSyncedAt !== prevLastSynced.current) {
      showToast('synced');
    }
    prevLastSynced.current = lastSyncedAt;
  }, [lastSyncedAt]);

  // Check for failed ops
  useEffect(() => {
    const failedOps = queue.filter((op) => op.status === 'failed');
    if (failedOps.length > 0) {
      showToast('failed');
    }
  }, [queue]);

  function showToast(type: ToastType) {
    const config = TOAST_CONFIGS[type];
    setToast(config);

    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(config.duration),
      Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }

  return (
    <>
      {/* Offline badge */}
      {!isOnline && (
        <View style={styles.badge}>
          <View style={styles.dot} />
          <Text style={styles.badgeText}>Offline</Text>
        </View>
      )}

      {/* Toast */}
      {toast && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 60,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 50, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 9999,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F87171',
    marginRight: 6,
  },
  badgeText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '600',
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(30, 30, 50, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
