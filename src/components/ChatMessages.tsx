import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Volume2, VolumeX, Copy, Check, ThumbsUp, ThumbsDown, Code2, Loader2 } from 'lucide-react';
import { Message } from '../types';

interface ChatMessagesProps {
  messages: Message[];
  onSpeak: (text: string) => void;
  activeSpeechText: string | null;
  onFeedback: (messageId: string, liked: boolean) => void;
  isProcessing?: boolean;
}

interface TextSegment {
  type: 'text' | 'code';
  content: string;
  lang?: string;
}

function parseMessageContent(raw: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      const before = raw.slice(lastIndex, match.index).trim();
      if (before) segments.push({ type: 'text', content: before });
    }
    segments.push({
      type: 'code',
      lang: match[1] || 'code',
      content: match[2].replace(/\n$/, ''),
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
        <strong key={idx} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[12px]"
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
  activeSpeechText,
  onFeedback,
  isProcessing = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleCopy = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      ref={containerRef}
      id="messages"
      tabIndex={0}
      aria-label="Chat messages history"
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
    >
      {messages.map((msg) => {
        const isBot = msg.sender === 'bot';
        const isSpeakingThis = activeSpeechText === msg.text;
        const segments = isBot ? parseMessageContent(msg.text) : [{ type: 'text' as const, content: msg.text }];

        return (
          <div
            key={msg.id}
            className={`flex items-start gap-3 transition-opacity ${
              isBot ? 'justify-start' : 'justify-end'
            }`}
          >
            {/* Bot Avatar */}
            {isBot && (
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            {/* Bubble Content */}
            <div
              className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                isBot
                  ? 'bg-slate-900 border border-slate-800 text-slate-100'
                  : 'bg-indigo-600 text-white rounded-br-sm'
              }`}
            >
              {/* Message Header Metadata */}
              <div className="flex items-center justify-between gap-3 mb-2 text-xs opacity-75">
                <span className="font-medium tracking-tight">
                  {isBot
                    ? msg.isOfflineMatch === false
                      ? 'AI Assistant'
                      : 'Offline Engine'
                    : 'You'}
                </span>
                <div className="flex items-center gap-1.5 text-[11px]">
                  {isBot && msg.category && (
                    <span className="capitalize text-slate-400 font-mono text-[10px]">
                      {msg.category === 'hybrid-online' ? 'AI' : msg.category}
                    </span>
                  )}
                  {isBot && msg.category && <span aria-hidden="true">·</span>}
                  <span>{formatTime(msg.timestamp)}</span>
                </div>
              </div>

              {/* Main Body with Markdown Code Block Support */}
              <div className="space-y-2.5 text-[13.5px]">
                {segments.map((seg, idx) => {
                  if (seg.type === 'code') {
                    const blockId = `${msg.id}_seg_${idx}`;
                    return (
                      <div
                        key={blockId}
                        className="rounded-lg overflow-hidden border border-slate-700 bg-slate-950 text-slate-200"
                      >
                        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                            {seg.lang || 'code'}
                          </span>
                          <button
                            onClick={() => handleCopy(seg.content, blockId)}
                            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                            title="Copy code"
                          >
                            {copiedId === blockId ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-[11px] text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="text-[11px]">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 text-xs font-mono overflow-x-auto text-emerald-400 bg-slate-950/90">
                          <code>{seg.content}</code>
                        </pre>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className="whitespace-pre-wrap break-words">
                      {isBot ? renderInlineFormatting(seg.content) : seg.content}
                    </div>
                  );
                })}
              </div>

              {/* Explicit Code Snippet Box (for offline structured rules) */}
              {msg.codeSnippet && (
                <div className="mt-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 text-slate-200">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                      {msg.codeLang || 'code'}
                    </span>
                    <button
                      onClick={() => handleCopy(msg.codeSnippet!, msg.id)}
                      className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                      title="Copy code"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-[11px] text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[11px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 text-xs font-mono overflow-x-auto text-emerald-400 bg-slate-950/90">
                    <code>{msg.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* Bottom Actions for Bot message */}
              {isBot && (
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    {/* Offline TTS Speak */}
                    <button
                      onClick={() => onSpeak(msg.text)}
                      className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer ${
                        isSpeakingThis
                          ? 'bg-indigo-500/20 text-indigo-300 font-semibold'
                          : 'hover:text-slate-200 hover:bg-slate-800'
                      }`}
                      title={isSpeakingThis ? 'Voice active (click to restart)' : 'Listen via offline speech synthesis'}
                    >
                      {isSpeakingThis ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                          <span className="text-[11px]">Speaking...</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Listen</span>
                        </>
                      )}
                    </button>

                    {/* Copy Text */}
                    <button
                      onClick={() => handleCopy(msg.text, `text-${msg.id}`)}
                      className="flex items-center gap-1 px-2 py-1 rounded hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Copy response text"
                    >
                      {copiedId === `text-${msg.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Feedback thumbs */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onFeedback(msg.id, true)}
                      className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                        msg.liked === true ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Helpful response"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onFeedback(msg.id, false)}
                      className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                        msg.liked === false ? 'text-rose-400' : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Not helpful"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar */}
            {!isBot && (
              <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        );
      })}

      {/* Typing / Thinking Indicator */}
      {isProcessing && (
        <div className="flex items-start gap-3 justify-start">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Bot className="w-4 h-4" />
          </div>
          <div className="rounded-2xl px-4 py-3 bg-slate-900 border border-slate-800 text-slate-300 text-xs flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>Thinking...</span>
          </div>
        </div>
      )}
    </div>
  );
};
