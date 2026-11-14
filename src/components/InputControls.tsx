import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Trash2, ShieldCheck, Radio } from 'lucide-react';
import { SpeechService, SpeechLang, RecognitionInstance } from '../services/speechService';

interface InputControlsProps {
  onSendMessage: (text: string, viaVoice?: boolean) => void;
  onClearChat: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isProcessing: boolean;
}

const LANG_OPTIONS: Array<{ value: SpeechLang; label: string }> = [
  { value: 'en-US', label: 'EN-US' },
  { value: 'en-IN', label: 'EN-IN' },
  { value: 'ta-IN', label: 'TA-IN' },
];

export const InputControls: React.FC<InputControlsProps> = ({
  onSendMessage,
  onClearChat,
  inputRef,
  isProcessing,
}) => {
  const [inputText, setInputText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [autoSendVoice, setAutoSendVoice] = useState(true);
  const [speechLang, setSpeechLang] = useState<SpeechLang>('en-US');
  const [micNote, setMicNote] = useState<string | null>(null);
  const [isSpeechSupported] = useState<boolean>(() => SpeechService.isRecognitionSupported());

  const recognitionRef = useRef<RecognitionInstance | null>(null);
  const autoSendRef = useRef(autoSendVoice);
  const isProcessingRef = useRef(isProcessing);
  const onSendRef = useRef(onSendMessage);

  useEffect(() => {
    autoSendRef.current = autoSendVoice;
  }, [autoSendVoice]);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    onSendRef.current = onSendMessage;
  }, [onSendMessage]);

  useEffect(() => {
    if (!isSpeechSupported) return;

    const instance = SpeechService.createRecognition(
      {
        onStart: () => {
          setIsListening(true);
          setInterimText('');
          setMicNote(null);
        },
        onInterim: (text: string) => {
          setInterimText(text);
        },
        onFinal: (finalText: string) => {
          setInterimText('');
          if (autoSendRef.current && !isProcessingRef.current) {
            onSendRef.current(finalText, true);
            setInputText('');
          } else {
            setInputText((prev) => (prev ? `${prev} ${finalText}` : finalText));
            inputRef.current?.focus();
          }
        },
        onError: (friendlyMessage: string, errorCode?: string) => {
          setIsListening(false);
          setInterimText('');
          if (errorCode !== 'aborted') {
            setMicNote(friendlyMessage);
            setTimeout(() => setMicNote(null), 5000);
          }
        },
        onEnd: () => {
          setIsListening(false);
          setInterimText('');
        },
      },
      speechLang
    );

    recognitionRef.current = instance;

    return () => {
      try {
        instance?.abort();
      } catch {
        // ignore
      }
    };
  }, [isSpeechSupported, speechLang, inputRef]);

  const handleToggleMic = () => {
    if (!isSpeechSupported || !recognitionRef.current) {
      setMicNote('Speech Recognition API is not supported in this browser (try Chrome or Edge).');
      setTimeout(() => setMicNote(null), 5000);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      setInterimText('');
    } else {
      // Stop any ongoing TTS playback before listening to avoid feedback loop
      SpeechService.stop();
      setMicNote(null);
      try {
        recognitionRef.current.setLang(speechLang);
        recognitionRef.current.start();
      } catch {
        setIsListening(false);
        setMicNote('Could not start microphone. Please try again.');
        setTimeout(() => setMicNote(null), 4000);
      }
    }
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isProcessing) return;
    onSendMessage(trimmed, false);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const displayValue = isListening && interimText
    ? (inputText ? `${inputText} ${interimText}` : interimText)
    : inputText;

  return (
    <div className="border-t border-slate-800 bg-slate-900 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Live Voice Dictation Banner */}
        {isListening && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Radio className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
              <span className="truncate">
                {interimText
                  ? `Listening: "${interimText}"`
                  : `Listening (${speechLang})... Speak your question now`}
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleMic}
              className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 cursor-pointer shrink-0 transition-colors"
            >
              Stop
            </button>
          </div>
        )}

        {/* Controls Row */}
        <div className="flex items-center gap-2">
          {/* Text Input + Mic Button */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              id="userInput"
              type="text"
              value={displayValue}
              onChange={(e) => {
                if (!isListening) setInputText(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? 'Listening... speak clearly'
                  : "Ask any question or tap mic to speak... (e.g. 'What is AI?')"
              }
              autoComplete="off"
              disabled={isProcessing}
              className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors pr-12 ${
                isListening
                  ? 'border-rose-500/70 ring-1 ring-rose-500/30'
                  : 'border-slate-800 focus:border-indigo-500'
              }`}
            />

            {/* Hands-Free Speech Recognition Mic Button */}
            <button
              id="micBtn"
              type="button"
              onClick={handleToggleMic}
              disabled={isProcessing}
              aria-label={isListening ? 'Stop voice dictation' : 'Start voice dictation'}
              aria-pressed={isListening}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all cursor-pointer disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                isListening
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title={
                isListening
                  ? 'Listening... click to stop dictation'
                  : 'Hands-free voice input (Speech Recognition)'
              }
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Send Button */}
          <button
            id="sendBtn"
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() || isProcessing}
            className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>

        {/* Footer, Voice Settings & Quick Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              {micNote ? (
                <span className="text-amber-300">{micNote}</span>
              ) : (
                'Voice & Text · Works online & offline'
              )}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            {/* Voice Language Selector */}
            {isSpeechSupported && (
              <div className="flex items-center gap-1.5">
                <label htmlFor="speechLangSelect" className="text-[11px] text-slate-400">
                  Voice:
                </label>
                <select
                  id="speechLangSelect"
                  value={speechLang}
                  onChange={(e) => setSpeechLang(e.target.value as SpeechLang)}
                  disabled={isListening}
                  className="bg-slate-950 border border-slate-800 rounded-md px-1.5 py-0.5 text-[11px] text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
                  title="Select speech recognition language"
                >
                  {LANG_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Hands-free Auto-Send Toggle */}
            {isSpeechSupported && (
              <button
                type="button"
                onClick={() => setAutoSendVoice((prev) => !prev)}
                className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                  autoSendVoice
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="Automatically send and read answers aloud after speaking"
              >
                {autoSendVoice ? 'Hands-Free: Auto-Send' : 'Dictate to Input'}
              </button>
            )}

            <button
              id="clearBtn"
              type="button"
              onClick={onClearChat}
              className="hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <Trash2 className="w-3 h-3 text-rose-400" />
              <span>Clear Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
