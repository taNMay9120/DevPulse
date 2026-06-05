import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore, BACKEND_URL } from '../store/authStore.js';
import { useMetricsStore } from '../store/metricsStore.js';
import { DashboardLayout } from './DashboardLayout.js';
import { MetricsOverview } from './MetricsOverview.js';
import { ChartsContainer } from './ChartsContainer.js';
import { InsightsPanel } from './InsightsPanel.js';
import { ActivityFeed } from './ActivityFeed.js';
import { DemoConsole } from './DemoConsole.js';
import { Terminal, Code, Star, ExternalLink, RefreshCw, AlertCircle, FileText, GitFork } from 'lucide-react';

export const Dashboard = () => {
  const { token, isDemo } = useAuthStore();
  const {
    loading,
    insightsLoading,
    error,
    repos,
    commitStats,
    prStats,
    dailyCommits,
    activeHours,
    activityFeed,
    insights,
    issueStats,
    churnStats,
    fetchMetrics,
    fetchInsights,
    regenerateInsights,
    updateFromSocket,
    addActivityFromSocket
  } = useMetricsStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [socketConnected, setSocketConnected] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  // 1. Fetch metrics and insights on mount
  useEffect(() => {
    if (token) {
      fetchMetrics(token);
      fetchInsights(token);
    }
  }, [token]);

  // 2. Setup WebSockets connection
  useEffect(() => {
    if (!token) return;

    console.log('Connecting websocket to backend:', BACKEND_URL);
    const socket = io(BACKEND_URL);
    setSocketInstance(socket);

    socket.on('connect', () => {
      console.log('Websocket connected successfully:', socket.id);
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Websocket disconnected');
      setSocketConnected(false);
    });

    // Handle real-time metrics stream broadcasts
    socket.on('metrics-update', (data) => {
      console.log('Socket metrics-update received:', data);
      updateFromSocket(data);
    });

    // Handle live activity notification pushes
    socket.on('activity-new', (activity) => {
      console.log('Socket activity-new received:', activity);
      addActivityFromSocket(activity);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Handler to emit simulated event via socket
  const handleSimulateEvent = (eventPayload: any) => {
    if (socketInstance && socketConnected) {
      socketInstance.emit('simulation-event', eventPayload);
    } else {
      console.warn('Socket not connected. Cannot emit simulation event.');
    }
  };

  // Aggregate totals
  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const topRepos = [...repos].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));

  if (loading && repos.length === 0) {
    return (
      <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-8 h-8 text-accent animate-spin" />
        <p className="text-sm text-text-secondary font-medium">Aggregating workspace telemetry data...</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      socketConnected={socketConnected}
    >
      {error && (
        <div className="p-4 rounded-xl bg-danger-red/10 border border-danger-red/25 flex gap-3 text-sm text-danger-red items-center">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="m-0 font-semibold">{error}</p>
        </div>
      )}

      {/* Render Active Tab panels */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top greeting banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white m-0">Workspace Efficiency Overview</h2>
              <p className="text-xs text-text-secondary mt-1">Real-time code health charts & developer sprint trackers</p>
            </div>
            {isDemo && (
              <button
                onClick={() => setConsoleOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-warning-amber/10 border border-warning-amber/25 text-warning-amber hover:bg-warning-amber/20 hover:scale-[1.01] active:scale-[0.99] font-bold text-xs transition-all cursor-pointer"
              >
                <Terminal className="w-4 h-4 animate-pulse" />
                Launch Event Console
              </button>
            )}
          </div>

          {/* Cards metrics overview */}
          <MetricsOverview
            commitStats={commitStats}
            prStats={prStats}
            issueStats={issueStats}
            churnStats={churnStats}
            reposCount={repos.length}
            starsCount={totalStars}
          />

          {/* Core Graphs Grid and Activity Feeds */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="xl:col-span-2 space-y-6">
              <ChartsContainer
                dailyCommits={dailyCommits}
                activeHours={activeHours}
                prStats={prStats}
                repos={repos}
                churnStats={churnStats}
              />
              <InsightsPanel
                insights={insights}
                loading={insightsLoading}
                onRegenerate={() => token && regenerateInsights(token)}
              />
            </div>
            
            <div className="xl:col-span-1 h-full">
              <ActivityFeed activities={activityFeed} />
            </div>
          </div>

          {/* Demo Drawer console */}
          {isDemo && (
            <DemoConsole
              repos={repos}
              isOpen={consoleOpen}
              onClose={() => setConsoleOpen(false)}
              onSimulateEvent={handleSimulateEvent}
            />
          )}
        </div>
      )}

      {activeTab === 'repos' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white m-0">Repositories</h2>
            <p className="text-xs text-text-secondary mt-1">List of projects tracked on this account</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topRepos.map((repo) => (
              <div key={repo.name} className="glass-panel glass-panel-hover rounded-xl p-5 flex flex-col justify-between min-h-[160px]">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-base text-white hover:text-accent-hover transition-colors truncate">
                      {repo.name}
                    </h3>
                    {repo.language && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-light text-accent-hover border border-accent/20">
                        {repo.language}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-2 line-clamp-3 leading-relaxed">
                    {repo.description || 'No description provided for this repository.'}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border-card pt-3 mt-4 text-[10px] text-text-secondary font-semibold">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-warning-amber">
                      <Star className="w-3.5 h-3.5 fill-warning-amber/10" />
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1 text-indigo-400">
                      <GitFork className="w-3.5 h-3.5" />
                      {repo.forks_count ?? 0}
                    </span>
                    {repo.open_issues_count !== undefined && repo.open_issues_count > 0 && (
                      <span className="flex items-center gap-1 text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {repo.open_issues_count}
                      </span>
                    )}
                  </div>
                  
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-text-secondary hover:text-white transition-colors"
                  >
                    View
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white m-0">Metrics Deep-Dive</h2>
            <p className="text-xs text-text-secondary mt-1">Numerical overview and raw statistics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Raw Commits log */}
            <div className="glass-panel rounded-xl p-5 md:p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Commit Telemetry Logs
              </h3>
              <div className="border border-border-card rounded-lg overflow-hidden text-xs">
                <div className="grid grid-cols-3 bg-bg-card border-b border-border-card px-4 py-3 font-bold text-white uppercase tracking-wide">
                  <span>Day</span>
                  <span className="text-center">Active Commits</span>
                  <span className="text-right">Velocity Weight</span>
                </div>
                <div className="divide-y divide-border-card font-mono">
                  {dailyCommits.map((d) => (
                    <div key={d.day} className="grid grid-cols-3 px-4 py-2.5">
                      <span className="text-text-primary">{d.day}</span>
                      <span className="text-center text-white font-bold">{d.commits}</span>
                      <span className="text-right text-text-muted">
                        {d.commits > 10 ? 'High Sprint' : d.commits > 2 ? 'Normal' : 'Low Focus'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Languages chart logs */}
            <div className="glass-panel rounded-xl p-5 md:p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4" />
                Language Composition Matrix
              </h3>
              <div className="border border-border-card rounded-lg overflow-hidden text-xs">
                <div className="grid grid-cols-2 bg-bg-card border-b border-border-card px-4 py-3 font-bold text-white uppercase tracking-wide">
                  <span>Language</span>
                  <span className="text-right">Tracked Projects</span>
                </div>
                <div className="divide-y divide-border-card font-mono">
                  {(Object.entries(
                    repos.reduce((acc, r) => {
                      if (r.language) acc[r.language] = (acc[r.language] || 0) + 1;
                      return acc;
                    }, {} as { [key: string]: number })
                  ) as [string, number][])
                    .sort((a, b) => b[1] - a[1])
                    .map(([lang, count]) => (
                      <div key={lang} className="grid grid-cols-2 px-4 py-2.5">
                        <span className="text-text-primary">{lang}</span>
                        <span className="text-right text-white font-bold">{count} repos</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white m-0">AI Coaching & Insights</h2>
            <p className="text-xs text-text-secondary mt-1">Custom coaching strategies based on codebase metrics</p>
          </div>
          
          <div className="max-w-4xl">
            <InsightsPanel
              insights={insights}
              loading={insightsLoading}
              onRegenerate={() => token && regenerateInsights(token)}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
export default Dashboard;
