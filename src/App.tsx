/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2, Sparkles, Download, CheckCircle } from 'lucide-react';
import { Message } from './types';
import { getOfflineReply } from './services/offlineEngine';
import { SpeechService } from './services/speechService';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Header } from './components/Header';
import { ChatMessages } from './components/ChatMessages';
import { QuickPrompts } from './components/QuickPrompts';
import { InputControls } from './components/InputControls';
import { KnowledgeBaseModal } from './components/KnowledgeBaseModal';
import { StudyQuizModal } from './components/StudyQuizModal';
import { StatsModal } from './components/StatsModal';

const STORAGE_MESSAGES_KEY = 'ai_offline_chatbot_messages_v1';

const INITIAL_MESSAGE: Message = {
  id: 'init_welcome_bot',
  sender: 'bot',
  text: `Hello! 👋 Welcome to AI Offline Chatbot.\n\nAsk me ANY question — I answer using AI when online and automatically switch to my built-in Offline Brain when you have no internet!\nType "help" to see offline tools & commands.`,
  timestamp: Date.now(),
  category: 'greeting',
  isOfflineMatch: true,
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_MESSAGES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [INITIAL_MESSAGE];
  });

  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [isHybridAllowed, setIsHybridAllowed] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [offlineCacheReady, setOfflineCacheReady] = useState<boolean>(() =>
    typeof window !== 'undefined' ? Boolean(window.__PWA_OFFLINE_READY__) : false
  );
  const [activeSpeechText, setActiveSpeechText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWideLayout, setIsWideLayout] = useState(false);

  // Modals
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  const { canInstall, isInstalled, isIOS, installApp } = usePWAInstall();

  const inputRef = useRef<HTMLInputElement>(null);

  // Monitor network status and Service Worker offline readiness
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    const handleOfflineReady = () => setOfflineCacheReady(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('pwa-offline-ready', handleOfflineReady);

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(() => setOfflineCacheReady(true))
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa-offline-ready', handleOfflineReady);
    };
  }, []);

  // Save chat to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  const handleSendMessage = async (text: string, viaVoice = false) => {
    const userMessage: Message = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    const currentHistory = messages
      .filter((m) => m.id !== 'init_welcome_bot')
      .slice(-10)
      .map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.text,
      }));

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    // Check offline engine first for instant math/clock utilities or user-trained custom rules
    const offlineMatch = getOfflineReply(text);
    const isInstantUtilityOrCustom =
      offlineMatch.isCustom || offlineMatch.ruleId === 'math_eval';

    const isEffectivelyOffline = isSimulatedOffline || !onlineStatus;

    if (!isEffectivelyOffline && isHybridAllowed && !isInstantUtilityOrCustom) {
      // Smart AI mode: answer any question using Gemini on the server
      try {
        const res = await fetch('/api/gemini-ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: text, history: currentHistory }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.reply) {
            const botMessage: Message = {
              id: `bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              sender: 'bot',
              text: data.reply,
              timestamp: Date.now(),
              category: 'hybrid-online',
              isOfflineMatch: false,
            };
            setMessages((prev) => [...prev, botMessage]);
            setIsProcessing(false);
            if (viaVoice) {
              handleSpeak(data.reply);
            }
            return;
          }
        }
      } catch {
        // Network or server unreachable — smoothly fall back to local offline engine
      }
    }

    // Offline Mode or Fallback: 100% Client-Side Knowledge & Synthesizer Engine
    setTimeout(() => {
      const botMessage: Message = {
        id: `bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sender: 'bot',
        text: offlineMatch.reply,
        timestamp: Date.now(),
        category: offlineMatch.category,
        codeSnippet: offlineMatch.codeSnippet,
        codeLang: offlineMatch.codeLang,
        isOfflineMatch: true,
        matchScore: offlineMatch.score,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsProcessing(false);
      if (viaVoice) {
        handleSpeak(offlineMatch.reply);
      }
    }, 150);
  };

  const handleClearChat = () => {
    SpeechService.stop();
    setActiveSpeechText(null);
    const clearedMsg: Message = {
      id: `bot_cleared_${Date.now()}`,
      sender: 'bot',
      text: 'Chat cleared! 👋 Ask me a question or type "help".',
      timestamp: Date.now(),
      category: 'greeting',
      isOfflineMatch: true,
    };
    setMessages([clearedMsg]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSpeak = (text: string) => {
    if (activeSpeechText === text) {
      SpeechService.stop();
      setActiveSpeechText(null);
      return;
    }

    setActiveSpeechText(text);
    SpeechService.speak(text, () => {
      setActiveSpeechText(null);
    });
  };

  const handleStopSpeech = () => {
    SpeechService.stop();
    setActiveSpeechText(null);
  };

  const handleFeedback = (messageId: string, liked: boolean) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, liked: m.liked === liked ? null : liked } : m))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#141e30] via-[#243b55] to-[#5146e5] flex flex-col justify-between items-center p-0 sm:p-4 text-slate-100 font-sans select-text">
      {/* Container Card */}
      <div
        className={`w-full flex flex-col bg-slate-900 border border-slate-800 sm:rounded-2xl shadow-2xl shadow-black/60 overflow-hidden transition-all duration-300 ${
          isWideLayout
            ? 'max-w-5xl h-screen sm:h-[92vh]'
            : 'max-w-xl h-screen sm:h-[88vh]'
        }`}
      >
        {/* Header Bar */}
        <Header
          isSimulatedOffline={isSimulatedOffline}
          onToggleSimulateOffline={() => setIsSimulatedOffline((prev) => !prev)}
          isHybridAllowed={isHybridAllowed}
          onToggleHybrid={() => setIsHybridAllowed((prev) => !prev)}
          onOpenKnowledgeModal={() => setIsKnowledgeModalOpen(true)}
          onOpenQuizModal={() => setIsQuizModalOpen(true)}
          onOpenStatsModal={() => setIsStatsModalOpen(true)}
          onClearChat={handleClearChat}
          onlineStatus={onlineStatus}
          activeSpeech={Boolean(activeSpeechText)}
          onStopSpeech={handleStopSpeech}
          canInstall={canInstall}
          isInstalled={isInstalled}
          onInstallApp={installApp}
        />

        {/* Layout Expand Toggle Bar */}
        <div className="bg-slate-950/70 border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                !isSimulatedOffline && onlineStatus && isHybridAllowed
                  ? 'bg-indigo-400'
                  : 'bg-emerald-400'
              }`}
            />
            <span>
              {!isSimulatedOffline && onlineStatus && isHybridAllowed
                ? 'Smart AI + Offline Engine active'
                : 'Offline Mode active · 0ms local responses'}
              {offlineCacheReady && ' · Site cached offline'}
            </span>
          </div>
          <button
            onClick={() => setIsWideLayout((prev) => !prev)}
            className="hidden sm:flex items-center gap-1 hover:text-slate-200 transition-colors cursor-pointer"
            title={isWideLayout ? 'Switch to Compact view' : 'Switch to Wide view'}
          >
            {isWideLayout ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            <span>{isWideLayout ? 'Compact' : 'Expand'}</span>
          </button>
        </div>

        {/* Message Stream */}
        <ChatMessages
          messages={messages}
          onSpeak={handleSpeak}
          activeSpeechText={activeSpeechText}
          onFeedback={handleFeedback}
          isProcessing={isProcessing}
        />

        {/* Quick Prompts Chips */}
        <QuickPrompts onSelectPrompt={handleSendMessage} />

        {/* Input Controls */}
        <InputControls
          onSendMessage={handleSendMessage}
          onClearChat={handleClearChat}
          inputRef={inputRef}
          isProcessing={isProcessing}
        />
      </div>

      {/* Modals */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
        onRulesUpdated={() => {
          // forces re-evaluation
        }}
      />

      <StudyQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
      />

      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        messageCount={messages.length}
        offlineCacheReady={offlineCacheReady}
        canInstall={canInstall}
        isInstalled={isInstalled}
        isIOS={isIOS}
        onInstallApp={installApp}
      />
    </div>
  );
}
