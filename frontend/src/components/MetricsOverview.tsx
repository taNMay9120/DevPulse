import React from 'react';
import { GitCommit, GitPullRequest, GitFork, Star, AlertCircle, Activity } from 'lucide-react';

interface MetricsOverviewProps {
  commitStats: {
    total_commits: number;
    commits_this_week: number;
    commits_this_month: number;
  } | null;
  prStats: {
    opened: number;
    merged: number;
    closed: number;
  } | null;
  issueStats: {
    open: number;
    closed: number;
  } | null;
  churnStats: {
    additions: number;
    deletions: number;
  } | null;
  reposCount: number;
  starsCount: number;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  commitStats,
  prStats,
  issueStats,
  churnStats,
  reposCount,
  starsCount
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
      {/* Commits Card */}
      <div className="glass-panel glass-panel-hover rounded-xl p-4 md:p-5 flex items-start gap-3.5">
        <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent">
          <GitCommit className="w-5.5 h-5.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider truncate">Commits / Wk</p>
          <p className="text-2xl font-black text-white mt-1 mb-1.5 font-mono">
            {commitStats?.commits_this_week ?? 0}
          </p>
          <div className="flex items-center justify-between text-[10px] text-text-secondary">
            <span>This Month:</span>
            <span className="font-bold text-text-primary font-mono">{commitStats?.commits_this_month ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Pull Requests Card */}
      <div className="glass-panel glass-panel-hover rounded-xl p-4 md:p-5 flex items-start gap-3.5">
        <div className="p-2.5 rounded-lg bg-success-green/10 border border-success-green/20 text-success-green">
          <GitPullRequest className="w-5.5 h-5.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider truncate">PRs Merged</p>
          <p className="text-2xl font-black text-white mt-1 mb-1.5 font-mono">
            {prStats?.merged ?? 0}
          </p>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-text-secondary">
            <div className="border-r border-border-card pr-1 flex justify-between">
              <span>Open:</span>
              <span className="font-bold text-warning-amber font-mono">{prStats?.opened ?? 0}</span>
            </div>
            <div className="pl-0.5 flex justify-between">
              <span>Closed:</span>
              <span className="font-bold text-danger-red font-mono">{prStats?.closed ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Issues Card */}
      <div className="glass-panel glass-panel-hover rounded-xl p-4 md:p-5 flex items-start gap-3.5">
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <AlertCircle className="w-5.5 h-5.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider truncate">Open Issues</p>
          <p className="text-2xl font-black text-white mt-1 mb-1.5 font-mono">
            {issueStats?.open ?? 0}
          </p>
          <div className="flex items-center justify-between text-[10px] text-text-secondary">
            <span>Resolved:</span>
            <span className="font-bold text-success-green font-mono">{issueStats?.closed ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Code Churn Card */}
      <div className="glass-panel glass-panel-hover rounded-xl p-4 md:p-5 flex items-start gap-3.5">
        <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Activity className="w-5.5 h-5.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider truncate">Lines Added</p>
          <p className="text-2xl font-black text-white mt-1 mb-1.5 font-mono text-success-green">
            +{churnStats?.additions ?? 0}
          </p>
          <div className="flex items-center justify-between text-[10px] text-text-secondary">
            <span>Deleted:</span>
            <span className="font-bold text-danger-red font-mono">-{churnStats?.deletions ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Repositories Card */}
      <div className="glass-panel glass-panel-hover rounded-xl p-4 md:p-5 flex items-start gap-3.5">
        <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <GitFork className="w-5.5 h-5.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider truncate">Repositories</p>
          <p className="text-2xl font-black text-white mt-1 mb-1.5 font-mono">
            {reposCount}
          </p>
          <div className="flex items-center justify-between text-[10px] text-text-secondary">
            <span>Linked:</span>
            <span className="font-bold text-text-primary">Profile</span>
          </div>
        </div>
      </div>

      {/* Stars/Impact Card */}
      <div className="glass-panel glass-panel-hover rounded-xl p-4 md:p-5 flex items-start gap-3.5">
        <div className="p-2.5 rounded-lg bg-warning-amber/10 border border-warning-amber/20 text-warning-amber">
          <Star className="w-5.5 h-5.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider truncate">Total Stars</p>
          <p className="text-2xl font-black text-white mt-1 mb-1.5 font-mono">
            {starsCount}
          </p>
          <div className="flex items-center justify-between text-[10px] text-text-secondary">
            <span>Growth:</span>
            <span className="font-bold text-success-green">Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
