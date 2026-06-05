import { Octokit } from '@octokit/rest';

let octokit: Octokit | null = null;

export const initGitHub = (token: string) => {
  octokit = new Octokit({
    auth: token,
  });
  return octokit;
};

export const getGitHubAuth = () => {
  return octokit;
};

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

export const fetchUserData = async (token: string): Promise<GitHubUser> => {
  const client = initGitHub(token);
  const response = await client.users.getAuthenticated();
  return response.data as GitHubUser;
};

export const fetchRepositories = async (token: string): Promise<RepositoryStats[]> => {
  const client = initGitHub(token);
  const response = await client.repos.listForAuthenticatedUser({
    per_page: 100,
    sort: 'updated',
  });

  return response.data.map((repo: any) => ({
    name: repo.name,
    url: repo.html_url,
    description: repo.description,
    stargazers_count: repo.stargazers_count,
    language: repo.language,
  }));
};

export const fetchCommitStats = async (token: string): Promise<CommitStats> => {
  const client = initGitHub(token);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  try {
    const weekResponse = await client.search.commits({
      q: `author:@me committer-date:>${weekAgo.toISOString().split('T')[0]}`,
      per_page: 1,
    });

    const monthResponse = await client.search.commits({
      q: `author:@me committer-date:>${monthAgo.toISOString().split('T')[0]}`,
      per_page: 1,
    });

    return {
      total_commits: weekResponse.data.total_count,
      commits_this_week: weekResponse.data.total_count,
      commits_this_month: monthResponse.data.total_count,
    };
  } catch (error) {
    console.warn('Could not fetch commit stats via search API:', error);
    // Fallback: return zeros if search fails
    return {
      total_commits: 0,
      commits_this_week: 0,
      commits_this_month: 0,
    };
  }
};

export const fetchPRStats = async (token: string): Promise<PRStats> => {
  const client = initGitHub(token);

  try {
    const openedResponse = await client.search.issuesAndPullRequests({
      q: `type:pr author:@me state:open`,
      per_page: 1,
    });

    const mergedResponse = await client.search.issuesAndPullRequests({
      q: `type:pr author:@me state:closed merged:true`,
      per_page: 1,
    });

    const closedResponse = await client.search.issuesAndPullRequests({
      q: `type:pr author:@me state:closed merged:false`,
      per_page: 1,
    });

    return {
      opened: openedResponse.data.total_count,
      merged: mergedResponse.data.total_count,
      closed: closedResponse.data.total_count,
    };
  } catch (error) {
    console.warn('Could not fetch PR stats:', error);
    return {
      opened: 0,
      merged: 0,
      closed: 0,
    };
  }
};

export const getLanguageStats = (repos: RepositoryStats[]): { [key: string]: number } => {
  const languages: { [key: string]: number } = {};

  repos.forEach((repo) => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });

  return languages;
};
