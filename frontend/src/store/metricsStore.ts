import { create } from 'zustand';
import axios from 'axios';
import { BACKEND_URL } from './authStore.js';

interface MetricsStore {
  loading: boolean;
  insightsLoading: boolean;
  error: string | null;
  repos: any[];
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
  dailyCommits: { day: string; commits: number }[];
  activeHours: { hour: string; commits: number }[];
  activityFeed: any[];
  insights: string[];
  
  fetchMetrics: (token: string) => Promise<void>;
  fetchInsights: (token: string) => Promise<void>;
  regenerateInsights: (token: string) => Promise<void>;
  updateFromSocket: (data: any) => void;
  addActivityFromSocket: (activity: any) => void;
}

export const useMetricsStore = create<MetricsStore>((set, get) => ({
  loading: false,
  insightsLoading: false,
  error: null,
  repos: [],
  commitStats: null,
  prStats: null,
  dailyCommits: [],
  activeHours: [],
  activityFeed: [],
  insights: [],

  fetchMetrics: async (token: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${BACKEND_URL}/api/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { repos, commitStats, prStats, dailyCommits, activeHours, activityFeed } = response.data;
      set({
        repos,
        commitStats,
        prStats,
        dailyCommits,
        activeHours,
        activityFeed,
        loading: false
      });
    } catch (err: any) {
      console.error('Fetch metrics error:', err);
      set({
        error: err.response?.data?.error || 'Failed to fetch dashboard metrics',
        loading: false
      });
    }
  },

  fetchInsights: async (token: string) => {
    set({ insightsLoading: true });
    try {
      // Just check if we can fetch insights. If none are generated yet, we fetch them.
      // We will make a POST to /api/ai/insights which returns current or new ones.
      const response = await axios.post(`${BACKEND_URL}/api/ai/insights`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({
        insights: response.data.insights || [],
        insightsLoading: false
      });
    } catch (err: any) {
      console.error('Fetch insights error:', err);
      set({ insightsLoading: false });
    }
  },

  regenerateInsights: async (token: string) => {
    set({ insightsLoading: true });
    try {
      const response = await axios.post(`${BACKEND_URL}/api/ai/insights`, { forceRegenerate: true }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({
        insights: response.data.insights || [],
        insightsLoading: false
      });
    } catch (err: any) {
      console.error('Regenerate insights error:', err);
      set({ insightsLoading: false });
      throw err;
    }
  },

  updateFromSocket: (data: any) => {
    set({
      commitStats: data.commitStats ?? get().commitStats,
      prStats: data.prStats ?? get().prStats,
      dailyCommits: data.dailyCommits ?? get().dailyCommits,
      activeHours: data.activeHours ?? get().activeHours,
      repos: data.repos ?? get().repos,
      activityFeed: data.activityFeed ?? get().activityFeed
    });
  },

  addActivityFromSocket: (activity: any) => {
    const feed = [activity, ...get().activityFeed];
    // Cap feed at 50
    if (feed.length > 50) {
      feed.pop();
    }
    set({ activityFeed: feed });
  }
}));
