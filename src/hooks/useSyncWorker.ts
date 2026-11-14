import { useState, useEffect, useCallback } from 'react';
import { localDb } from '../db';
import { apiClient } from '../services/apiClient';
import type { SyncStatus } from '../types';

interface UseSyncWorkerProps {
  authToken: string | null;
  onRemoteChangesLoaded?: () => void;
}

export function useSyncWorker({ authToken, onRemoteChangesLoaded }: UseSyncWorkerProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() =>
    navigator.onLine ? (authToken ? 'synced' : 'idle') : 'offline'
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() =>
    localStorage.getItem('bakeflow_last_synced_at')
  );

  // Refresh pending count
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await localDb.sync_queue.count();
      setPendingCount(count);
    } catch {
      setPendingCount(0);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (!authToken) {
      setSyncStatus('idle');
      return;
    }

    if (!navigator.onLine) {
      setSyncStatus('offline');
      return;
    }

    setSyncStatus('syncing');

    try {
      const mutations = await localDb.sync_queue.toArray();

      const response = await apiClient.sync(authToken, lastSyncedAt, mutations);

      // 1. Delete flushed mutations
      if (mutations.length > 0) {
        const ids = mutations.map((m) => m.id);
        await localDb.sync_queue.bulkDelete(ids);
      }

      // 2. Merge remote changes into local Dexie
      let hasRemoteChanges = false;

      if (response.changes.orders && response.changes.orders.length > 0) {
        hasRemoteChanges = true;
        // Strip items if joined or ensure consistent shape
        const remoteOrders = response.changes.orders.map((o: any) => ({
          ...o,
          items: o.items || []
        }));
        await localDb.orders.bulkPut(remoteOrders);
      }

      if (response.changes.menu_items && response.changes.menu_items.length > 0) {
        hasRemoteChanges = true;
        await localDb.menu_items.bulkPut(response.changes.menu_items);
      }

      if (hasRemoteChanges && onRemoteChangesLoaded) {
        onRemoteChangesLoaded();
      }

      setLastSyncedAt(response.synced_at);
      localStorage.setItem('bakeflow_last_synced_at', response.synced_at);
      setSyncStatus('synced');
      await refreshPendingCount();
    } catch (err) {
      console.warn('Sync failed, queued for retry:', err);
      setSyncStatus('error');
    }
  }, [authToken, lastSyncedAt, onRemoteChangesLoaded, refreshPendingCount]);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => {
      triggerSync();
    };
    const handleOffline = () => {
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    refreshPendingCount();

    // Auto-sync interval every 60s if logged in
    const timer = setInterval(() => {
      if (authToken && navigator.onLine) {
        triggerSync();
      }
    }, 60000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
    };
  }, [authToken, triggerSync, refreshPendingCount]);

  return {
    syncStatus,
    pendingCount,
    lastSyncedAt,
    triggerSync,
    refreshPendingCount
  };
}
