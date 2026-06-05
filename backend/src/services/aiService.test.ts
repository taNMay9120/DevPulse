import { describe, it, expect, vi } from 'vitest';
import { generateInsights } from './aiService.js';
import axios from 'axios';

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

  describe('Gemini API Integration', () => {
    it('should generate insights using Gemini API when AI_PROVIDER is gemini and API key is present', async () => {
      const mockMetrics = {
        commitStats: { total_commits: 120, commits_this_week: 32, commits_this_month: 80 },
        prStats: { opened: 5, merged: 12, closed: 2 },
        repos: [{ name: 'test-repo-1', url: 'http://test1.com', description: null, stargazers_count: 10, language: 'TypeScript' }],
        dailyCommits: [{ day: 'Mon', commits: 5 }],
        activeHours: [{ hour: '14:00', commits: 15 }]
      };

      const originalApiKey = process.env.AI_API_KEY;
      const originalProvider = process.env.AI_PROVIDER;
      
      process.env.AI_API_KEY = 'test-gemini-key';
      process.env.AI_PROVIDER = 'gemini';

      const axiosSpy = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: {
          candidates: [
            {
              content: {
                parts: [
                  { text: '* Focus on testing\n* Modular commits\n* PR backlog review\n* Time management' }
                ]
              }
            }
          ]
        }
      });

      try {
        const insights = await generateInsights(mockMetrics);
        
        expect(axiosSpy).toHaveBeenCalledWith(
          expect.stringContaining('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=test-gemini-key'),
          expect.objectContaining({
            contents: expect.any(Array)
          })
        );
        expect(insights).toEqual([
          'Focus on testing',
          'Modular commits',
          'PR backlog review',
          'Time management'
        ]);
      } finally {
        axiosSpy.mockRestore();
        process.env.AI_API_KEY = originalApiKey;
        process.env.AI_PROVIDER = originalProvider;
      }
    });

    it('should fallback to heuristics if Gemini API call fails', async () => {
      const mockMetrics = {
        commitStats: { total_commits: 120, commits_this_week: 32, commits_this_month: 80 },
        prStats: { opened: 5, merged: 12, closed: 2 },
        repos: [{ name: 'test-repo-1', url: 'http://test1.com', description: null, stargazers_count: 10, language: 'TypeScript' }],
        dailyCommits: [{ day: 'Mon', commits: 5 }],
        activeHours: [{ hour: '14:00', commits: 15 }]
      };

      const originalApiKey = process.env.AI_API_KEY;
      const originalProvider = process.env.AI_PROVIDER;
      
      process.env.AI_API_KEY = 'test-gemini-key';
      process.env.AI_PROVIDER = 'gemini';

      const axiosSpy = vi.spyOn(axios, 'post').mockRejectedValueOnce(new Error('API Error'));

      try {
        const insights = await generateInsights(mockMetrics);
        
        expect(insights).toBeInstanceOf(Array);
        expect(insights.length).toBe(4);
        expect(insights[0]).toContain('High Output Velocity');
      } finally {
        axiosSpy.mockRestore();
        process.env.AI_API_KEY = originalApiKey;
        process.env.AI_PROVIDER = originalProvider;
      }
    });
  });
});
