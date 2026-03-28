import { useState, useEffect, useCallback, useRef } from 'react';

export type SyncStatus = 'idle' | 'loading' | 'success' | 'error' | 'unauthenticated';

export function useSync(data: any, onDataLoaded: (data: any) => void) {
  const [status, setStatus] = useState<SyncStatus>('unauthenticated');
  const [lastSync, setLastSync] = useState<string | null>(localStorage.getItem('nutriplan_last_sync'));
  const [error, setError] = useState<string | null>(null);
  const isInitialLoad = useRef(true);
  const uploadTimeout = useRef<NodeJS.Timeout | null>(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setStatus(data.isAuthenticated ? 'idle' : 'unauthenticated');
      return data.isAuthenticated;
    } catch (e) {
      setStatus('unauthenticated');
      return false;
    }
  }, []);

  const download = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const res = await fetch('/api/sync/download');
      if (!res.ok) {
        if (res.status === 404) {
          setStatus('idle');
          return;
        }
        throw new Error("Error al descargar datos");
      }
      
      const { data } = await res.json();
      onDataLoaded(data);
      
      const now = new Date().toLocaleString();
      setLastSync(now);
      localStorage.setItem('nutriplan_last_sync', now);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (e: any) {
      setError(e.message);
      setStatus('error');
    }
  }, [onDataLoaded]);

  const upload = useCallback(async (currentData: any) => {
    setStatus('loading');
    setError(null);
    try {
      const res = await fetch('/api/sync/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: currentData })
      });
      
      if (!res.ok) throw new Error("Error al subir datos");
      
      const now = new Date().toLocaleString();
      setLastSync(now);
      localStorage.setItem('nutriplan_last_sync', now);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (e: any) {
      setError(e.message);
      setStatus('error');
    }
  }, []);

  // Initial check and download
  useEffect(() => {
    const init = async () => {
      const authenticated = await checkAuthStatus();
      if (authenticated) {
        await download();
      }
      isInitialLoad.current = false;
    };
    init();
  }, [checkAuthStatus, download]);

  // Auto-upload on data change
  useEffect(() => {
    if (isInitialLoad.current || status === 'unauthenticated') return;

    if (uploadTimeout.current) clearTimeout(uploadTimeout.current);

    uploadTimeout.current = setTimeout(() => {
      upload(data);
    }, 5000); // 5 second debounce

    return () => {
      if (uploadTimeout.current) clearTimeout(uploadTimeout.current);
    };
  }, [data, status, upload]);

  return {
    status,
    lastSync,
    error,
    checkAuthStatus,
    download,
    upload,
    isAuthenticated: status !== 'unauthenticated'
  };
}
