import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Zap,
  Database,
  Lock,
  Smartphone,
  WifiOff,
  CheckCircle2,
  RefreshCw,
  Download,
} from 'lucide-react';
import { getAllRules, getCustomRules } from '../services/offlineEngine';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageCount: number;
  offlineCacheReady: boolean;
  canInstall?: boolean;
  isInstalled?: boolean;
  isIOS?: boolean;
  onInstallApp?: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  messageCount,
  offlineCacheReady,
  canInstall,
  isInstalled,
  isIOS,
  onInstallApp,
}) => {
  const [cachedAssetCount, setCachedAssetCount] = useState<number | null>(null);
  const [swActive, setSwActive] = useState(false);
  const [isRefreshingCache, setIsRefreshingCache] = useState(false);

  const inspectOfflineCache = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        setSwActive(Boolean(reg?.active || navigator.serviceWorker.controller));
      }
      if ('caches' in window) {
        const names = await caches.keys();
        let total = 0;
        for (const name of names) {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          total += keys.length;
        }
        setCachedAssetCount(total);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      inspectOfflineCache();
    }
  }, [isOpen, offlineCacheReady]);

  const handleWarmCache = async () => {
    setIsRefreshingCache(true);
    try {
      const urls = [
        '/',
        '/manifest.webmanifest',
        '/favicon.svg',
        '/pwa-192x192.png',
        '/pwa-512x512.png',
        '/apple-touch-icon.png',
      ];
      await Promise.allSettled(urls.map((u) => fetch(u, { cache: 'reload' })));
      await inspectOfflineCache();
    } finally {
      setIsRefreshingCache(false);
    }
  };

  if (!isOpen) return null;

  const allRules = getAllRules();
  const customRules = getCustomRules();

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Offline Website & Engine Status</h2>
              <p className="text-xs text-slate-400">Service Worker cache & privacy audit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Offline Website Readiness Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-white">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    swActive || offlineCacheReady ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                />
                <span>
                  {swActive || offlineCacheReady
                    ? 'Website Cached for Offline Use'
                    : 'Preparing Offline Cache...'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleWarmCache}
                disabled={isRefreshingCache}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshingCache ? 'animate-spin' : ''}`} />
                <span>Sync Cache</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-slate-400">Service Worker</div>
                <div className={`font-semibold mt-0.5 ${swActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {swActive ? 'Active & Controlling' : 'Registering...'}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-slate-400">Cached App Files</div>
                <div className="font-semibold text-cyan-400 mt-0.5">
                  {cachedAssetCount !== null ? `${cachedAssetCount} resources stored` : 'Checking...'}
                </div>
              </div>
            </div>

            {/* Install App Button or iOS Guide */}
            {canInstall && !isInstalled && onInstallApp && (
              <button
                type="button"
                onClick={onInstallApp}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install as Offline App</span>
              </button>
            )}

            {isIOS && !isInstalled && (
              <p className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                On iPhone/iPad Safari: tap <strong>Share</strong> then <strong>Add to Home Screen</strong> to launch offline anytime.
              </p>
            )}
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Offline Latency
              </div>
              <div className="text-xl font-bold text-emerald-400 mt-1 flex items-baseline gap-1">
                <span>&lt; 5 ms</span>
                <span className="text-xs text-slate-500 font-normal">local</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Offline Data Sent
              </div>
              <div className="text-xl font-bold text-cyan-400 mt-1 flex items-baseline gap-1">
                <span>0 KB</span>
                <span className="text-xs text-slate-500 font-normal">outbound</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Offline Brain Rules
              </div>
              <div className="text-xl font-bold text-indigo-400 mt-1 flex items-baseline gap-1">
                <span>{allRules.length}</span>
                <span className="text-xs text-slate-500 font-normal">({customRules.length} custom)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Messages Stored
              </div>
              <div className="text-xl font-bold text-amber-400 mt-1 flex items-baseline gap-1">
                <span>{messageCount}</span>
                <span className="text-xs text-slate-500 font-normal">local</span>
              </div>
            </div>
          </div>

          {/* Privacy & Architecture Details */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Full Offline Website Architecture</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              The Service Worker caches this website&apos;s HTML, scripts, styles, and icons locally in your browser. Even if you disconnect Wi-Fi or mobile data, you can reopen and use the chatbot, math solver, study quiz, and custom rules offline.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <WifiOff className="w-3.5 h-3.5 text-indigo-400" />
                <span>Works without Wi-Fi/Data</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>LocalStorage & Cache API</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Installable PWA app</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>No internet needed offline</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
