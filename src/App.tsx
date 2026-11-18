/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Menu,
  PanelLeftOpen,
  Settings,
  Sun,
  Moon,
  Camera,
  Mic,
  Download,
  Code2,
  Calculator,
  FlaskConical,
  Languages,
  ArrowRight,
  WifiOff,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  AppSettings,
  AssistantVisualState,
  ChatMessage,
  Conversation,
  ImageAttachment,
} from './types';
import { AIChatService } from './services/aiChatService';
import { ChatStorage, DEFAULT_SETTINGS } from './services/chatStorage';
import { SpeechService } from './services/speechService';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Logo3D } from './components/Logo3D';
import { Sidebar } from './components/Sidebar';
import { ChatMessages } from './components/ChatMessages';
import { InputControls } from './components/InputControls';
import { CameraModal } from './components/CameraModal';
import { SettingsModal } from './components/SettingsModal';

interface StarterPrompt {
  title: string;
  prompt: string;
  icon: React.ReactNode;
}

const STARTER_PROMPTS: StarterPrompt[] = [
  {
    title: 'Science & Nuclear Physics',
    prompt: 'Define nuclear radiation and explain alpha, beta, and gamma rays with examples.',
    icon: <FlaskConical className="w-4 h-4 text-emerald-500" />,
  },
  {
    title: 'Mathematics & Step-by-Step',
    prompt: 'Solve 2x^2 - 5x - 3 = 0 step by step and explain each stage.',
    icon: <Calculator className="w-4 h-4 text-indigo-500" />,
  },
  {
    title: 'Programming & Algorithms',
    prompt: 'Write a clean Python function for binary search and explain its time complexity.',
    icon: <Code2 className="w-4 h-4 text-cyan-500" />,
  },
  {
    title: 'Tamil & Tanglish AI',
    prompt: 'Explain photosynthesis and why leaves are green in simple Tanglish.',
    icon: <Languages className="w-4 h-4 text-amber-500" />,
  },
];

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeechText, setActiveSpeechText] = useState<string | null>(null);

  const [pendingImage, setPendingImage] = useState<ImageAttachment | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [externalMicTrigger, setExternalMicTrigger] = useState(0);

  const [onlineStatus, setOnlineStatus] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const { canInstall, isInstalled, installApp } = usePWAInstall();

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const partialResponseRef = useRef('');

  // Load persisted IndexedDB conversations and settings
  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const [loadedConvs, loadedSettings] = await Promise.all([
        ChatStorage.getAllConversations(),
        ChatStorage.getSettings(),
      ]);

      if (!mounted) return;

      setConversations(loadedConvs);
      if (loadedConvs.length > 0) {
        setActiveConversationId(loadedConvs[0].id);
      }

      setSettings(loadedSettings);
      SpeechService.setMuted(loadedSettings.ttsMuted);
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  // Monitor network status
  useEffect(() => {
    const onOnline = () => setOnlineStatus(true);
    const onOffline = () => setOnlineStatus(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Sync theme class on document root
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      if ('ttsMuted' in partial) {
        SpeechService.setMuted(next.ttsMuted);
        if (next.ttsMuted) {
          setActiveSpeechText(null);
        }
      }
      ChatStorage.saveSettings(next);
      return next;
    });
  }, []);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null;

  const assistantVisualState: AssistantVisualState = isGenerating
    ? 'thinking'
    : isListening
    ? 'listening'
    : activeSpeechText
    ? 'speaking'
    : 'idle';

  const handleSpeak = useCallback(
    (text: string) => {
      if (settings.ttsMuted) return;
      if (activeSpeechText === text) {
        SpeechService.stop();
        setActiveSpeechText(null);
        return;
      }
      setActiveSpeechText(text);
      SpeechService.speak(
        text,
        () => {
          setActiveSpeechText(null);
        },
        settings.ttsRate,
        settings.speechLang
      );
    },
    [activeSpeechText, settings.speechLang, settings.ttsMuted, settings.ttsRate]
  );

  const handleStopSpeech = useCallback(() => {
    SpeechService.stop();
    setActiveSpeechText(null);
  }, []);

  const handleNewChat = useCallback(() => {
    SpeechService.stop();
    setActiveSpeechText(null);
    setPendingImage(null);
    setActiveConversationId(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleClearCurrentChat = useCallback(async () => {
    SpeechService.stop();
    setActiveSpeechText(null);
    setPendingImage(null);
    if (activeConversationId) {
      await ChatStorage.deleteConversation(activeConversationId);
      setConversations((prev) => prev.filter((c) => c.id !== activeConversationId));
      setActiveConversationId(null);
    }
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [activeConversationId]);

  const handleSelectConversation = useCallback((id: string) => {
    SpeechService.stop();
    setActiveSpeechText(null);
    setActiveConversationId(id);
  }, []);

  const handleRenameConversation = useCallback(async (id: string, newTitle: string) => {
    let updatedConv: Conversation | null = null;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        updatedConv = { ...c, title: newTitle, updatedAt: Date.now() };
        return updatedConv;
      })
    );
    if (updatedConv) {
      await ChatStorage.saveConversation(updatedConv);
    }
  }, []);

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      await ChatStorage.deleteConversation(id);
      setConversations((prev) => {
        const remaining = prev.filter((c) => c.id !== id);
        if (activeConversationId === id) {
          setActiveConversationId(remaining[0]?.id || null);
        }
        return remaining;
      });
    },
    [activeConversationId]
  );

  const handleClearAllHistory = useCallback(async () => {
    await ChatStorage.clearAllConversations();
    setConversations([]);
    setActiveConversationId(null);
  }, []);

  const handleExportHistory = useCallback(() => {
    const payload = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        app: 'LocalMind',
        conversations,
      },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `localmind-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [conversations]);

  const persistMessagesToConversation = useCallback(
    async (
      convId: string,
      baseConv: Conversation | null,
      nextMessages: ChatMessage[],
      firstText: string
    ) => {
      const now = Date.now();
      const updated: Conversation = baseConv
        ? {
            ...baseConv,
            messages: nextMessages,
            updatedAt: now,
          }
        : {
            id: convId,
            title: ChatStorage.deriveTitle(firstText),
            createdAt: now,
            updatedAt: now,
            messages: nextMessages,
          };

      setConversations((prev) => {
        const exists = prev.some((c) => c.id === convId);
        const merged = exists
          ? prev.map((c) => (c.id === convId ? updated : c))
          : [updated, ...prev];
        return merged.sort((a, b) => b.updatedAt - a.updatedAt);
      });

      await ChatStorage.saveConversation(updated);
      return updated;
    },
    []
  );

  const handleStopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const handleSendMessage = useCallback(
    async (rawText: string, attachedImage: ImageAttachment | null, viaVoice: boolean) => {
      const trimmed = rawText.trim();
      if (!trimmed && !attachedImage) return;
      if (isGenerating) return;

      const convId =
        activeConversationId ||
        `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const existingConv = conversations.find((c) => c.id === convId) || null;
      const priorMessages = existingConv ? existingConv.messages : [];

      if (!activeConversationId) {
        setActiveConversationId(convId);
      }

      setPendingImage(null);
      partialResponseRef.current = '';
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsGenerating(true);

      const userMsg: ChatMessage = {
        id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        sender: 'user',
        text: trimmed || (attachedImage ? 'Please analyze and solve the contents of this image.' : ''),
        timestamp: Date.now(),
        image: attachedImage || undefined,
      };

      const assistantMsgId = `ast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const placeholderAssistant: ChatMessage = {
        id: assistantMsgId,
        sender: 'assistant',
        text: '',
        timestamp: Date.now(),
        topicCategory: attachedImage ? 'Universal Vision AI' : 'Universal AI',
        isStreaming: true,
      };

      const workingConv = await persistMessagesToConversation(
        convId,
        existingConv,
        [...priorMessages, userMsg, placeholderAssistant],
        userMsg.text
      );

      setStatusMessage(attachedImage ? 'Analyzing image and thinking...' : 'Generating answer...');

      try {
        const finalReply = await AIChatService.streamAnswer({
          prompt: userMsg.text,
          history: priorMessages,
          image: attachedImage,
          language: settings.language,
          explanationDepth: settings.explanationDepth,
          signal: controller.signal,
          onToken: (fullTextSoFar) => {
            partialResponseRef.current = fullTextSoFar;
            setStatusMessage(null);
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id !== convId) return c;
                return {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId ? { ...m, text: fullTextSoFar } : m
                  ),
                };
              })
            );
          },
        });

        const completedAssistant: ChatMessage = {
          ...placeholderAssistant,
          text: finalReply,
          timestamp: Date.now(),
          isStreaming: false,
        };

        await persistMessagesToConversation(
          convId,
          workingConv,
          [...priorMessages, userMsg, completedAssistant],
          userMsg.text
        );

        if ((viaVoice || settings.autoSpeak) && !settings.ttsMuted) {
          handleSpeak(finalReply);
        }
      } catch (err: unknown) {
        const wasAborted = controller.signal.aborted;
        const partial = partialResponseRef.current.trim();

        if (wasAborted && partial) {
          const stoppedAssistant: ChatMessage = {
            ...placeholderAssistant,
            text: `${partial}\n\n[Generation stopped]`,
            timestamp: Date.now(),
            isStreaming: false,
          };
          await persistMessagesToConversation(
            convId,
            workingConv,
            [...priorMessages, userMsg, stoppedAssistant],
            userMsg.text
          );
        } else {
          const errMessage = wasAborted
            ? 'Response generation was stopped.'
            : err instanceof Error
            ? err.message
            : 'Unable to reach the AI inference service.';

          const errMsg: ChatMessage = {
            id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            sender: 'assistant',
            text: errMessage,
            timestamp: Date.now(),
            isError: !wasAborted,
          };

          await persistMessagesToConversation(
            convId,
            workingConv,
            [...priorMessages, userMsg, errMsg],
            userMsg.text
          );
        }
      } finally {
        abortControllerRef.current = null;
        setStatusMessage(null);
        setIsGenerating(false);
      }
    },
    [
      activeConversationId,
      conversations,
      handleSpeak,
      isGenerating,
      persistMessagesToConversation,
      settings.autoSpeak,
      settings.explanationDepth,
      settings.language,
      settings.ttsMuted,
    ]
  );

  return (
    <div className={settings.theme === 'dark' ? 'dark h-screen' : 'h-screen'}>
      <div className="h-screen w-full flex overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-cyan-50/50 dark:from-[#060913] dark:via-[#0b1122] dark:to-[#111833] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
        {/* Ambient Mesh Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 overflow-hidden opacity-60 dark:opacity-45"
        >
          <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-cyan-500/20 blur-3xl" />
        </div>

        {/* Left Collapsible Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          onRenameConversation={handleRenameConversation}
          onDeleteConversation={handleDeleteConversation}
          onClearAllHistory={handleClearAllHistory}
          onOpenMicrophone={() => setExternalMicTrigger((n) => n + 1)}
          onOpenCamera={() => setIsCameraOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          theme={settings.theme}
          onToggleTheme={() =>
            updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
          }
        />

        {/* Main Workspace */}
        <div className="relative z-10 flex-1 flex flex-col min-w-0 h-full">
          {/* Top Glass Header Bar */}
          <header className="px-4 sm:px-6 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={sidebarOpen ? 'Hide sidebar' : 'Open sidebar'}
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? (
                  <Menu className="w-5 h-5 lg:hidden" />
                ) : (
                  <PanelLeftOpen className="w-5 h-5" />
                )}
                {sidebarOpen && <PanelLeftOpen className="w-5 h-5 hidden lg:block rotate-180" />}
              </button>

              <div className="flex items-center gap-2.5 min-w-0">
                {!sidebarOpen && <Logo3D size="sm" state={assistantVisualState} />}
                <h1 className="font-display font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  LocalMind
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap"
                title={
                  onlineStatus
                    ? 'Universal AI Answer Engine ready'
                    : 'Internet connection unavailable'
                }
              >
                {onlineStatus ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Universal AI Ready</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                    <span>Offline</span>
                  </>
                )}
              </div>

              {activeConversation && activeConversation.messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCurrentChat}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer whitespace-nowrap"
                  title="Clear current chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear Chat</span>
                </button>
              )}

              {canInstall && !isInstalled && (
                <button
                  type="button"
                  onClick={installApp}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Open Camera Assistant"
                aria-label="Open Camera Assistant"
              >
                <Camera className="w-4.5 h-4.5" />
              </button>

              <button
                type="button"
                onClick={() => setExternalMicTrigger((n) => n + 1)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-rose-500/15 text-rose-500'
                    : 'text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
                title="Voice Assistant"
                aria-label="Activate Voice Assistant"
              >
                <Mic className="w-4.5 h-4.5" />
              </button>

              <button
                type="button"
                onClick={() =>
                  updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
                }
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={settings.theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'}
                aria-label="Toggle theme"
              >
                {settings.theme === 'dark' ? (
                  <Sun className="w-4.5 h-4.5 text-amber-400" />
                ) : (
                  <Moon className="w-4.5 h-4.5 text-indigo-600" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Settings"
                aria-label="Open Settings"
              >
                <Settings className="w-4.5 h-4.5" />
              </button>
            </div>
          </header>

          {/* Main Area: Welcome Screen or Active Conversation */}
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <div className="flex-1 overflow-y-auto custom-scroll px-4 sm:px-6 py-10">
              <div className="max-w-3xl mx-auto flex flex-col items-center text-center space-y-8">
                {/* 3D Hero Identity */}
                <div className="flex flex-col items-center space-y-4 pt-4">
                  <Logo3D size="lg" state={assistantVisualState} interactive />

                  <div className="space-y-2.5">
                    <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-slate-900 dark:text-white text-balance">
                      Ask{' '}
                      <span className="bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                        LocalMind
                      </span>{' '}
                      Anything
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                      A universal AI assistant ready to answer any question across Science, Math,
                      Coding, Engineering, History, Education, and Daily Life in English, தமிழ், and
                      Tanglish — with zero local model downloads.
                    </p>
                  </div>
                </div>

                {/* Prompt Starters */}
                <div className="w-full space-y-3 text-left">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Try asking any open-ended question
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="flex items-center gap-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Ask with Photo / Camera</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {STARTER_PROMPTS.map((item) => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => handleSendMessage(item.prompt, pendingImage, false)}
                        className="group p-4 rounded-2xl bg-white/80 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 hover:border-indigo-500/50 text-left transition-all hover:-translate-y-0.5 shadow-xs hover:shadow-md cursor-pointer flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                            {item.icon}
                            <span>{item.title}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {item.prompt}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ChatMessages
              messages={activeConversation.messages}
              onSpeak={handleSpeak}
              onStopSpeech={handleStopSpeech}
              ttsMuted={settings.ttsMuted}
              onToggleMute={() => updateSettings({ ttsMuted: !settings.ttsMuted })}
              activeSpeechText={activeSpeechText}
              isGenerating={isGenerating}
              statusMessage={statusMessage}
            />
          )}

          {/* Bottom Input Area */}
          <InputControls
            onSendMessage={handleSendMessage}
            onStopGenerating={handleStopGenerating}
            isGenerating={isGenerating}
            onOpenCamera={() => setIsCameraOpen(true)}
            pendingImage={pendingImage}
            onRemoveImage={() => setPendingImage(null)}
            speechLang={settings.speechLang}
            onChangeSpeechLang={(lang) => updateSettings({ speechLang: lang })}
            ttsMuted={settings.ttsMuted}
            onToggleMute={() => updateSettings({ ttsMuted: !settings.ttsMuted })}
            isSpeaking={Boolean(activeSpeechText)}
            onStopSpeech={handleStopSpeech}
            onListeningChange={setIsListening}
            externalMicTrigger={externalMicTrigger}
            inputRef={inputRef}
          />
        </div>

        {/* Camera & Image Assistant Modal */}
        <CameraModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onAttachImage={(attachment) => {
            setPendingImage(attachment);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          existingAttachment={pendingImage}
        />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={updateSettings}
          onClearAllHistory={handleClearAllHistory}
          onExportHistory={handleExportHistory}
          conversationCount={conversations.length}
        />
      </div>
    </div>
  );
}
