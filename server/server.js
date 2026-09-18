import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { setupRoomHandlers, getQueue } from './handlers/roomHandler.js';
import { setupSignalingHandlers } from './handlers/signalingHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend build from client/dist if present
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      if (filePath.includes(path.join('dist', 'assets'))) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  }));
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PulseCare Signaling Server',
    activePatientsInQueue: getQueue().length,
    timestamp: Date.now()
  });
});

// Socket.io connection lifecycle
io.on('connection', (socket) => {
  // Send current queue immediately upon connection
  socket.emit('queue-updated', getQueue());

  // Setup domain handlers
  setupRoomHandlers(io, socket);
  setupSignalingHandlers(io, socket);
});

// SPA fallback for client-side routing (Express 5 compatible)
if (fs.existsSync(clientDistPath)) {
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/socket.io') || req.path.startsWith('/health')) {
      return next();
    }
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[PulseCare] Server & Signaling running on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown handling for container and cloud deployments
const handleShutdown = () => {
  console.log('[PulseCare] Received termination signal. Gracefully closing signaling server...');
  io.close(() => {
    server.close(() => {
      console.log('[PulseCare] Server closed successfully.');
      process.exit(0);
    });
  });
};
process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);
