import { RepositoryStats, CommitStats, PRStats } from './githubService.js';

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

export interface ChartData {
  day: string;
  commits: number;
}

export interface ActiveHourData {
  hour: string;
  commits: number;
}

export class MockDatabase {
  private user: any = null;
  private repos: RepositoryStats[] = [];
  private commits: CommitStats = { total_commits: 0, commits_this_week: 0, commits_this_month: 0 };
  private prs: PRStats = { opened: 0, merged: 0, closed: 0 };
  private activityFeed: ActivityLog[] = [];
  private dailyCommits: ChartData[] = [];
  private activeHours: ActiveHourData[] = [];
  private insights: string[] = [];

  constructor() {
    this.resetDemoData();
  }

  public getUser() {
    return this.user;
  }

  public setUser(user: any) {
    this.user = user;
  }

  public getRepos() {
    return this.repos;
  }

  public getCommitStats() {
    return this.commits;
  }

  public getPRStats() {
    return this.prs;
  }

  public getActivityFeed() {
    return this.activityFeed;
  }

  public getDailyCommits() {
    return this.dailyCommits;
  }

  public getActiveHours() {
    return this.activeHours;
  }

  public getInsights() {
    return this.insights;
  }

  public setInsights(insights: string[]) {
    this.insights = insights;
  }

  public addCommit(repoName: string, additions: number, deletions: number, message: string) {
    // Increment stats
    this.commits.total_commits += 1;
    this.commits.commits_this_week += 1;
    this.commits.commits_this_month += 1;

    // Increment commits count on specific repo
    const repo = this.repos.find(r => r.name === repoName);
    if (repo) {
      repo.commits_count = (repo.commits_count || 0) + 1;
    }

    // Update daily commit chart (today's count)
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const dayData = this.dailyCommits.find(d => d.day === todayStr);
    if (dayData) {
      dayData.commits += 1;
    } else {
      this.dailyCommits.push({ day: todayStr, commits: 1 });
    }

    // Update active hours (current hour)
    const currentHourStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', hour12: false });
    const hourData = this.activeHours.find(h => h.hour === `${currentHourStr}:00`);
    if (hourData) {
      hourData.commits += 1;
    } else {
      this.activeHours.push({ hour: `${currentHourStr}:00`, commits: 1 });
    }
    this.activeHours.sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

    // Add activity
    const activity: ActivityLog = {
      id: `act_${Math.random().toString(36).substring(2, 11)}`,
      type: 'commit',
      repo: repoName,
      user: this.user?.login || 'demo-coder',
      message: message,
      timestamp: new Date().toISOString(),
      meta: { additions, deletions }
    };
    this.activityFeed.unshift(activity);
    
    // Cap activity feed at 50
    if (this.activityFeed.length > 50) {
      this.activityFeed.pop();
    }

    return { commitStats: this.commits, dailyCommits: this.dailyCommits, activeHours: this.activeHours, activity };
  }

  public openPR(repoName: string, title: string) {
    this.prs.opened += 1;

    const prNumber = Math.floor(Math.random() * 1000) + 1;
    const activity: ActivityLog = {
      id: `act_${Math.random().toString(36).substring(2, 11)}`,
      type: 'pr_open',
      repo: repoName,
      user: this.user?.login || 'demo-coder',
      message: `Opened PR #${prNumber}: ${title}`,
      timestamp: new Date().toISOString(),
      meta: { prNumber }
    };
    this.activityFeed.unshift(activity);

    return { prStats: this.prs, activity };
  }

  public mergePR(repoName: string, title: string) {
    if (this.prs.opened > 0) {
      this.prs.opened -= 1;
    }
    this.prs.merged += 1;

    const prNumber = Math.floor(Math.random() * 1000) + 1;
    const activity: ActivityLog = {
      id: `act_${Math.random().toString(36).substring(2, 11)}`,
      type: 'pr_merge',
      repo: repoName,
      user: this.user?.login || 'demo-coder',
      message: `Merged PR #${prNumber}: ${title}`,
      timestamp: new Date().toISOString(),
      meta: { prNumber }
    };
    this.activityFeed.unshift(activity);

    return { prStats: this.prs, activity };
  }

  public openIssue(repoName: string, title: string) {
    const issueNumber = Math.floor(Math.random() * 500) + 1;
    const activity: ActivityLog = {
      id: `act_${Math.random().toString(36).substring(2, 11)}`,
      type: 'issue_open',
      repo: repoName,
      user: this.user?.login || 'demo-coder',
      message: `Opened Issue #${issueNumber}: ${title}`,
      timestamp: new Date().toISOString(),
      meta: { issueNumber }
    };
    this.activityFeed.unshift(activity);

    return { activity };
  }

  public resolveIssue(repoName: string, title: string) {
    const issueNumber = Math.floor(Math.random() * 500) + 1;
    const activity: ActivityLog = {
      id: `act_${Math.random().toString(36).substring(2, 11)}`,
      type: 'issue_resolve',
      repo: repoName,
      user: this.user?.login || 'demo-coder',
      message: `Closed Issue #${issueNumber}: ${title}`,
      timestamp: new Date().toISOString(),
      meta: { issueNumber }
    };
    this.activityFeed.unshift(activity);

    return { activity };
  }

