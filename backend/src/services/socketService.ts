import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { db } from './mockDb.js';

let io: SocketIOServer | null = null;

export const initSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', // Allow connections from frontend
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Push initial status or acknowledgment
    socket.emit('status', { status: 'connected', mode: process.env.MONGO_URI ? 'live' : 'demo' });

    // Listen for simulation events (Demo Mode control panel calls)
    socket.on('simulation-event', (data: {
      type: 'commit' | 'pr_open' | 'pr_merge' | 'issue_open' | 'issue_resolve';
      repo: string;
      message: string;
      meta?: any;
    }) => {
      console.log(`Simulation event received:`, data);
      
      let updateResult: any = null;

      switch (data.type) {
        case 'commit': {
          const additions = data.meta?.additions || Math.floor(Math.random() * 100) + 5;
          const deletions = data.meta?.deletions || Math.floor(Math.random() * 30) + 1;
          updateResult = db.addCommit(data.repo, additions, deletions, data.message);
          break;
        }
        case 'pr_open':
          updateResult = db.openPR(data.repo, data.message);
          break;
        case 'pr_merge':
          updateResult = db.mergePR(data.repo, data.message);
          break;
        case 'issue_open':
          updateResult = db.openIssue(data.repo, data.message);
          break;
        case 'issue_resolve':
          updateResult = db.resolveIssue(data.repo, data.message);
          break;
        default:
          console.warn(`Unknown simulation event type: ${data.type}`);
          return;
      }

      if (updateResult) {
        // Broadcast the new activity log to all connected clients
        io?.emit('activity-new', updateResult.activity);

        // Broadcast the updated aggregate metrics to all connected clients
        io?.emit('metrics-update', {
          commitStats: db.getCommitStats(),
          prStats: db.getPRStats(),
          dailyCommits: db.getDailyCommits(),
          activeHours: db.getActiveHours(),
          repos: db.getRepos(),
          activityFeed: db.getActivityFeed()
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};
