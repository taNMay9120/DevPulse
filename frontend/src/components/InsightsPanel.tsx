import React from 'react';
import { Sparkles, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';

interface InsightsPanelProps {
  insights: string[];
  loading: boolean;
  onRegenerate: () => void;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  loading,
  onRegenerate
}) => {
  // Simple custom parser to transform "**Key**: Value" into formatted React elements
  const parseMarkdown = (text: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold segment
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Add the bold segment formatted
      parts.push(
        <strong key={match.index} className="text-white font-bold tracking-wide">
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="glass-panel rounded-xl p-5 md:p-6 space-y-6">
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-border-card pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-none">Weekly AI Insights</h3>
            <span className="text-[11px] text-text-secondary mt-1 block">Heuristic suggestions & coaching recommendations</span>
          </div>
        </div>

        <button
          onClick={onRegenerate}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-card hover:border-accent/30 text-xs font-semibold text-text-secondary hover:text-white transition-all bg-bg-card/40 hover:bg-accent/5 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {/* Insights Content List */}
      {loading ? (
        // Glowing loader skeletons
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-5 h-5 rounded-full bg-border-card mt-1 shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-border-card rounded w-1/4"></div>
                <div className="h-3.5 bg-border-card rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-3.5 rounded-lg hover:bg-border-card/10 border border-transparent hover:border-border-card/30 transition-all duration-200"
            >
              <div className="w-6 h-6 rounded-full bg-accent/15 border border-accent/25 text-accent-hover flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono">
                {idx + 1}
              </div>
              <div className="text-sm leading-relaxed text-text-secondary flex-1">
                {parseMarkdown(insight)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
          <AlertCircle className="w-10 h-10 text-text-muted" />
          <p className="text-sm font-semibold text-text-secondary">No Insights Loaded</p>
          <p className="text-xs text-text-muted max-w-xs">
            We haven't run our AI coaching analysis yet. Click the refresh button to trigger.
          </p>
        </div>
      )}

      {/* Call to Action footer */}
      {!loading && insights.length > 0 && (
        <div className="pt-2 border-t border-border-card flex justify-end">
          <a
            href="#metrics"
            className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover transition-colors group"
          >
            Explore Productivity Deep-Dive
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      )}
    </div>
  );
};
