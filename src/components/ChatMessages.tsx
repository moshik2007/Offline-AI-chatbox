import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Volume2,
  Square,
  VolumeX,
  Copy,
  Check,
  Code2,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { Logo3D } from './Logo3D';

interface ChatMessagesProps {
  messages: ChatMessage[];
  onSpeak: (text: string) => void;
  onStopSpeech: () => void;
  ttsMuted: boolean;
  onToggleMute: () => void;
  activeSpeechText: string | null;
  isGenerating: boolean;
  statusMessage?: string | null;
}

interface TextSegment {
  type: 'text' | 'code';
  content: string;
  lang?: string;
}

function parseMessageContent(raw: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const regex = /```([^\r\n`]*)\r?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      const before = raw.slice(lastIndex, match.index).trim();
      if (before) segments.push({ type: 'text', content: before });
    }
    const lang = match[1].trim() || 'code';
    segments.push({
      type: 'code',
      lang,
      content: match[2].replace(/\r?\n$/, ''),
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < raw.length) {
    const rest = raw.slice(lastIndex).trim();
    if (rest) segments.push({ type: 'text', content: rest });
  }

  return segments.length > 0 ? segments : [{ type: 'text', content: raw }];
}

function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-slate-950 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-indigo-700 dark:text-cyan-300 font-mono text-[12px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  onSpeak,
  onStopSpeech,
  ttsMuted,
  onToggleMute,
  activeSpeechText,
  isGenerating,
  statusMessage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isGenerating, statusMessage]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleCopy = async (code: string, id: string) => {
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied && typeof document !== 'undefined') {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';
        document.body.appendChild(textarea);
        textarea.select();
        copied = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        copied = false;
      }
    }

    if (copied) {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      setCopiedId(id);
      copyTimerRef.current = setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <div
        ref={containerRef}
        id="messages"
        tabIndex={0}
        aria-label="Conversation messages"
        className="flex-1 overflow-y-auto custom-scroll px-4 sm:px-6 py-6 space-y-6 focus:outline-none"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => {
            const isAssistant = msg.sender === 'assistant';
            const isSpeakingThis = activeSpeechText === msg.text;
            const segments = parseMessageContent(msg.text);

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  isAssistant ? 'justify-start' : 'justify-end'
                }`}
              >
                {isAssistant && (
                  <div className="shrink-0 mt-0.5">
                    <Logo3D
                      size="sm"
                      state={
                        msg.isStreaming
                          ? 'thinking'
                          : isSpeakingThis
                          ? 'speaking'
                          : 'idle'
                      }
                    />
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed transition-all ${
                    isAssistant
                      ? msg.isError
                        ? 'bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-200 backdrop-blur-md'
                        : 'bg-white/80 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 backdrop-blur-md shadow-sm'
                      : 'bg-gradient-to-br from-indigo-600 to-cyan-600 text-white rounded-br-sm shadow-md shadow-indigo-600/15'
                  }`}
                >
                  {/* Header Metadata */}
                  <div className="flex items-center justify-between gap-4 mb-1.5 text-[11px] opacity-75">
                    <span className="font-semibold">
                      {isAssistant ? 'LocalMind' : 'You'}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono tabular-nums">
                      {isAssistant && msg.topicCategory && (
                        <>
                          <span className="truncate max-w-[140px]">
                            {msg.topicCategory}
                          </span>
                          <span aria-hidden="true">·</span>
                        </>
                      )}
                      <span>{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>

                  {/* Uploaded / Captured Image Attachment */}
                  {msg.image && (
                    <div className="mb-2.5 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => setZoomedImageUrl(msg.image!.dataUrl)}
                        className="block rounded-xl overflow-hidden border border-white/20 hover:opacity-95 transition-opacity cursor-zoom-in"
                        title="Click to inspect full image"
                      >
                        <img
                          src={msg.image.dataUrl}
                          alt={msg.image.fileName}
                          className="max-h-56 w-auto object-contain bg-slate-950/60"
                        />
                      </button>
                      {msg.image.ocrText && (
                        <details className="text-[11px] bg-black/20 rounded-lg px-2.5 py-1.5">
                          <summary className="cursor-pointer font-medium opacity-90">
                            Local OCR extracted text ({Math.round(msg.image.ocrConfidence || 0)}% confidence)
                          </summary>
                          <pre className="mt-1.5 whitespace-pre-wrap font-mono text-[11px] opacity-85">
                            {msg.image.ocrText}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}

                  {/* Error Icon + Body */}
                  {msg.isError ? (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                      <div className="whitespace-pre-wrap break-words text-[13.5px]">
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-[14px]">
                      {segments.map((seg, idx) => {
                        if (seg.type === 'code') {
                          const blockId = `${msg.id}_code_${idx}`;
                          return (
                            <div
                              key={blockId}
                              className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700/80 bg-slate-950 text-slate-200 my-1"
                            >
                              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
                                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                                  {seg.lang || 'code'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(seg.content, blockId)}
                                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                  aria-label={`Copy ${seg.lang || 'code'} snippet`}
                                  title="Copy code to clipboard"
                                >
                                  {copiedId === blockId ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-[11px] font-medium text-emerald-400">
                                        Copied
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span className="text-[11px] font-medium">Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="p-3 text-xs font-mono overflow-x-auto text-emerald-400">
                                <code>{seg.content}</code>
                              </pre>
                            </div>
                          );
                        }

                        return (
                          <div key={idx} className="whitespace-pre-wrap break-words">
                            {isAssistant ? renderInlineFormatting(seg.content) : seg.content}
                            {msg.isStreaming && idx === segments.length - 1 && (
                              <span className="inline-block w-2 h-4 ml-1 align-middle bg-indigo-500 animate-pulse rounded-xs" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Voice & Copy Controls on Completed Assistant Messages */}
                  {isAssistant && !msg.isStreaming && !msg.isError && msg.text && (
                    <div className="mt-3 pt-2 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        {!isSpeakingThis ? (
                          <button
                            type="button"
                            onClick={() => onSpeak(msg.text)}
                            disabled={ttsMuted}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                            title={ttsMuted ? 'Voice is muted' : 'Read answer aloud'}
                          >
                            <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[11px]">Read Aloud</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={onStopSpeech}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/15 text-rose-500 font-medium cursor-pointer"
                            title="Stop reading aloud"
                          >
                            <Square className="w-3 h-3 fill-current" />
                            <span className="text-[11px]">Stop</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={onToggleMute}
                          className="p-1 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title={ttsMuted ? 'Unmute voice playback' : 'Mute voice playback'}
                          aria-label={ttsMuted ? 'Unmute voice' : 'Mute voice'}
                        >
                          {ttsMuted ? (
                            <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 opacity-60" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(msg.text, `msg_${msg.id}`)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                          title="Copy answer"
                        >
                          {copiedId === `msg_${msg.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {!isAssistant && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Progress Status (e.g. OCR Extraction or Loading Before First Token) */}
          {statusMessage && (
            <div className="flex items-start gap-3 justify-start">
              <div className="shrink-0 mt-0.5">
                <Logo3D size="sm" state="thinking" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-white/80 dark:bg-slate-900/75 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 backdrop-blur-md">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span>{statusMessage}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {zoomedImageUrl && (
        <div
          onClick={() => setZoomedImageUrl(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <button
            type="button"
            onClick={() => setZoomedImageUrl(null)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            aria-label="Close image preview"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={zoomedImageUrl}
            alt="Uploaded preview"
            className="max-w-full max-h-[90vh] rounded-xl object-contain"
          />
        </div>
      )}
    </>
  );
};
