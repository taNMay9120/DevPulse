import React from 'react';
import { useAuthStore } from '../store/authStore.js';
import { LayoutDashboard, Code2, LineChart, Sparkles, LogOut, Terminal, CheckCircle2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  socketConnected: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  socketConnected
}) => {
  const { user, logout, isDemo } = useAuthStore();

  const navigationItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'repos', label: 'Repositories', icon: Code2 },
    { id: 'metrics', label: 'Metrics Deep-Dive', icon: LineChart },
    { id: 'insights', label: 'AI Insights', icon: Sparkles }
  ];

  return (
    <div className="flex min-h-screen bg-bg-main text-text-primary">
      {/* Sidebar */}
      <aside className="w-64 h-screen sticky top-0 border-r border-border-card bg-bg-card/50 backdrop-blur-md flex flex-col justify-between hidden md:flex overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {/* Logo */}
          <div className="p-6 border-b border-border-card flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent to-accent-hover flex items-center justify-center font-bold text-lg text-white">
              D
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white m-0 leading-none">DevPulse</h1>
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest">AI Productivity</span>
            </div>
          </div>
 
          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                   key={item.id}
                   onClick={() => setActiveTab(item.id)}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                       ? 'bg-accent/15 text-accent-hover border border-accent/30'
                       : 'text-text-secondary hover:bg-border-card/30 hover:text-text-primary border border-transparent'
                   }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
 
        {/* User profile details & connection status */}
        <div className="p-4 border-t border-border-card bg-bg-main/30 space-y-4 shrink-0">
          {user && (
            <div className="flex items-center gap-3 px-2">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-10 h-10 rounded-full border-2 border-accent/40"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-white leading-tight">{user.name || user.login}</p>
                <p className="text-xs text-text-secondary truncate">@{user.login}</p>
              </div>
            </div>
          )}

          {/* Live Status indicator */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs px-2">
              <span className="text-text-muted">WebSocket:</span>
              <span className="flex items-center gap-1.5 font-medium">
                {socketConnected ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-success-green animate-pulse"></span>
                    <span className="text-success-green">Connected</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-danger-red"></span>
                    <span className="text-danger-red">Disconnected</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs px-2">
              <span className="text-text-muted">Engine:</span>
              <span className="font-semibold text-white">
                {isDemo ? (
                  <span className="text-warning-amber flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5" /> Demo Mode
                  </span>
                ) : (
                  <span className="text-accent-hover flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Live Mode
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border-card hover:border-danger-red/40 text-text-secondary hover:text-danger-red text-xs font-semibold transition-all bg-bg-card/40 hover:bg-danger-red/5 mt-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden border-b border-border-card bg-bg-card px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center font-bold text-white text-sm">
              D
            </div>
            <h1 className="text-lg font-bold text-white">DevPulse</h1>
          </div>
          <button
            onClick={logout}
            className="p-2 text-text-secondary hover:text-danger-red rounded-lg border border-border-card"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Tab content rendering */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
