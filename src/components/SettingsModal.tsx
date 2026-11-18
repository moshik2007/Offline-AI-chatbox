import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  Sun,
  Moon,
  Languages,
  Database,
  Sparkles,
  ShieldCheck,
  Mic,
  Smartphone,
} from 'lucide-react';
import {
  AppSettings,
  ExplanationDepth,
  LanguagePreference,
  SpeechLang,
} from '../types';
import { SpeechService } from '../services/speechService';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (partial: Partial<AppSettings>) => void;
  onClearAllHistory: () => Promise<void>;
  onExportHistory: () => void;
  conversationCount: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearAllHistory,
  onExportHistory,
  conversationCount,
}) => {
  const [confirmClearChats, setConfirmClearChats] = useState(false);
  const [micPermission, setMicPermission] = useState<
    'granted' | 'prompt' | 'denied' | 'unsupported'
  >('prompt');
  const [micFeedback, setMicFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setMicFeedback(null);
    SpeechService.getMicrophonePermissionState().then(setMicPermission);
  }, [isOpen]);

  const handleRequestMicPermission = async () => {
    setMicFeedback(null);
    const res = await SpeechService.requestMicrophonePermission();
    const nextState = await SpeechService.getMicrophonePermissionState();
    setMicPermission(res.granted ? 'granted' : nextState);
    if (res.granted) {
      setMicFeedback('Microphone access granted and ready.');
    } else if (res.error) {
      setMicFeedback(res.error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="LocalMind Settings"
        className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              LocalMind Settings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure response language, simple explanations, voice, theme, and local chat history
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scroll p-5 space-y-5">
          {/* Universal AI Architecture Info */}
          <section className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-slate-900 dark:text-white">
                Universal AI Answer Engine · Zero Model Downloads
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                LocalMind answers open-ended questions across all subjects dynamically via its
                backend AI inference service — with multi-turn context, multimodal image
                understanding, and English, Tamil, and Tanglish support without installing Ollama,
                ONNX, or downloading local models.
              </p>
            </div>
          </section>

          {/* Language, Explanation Depth & Voice */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Language & Appearance */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Languages className="w-4 h-4 text-indigo-500" />
                <span>Language &amp; Appearance</span>
              </h3>

              <div className="space-y-1.5">
                <label
                  htmlFor="aiLanguageSelect"
                  className="block text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  Answer Language
                </label>
                <select
                  id="aiLanguageSelect"
                  value={settings.language}
                  onChange={(e) =>
                    onUpdateSettings({ language: e.target.value as LanguagePreference })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs outline-none focus:border-indigo-500"
                >
                  <option value="auto">Auto (English + தமிழ் + Tanglish)</option>
                  <option value="english">English</option>
                  <option value="tamil">Tamil (தமிழ்)</option>
                  <option value="tanglish">Tanglish</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="explanationDepthSelect"
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Explanation Style</span>
                </label>
                <select
                  id="explanationDepthSelect"
                  value={settings.explanationDepth}
                  onChange={(e) =>
                    onUpdateSettings({ explanationDepth: e.target.value as ExplanationDepth })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs outline-none focus:border-indigo-500"
                >
                  <option value="standard">Detailed &amp; Step-by-Step</option>
                  <option value="simple">Simple &amp; Easy to Understand</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Interface Theme
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ theme: 'dark' })}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                      settings.theme === 'dark'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ theme: 'light' })}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                      settings.theme === 'light'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Light</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Voice Settings */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3.5">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-500" />
                <span>Voice &amp; Speech Settings</span>
              </h3>

              <div className="space-y-1.5">
                <label
                  htmlFor="voiceLangSetting"
                  className="block text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  Voice Recognition Language
                </label>
                <select
                  id="voiceLangSetting"
                  value={settings.speechLang}
                  onChange={(e) =>
                    onUpdateSettings({ speechLang: e.target.value as SpeechLang })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs outline-none focus:border-indigo-500"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-IN">English (India)</option>
                  <option value="ta-IN">Tamil (India)</option>
                </select>
              </div>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span>Read voice replies aloud automatically</span>
                <input
                  type="checkbox"
                  checked={settings.autoSpeak}
                  onChange={(e) => onUpdateSettings({ autoSpeak: e.target.checked })}
                  className="accent-indigo-600 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span>Mute all text-to-speech audio</span>
                <input
                  type="checkbox"
                  checked={settings.ttsMuted}
                  onChange={(e) => onUpdateSettings({ ttsMuted: e.target.checked })}
                  className="accent-indigo-600 w-4 h-4 cursor-pointer"
                />
              </label>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Speech Speed</span>
                  <span className="font-mono tabular-nums">{settings.ttsRate.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.7}
                  max={1.5}
                  step={0.1}
                  value={settings.ttsRate}
                  onChange={(e) => onUpdateSettings({ ttsRate: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                    <Mic className="w-3.5 h-3.5 text-rose-500" />
                    <span>Microphone Access</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleRequestMicPermission}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                      micPermission === 'granted'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {micPermission === 'granted'
                      ? 'Granted (Re-test)'
                      : micPermission === 'denied'
                      ? 'Retry Permission'
                      : 'Allow Microphone'}
                  </button>
                </div>
                {micFeedback && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {micFeedback}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Chat History Management */}
          <section className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-indigo-500 shrink-0" />
              <div>
                <div className="font-semibold">Local IndexedDB Chat Storage</div>
                <div className="text-slate-500 dark:text-slate-400">
                  {conversationCount} saved conversation{conversationCount === 1 ? '' : 's'} stored
                  privately on this device
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onExportHistory}
                disabled={conversationCount === 0}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 font-medium cursor-pointer"
              >
                Export JSON
              </button>

              {!confirmClearChats ? (
                <button
                  type="button"
                  onClick={() => setConfirmClearChats(true)}
                  disabled={conversationCount === 0}
                  className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 disabled:opacity-40 font-medium cursor-pointer"
                >
                  Delete All History
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={async () => {
                      await onClearAllHistory();
                      setConfirmClearChats(false);
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-600 text-white font-medium cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearChats(false)}
                    className="px-2.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Install as App (PWA) */}
          <section className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-cyan-500 shrink-0" />
              <div>
                <div className="font-semibold">Install LocalMind as an App</div>
                <div className="text-slate-500 dark:text-slate-400">
                  Run LocalMind standalone on Android, iOS, Windows, or macOS with offline UI caching
                </div>
              </div>
            </div>
            <PWAInstallButton variant="settings" />
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
