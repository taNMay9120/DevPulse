import React from 'react';
import { GitCommit, GitPullRequest, GitFork, Star } from 'lucide-react';

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
  reposCount: number;
  starsCount: number;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  commitStats,
  prStats,
  reposCount,
  starsCount
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {/* Commits Card */}
      <div className="glass-panel glass-panel-hover rounded-xl p-5 md:p-6 flex items-start gap-4">
        <div className="p-3.5 rounded-lg bg-accent/10 border border-accent/20 text-accent">
          <GitCommit className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Commits This Week</p>
          <p className="text-3xl font-bold text-white mt-1 mb-2 font-mono">
            {commitStats?.commits_this_week ?? 0}
          </p>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>This Month:</span>
            <span className="font-semibold text-text-primary font-mono">{commitStats?.commits_this_month ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Pull Requests Card */}
      <div className="glass-panel glass-panel-hover rounded-xl p-5 md:p-6 flex items-start gap-4">
        <div className="p-3.5 rounded-lg bg-success-green/10 border border-success-green/20 text-success-green">
          <GitPullRequest className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Pull Requests</p>
          <div className="flex items-baseline gap-2 mt-1 mb-2">
            <span className="text-3xl font-bold text-white font-mono">{prStats?.merged ?? 0}</span>
            <span className="text-xs text-text-secondary">Merged</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary pt-0.5">
            <div className="flex justify-between border-r border-border-card pr-2">
              <span>Open:</span>
              <span className="font-semibold text-warning-amber font-mono">{prStats?.opened ?? 0}</span>
            </div>
            <div className="flex justify-between pl-1">
              <span>Closed:</span>
              <span className="font-semibold text-danger-red font-mono">{prStats?.closed ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Repositories Card */}
      <div className="glass-panel glass-panel-hover rounded-xl p-5 md:p-6 flex items-start gap-4">
        <div className="p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <GitFork className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Active Repositories</p>
          <p className="text-3xl font-bold text-white mt-1 mb-2 font-mono">
            {reposCount}
          </p>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Linked Workspaces:</span>
            <span className="font-semibold text-text-primary">GitHub Profile</span>
          </div>
        </div>
      </div>

      {/* Stars/Impact Card */}
      <div className="glass-panel glass-panel-hover rounded-xl p-5 md:p-6 flex items-start gap-4">
        <div className="p-3.5 rounded-lg bg-warning-amber/10 border border-warning-amber/20 text-warning-amber">
          <Star className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Project Stars</p>
          <p className="text-3xl font-bold text-white mt-1 mb-2 font-mono">
            {starsCount}
          </p>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Engagement:</span>
            <span className="font-semibold text-success-green">High Growth</span>
          </div>
        </div>
      </div>
    </div>
  );
};
