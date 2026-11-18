import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Camera,
  Square,
  X,
  RefreshCw,
  Radio,
  AlertCircle,
  VolumeX,
  Volume2,
} from 'lucide-react';
import { ImageAttachment, SpeechLang } from '../types';
import { SpeechService, RecognitionInstance } from '../services/speechService';

interface InputControlsProps {
  onSendMessage: (text: string, image: ImageAttachment | null, viaVoice: boolean) => void;
  onStopGenerating: () => void;
  isGenerating: boolean;
  onOpenCamera: () => void;
  pendingImage: ImageAttachment | null;
  onRemoveImage: () => void;
  speechLang: SpeechLang;
  onChangeSpeechLang: (lang: SpeechLang) => void;
  ttsMuted: boolean;
  onToggleMute: () => void;
  isSpeaking: boolean;
  onStopSpeech: () => void;
  onListeningChange: (listening: boolean) => void;
  externalMicTrigger: number;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

const LANG_OPTIONS: Array<{ value: SpeechLang; label: string }> = [
  { value: 'en-US', label: 'EN-US' },
  { value: 'en-IN', label: 'EN-IN' },
  { value: 'ta-IN', label: 'TA-IN' },
];

export const InputControls: React.FC<InputControlsProps> = ({
  onSendMessage,
  onStopGenerating,
  isGenerating,
  onOpenCamera,
  pendingImage,
  onRemoveImage,
  speechLang,
  onChangeSpeechLang,
  ttsMuted,
  onToggleMute,
  isSpeaking,
  onStopSpeech,
  onListeningChange,
  externalMicTrigger,
  inputRef,
}) => {
  const [inputText, setInputText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'speech' | 'recorder' | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [autoSendVoice, setAutoSendVoice] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);
  const [micPermission, setMicPermission] = useState<
    'granted' | 'prompt' | 'denied' | 'unsupported'
  >('prompt');
  const [isSpeechSupported] = useState<boolean>(() => SpeechService.isRecognitionSupported());
  const [isRecorderSupported] = useState<boolean>(() => SpeechService.isMediaRecorderSupported());

  const recognitionRef = useRef<RecognitionInstance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const preferRecorderRef = useRef<boolean>(!SpeechService.isRecognitionSupported());

  const autoSendRef = useRef(autoSendVoice);
  const isGeneratingRef = useRef(isGenerating);
  const pendingImageRef = useRef(pendingImage);
  const speechLangRef = useRef(speechLang);
  const onSendRef = useRef(onSendMessage);

  useEffect(() => {
    autoSendRef.current = autoSendVoice;
  }, [autoSendVoice]);

  useEffect(() => {
    isGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  useEffect(() => {
    pendingImageRef.current = pendingImage;
  }, [pendingImage]);

  useEffect(() => {
    speechLangRef.current = speechLang;
  }, [speechLang]);

  useEffect(() => {
    onSendRef.current = onSendMessage;
  }, [onSendMessage]);

  useEffect(() => {
    onListeningChange(isListening);
  }, [isListening, onListeningChange]);

  const refreshMicPermission = async () => {
    const state = await SpeechService.getMicrophonePermissionState();
    setMicPermission(state);
    return state;
  };

  useEffect(() => {
    refreshMicPermission();
  }, []);

  const cleanupRecorderResources = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setAudioLevel(0);
  };

  const startMediaRecorderCapture = async () => {
    if (!SpeechService.isMediaRecorderSupported()) {
      setMicError(
        'Microphone recording is unavailable in this browser context (HTTPS or localhost required).'
      );
      setTimeout(() => setMicError(null), 6000);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      mediaStreamRef.current = stream;

      // Setup live audio level visualizer
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 128;
          source.connect(analyser);
          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const updateLevel = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / (dataArray.length || 1);
            setAudioLevel(Math.min(1, avg / 70));
            rafRef.current = requestAnimationFrame(updateLevel);
          };
          rafRef.current = requestAnimationFrame(updateLevel);
        }
      } catch {
        // Ignore visualizer failures; recording continues normally
      }

      const preferredTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
      const mimeType = preferredTypes.find((t) => MediaRecorder.isTypeSupported?.(t)) || '';
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      audioChunksRef.current = [];
      recorder.ondataavailable = (evt) => {
        if (evt.data && evt.data.size > 0) {
          audioChunksRef.current.push(evt.data);
        }
      };

      recorder.onstop = async () => {
        const recordedMime = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: recordedMime });
        audioChunksRef.current = [];
        cleanupRecorderResources();
        setIsListening(false);
        setRecordingMode(null);

