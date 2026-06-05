import React, { useState } from 'react';
import { Terminal, X, Play, GitPullRequest, AlertCircle, Sparkles } from 'lucide-react';

interface DemoConsoleProps {
  repos: { name: string }[];
  isOpen: boolean;
  onClose: () => void;
  onSimulateEvent: (event: {
    type: 'commit' | 'pr_open' | 'pr_merge' | 'issue_open' | 'issue_resolve';
    repo: string;
    message: string;
    meta?: any;
  }) => void;
}

export const DemoConsole: React.FC<DemoConsoleProps> = ({
  repos,
  isOpen,
  onClose,
  onSimulateEvent
}) => {
  const [activeTab, setActiveTab] = useState<'commit' | 'pr' | 'issue'>('commit');
  const [selectedRepo, setSelectedRepo] = useState(repos[0]?.name || 'pulse-dashboard');
  
  // Form states
  const [commitMsg, setCommitMsg] = useState('feat: optimize charts rendering layers');
  const [additions, setAdditions] = useState(42);
  const [deletions, setDeletions] = useState(12);
  
  const [prTitle, setPRTitle] = useState('feat: add custom web sockets handler');
  const [issueTitle, setIssueTitle] = useState('fix: mobile navigation scroll lag');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'commit') {
      onSimulateEvent({
        type: 'commit',
        repo: selectedRepo,
        message: commitMsg,
        meta: { additions, deletions }
      });
      // Set random next commit message
      const commitMessages = [
        'fix: resolve race condition in websocket initialization',
        'docs: update API endpoints definitions guide',
        'refactor: extract metrics calculations to services helper',
        'test: write integration specs for OAuth exchanges',
        'style: adjust padding on dashboard charts grids'
      ];
      setCommitMsg(commitMessages[Math.floor(Math.random() * commitMessages.length)]);
    }
  };

  const handlePrAction = (action: 'pr_open' | 'pr_merge') => {
    onSimulateEvent({
      type: action,
      repo: selectedRepo,
      message: action === 'pr_open' ? prTitle : `Merged PR: ${prTitle}`,
    });
    // Set random next PR title
    if (action === 'pr_open') {
      const prTitles = [
        'refactor: update Tailwind CSS compilation config',
        'feat: implement Gemini insights analysis adapter',
        'fix: correct charts responsiveness on iPad landscape screen',
        'feat: add customizable developer alerts settings'
      ];
      setPRTitle(prTitles[Math.floor(Math.random() * prTitles.length)]);
    }
  };

  const handleIssueAction = (action: 'issue_open' | 'issue_resolve') => {
    onSimulateEvent({
      type: action,
      repo: selectedRepo,
      message: action === 'issue_open' ? issueTitle : `Resolved Issue: ${issueTitle}`,
    });
    // Set random next Issue title
    if (action === 'issue_open') {
      const issueTitles = [
        'bug: charts tooltip clip-path overflows container',
        'fix: token auth verification redirect loop',
        'bug: socket connection drops on tab freeze'
      ];
      setIssueTitle(issueTitles[Math.floor(Math.random() * issueTitles.length)]);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-bg-card/95 border-l border-border-card shadow-2xl backdrop-blur-md z-50 flex flex-col justify-between animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-border-card flex items-center justify-between">
        <div className="flex items-center gap-2 text-warning-amber">
          <Terminal className="w-5 h-5 animate-pulse" />
          <h3 className="font-bold text-sm text-white uppercase tracking-wider m-0">Demo Event Console</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-text-secondary hover:text-white hover:bg-border-card transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs selector */}
      <div className="flex border-b border-border-card bg-bg-main/40 text-xs font-semibold">
        {(['commit', 'pr', 'issue'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-center border-b-2 capitalize transition-all ${
              activeTab === tab
                ? 'border-accent text-white bg-accent/5'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-card'
            }`}
          >
            {tab === 'pr' ? 'Pull Request' : tab === 'issue' ? 'Issue' : tab}
          </button>
        ))}
      </div>

      {/* Inputs block */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Repo Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">Target Repository</label>
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="w-full bg-bg-main border border-border-card rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
          >
            {repos.map((repo) => (
              <option key={repo.name} value={repo.name}>
                {repo.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tab contents */}
        {activeTab === 'commit' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">Commit Message</label>
              <textarea
                value={commitMsg}
                onChange={(e) => setCommitMsg(e.target.value)}
                rows={2}
                className="w-full bg-bg-main border border-border-card rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">Additions (+)</label>
                <input
                  type="number"
                  value={additions}
                  onChange={(e) => setAdditions(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-bg-main border border-border-card rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">Deletions (-)</label>
                <input
                  type="number"
                  value={deletions}
                  onChange={(e) => setDeletions(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-bg-main border border-border-card rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors cursor-pointer mt-4"
            >
              <Play className="w-4 h-4" /> Simulate Commit
            </button>
          </form>
        )}

        {activeTab === 'pr' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">PR Title</label>
              <input
                type="text"
                value={prTitle}
                onChange={(e) => setPRTitle(e.target.value)}
                className="w-full bg-bg-main border border-border-card rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handlePrAction('pr_open')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-warning-amber text-warning-amber hover:bg-warning-amber/5 font-semibold text-sm transition-all cursor-pointer"
              >
                <GitPullRequest className="w-4 h-4" /> Open Pull Request
              </button>
              <button
                onClick={() => handlePrAction('pr_merge')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-success-green hover:bg-success-green/90 text-white font-semibold text-sm transition-all cursor-pointer"
              >
                <Play className="w-4 h-4" /> Merge Pull Request
              </button>
            </div>
          </div>
        )}

        {activeTab === 'issue' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">Issue Title</label>
              <input
                type="text"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                className="w-full bg-bg-main border border-border-card rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleIssueAction('issue_open')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-rose-500 text-rose-500 hover:bg-rose-500/5 font-semibold text-sm transition-all cursor-pointer"
              >
                <AlertCircle className="w-4 h-4" /> Open Issue
              </button>
              <button
                onClick={() => handleIssueAction('issue_resolve')}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold text-sm transition-all cursor-pointer"
              >
                <Play className="w-4 h-4" /> Close / Resolve Issue
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Simulation tips footer */}
      <div className="p-4 border-t border-border-card bg-bg-main/50 text-[11px] text-text-secondary leading-relaxed">
        <span className="font-semibold text-white flex items-center gap-1 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-warning-amber" />
          Interactive Stream
        </span>
        All simulated actions are sent via WebSocket to the server, recalculated into aggregate metric payloads, and broadcast back to the frontend instantly.
      </div>
    </div>
  );
};
