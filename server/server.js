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
  app.use(express.static(clientDistPath));
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

// SPA fallback for client-side routing
if (fs.existsSync(clientDistPath)) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/socket.io') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[PulseCare] Server & Signaling running on http://localhost:${PORT}`);
});
