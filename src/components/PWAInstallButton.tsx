import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'settings';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { canInstall, isInstalled, isIOS, installApp } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>Installed as App</span>
        </div>
      );
    }
    return null;
  }

  const handleClick = async () => {
    if (canInstall) {
      await installApp();
      return;
    }
    setShowGuide(true);
  };

  if (variant === 'header' && !canInstall && !isIOS) {
    return null;
  }

  return (
    <>
      {variant === 'header' ? (
        <button
          type="button"
          onClick={handleClick}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
          title="Install LocalMind as an App"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isIOS && !canInstall ? 'Install on iOS' : 'Install App'}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{canInstall ? 'Install App' : isIOS ? 'Install on iOS' : 'How to Install'}</span>
        </button>
      )}

      {showGuide && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowGuide(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Install LocalMind as an App"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 text-left text-slate-900 dark:text-slate-100"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-base">Install LocalMind App</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Close install guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <ol className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <Share className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>
                    1. Tap the <strong>Share</strong> icon in Safari&apos;s toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <PlusSquare className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>
                    2. Scroll down and tap <strong>Add to Home Screen</strong>, then confirm{' '}
                    <strong>Add</strong>.
                  </span>
                </li>
              </ol>
            ) : (
              <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <li>
                  1. Open LocalMind directly in its standalone browser tab (outside embedded
                  previews).
                </li>
                <li>
                  2. In Chrome or Edge, click the <strong>Install</strong> icon in the address bar
                  (or open browser menu → <strong>Install LocalMind</strong>).
                </li>
              </ol>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
