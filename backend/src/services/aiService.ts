import OpenAI from 'openai';
import { CommitStats, PRStats, RepositoryStats } from './githubService.js';
import { db } from './mockDb.js';

interface MetricsPayload {
  commitStats: CommitStats;
  prStats: PRStats;
  repos: RepositoryStats[];
  activeHours: { hour: string; commits: number }[];
  dailyCommits: { day: string; commits: number }[];
}

export const generateInsights = async (metrics: MetricsPayload): Promise<string[]> => {
  const apiKey = process.env.AI_API_KEY;
  const provider = process.env.AI_PROVIDER || 'openai';

  if (!apiKey) {
    console.log('AI API Key not configured. Using rule-based fallback heuristics engine.');
    return generateHeuristicInsights(metrics);
  }

  try {
    if (provider === 'openai') {
      const openai = new OpenAI({ apiKey });
      const prompt = `
        You are a seasoned developer productivity coach. Analyze these GitHub activity metrics:
        - Commits this week: ${metrics.commitStats.commits_this_week} (this month: ${metrics.commitStats.commits_this_month})
        - Pull Requests: Open: ${metrics.prStats.opened}, Merged: ${metrics.prStats.merged}, Closed: ${metrics.prStats.closed}
        - Top Repositories: ${metrics.repos.slice(0, 3).map(r => `${r.name} (${r.language || 'No Lang'})`).join(', ')}
        - Daily Commit Trend: ${metrics.dailyCommits.map(d => `${d.day}:${d.commits}`).join(', ')}
        - Hourly Activity: ${metrics.activeHours.map(h => `${h.hour}:${h.commits}`).join(', ')}

        Generate 4 concise, action-oriented bullet points containing insights or suggestions on how the developer can optimize their workflow, avoid fatigue, address bottlenecks, or leverage their strengths. Use Markdown formatting. Ensure each point is highly specific to the metrics.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        // Parse bullets
        const bullets = content
          .split('\n')
          .map(line => line.replace(/^-\s*/, '').replace(/^\*\s*/, '').trim())
          .filter(line => line.length > 0);
        return bullets;
      }
    }
    
    // Default fallback if OpenAI fails or provider is unrecognized
    return generateHeuristicInsights(metrics);
  } catch (error: any) {
    console.error('Failed to generate AI insights via API:', error.message);
    return generateHeuristicInsights(metrics);
  }
};

const generateHeuristicInsights = (metrics: MetricsPayload): string[] => {
  const insights: string[] = [];
  const weekCommits = metrics.commitStats.commits_this_week;
  const reposCount = metrics.repos.length;
  
  // 1. Commits analysis
  if (weekCommits > 25) {
    insights.push(
      `**High Output Velocity**: You've pushed **${weekCommits} commits** this week! You are in a high-focus build phase. Ensure commit sizes stay small and modular to ease peer reviews.`
    );
  } else if (weekCommits > 5) {
    insights.push(
      `**Steady Flow**: With **${weekCommits} commits** this week, you are keeping a consistent release cadence. Use this steady period to focus on automated test coverage and documentation.`
    );
  } else {
    insights.push(
      `**Focus & Planning Phase**: Low commit volume (**${weekCommits} commits**) suggests a planning, brainstorming, or heavy design cycle. If working on large feature sets, try pushing WIP branches early to sync.`
    );
  }

  // 2. PR ratio analysis
  const openPrs = metrics.prStats.opened;
  const mergedPrs = metrics.prStats.merged;
  if (openPrs > mergedPrs && openPrs > 3) {
    insights.push(
      `**Pull Request Backlog**: You currently have **${openPrs} open PRs** but only **${mergedPrs} merged** this week. Consider hosting a quick review sync to unblock pending reviews and avoid merge conflicts.`
    );
  } else if (mergedPrs > 5) {
    insights.push(
      `**Review Efficiency**: Fantastic work merging **${mergedPrs} pull requests** this week! Keep up this cycle of incremental deployment to reduce lead time for changes.`
    );
  } else {
    insights.push(
      `**Continuous Integration**: Pull request throughput is moderate. Automating your staging builds could help you feel more confident about moving code from review to main branch faster.`
    );
  }

  // 3. Languages / Repos analysis
  const languagesMap = new Map<string, number>();
  metrics.repos.forEach(r => {
    if (r.language) {
      languagesMap.set(r.language, (languagesMap.get(r.language) || 0) + 1);
    }
  });

  let topLanguage = 'TypeScript';
  let topCount = 0;
  languagesMap.forEach((count, lang) => {
    if (count > topCount) {
      topCount = count;
      topLanguage = lang;
    }
  });

  if (topCount > 0) {
    insights.push(
      `**Stack Specialization**: **${topLanguage}** is your primary technology choice, representing ${Math.round((topCount / (reposCount || 1)) * 100)}% of your active projects. Establishing shared lint/format settings for ${topLanguage} will reduce project boot times.`
    );
  } else {
    insights.push(
      `**Polyglot Exploration**: You are spreading your focus across multiple development environments. Be mindful of context-switching costs when changing repositories.`
    );
  }

  // 4. Time analysis
  // Find peak hour
  let peakHour = '16:00';
  let maxCommits = 0;
  metrics.activeHours.forEach(h => {
    if (h.commits > maxCommits) {
      maxCommits = h.commits;
      peakHour = h.hour;
    }
  });

  const peakHourNum = parseInt(peakHour.split(':')[0]);
  if (peakHourNum >= 20 || peakHourNum <= 4) {
    insights.push(
      `**After-Hours Coding Peak**: A significant coding burst occurs around **${peakHour}** (late night). Make sure you schedule automated CI runs for these late builds, and schedule fresh-eyes reviews before merge.`
    );
  } else if (peakHourNum >= 12 && peakHourNum <= 15) {
    insights.push(
      `**Midday Sprint Pattern**: Your primary focus peak is around **${peakHour}**. Safeguard this time slot in your calendar by snoozing chat notifications to allow for uninterrupted flow.`
    );
  } else {
    insights.push(
      `**Standard Workspace Flow**: Commit timings show steady activity during regular hours around **${peakHour}**. This healthy boundaries schedule helps maintain long-term productivity.`
    );
  }

  return insights;
};
