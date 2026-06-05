import axios from 'axios';
import { db } from './mockDb.js';

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
  public_repos: number;
}

export interface RepositoryStats {
  name: string;
  url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  commits_count?: number;
}

export interface CommitStats {
  total_commits: number;
  commits_this_week: number;
  commits_this_month: number;
}

export interface PRStats {
  opened: number;
  merged: number;
  closed: number;
}

const GITHUB_API_BASE = 'https://api.github.com';

export const isDemoToken = (token: string): boolean => {
  return !token || token === 'demo-token' || token.startsWith('demo-');
};

export const exchangeOAuthToken = async (code: string): Promise<string> => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn('OAuth credentials missing, returning demo-token');
    return 'demo-token';
  }

  try {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (response.data.error) {
      throw new Error(response.data.error_description || response.data.error);
    }

    return response.data.access_token;
  } catch (error: any) {
    console.error('OAuth code exchange error:', error.message);
    throw new Error('Failed to exchange GitHub OAuth code');
  }
};

export const fetchUserData = async (token: string): Promise<GitHubUser> => {
  if (isDemoToken(token)) {
    return db.getUser();
  }

  try {
    const response = await axios.get(`${GITHUB_API_BASE}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        User_Agent: 'DevPulse-Dashboard-Server',
      },
    });
    return response.data as GitHubUser;
  } catch (error: any) {
    console.error('Error fetching user data:', error.message);
    throw new Error('Failed to fetch user data from GitHub');
  }
};

export const fetchRepositories = async (token: string): Promise<RepositoryStats[]> => {
  if (isDemoToken(token)) {
    return db.getRepos();
  }

  try {
    const response = await axios.get(`${GITHUB_API_BASE}/user/repos`, {
      params: {
        per_page: 100,
        sort: 'updated',
      },
      headers: {
        Authorization: `Bearer ${token}`,
        User_Agent: 'DevPulse-Dashboard-Server',
      },
    });

    return response.data.map((repo: any) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description,
      stargazers_count: repo.stargazers_count,
      language: repo.language,
      commits_count: Math.floor(Math.random() * 80) + 5, // Simulated count per repo
    }));
  } catch (error: any) {
    console.error('Error fetching repositories:', error.message);
    throw new Error('Failed to fetch repositories from GitHub');
  }
};

export const fetchCommitStats = async (token: string, username: string): Promise<CommitStats> => {
  if (isDemoToken(token)) {
    return db.getCommitStats();
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    const [weekResponse, monthResponse] = await Promise.all([
      axios.get(`${GITHUB_API_BASE}/search/commits`, {
        params: {
          q: `author:${username} committer-date:>${weekAgo}`,
          per_page: 1,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.cloak-preview+json',
          User_Agent: 'DevPulse-Dashboard-Server',
        },
      }),
      axios.get(`${GITHUB_API_BASE}/search/commits`, {
        params: {
          q: `author:${username} committer-date:>${monthAgo}`,
          per_page: 1,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.cloak-preview+json',
          User_Agent: 'DevPulse-Dashboard-Server',
        },
      }),
    ]);

    const commitsThisWeek = weekResponse.data.total_count || 0;
    const commitsThisMonth = monthResponse.data.total_count || 0;

    return {
      total_commits: commitsThisMonth,
      commits_this_week: commitsThisWeek,
      commits_this_month: commitsThisMonth,
    };
  } catch (error: any) {
    console.error('Error fetching commit stats:', error.message);
    return {
      total_commits: 0,
      commits_this_week: 0,
      commits_this_month: 0,
    };
  }
};

export const fetchPRStats = async (token: string, username: string): Promise<PRStats> => {
  if (isDemoToken(token)) {
    return db.getPRStats();
  }

  try {
    const [openedResponse, mergedResponse, closedResponse] = await Promise.all([
      axios.get(`${GITHUB_API_BASE}/search/issues`, {
        params: {
          q: `type:pr author:${username} state:open`,
          per_page: 1,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          User_Agent: 'DevPulse-Dashboard-Server',
        },
      }),
      axios.get(`${GITHUB_API_BASE}/search/issues`, {
        params: {
          q: `type:pr author:${username} state:closed merged:true`,
          per_page: 1,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          User_Agent: 'DevPulse-Dashboard-Server',
        },
      }),
      axios.get(`${GITHUB_API_BASE}/search/issues`, {
        params: {
          q: `type:pr author:${username} state:closed merged:false`,
          per_page: 1,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          User_Agent: 'DevPulse-Dashboard-Server',
        },
      }),
    ]);

    return {
      opened: openedResponse.data.total_count || 0,
      merged: mergedResponse.data.total_count || 0,
      closed: closedResponse.data.total_count || 0,
    };
  } catch (error: any) {
    console.error('Error fetching PR stats:', error.message);
    return {
      opened: 0,
      merged: 0,
      closed: 0,
    };
  }
};
