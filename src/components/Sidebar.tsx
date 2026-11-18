import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Pencil,
  Trash2,
  Check,
  X,
  Mic,
  Camera,
  Settings,
  Sun,
  Moon,
  PanelLeftClose,
} from 'lucide-react';
import { Conversation, ThemeMode } from '../types';
import { Logo3D } from './Logo3D';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onClearAllHistory: () => void;
  onOpenMicrophone: () => void;
  onOpenCamera: () => void;
  onOpenSettings: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  onClearAllHistory,
  onOpenMicrophone,
  onOpenCamera,
  onOpenSettings,
  theme,
  onToggleTheme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredConversations = conversations.filter((conv) => {
    if (!normalizedQuery) return true;
    if (conv.title.toLowerCase().includes(normalizedQuery)) return true;
    return conv.messages.some((m) => m.text.toLowerCase().includes(normalizedQuery));
  });

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const commitRename = (id: string) => {
    const trimmed = editTitle.trim();
    if (trimmed) {
      onRenameConversation(id, trimmed);
    }
    setEditingId(null);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Conversation history and tools"
        className={`fixed lg:static inset-y-0 left-0 z-40 w-76 shrink-0 flex flex-col border-r transition-transform duration-300 ease-out backdrop-blur-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'
        } bg-white/85 dark:bg-slate-950/85 border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-slate-100`}
      >
        {/* Top Brand + Collapse */}
        <div className="p-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <Logo3D size="sm" state="idle" />
            <div>
              <div className="font-display font-bold text-base tracking-tight text-slate-900 dark:text-white">
                LocalMind
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Universal AI Assistant
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat + Search History */}
        <div className="p-3 space-y-2.5 border-b border-slate-200/70 dark:border-slate-800/70">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium text-sm shadow-md shadow-indigo-600/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions or chats..."
              aria-label="Search chat history"
              className="w-full pl-8 pr-7 py-2 text-xs rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Previous Conversations List */}
        <div className="flex-1 overflow-y-auto custom-scroll p-2.5 space-y-1">
          <div className="px-2 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Previous Conversations</span>
            <span className="font-mono tabular-nums">{filteredConversations.length}</span>
          </div>

          {filteredConversations.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              {normalizedQuery
                ? `No conversations matching "${searchQuery}".`
                : 'No saved conversations yet. Start asking a question.'}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const isEditing = editingId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    if (!isEditing) {
                      onSelectConversation(conv.id);
                      onCloseMobile();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isEditing) {
                      onSelectConversation(conv.id);
                      onCloseMobile();
                    }
                  }}
                  className={`group flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-500/12 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-200 border border-indigo-500/30'
                      : 'hover:bg-slate-200/60 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />

                  {isEditing ? (
                    <div
                      className="flex-1 flex items-center gap-1 min-w-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitRename(conv.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-indigo-500 rounded px-1.5 py-0.5 text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => commitRename(conv.id)}
                        className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded cursor-pointer"
                        title="Save title"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1 text-slate-400 hover:bg-slate-500/10 rounded cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{conv.title}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                          {formatDate(conv.updatedAt)} · {conv.messages.length} msg
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                        <button
                          type="button"
                          onClick={(e) => startRename(conv, e)}
                          className="p-1 rounded hover:bg-slate-300/60 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-pointer"
                          title="Rename conversation"
                          aria-label="Rename conversation"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                          }}
                          className="p-1 rounded hover:bg-rose-500/15 text-rose-500 cursor-pointer"
                          title="Delete conversation"
                          aria-label="Delete conversation"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Assistant Tools & Controls */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-1.5 text-xs">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                onOpenMicrophone();
                onCloseMobile();
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5 text-rose-500" />
              <span className="truncate font-medium">Voice Assistant</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenCamera();
                onCloseMobile();
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-500" />
              <span className="truncate font-medium">Camera AI</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                onOpenSettings();
                onCloseMobile();
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-indigo-500" />
              <span className="truncate font-medium">Settings</span>
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="truncate font-medium">Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="truncate font-medium">Dark Theme</span>
                </>
              )}
            </button>
          </div>

          {conversations.length > 0 && (
            <div className="pt-1">
              {!confirmClearAll ? (
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              ) : (
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30">
                  <span className="text-[11px] text-rose-500 dark:text-rose-300 font-medium">
                    Delete all chats?
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        onClearAllHistory();
                        setConfirmClearAll(false);
                      }}
                      className="px-2 py-0.5 rounded bg-rose-600 text-white text-[11px] cursor-pointer"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClearAll(false)}
                      className="px-2 py-0.5 rounded bg-slate-700 text-white text-[11px] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
