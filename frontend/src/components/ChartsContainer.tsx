import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';

interface DailyCommit {
  day: string;
  commits: number;
}

interface ActiveHour {
  hour: string;
  commits: number;
}

interface PRStats {
  opened: number;
  merged: number;
  closed: number;
}

interface Repository {
  name: string;
  language: string | null;
}

interface ChartsContainerProps {
  dailyCommits: DailyCommit[];
  activeHours: ActiveHour[];
  prStats: PRStats | null;
  repos: Repository[];
}

export const ChartsContainer: React.FC<ChartsContainerProps> = ({
  dailyCommits,
  activeHours,
  prStats,
  repos
}) => {
  // 1. Process Language Distribution
  const languageCounts: { [key: string]: number } = {};
  repos.forEach((repo) => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  });

  const languageData = Object.entries(languageCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // top 5 languages

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

  // 2. Process PR Stats for bar display
  const prData = prStats
    ? [
        { name: 'Opened', count: prStats.opened, fill: '#f59e0b' },
        { name: 'Merged', count: prStats.merged, fill: '#10b981' },
        { name: 'Closed', count: prStats.closed, fill: '#ef4444' }
      ]
    : [];

  // Custom tooltips matching dashboard glass theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-card/95 border border-border-card px-3 py-2 rounded-lg shadow-xl backdrop-blur-md text-xs font-medium">
          <p className="text-text-secondary m-0">{label}</p>
          <p className="text-white font-mono mt-1 mb-0 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
            {payload[0].name}: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Commit Frequency Card */}
      <div className="glass-panel rounded-xl p-5 md:p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Commit Velocity</h3>
          <p className="text-xs text-text-secondary">Total commit counts across the last 7 days</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyCommits} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2a3c" vertical={false} />
              <XAxis dataKey="day" stroke="#6b7280" tickLine={false} style={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <YAxis stroke="#6b7280" tickLine={false} axisLine={false} style={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="commits" name="Commits" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCommits)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Language Composition Card */}
      <div className="glass-panel rounded-xl p-5 md:p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Language Distribution</h3>
          <p className="text-xs text-text-secondary">Codebase language frequency breakdown</p>
        </div>
        <div className="h-64 flex items-center justify-center">
          {languageData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {languageData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#131a26" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-bg-card/95 border border-border-card px-3 py-2 rounded-lg shadow-xl backdrop-blur-md text-xs font-medium">
                          <p className="text-white font-mono m-0 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: payload[0].payload.fill }}></span>
                            {payload[0].name}: <span className="font-bold">{payload[0].value} repositories</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-text-secondary">No repository languages found</p>
          )}
        </div>
      </div>

      {/* Active Hours Distribution */}
      <div className="glass-panel rounded-xl p-5 md:p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Hours</h3>
          <p className="text-xs text-text-secondary">Hourly commit distribution over active cycles</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2a3c" vertical={false} />
              <XAxis dataKey="hour" stroke="#6b7280" tickLine={false} style={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <YAxis stroke="#6b7280" tickLine={false} axisLine={false} style={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="commits" name="Commits" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PR Status Breakdown */}
      <div className="glass-panel rounded-xl p-5 md:p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">PR Pipeline</h3>
          <p className="text-xs text-text-secondary">Distribution of opened, merged, and closed PRs</p>
        </div>
        <div className="h-64">
          {prData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2a3c" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" tickLine={false} style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" tickLine={false} axisLine={false} style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-bg-card/95 border border-border-card px-3 py-2 rounded-lg shadow-xl backdrop-blur-md text-xs font-medium">
                          <p className="text-white font-mono m-0 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: payload[0].payload.fill }}></span>
                            {payload[0].name}: <span className="font-bold">{payload[0].value} PRs</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {prData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-text-secondary">No pull requests details available</p>
          )}
        </div>
      </div>
    </div>
  );
};
