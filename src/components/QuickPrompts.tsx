import React from 'react';
import { Sparkles, Terminal, Code, GraduationCap, Clock, Calculator, Languages, HelpCircle } from 'lucide-react';

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

const PROMPTS = [
  { label: 'What is AI?', icon: Sparkles, query: 'What is AI?' },
  { label: 'Explain in Tanglish', icon: Languages, query: 'Explain AI in Tanglish' },
  { label: 'Python Code', icon: Code, query: 'Python' },
  { label: 'Java OOP', icon: Terminal, query: 'Java' },
  { label: 'HTML Structure', icon: Code, query: 'HTML' },
  { label: 'College Exam Tips', icon: GraduationCap, query: 'College study tips' },
  { label: 'Current Time', icon: Clock, query: 'What time is it?' },
  { label: 'Calc: 45 * 12', icon: Calculator, query: 'calc: 45 * 12' },
  { label: 'Help', icon: HelpCircle, query: 'help' },
];

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelectPrompt }) => {
  return (
    <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-[11px] font-medium text-slate-400 shrink-0 uppercase tracking-wider">
          Quick Ask:
        </span>
        {PROMPTS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.label}
              onClick={() => onSelectPrompt(p.query)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 hover:border-indigo-500/50 transition-colors whitespace-nowrap cursor-pointer shrink-0 font-medium active:scale-95"
            >
              <Icon className="w-3 h-3 text-indigo-400" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
