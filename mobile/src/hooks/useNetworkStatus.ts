import { useEffect, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useOfflineSyncStore } from '../stores/offlineSyncStore';
import { flushSyncQueue } from '../services/offlineWorkoutService';

const DEBOUNCE_MS = 2000;

/**
 * Hook that monitors network connectivity and triggers sync on reconnect.
 * Mount once at root layout level.
 */
export function useNetworkStatus() {
  const setOnline = useOfflineSyncStore((s) => s.setOnline);
  const isOnline = useOfflineSyncStore((s) => s.isOnline);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasOffline = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? false;

      // Debounce to avoid flapping
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setOnline(connected);

        if (connected && wasOffline.current) {
          // Just came back online — flush the queue
          flushSyncQueue();
        }

        wasOffline.current = !connected;
      }, DEBOUNCE_MS);
    });

    // Check initial state
    NetInfo.fetch().then((state) => {
      const connected = state.isConnected ?? false;
      setOnline(connected);
      wasOffline.current = !connected;
    });

    return () => {
      unsubscribe();
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [setOnline]);

  return { isOnline };
}
