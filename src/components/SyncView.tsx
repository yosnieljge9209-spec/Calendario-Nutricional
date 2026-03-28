import React, { useState, useEffect } from 'react';
import { Cloud, RefreshCw, LogIn, LogOut, CheckCircle, AlertCircle, Download, Upload } from 'lucide-react';
import { cn } from '../lib/utils';

type SyncViewProps = {
  onSyncComplete: (data: any) => void;
  getCurrentData: () => any;
};

export const SyncView = ({ onSyncComplete, getCurrentData }: SyncViewProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(localStorage.getItem('nutriplan_last_sync'));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsAuthenticated(true);
        checkAuthStatus();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setIsAuthenticated(data.isAuthenticated);
    } catch (e) {
      setIsAuthenticated(false);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/url');
      const { url } = await res.json();
      window.open(url, 'google_auth_popup', 'width=600,height=700');
    } catch (e) {
      setError("Error al conectar con Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const handleUpload = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = getCurrentData();
      const res = await fetch('/api/sync/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });
      
      if (!res.ok) throw new Error("Upload failed");
      
      const now = new Date().toLocaleString();
      setLastSync(now);
      localStorage.setItem('nutriplan_last_sync', now);
    } catch (e) {
      setError("Error al subir los datos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sync/download');
      if (!res.ok) {
        if (res.status === 404) throw new Error("No se encontró respaldo en Drive");
        throw new Error("Download failed");
      }
      
      const { data } = await res.json();
      onSyncComplete(data);
      
      const now = new Date().toLocaleString();
      setLastSync(now);
      localStorage.setItem('nutriplan_last_sync', now);
    } catch (e: any) {
      setError(e.message || "Error al descargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 notion-scrollbar overflow-y-auto p-4 sm:p-8 bg-bg">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-notion-blue/10 flex items-center justify-center text-notion-blue">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sincronización en la Nube</h1>
            <p className="text-text-secondary text-sm">Respalda tus datos en Google Drive para acceder desde cualquier dispositivo.</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-3 h-3 rounded-full",
                isAuthenticated ? "bg-notion-green" : "bg-notion-red"
              )} />
              <span className="font-bold">Estado: {isAuthenticated ? "Conectado" : "Desconectado"}</span>
            </div>
            {isAuthenticated ? (
              <button 
                onClick={handleLogout}
                className="text-xs font-bold text-notion-red hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" /> Cerrar Sesión
              </button>
            ) : (
              <button 
                onClick={handleConnect}
                disabled={isLoading}
                className="bg-notion-blue text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-notion-blue/90 transition-colors disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" /> Conectar con Google Drive
              </button>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-notion-red/5 border border-notion-red/20 text-notion-red flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {isAuthenticated && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
              <button
                onClick={handleUpload}
                disabled={isLoading}
                className="flex flex-col items-center justify-center p-6 rounded-xl border border-border hover:bg-surface-light transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-notion-orange/10 flex items-center justify-center text-notion-orange mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm">Subir a la Nube</span>
                <span className="text-[10px] text-text-muted mt-1">Guarda tus datos actuales</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={isLoading}
                className="flex flex-col items-center justify-center p-6 rounded-xl border border-border hover:bg-surface-light transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-notion-green/10 flex items-center justify-center text-notion-green mb-3 group-hover:scale-110 transition-transform">
                  <Download className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm">Descargar de la Nube</span>
                <span className="text-[10px] text-text-muted mt-1">Recupera tus datos guardados</span>
              </button>
            </div>
          )}

          {lastSync && (
            <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold uppercase tracking-wider pt-4">
              <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
              Última sincronización: {lastSync}
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-notion-blue/5 border border-notion-blue/10 space-y-4">
          <h2 className="font-bold text-notion-blue flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> ¿Cómo funciona?
          </h2>
          <ul className="text-xs text-text-secondary space-y-2 list-disc pl-4">
            <li>Tus datos se guardan en un archivo privado llamado <code className="bg-surface px-1 rounded">nutriplan_backup.json</code> en tu Google Drive.</li>
            <li>NutriPlan solo tiene acceso a este archivo específico, no a todo tu Drive.</li>
            <li>Para sincronizar otro dispositivo, simplemente inicia sesión con la misma cuenta de Google y selecciona "Descargar de la Nube".</li>
            <li>Se recomienda "Subir a la Nube" después de realizar cambios importantes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
