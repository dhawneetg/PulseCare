// In-memory state for 36-hour hackathon MVP (No database)
const patientQueue = [];
const activeRooms = new Map();

export function setupRoomHandlers(io, socket) {
  // Client joins the waiting room queue
  socket.on('join-queue', (payload) => {
    const { patientId, name, age, vitals, symptoms, urgency } = payload || {};
    
    // Check if already in queue to avoid duplicates
    const existingIndex = patientQueue.findIndex(p => p.id === patientId || p.socketId === socket.id);
    const patientRecord = {
      id: patientId || `p_${Date.now()}`,
      name: name || 'Anonymous Patient',
      age: age || 30,
      vitals: vitals || { temp: 98.6, bp: '120/80' },
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
    const targetSocketId = targetPeerId;
    socket.join(roomId);

    if (targetSocketId && io.sockets.sockets.get(targetSocketId)) {
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      targetSocket.join(roomId);

      // Notify the target patient that doctor initiated call
      targetSocket.emit('call-initiate', {
        callerId: socket.id,
        roomId
      });
    }

    // Remove called patient from the waiting queue if present
    const index = patientQueue.findIndex(p => p.socketId === targetSocketId || p.id === targetPeerId);
    if (index >= 0) {
      patientQueue.splice(index, 1);
      io.emit('queue-updated', patientQueue);
    }
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    const index = patientQueue.findIndex(p => p.socketId === socket.id);
    if (index >= 0) {
      patientQueue.splice(index, 1);
      io.emit('queue-updated', patientQueue);
    }
  });
}

export function getQueue() {
  return patientQueue;
}
