import { describe, it, expect } from 'vitest';
import { generateInsights } from './aiService.js';

describe('AI Heuristics Service', () => {
  it('should generate deterministic fallback insights when API key is missing', async () => {
    const mockMetrics = {
      commitStats: {
        total_commits: 120,
        commits_this_week: 32,
        commits_this_month: 80
      },
      prStats: {
        opened: 5,
        merged: 12,
        closed: 2
      },
      repos: [
        { name: 'test-repo-1', url: 'http://test1.com', description: null, stargazers_count: 10, language: 'TypeScript' },
        { name: 'test-repo-2', url: 'http://test2.com', description: null, stargazers_count: 5, language: 'TypeScript' }
      ],
      dailyCommits: [
        { day: 'Mon', commits: 5 },
        { day: 'Tue', commits: 8 }
      ],
      activeHours: [
        { hour: '14:00', commits: 15 },
        { hour: '10:00', commits: 5 }
      ]
    };

    // Ensure environment key is unset for this test run
    const originalApiKey = process.env.AI_API_KEY;
    delete process.env.AI_API_KEY;

    try {
      const insights = await generateInsights(mockMetrics);
      
      expect(insights).toBeInstanceOf(Array);
      expect(insights.length).toBe(4);
      
      // The first insight should highlight high commit velocity (>25 commits)
      expect(insights[0]).toContain('High Output Velocity');
      
      // The second insight should highlight pull request throughput
      expect(insights[1]).toContain('Review Efficiency');

      // The third insight should note TypeScript stack specialization
      expect(insights[2]).toContain('Stack Specialization');
      expect(insights[2]).toContain('TypeScript');

      // The fourth insight should check hourly active times
      expect(insights[3]).toContain('Midday Sprint Pattern');
    } finally {
      process.env.AI_API_KEY = originalApiKey;
    }
  });
});
