import { Bot, Cpu, HelpCircle, BookOpen, BarChart3, Wifi, WifiOff, Trash2, Sparkles, Download } from 'lucide-react';

interface HeaderProps {
  isSimulatedOffline: boolean;
  onToggleSimulateOffline: () => void;
  isHybridAllowed: boolean;
  onToggleHybrid: () => void;
  onOpenKnowledgeModal: () => void;
  onOpenQuizModal: () => void;
  onOpenStatsModal: () => void;
  onClearChat: () => void;
  onlineStatus: boolean;
  activeSpeech: boolean;
  onStopSpeech: () => void;
  canInstall?: boolean;
  isInstalled?: boolean;
  onInstallApp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSimulatedOffline,
  onToggleSimulateOffline,
  isHybridAllowed,
  onToggleHybrid,
  onOpenKnowledgeModal,
  onOpenQuizModal,
  onOpenStatsModal,
  onClearChat,
  onlineStatus,
  activeSpeech,
  onStopSpeech,
  canInstall,
  isInstalled,
  onInstallApp,
}) => {
  const isEffectivelyOffline = isSimulatedOffline || !onlineStatus;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 sm:px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold tracking-tight text-white">
                AI Offline Chatbot
              </h1>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <span aria-hidden="true">·</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isEffectivelyOffline
                      ? 'bg-amber-400'
                      : isHybridAllowed
                      ? 'bg-indigo-400 animate-pulse'
                      : 'bg-emerald-400'
                  }`}
                />
                <span className={isEffectivelyOffline ? 'text-amber-300' : isHybridAllowed ? 'text-indigo-300' : 'text-emerald-300'}>
                  {isEffectivelyOffline
                    ? 'Offline Mode'
                    : isHybridAllowed
                    ? 'Smart AI + Offline'
                    : 'Offline Only'}
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ask any question · Works online & 100% offline
            </p>
          </div>
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Active Audio Stop indicator if speaking */}
          {activeSpeech && (
            <button
              onClick={onStopSpeech}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-colors animate-pulse cursor-pointer"
              title="Stop voice playback"
            >
              <span>Stop Voice</span>
            </button>
          )}

          {/* Smart AI Mode Toggle */}
          <button
            onClick={onToggleHybrid}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer font-medium ${
              isHybridAllowed && !isEffectivelyOffline
                ? 'bg-indigo-600/25 border-indigo-500/50 text-indigo-200 hover:bg-indigo-600/35'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Switch between Smart AI (answers any question when online) and strict Offline-Only mode"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isHybridAllowed ? 'text-indigo-400' : 'text-slate-400'}`} />
            <span>{isHybridAllowed ? 'Smart AI: On' : 'Smart AI: Off'}</span>
          </button>

          {/* Brain Rules (Knowledge Base Trainer) */}
          <button
            onClick={onOpenKnowledgeModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer font-medium"
            title="View built-in knowledge & train custom rules"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Brain Rules</span>
          </button>

          {/* Offline Exam & CS Quiz */}
          <button
            onClick={onOpenQuizModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer font-medium"
            title="Take an offline exam prep quiz"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Quiz Prep</span>
          </button>

          {/* Local Stats */}
          <button
            onClick={onOpenStatsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer font-medium"
            title="View offline engine metrics and privacy guarantee"
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Stats</span>
          </button>

          {/* Network Simulator Toggle */}
          <button
            onClick={onToggleSimulateOffline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer font-medium ${
              isSimulatedOffline
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Toggle simulated offline mode to test without internet"
          >
            {isSimulatedOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulated Offline</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulate Offline</span>
              </>
            )}
          </button>

          {/* Install App for Offline Use */}
          {canInstall && !isInstalled && onInstallApp && (
            <button
              onClick={onInstallApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm transition-colors cursor-pointer animate-pulse"
              title="Install app on your device for 100% offline access"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Offline</span>
            </button>
          )}

          {/* Clear Chat Button */}
          <button
            onClick={onClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800/60 transition-colors cursor-pointer font-medium"
            title="Clear conversation history"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </div>
    </header>
  );
};
