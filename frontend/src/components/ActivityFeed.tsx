import React from 'react';
import { GitCommit, GitPullRequest, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface ActivityLog {
  id: string;
  type: 'commit' | 'pr_open' | 'pr_merge' | 'issue_open' | 'issue_resolve';
  repo: string;
  user: string;
  message: string;
  timestamp: string;
  meta?: {
    additions?: number;
    deletions?: number;
    prNumber?: number;
    issueNumber?: number;
  };
}

interface ActivityFeedProps {
  activities: ActivityLog[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      // Format as "3m ago", "1h ago", or "2:30 PM"
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getActivityConfig = (type: string) => {
    switch (type) {
      case 'commit':
        return {
          icon: GitCommit,
          iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
          label: 'Code Commit'
        };
      case 'pr_open':
        return {
          icon: GitPullRequest,
          iconColor: 'text-warning-amber bg-warning-amber/10 border-warning-amber/20',
          label: 'PR Opened'
        };
      case 'pr_merge':
        return {
          icon: CheckCircle2,
          iconColor: 'text-success-green bg-success-green/10 border-success-green/20',
          label: 'PR Merged'
        };
      case 'issue_open':
        return {
          icon: AlertCircle,
          iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
          label: 'Issue Opened'
        };
      case 'issue_resolve':
        return {
          icon: CheckCircle2,
          iconColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
          label: 'Issue Resolved'
        };
      default:
        return {
          icon: HelpCircle,
          iconColor: 'text-text-muted bg-border-card border-border-card',
          label: 'Activity'
        };
    }
  };

  return (
    <div className="glass-panel rounded-xl p-5 md:p-6 space-y-4 flex flex-col h-full">
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Activity Feed</h3>
        <p className="text-xs text-text-secondary">Simulated real-time GitHub event stream</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[360px] lg:max-h-none">
        {activities.length > 0 ? (
          activities.map((activity) => {
            const config = getActivityConfig(activity.type);
            const Icon = config.icon;
            
            return (
              <div
                key={activity.id}
                className="flex gap-3.5 p-3 rounded-lg bg-bg-card/40 border border-border-card/40 hover:border-border-card transition-all duration-200 animate-slide-in-right"
              >
                {/* Event Icon Badge */}
                <div className={`p-2 rounded-lg shrink-0 border ${config.iconColor} h-10 w-10 flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Event Message */}
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-xs font-semibold text-text-primary truncate">
                      {activity.repo} <span className="text-text-muted font-normal">by @{activity.user}</span>
                    </p>
                    <span className="text-[10px] text-text-muted font-mono shrink-0 pt-0.5">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-white mt-1 line-clamp-1">
                    {activity.message}
                  </p>

                  {/* Additions/Deletions tags */}
                  {activity.type === 'commit' && activity.meta && (
                    <div className="flex gap-2.5 items-center mt-1.5 text-[10px] font-mono font-bold">
                      <span className="text-success-green">+{activity.meta.additions} additions</span>
                      <span className="text-danger-red">-{activity.meta.deletions} deletions</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-2 h-full">
            <p className="text-xs text-text-muted">No activity logged yet</p>
            <p className="text-[10px] text-text-muted max-w-xs">
              Simulate events using the control panel to see them flow into this live feed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
