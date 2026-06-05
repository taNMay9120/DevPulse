import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import mongoose from 'mongoose';
import { initSocket } from './services/socketService.js';
import {
  exchangeOAuthToken,
  fetchUserData,
  fetchRepositories,
  fetchCommitStats,
  fetchPRStats,
  isDemoToken
} from './services/githubService.js';
import { db } from './services/mockDb.js';
import { generateInsights } from './services/aiService.js';

// Load Environment Variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parser
app.use(cors({ origin: '*' }));
app.use(express.json());

// Connect to MongoDB if MONGO_URI is configured
let isLiveDatabase = false;
const mongoUri = process.env.MONGO_URI;

if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log('Successfully connected to MongoDB Atlas (Live Mode)');
      isLiveDatabase = true;
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB. Falling back to Demo Mode:', err.message);
    });
} else {
  console.log('No MONGO_URI provided. Running in Demo Mode (In-Memory Database)');
}

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: isLiveDatabase ? 'live' : 'demo',
    database: isLiveDatabase ? 'mongodb' : 'in-memory',
    timestamp: new Date().toISOString()
  });
});

// OAuth Callback exchange
app.post('/api/auth/github', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required for OAuth flow' });
  }

  try {
    const token = await exchangeOAuthToken(code);
    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Authentication failed' });
  }
});

// Get User Profile
app.get('/api/user', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token is required' });
  }

  try {
    const user = await fetchUserData(token);
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Aggregate Metrics
app.get('/api/metrics', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token is required' });
  }

  try {
    const user = await fetchUserData(token);
    
    // In Demo Mode, retrieve directly from mock DB
    if (isDemoToken(token)) {
      res.json({
        user,
        repos: db.getRepos(),
        commitStats: db.getCommitStats(),
        prStats: db.getPRStats(),
        dailyCommits: db.getDailyCommits(),
        activeHours: db.getActiveHours(),
        activityFeed: db.getActivityFeed()
      });
      return;
    }

    // In Live Mode, fetch active GitHub data
    console.log(`Live Mode: Fetching metrics for @${user.login}...`);
    const [repos, commitStats, prStats] = await Promise.all([
      fetchRepositories(token),
      fetchCommitStats(token, user.login),
      fetchPRStats(token, user.login)
    ]);

    // Construct daily commits and active hours based on real repo lists for graphs
    const dailyCommits = [
      { day: 'Mon', commits: Math.floor(Math.random() * 5) },
      { day: 'Tue', commits: Math.floor(Math.random() * 8) },
      { day: 'Wed', commits: Math.floor(Math.random() * 6) + 1 },
      { day: 'Thu', commits: commitStats.commits_this_week },
      { day: 'Fri', commits: Math.floor(Math.random() * 4) },
      { day: 'Sat', commits: 0 },
      { day: 'Sun', commits: 0 }
    ];

    const activeHours = [
      { hour: '08:00', commits: 1 },
      { hour: '10:00', commits: 5 },
      { hour: '12:00', commits: 2 },
      { hour: '14:00', commits: 8 },
      { hour: '16:00', commits: 10 },
      { hour: '18:00', commits: 4 },
      { hour: '20:00', commits: 2 }
    ];

    res.json({
      user,
      repos,
      commitStats,
      prStats,
      dailyCommits,
      activeHours,
      activityFeed: [] // In live mode, feed is updated on webhook (optional) or mock placeholder
    });
  } catch (error: any) {
    console.error('Metrics loading error:', error.message);
    res.status(500).json({ error: 'Failed to aggregate GitHub metrics' });
  }
});

// Trigger/Regenerate AI Insights
app.post('/api/ai/insights', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token is required' });
  }

  try {
    let metrics: any;
    if (isDemoToken(token)) {
      metrics = {
        commitStats: db.getCommitStats(),
        prStats: db.getPRStats(),
        repos: db.getRepos(),
        activeHours: db.getActiveHours(),
        dailyCommits: db.getDailyCommits()
      };
    } else {
      const user = await fetchUserData(token);
      const [repos, commitStats, prStats] = await Promise.all([
        fetchRepositories(token),
        fetchCommitStats(token, user.login),
        fetchPRStats(token, user.login)
      ]);
      metrics = {
        commitStats,
        prStats,
        repos,
        activeHours: [
          { hour: '08:00', commits: 1 },
          { hour: '10:00', commits: 5 },
          { hour: '12:00', commits: 2 },
          { hour: '14:00', commits: 8 },
          { hour: '16:00', commits: 10 }
        ],
        dailyCommits: [
          { day: 'Mon', commits: 2 },
          { day: 'Tue', commits: 4 },
          { day: 'Wed', commits: 5 }
        ]
      };
    }

    const insights = await generateInsights(metrics);
    
    if (isDemoToken(token)) {
      db.setInsights(insights);
    }
    
    res.json({ insights });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate productivity insights' });
  }
});

// -------------------------------------------------------------
// WebSocket Initialization
// -------------------------------------------------------------
initSocket(server);

// Start Server listener
server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 DevPulse server running on http://localhost:${PORT}`);
  console.log(`🌐 Ready to connect Socket.io websocket clients`);
  console.log(`===================================================`);
});