        if (blob.size < 400) {
          setMicError('Recording was too short. Please speak clearly and try again.');
          setTimeout(() => setMicError(null), 5000);
          return;
        }

        setIsTranscribing(true);
        try {
          const transcript = await SpeechService.transcribeAudioBlob(blob, speechLangRef.current);
          if (!transcript) {
            setMicError('No clear speech was detected. Please try speaking closer to the mic.');
            setTimeout(() => setMicError(null), 5000);
            return;
          }
          if (autoSendRef.current && !isGeneratingRef.current) {
            onSendRef.current(transcript, pendingImageRef.current, true);
            setInputText('');
          } else {
            setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
            inputRef.current?.focus();
          }
        } catch (err: unknown) {
          setMicError(
            err instanceof Error ? err.message : 'Failed to transcribe microphone audio.'
          );
          setTimeout(() => setMicError(null), 6000);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setRecordingMode('recorder');
      setIsListening(true);
      setMicError(null);
    } catch (err: unknown) {
      cleanupRecorderResources();
      setIsListening(false);
      setRecordingMode(null);
      await refreshMicPermission();
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setMicPermission('denied');
        setMicError(
          'Microphone permission was denied. Please allow microphone access in your browser site settings.'
        );
      } else {
        setMicError(
          `Could not access microphone: ${err instanceof Error ? err.message : String(err)}`
        );
      }
      setTimeout(() => setMicError(null), 6000);
    }
  };

  useEffect(() => {
    if (!isSpeechSupported) return;

    const instance = SpeechService.createRecognition(
      {
        onStart: () => {
          setRecordingMode('speech');
          setIsListening(true);
          setInterimText('');
          setMicError(null);
        },
        onInterim: (text: string) => {
          setInterimText(text);
        },
        onFinal: (finalText: string) => {
          setInterimText('');
          if (autoSendRef.current && !isGeneratingRef.current) {
            onSendRef.current(finalText, pendingImageRef.current, true);
            setInputText('');
          } else {
            setInputText((prev) => (prev ? `${prev} ${finalText}` : finalText));
            inputRef.current?.focus();
          }
        },
        onError: (friendlyMessage: string, errorCode?: string) => {
          setIsListening(false);
          setRecordingMode(null);
          setInterimText('');
          if (
            (errorCode === 'network' ||
              errorCode === 'service-not-allowed' ||
              errorCode === 'language-not-supported') &&
            SpeechService.isMediaRecorderSupported()
          ) {
            preferRecorderRef.current = true;
            startMediaRecorderCapture();
            return;
          }
          if (errorCode !== 'aborted') {
            setMicError(friendlyMessage);
            setTimeout(() => setMicError(null), 6000);
          }
        },
        onEnd: () => {
          setIsListening(false);
          setRecordingMode((prev) => (prev === 'speech' ? null : prev));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpeechSupported, speechLang, inputRef]);

  useEffect(() => {
    return () => {
      cleanupRecorderResources();
    };
  }, []);

  const handleRequestMicAccessOnly = async () => {
    setMicError(null);
    const perm = await SpeechService.requestMicrophonePermission();
    await refreshMicPermission();
    if (!perm.granted) {
      setMicError(perm.error || 'Microphone permission denied.');
      setTimeout(() => setMicError(null), 6000);
    }
  };

  const handleToggleMic = async () => {
    if (isTranscribing) return;

    if (isListening) {
      if (recordingMode === 'recorder' && mediaRecorderRef.current) {
        try {
          if (mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
        } catch {
          cleanupRecorderResources();
          setIsListening(false);
          setRecordingMode(null);
        }
        return;
      }

      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      setRecordingMode(null);
      setInterimText('');
      return;
    }

    if (!isSpeechSupported && !isRecorderSupported) {
      setMicError(
        'Microphone API is unavailable in this browser context. Please allow microphone access over HTTPS or localhost.'
      );
      setTimeout(() => setMicError(null), 6000);
      return;
    }

    // Stop active TTS before requesting microphone
    SpeechService.stop();
    setMicError(null);

    if (preferRecorderRef.current || !isSpeechSupported || !recognitionRef.current) {
      await startMediaRecorderCapture();
      return;
    }

    // Ask microphone permission explicitly before starting speech recognition
    const perm = await SpeechService.requestMicrophonePermission();
    await refreshMicPermission();
    if (!perm.granted) {
      setMicError(perm.error || 'Microphone permission denied.');
      setTimeout(() => setMicError(null), 6000);
      return;
    }

    try {
      recognitionRef.current.setLang(speechLang);
      recognitionRef.current.start();
    } catch {
      preferRecorderRef.current = true;
      await startMediaRecorderCapture();
    }
  };

  // Trigger microphone when clicked from Sidebar
  useEffect(() => {
    if (externalMicTrigger > 0 && !isListening) {
      handleToggleMic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalMicTrigger]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if ((!trimmed && !pendingImage) || isGenerating) return;
    onSendMessage(trimmed, pendingImage, false);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const displayValue =
    isListening && interimText
      ? inputText
        ? `${inputText} ${interimText}`
        : interimText
      : inputText;

  return (
    <div className="px-4 sm:px-6 pb-4 pt-2 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/75 dark:bg-slate-950/75 backdrop-blur-xl">
      <div className="max-w-3xl mx-auto space-y-2.5">
        {/* Attached Image Preview */}
        {pendingImage && (
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={pendingImage.dataUrl}
                alt={pendingImage.fileName}
                className="w-12 h-12 rounded-lg object-cover border border-slate-300 dark:border-slate-700 shrink-0"
              />
              <div className="min-w-0 text-xs">
                <div className="font-medium text-slate-900 dark:text-white truncate">
                  {pendingImage.fileName}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  {pendingImage.width}×{pendingImage.height} ·{' '}
                  {(pendingImage.sizeBytes / 1024).toFixed(0)} KB
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onOpenCamera}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                title="Replace image"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={onRemoveImage}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Remove attached image"
                aria-label="Remove attached image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Listening / Transcribing Banner */}
        {(isListening || isTranscribing) && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/35 text-xs text-rose-600 dark:text-rose-200"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Radio className="w-4 h-4 text-rose-500 animate-pulse shrink-0" />
              {recordingMode === 'recorder' && isListening && (
                <div className="flex items-end gap-0.5 h-3.5 shrink-0" aria-hidden="true">
                  {[0.25, 0.5, 0.75, 0.9, 0.6].map((factor, idx) => (
                    <span
                      key={idx}
                      className="w-1 rounded-full bg-rose-500 transition-all duration-75"
                      style={{
                        height: `${Math.max(25, Math.round(audioLevel * factor * 100))}%`,
                      }}
                    />
                  ))}
                </div>
              )}
              <span className="truncate font-medium">
                {isTranscribing
                  ? 'Transcribing microphone audio...'
                  : interimText
                  ? `"${interimText}"`
                  : recordingMode === 'recorder'
                  ? `Recording mic (${speechLang}) — Speak your question, then click Stop & Send`
                  : `Listening (${speechLang}) — Speak your question...`}
              </span>
            </div>
            {isListening && (
              <button
                type="button"
                onClick={handleToggleMic}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold cursor-pointer shrink-0"
              >
                {recordingMode === 'recorder' ? 'Stop & Send' : 'Stop Mic'}
              </button>
            )}
          </div>
        )}

        {/* Mic Error Banner */}
        {micError && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300">
            <div className="flex items-start gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{micError}</span>
            </div>
            <button
              type="button"
              onClick={handleRequestMicAccessOnly}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 text-[11px] font-semibold cursor-pointer shrink-0"
            >
              Retry Mic
            </button>
          </div>
        )}

        {/* Main Input Bar */}
        <div className="flex items-end gap-2 p-2 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 transition-colors shadow-sm">
          {/* Camera Button */}
          <button
            id="cameraBtn"
            type="button"
            onClick={onOpenCamera}
            disabled={isGenerating}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-white dark:hover:bg-slate-800 transition-all hover:-translate-y-0.5 disabled:opacity-40 cursor-pointer shrink-0"
            title="Camera & Image Assistant (capture or upload photo)"
            aria-label="Open camera or upload image"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Textarea */}
          <textarea
            ref={inputRef}
            id="userInput"
            rows={1}
            value={displayValue}
            onChange={(e) => {
              if (!isListening) {
                setInputText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              pendingImage
                ? 'Ask a question about this image (or press Send to scan & solve)...'
                : 'Ask LocalMind anything in English, தமிழ், or Tanglish...'
            }
            disabled={isGenerating}
            className="flex-1 bg-transparent py-2 px-1 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none resize-none max-h-36 leading-relaxed"
          />

          {/* Microphone Button */}
          <button
            id="micBtn"
            type="button"
            onClick={handleToggleMic}
            disabled={isGenerating}
            aria-label={isListening ? 'Stop voice dictation' : 'Start voice dictation'}
            aria-pressed={isListening}
            className={`p-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-40 shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/30 animate-pulse'
                : 'text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800 hover:-translate-y-0.5'
            }`}
            title={isListening ? 'Stop listening' : 'Voice dictation (English / Tamil)'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send or Stop Generating Button */}
          {isGenerating ? (
            <button
              type="button"
              onClick={onStopGenerating}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer shrink-0"
              title="Stop generating response"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Stop</span>
            </button>
          ) : (
            <button
              id="sendBtn"
              type="button"
              onClick={handleSend}
              disabled={!inputText.trim() && !pendingImage}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-40 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          )}
        </div>

        {/* Voice Controls Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 px-1">
          <div className="flex flex-wrap items-center gap-2.5">
            {(isSpeechSupported || isRecorderSupported) && (
              <>
                <div className="flex items-center gap-1">
                  <label htmlFor="speechLangSelect">Mic:</label>
                  <select
                    id="speechLangSelect"
                    value={speechLang}
                    onChange={(e) => onChangeSpeechLang(e.target.value as SpeechLang)}
                    disabled={isListening || isTranscribing}
                    className="bg-transparent border border-slate-200 dark:border-slate-800 rounded-md px-1.5 py-0.5 text-[11px] outline-none cursor-pointer"
                  >
                    {LANG_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value} className="bg-white dark:bg-slate-900">
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setAutoSendVoice((prev) => !prev)}
                  className={`px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    autoSendVoice
                      ? 'bg-indigo-500/10 border-indigo-500/35 text-indigo-600 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {autoSendVoice ? 'Hands-Free Send: On' : 'Dictate to Input'}
                </button>

                {micPermission !== 'granted' && micPermission !== 'unsupported' && (
                  <button
                    type="button"
                    onClick={handleRequestMicAccessOnly}
                    className="px-2 py-0.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-medium transition-colors cursor-pointer"
                  >
                    {micPermission === 'denied' ? 'Mic Blocked — Retry' : 'Allow Mic Access'}
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isSpeaking && (
              <button
                type="button"
                onClick={onStopSpeech}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-500 font-medium cursor-pointer"
              >
                <Square className="w-2.5 h-2.5 fill-current" />
                <span>Stop Audio</span>
              </button>
            )}

            <button
              type="button"
              onClick={onToggleMute}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition-colors"
              title={ttsMuted ? 'Unmute voice output' : 'Mute voice output'}
            >
              {ttsMuted ? (
                <>
                  <VolumeX className="w-3 h-3 text-rose-500" />
                  <span>Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3 text-emerald-500" />
                  <span>Voice Ready</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
