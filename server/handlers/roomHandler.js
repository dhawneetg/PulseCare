// In-memory state for 36-hour hackathon MVP (No database)
const patientQueue = [];
const socketRooms = new Map(); // socketId -> Set<roomId>

function trackSocketRoom(socketId, roomId) {
  if (!roomId) return;
  if (!socketRooms.has(socketId)) {
    socketRooms.set(socketId, new Set());
  }
  socketRooms.get(socketId).add(roomId);
}

function untrackSocketRoom(socketId, roomId) {
  if (socketRooms.has(socketId)) {
    socketRooms.get(socketId).delete(roomId);
    if (socketRooms.get(socketId).size === 0) {
      socketRooms.delete(socketId);
    }
  }
}

export function setupRoomHandlers(io, socket) {
  // Client joins a consultation room directly
  socket.on('join-room', ({ roomId, role }) => {
    if (!roomId) return;
    socket.join(roomId);
    trackSocketRoom(socket.id, roomId);
    socket.to(roomId).emit('peer-joined', {
      peerId: socket.id,
      roomId,
      role: role || 'peer',
      timestamp: Date.now()
    });
    console.log(`[PulseCare] Socket ${socket.id} (${role || 'peer'}) joined room ${roomId}`);
  });

  // Client leaves a consultation room explicitly
  socket.on('leave-room', ({ roomId }) => {
    if (!roomId) return;
    socket.leave(roomId);
    untrackSocketRoom(socket.id, roomId);
    socket.to(roomId).emit('call-ended', {
      roomId,
      from: socket.id,
      reason: 'Remote peer left the consultation'
    });
    console.log(`[PulseCare] Socket ${socket.id} left room ${roomId}`);
  });

  // Client joins the waiting room queue
  socket.on('join-queue', (payload) => {
    const { patientId, name, age, vitals, symptoms, urgency } = payload || {};
    
    // Check if already in queue to avoid duplicates
    const existingIndex = patientQueue.findIndex(p => p.id === patientId || p.socketId === socket.id);
    const patientRecord = {
      id: patientId || `p_${Date.now()}`,
      name: name || 'Anonymous Patient',
      age: age || 30,
      vitals: vitals || { temp: '98.6', bp: '120/80' },
      symptoms: symptoms || [],
      urgency: urgency || 'consultation',
      socketId: socket.id,
      joinedAt: Date.now()
    };

    if (existingIndex >= 0) {
      patientQueue[existingIndex] = patientRecord;
    } else {
      patientQueue.push(patientRecord);
    }

    // Broadcast updated queue to all connected peers (specifically doctors)
    io.emit('queue-updated', patientQueue);
  });

  // Doctor initiates a call with a patient
  socket.on('call-initiate', ({ targetPeerId, roomId }) => {
    socket.join(roomId);
    trackSocketRoom(socket.id, roomId);

    // Look up target socket by socket.id or by patient ID in queue
    let targetSocket = null;
    if (targetPeerId) {
      targetSocket = io.sockets.sockets.get(targetPeerId);
      if (!targetSocket) {
        const queuedPatient = patientQueue.find(p => p.id === targetPeerId || p.socketId === targetPeerId);
        if (queuedPatient && queuedPatient.socketId) {
          targetSocket = io.sockets.sockets.get(queuedPatient.socketId);
        }
      }
    }

    if (targetSocket) {
      targetSocket.join(roomId);
      trackSocketRoom(targetSocket.id, roomId);
      targetSocket.emit('call-initiate', {
        callerId: socket.id,
        roomId
      });
      console.log(`[PulseCare] Direct call initiated: Doctor (${socket.id}) -> Patient (${targetSocket.id}) in room ${roomId}`);
    } else {
      console.log(`[PulseCare] Target peer ${targetPeerId} not directly found. Broadcasting call-initiate to all non-caller peers for demo resilience.`);
      socket.broadcast.emit('call-initiate', {
        callerId: socket.id,
        roomId
      });
    }

    // Remove called patient from the waiting queue if present
    const index = patientQueue.findIndex(p => p.socketId === targetPeerId || p.id === targetPeerId);
    if (index >= 0) {
      patientQueue.splice(index, 1);
      io.emit('queue-updated', patientQueue);
    }
  });

  // Handle client disconnection (tab close, network loss, navigation)
  socket.on('disconnecting', () => {
    // Notify all rooms this socket was in that the peer disconnected/closed tab
    const userRooms = socketRooms.get(socket.id) || new Set();
    // Also check socket.rooms for any additional rooms
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        userRooms.add(room);
      }
    }

    userRooms.forEach((roomId) => {
      console.log(`[PulseCare] Peer ${socket.id} disconnected. Emitting call-ended to room ${roomId}`);
      socket.to(roomId).emit('call-ended', {
        roomId,
        from: socket.id,
        reason: 'Remote peer closed browser or disconnected'
      });
    });

    socketRooms.delete(socket.id);
  });

  socket.on('disconnect', () => {
    const index = patientQueue.findIndex(p => p.socketId === socket.id);
    if (index >= 0) {
      patientQueue.splice(index, 1);
      io.emit('queue-updated', patientQueue);
    }
    socketRooms.delete(socket.id);
  });
}

export function getQueue() {
  return patientQueue;
}
