import React, { useState } from 'react';
import { X, Plus, Trash2, Download, Upload, Search, CheckCircle2, Cpu, Sparkles, BookOpen } from 'lucide-react';
import { KnowledgeRule, ResponseCategory } from '../types';
import { getAllRules, addCustomRule, deleteCustomRule, getCustomRules, saveCustomRules, getOfflineReply } from '../services/offlineEngine';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRulesUpdated: () => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  onRulesUpdated,
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'custom' | 'teach' | 'test'>('all');

  // New Rule Form state
  const [triggersInput, setTriggersInput] = useState('');
  const [responseInput, setResponseInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<ResponseCategory>('custom');
  const [codeSnippetInput, setCodeSnippetInput] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Test Sandbox state
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  if (!isOpen) return null;

  const allRules = getAllRules();
  const customRules = getCustomRules();

  const filteredRules = allRules.filter((r) => {
    if (activeTab === 'custom' && !r.isCustom) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.triggers.some((t) => t.toLowerCase().includes(q)) ||
      r.response.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  });

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const triggers = triggersInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (triggers.length === 0 || !responseInput.trim()) {
      alert('Please provide at least one trigger keyword and a response.');
      return;
    }

    addCustomRule({
      triggers,
      response: responseInput.trim(),
      category: categoryInput,
      codeSnippet: codeSnippetInput.trim() || undefined,
      codeLang: codeSnippetInput.trim() ? 'javascript' : undefined,
    });

    setTriggersInput('');
    setResponseInput('');
    setCodeSnippetInput('');
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 2500);
    onRulesUpdated();
    setActiveTab('custom');
  };

  const handleDeleteRule = (id: string) => {
    if (window.confirm('Are you sure you want to delete this custom offline rule?')) {
      deleteCustomRule(id);
      onRulesUpdated();
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(customRules, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'ai_offline_chatbot_rules.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          saveCustomRules([...customRules, ...parsed]);
          onRulesUpdated();
          alert(`Successfully imported ${parsed.length} custom rules!`);
        }
      } catch {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleRunTest = () => {
    if (!testQuery.trim()) return;
    const res = getOfflineReply(testQuery.trim());
    setTestResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Offline Brain & Knowledge Base
              </h2>
              <p className="text-xs text-slate-400">
                {allRules.length} rules loaded locally in memory · Zero network calls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 px-4 sm:px-5 pt-3 border-b border-slate-800 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-800 text-white border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Rules ({allRules.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-slate-800 text-white border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Rules ({customRules.length})
          </button>
          <button
            onClick={() => setActiveTab('teach')}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'teach'
                ? 'bg-slate-800 text-white border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Teach New Rule</span>
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'test'
                ? 'bg-slate-800 text-white border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Rule Sandbox</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TEACH TAB */}
          {activeTab === 'teach' && (
            <form onSubmit={handleCreateRule} className="space-y-4 max-w-xl mx-auto">
              <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-xl p-3.5 text-xs text-indigo-300">
                Teach the offline chatbot new questions! When the user types any of the trigger words,
                this rule will execute locally and return your customized answer.
              </div>

              {formSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Rule saved to local offline brain successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Trigger Keywords (comma-separated) *
                </label>
                <input
                  type="text"
                  value={triggersInput}
                  onChange={(e) => setTriggersInput(e.target.value)}
                  placeholder="e.g. project deadline, lab exam, my college, syllabus"
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value as ResponseCategory)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
                >
                  <option value="custom">Custom</option>
                  <option value="college">College / Exams</option>
                  <option value="programming">Programming</option>
                  <option value="web">Web Development</option>
                  <option value="ai">AI / ML</option>
                  <option value="tanglish">Tamil / Tanglish</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Offline Response Text *
                </label>
                <textarea
                  rows={4}
                  value={responseInput}
                  onChange={(e) => setResponseInput(e.target.value)}
                  placeholder="Type the exact answer the bot should provide..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Optional Code Snippet
                </label>
                <textarea
                  rows={3}
                  value={codeSnippetInput}
                  onChange={(e) => setCodeSnippetInput(e.target.value)}
                  placeholder="// Optional code snippet to display..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Save Offline Rule</span>
              </button>
            </form>
          )}

          {/* TEST SANDBOX TAB */}
          {activeTab === 'test' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="bg-slate-800/60 rounded-xl p-3 text-xs text-slate-300">
                Test how the offline pattern matcher and fuzzy NLP engine resolve any query in 0ms.
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunTest()}
                  placeholder="Enter sample query (e.g. 'what is ai', 'pythn', 'calc 40*5')..."
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
                />
                <button
                  type="button"
                  onClick={handleRunTest}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Simulate Match
                </button>
              </div>

              {testResult && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-white">Match Result</span>
                    <span>Confidence Score: {(testResult.score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="text-xs text-indigo-400 font-mono">
                    Category: {testResult.category} · Rule ID: {testResult.ruleId || 'fallback'}
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg text-xs text-slate-200 whitespace-pre-wrap">
                    {testResult.reply}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RULES LIST (ALL / CUSTOM) */}
          {(activeTab === 'all' || activeTab === 'custom') && (
            <div className="space-y-3">
              {/* Filter bar & Actions */}
              <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search trigger words..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
                  <button
                    onClick={handleExportJSON}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                    title="Export custom rules to JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                  <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJSON}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Rules Cards */}
              <div className="space-y-2">
                {filteredRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {rule.triggers.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          {rule.category}
                        </span>
                        {rule.isCustom && (
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1 rounded text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete custom rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-3">
                      {rule.response}
                    </div>

                    {rule.codeSnippet && (
                      <div className="p-2 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                        <code>{rule.codeSnippet}</code>
                      </div>
                    )}
                  </div>
                ))}

                {filteredRules.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No rules found matching &quot;{search}&quot;.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Close Brain Rules
          </button>
        </div>
      </div>
    </div>
  );
};
