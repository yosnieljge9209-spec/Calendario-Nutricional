import React, { useState, useEffect } from 'react';
import { Cloud, RefreshCw, LogIn, LogOut, CheckCircle, AlertCircle, Download, Upload } from 'lucide-react';
import { cn } from '../lib/utils';
import { SyncStatus } from '../hooks/useSync';

type SyncViewProps = {
  onSyncComplete: (data: any) => void;
  getCurrentData: () => any;
  syncStatus: SyncStatus;
  lastSync: string | null;
  syncError: string | null;
  isAuthenticated: boolean;
  onDownload: () => Promise<void>;
  onUpload: () => Promise<void>;
};

export const SyncView = ({ 
  onSyncComplete, 
  getCurrentData, 
  syncStatus, 
  lastSync, 
  syncError, 
  isAuthenticated,
  onDownload,
  onUpload
}: SyncViewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(syncError);
  const [clientId, setClientId] = useState(localStorage.getItem('nutriplan_client_id') || '');
  const [clientSecret, setClientSecret] = useState(localStorage.getItem('nutriplan_client_secret') || '');

  useEffect(() => {
    setError(syncError);
  }, [syncError]);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Save credentials locally
      if (clientId) localStorage.setItem('nutriplan_client_id', clientId);
      if (clientSecret) localStorage.setItem('nutriplan_client_secret', clientSecret);

      // Send config to server
      const configRes = await fetch('/api/auth/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, clientSecret })
      });

      if (!configRes.ok) {
        const errData = await configRes.json();
        throw new Error(errData.error || "Error al configurar credenciales");
      }

      const res = await fetch('/api/auth/url');
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "No se pudo obtener la URL de autenticación");
      }
      const { url } = await res.json();
      
      if (!url || url.includes('client_id=undefined')) {
        setError("Error: El Client ID no se configuró correctamente.");
        return;
      }
      
      window.open(url, 'google_auth_popup', 'width=600,height=700');
    } catch (e: any) {
      setError(e.message || "Error al conectar con Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.reload(); // Reload to reset sync state
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const handleManualUpload = async () => {
    setIsLoading(true);
    await onUpload();
    setIsLoading(false);
  };

  const handleManualDownload = async () => {
    setIsLoading(true);
    await onDownload();
    setIsLoading(false);
  };

  return (
    <div className="flex-1 notion-scrollbar overflow-y-auto p-4 sm:p-8 bg-bg">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-notion-blue/10 flex items-center justify-center text-notion-blue">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Google Drive — Sincronización</h1>
            <p className="text-text-secondary text-sm">Respalda tus datos en Google Drive para acceder desde cualquier dispositivo.</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between bg-bg/50 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-4 h-4 rounded-full shadow-sm",
                isAuthenticated ? "bg-notion-green" : "bg-notion-red",
                syncStatus === 'loading' && "animate-pulse"
              )} />
              <div>
                <p className="font-bold text-sm">{isAuthenticated ? "Conectado" : "No conectado"}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">
                  {syncStatus === 'loading' ? "Sincronizando..." : 
                   isAuthenticated ? "Sincronización automática activa" : "Ingresa tu Client ID y haz clic en Conectar"}
                </p>
              </div>
            </div>
            {!isAuthenticated && (
              <button 
                onClick={handleConnect}
                disabled={isLoading}
                className="bg-notion-blue text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-notion-blue/90 transition-all disabled:opacity-50 shadow-lg shadow-notion-blue/20"
              >
                Conectar
              </button>
            )}
          </div>

          {!isAuthenticated && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Google OAuth Client ID</label>
                <input 
                  type="text" 
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="878049462979-..."
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-notion-blue/50 outline-none font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Google OAuth Client Secret</label>
                <input 
                  type="password" 
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="GOCSPX-..."
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-notion-blue/50 outline-none font-mono"
                />
              </div>
              <p className="text-[10px] text-text-muted italic px-1">Las credenciales se guardan localmente en este navegador.</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-notion-red/5 border border-notion-red/20 text-notion-red flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {isAuthenticated && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleManualUpload}
                  disabled={isLoading || syncStatus === 'loading'}
                  className="flex flex-col items-center justify-center p-6 rounded-xl border border-border hover:bg-surface-light transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-notion-orange/10 flex items-center justify-center text-notion-orange mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm">Forzar Subida</span>
                  <span className="text-[10px] text-text-muted mt-1">Sincronizar ahora manualmente</span>
                </button>

                <button
                  onClick={handleManualDownload}
                  disabled={isLoading || syncStatus === 'loading'}
                  className="flex flex-col items-center justify-center p-6 rounded-xl border border-border hover:bg-surface-light transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-notion-green/10 flex items-center justify-center text-notion-green mb-3 group-hover:scale-110 transition-transform">
                    <Download className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm">Forzar Descarga</span>
                  <span className="text-[10px] text-text-muted mt-1">Recuperar datos de la nube</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                {lastSync && (
                  <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                    <RefreshCw className={cn("w-3 h-3", syncStatus === 'loading' && "animate-spin")} />
                    Última sincronización: {lastSync}
                  </div>
                )}
                <button 
                  onClick={handleLogout}
                  className="text-xs font-bold text-notion-red hover:underline flex items-center gap-1 ml-auto"
                >
                  <LogOut className="w-3 h-3" /> Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-notion-blue/5 border border-notion-blue/10 space-y-4">
          <h2 className="font-bold text-notion-blue flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Sincronización Automática
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            NutriPlan sincroniza tus datos automáticamente en segundo plano, igual que Cashew. 
            Cualquier cambio que realices se guardará en tu Google Drive después de unos segundos de inactividad. 
            Al abrir la aplicación en otro dispositivo, se descargarán los datos más recientes automáticamente.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="font-bold text-lg">Configuración (una sola vez)</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-notion-blue text-white flex items-center justify-center font-bold shrink-0">1</div>
              <div className="space-y-1">
                <p className="font-bold text-sm">Google Cloud Console</p>
                <p className="text-xs text-text-secondary">
                  Ve a <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-notion-blue hover:underline">console.cloud.google.com</a> → Nuevo proyecto → Nombre: <code className="bg-bg px-1 rounded">NutriPlan</code>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-notion-blue text-white flex items-center justify-center font-bold shrink-0">2</div>
              <div className="space-y-1">
                <p className="font-bold text-sm">Habilitar Google Drive API</p>
                <p className="text-xs text-text-secondary">
                  APIs y servicios → Biblioteca → <code className="bg-bg px-1 rounded">Google Drive API</code> → Habilitar
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-notion-blue text-white flex items-center justify-center font-bold shrink-0">3</div>
              <div className="space-y-1">
                <p className="font-bold text-sm">Pantalla de consentimiento OAuth</p>
                <p className="text-xs text-text-secondary">
                  Externo → Crear → Agregar permiso <code className="bg-bg px-1 rounded">drive.appdata</code> → Agregar tu email como usuario de prueba
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-notion-blue text-white flex items-center justify-center font-bold shrink-0">4</div>
              <div className="space-y-1">
                <p className="font-bold text-sm">Crear credencial OAuth 2.0</p>
                <p className="text-xs text-text-secondary">
                  Credenciales → Crear → ID de cliente OAuth → Aplicación web
                </p>
                <div className="mt-2 p-3 bg-bg border border-border rounded-lg space-y-2">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Origen autorizado:</p>
                  <code className="text-[10px] text-notion-orange break-all">{window.location.origin}</code>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-2">URI de redireccionamiento:</p>
                  <code className="text-[10px] text-notion-orange break-all">{window.location.origin}/auth/google/callback</code>
                </div>
                <p className="text-xs text-text-secondary mt-2">Copia el Client ID y pégalo arriba.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
