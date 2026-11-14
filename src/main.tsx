import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

declare global {
  interface Window {
    __PWA_OFFLINE_READY__?: boolean;
  }
}

const markOfflineReady = () => {
  window.__PWA_OFFLINE_READY__ = true;
  window.dispatchEvent(new CustomEvent('pwa-offline-ready'));
};

registerSW({
  immediate: true,
  onOfflineReady() {
    markOfflineReady();
  },
  onRegisteredSW(_swUrl, registration) {
    if (registration?.active) {
      markOfflineReady();
    }
  },
});

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.ready
    .then(() => {
      markOfflineReady();
      // Warm critical offline assets in cache storage
      if (navigator.onLine) {
        const urls = [
          '/',
          '/manifest.webmanifest',
          '/favicon.svg',
          '/pwa-192x192.png',
          '/pwa-512x512.png',
          '/apple-touch-icon.png',
        ];
        urls.forEach((u) => {
          fetch(u, { cache: 'reload' }).catch(() => {});
        });
      }
    })
    .catch(() => {});
}

createRoot(document.getElementById('root')!).render(<App />);