  public resetDemoData() {
    this.user = {
      login: 'demo-coder',
      avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4', // GitHub mascot Octocat
      name: 'Alex Developer',
      public_repos: 12
    };

    this.repos = [
      { name: 'pulse-dashboard', url: 'https://github.com/demo-coder/pulse-dashboard', description: 'Next-gen dev efficiency trackers and metrics visualization tools.', stargazers_count: 142, language: 'TypeScript', commits_count: 54 },
      { name: 'ai-insights-engine', url: 'https://github.com/demo-coder/ai-insights-engine', description: 'LLM heuristics module parsing commit diffs into productivity insights.', stargazers_count: 98, language: 'Python', commits_count: 38 },
      { name: 'react-canvas-charts', url: 'https://github.com/demo-coder/react-canvas-charts', description: 'Super lightweight interactive graphing wrapper for React canvas components.', stargazers_count: 73, language: 'TypeScript', commits_count: 22 },
      { name: 'express-socket-stream', url: 'https://github.com/demo-coder/express-socket-stream', description: 'Middleware connecting express route updates to socket listeners automatically.', stargazers_count: 45, language: 'JavaScript', commits_count: 18 },
      { name: 'config-dotfiles', url: 'https://github.com/demo-coder/config-dotfiles', description: 'Neovim + tmux + zsh dev configuration suite.', stargazers_count: 28, language: 'Shell', commits_count: 12 },
      { name: 'rust-crypto-hasher', url: 'https://github.com/demo-coder/rust-crypto-hasher', description: 'Blazing fast custom hashing engine written in Rust.', stargazers_count: 19, language: 'Rust', commits_count: 5 }
    ];

    this.commits = {
      total_commits: 149,
      commits_this_week: 34,
      commits_this_month: 87
    };

    this.prs = {
      opened: 4,
      merged: 18,
      closed: 2
    };

    this.dailyCommits = [
      { day: 'Mon', commits: 4 },
      { day: 'Tue', commits: 8 },
      { day: 'Wed', commits: 5 },
      { day: 'Thu', commits: 12 },
      { day: 'Fri', commits: 3 },
      { day: 'Sat', commits: 1 },
      { day: 'Sun', commits: 1 }
    ];

    this.activeHours = [
      { hour: '08:00', commits: 3 },
      { hour: '10:00', commits: 12 },
      { hour: '12:00', commits: 6 },
      { hour: '14:00', commits: 15 },
      { hour: '16:00', commits: 22 },
      { hour: '18:00', commits: 18 },
      { hour: '20:00', commits: 8 },
      { hour: '22:00', commits: 14 },
      { hour: '00:00', commits: 6 }
    ];

    this.activityFeed = [
      { id: 'act_1', type: 'commit', repo: 'pulse-dashboard', user: 'demo-coder', message: 'feat: Integrates Recharts Area chart for active commit tracking', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), meta: { additions: 142, deletions: 12 } },
      { id: 'act_2', type: 'pr_merge', repo: 'ai-insights-engine', user: 'demo-coder', message: 'Merged PR #12: feat: implement GEMINI API heuristics adapter', timestamp: new Date(Date.now() - 120 * 60000).toISOString(), meta: { prNumber: 12 } },
      { id: 'act_3', type: 'pr_open', repo: 'react-canvas-charts', user: 'demo-coder', message: 'Opened PR #45: fix: Tooltip positioning on multi-dataset grids', timestamp: new Date(Date.now() - 240 * 60000).toISOString(), meta: { prNumber: 45 } },
      { id: 'act_4', type: 'commit', repo: 'express-socket-stream', user: 'demo-coder', message: 'refactor: simplify socket channel creation lifecycle', timestamp: new Date(Date.now() - 360 * 60000).toISOString(), meta: { additions: 35, deletions: 19 } },
      { id: 'act_5', type: 'issue_resolve', repo: 'pulse-dashboard', user: 'demo-coder', message: 'Closed Issue #104: UI layout break on mobile screen headers', timestamp: new Date(Date.now() - 720 * 60000).toISOString(), meta: { issueNumber: 104 } }
    ];

    this.insights = [
      "**Peak Productivity Zone**: Your coding bursts are highly concentrated around 4 PM - 6 PM. Consider scheduling your deep focus hours here and leaving mornings for syncs.",
      "**Code Base Distribution**: TypeScript continues to dominate your stack (54%). Consider standardizing your dev templates to leverage your TS configurations.",
      "**Pull Request Velocity**: Your PR merge rate is healthy, averaging a merge ratio of 81%. However, review bottlenecks exist on *ai-insights-engine*.",
      "**Heuristic Check**: High commit density (12 commits) on Thursday suggests a sprint peak. Build automated test runs to ensure code churn doesn't trigger regressions."
    ];
  }
}

export const db = new MockDatabase();
