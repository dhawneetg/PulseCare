// In-memory room signaling buffer for zero-packet-drop WebRTC handshakes (Critical for mobile cellular networks & Render)
export const roomOffers = new Map();       // roomId -> { sdp, from, timestamp }
export const roomAnswers = new Map();      // roomId -> { sdp, from, timestamp }
export const roomCandidates = new Map();   // roomId -> Array<{ candidate, from, timestamp }>

/**
 * Deliver pending SDP offers and gathered ICE candidates to a newly joined socket peer
 */
export function flushPendingRoomSignaling(socket, roomId) {
  if (!socket || !roomId) return;

  // 1. Deliver pending offer from another peer if present
  const pendingOffer = roomOffers.get(roomId);
  if (pendingOffer && pendingOffer.from !== socket.id) {
    console.log(`[PulseCare] Server delivering buffered SDP offer in room ${roomId} to peer ${socket.id}`);
    socket.emit('signal-offer', {
      sdp: pendingOffer.sdp,
      roomId,
      from: pendingOffer.from
    });
  }

  // 2. Deliver pending answer if present
  const pendingAnswer = roomAnswers.get(roomId);
  if (pendingAnswer && pendingAnswer.from !== socket.id) {
    console.log(`[PulseCare] Server delivering buffered SDP answer in room ${roomId} to peer ${socket.id}`);
    socket.emit('signal-answer', {
      sdp: pendingAnswer.sdp,
      roomId,
      from: pendingAnswer.from
    });
  }

  // 3. Deliver all gathered ICE candidates from other peers
  const pendingCandidates = roomCandidates.get(roomId);
  if (pendingCandidates && pendingCandidates.length > 0) {
    const peerCandidates = pendingCandidates.filter(c => c.from !== socket.id);
    if (peerCandidates.length > 0) {
      console.log(`[PulseCare] Server flushing ${peerCandidates.length} buffered ICE candidates in room ${roomId} to peer ${socket.id}`);
      peerCandidates.forEach(({ candidate, from }) => {
        socket.emit('ice-candidate', {
          candidate,
          roomId,
          from
        });
      });
    }
  }
}

export function clearRoomSignaling(roomId) {
  if (!roomId) return;
  roomOffers.delete(roomId);
  roomAnswers.delete(roomId);
  roomCandidates.delete(roomId);
}

export function setupSignalingHandlers(io, socket) {
  // Relay SDP offer to the other peer in the room (with persistent buffer)
  socket.on('signal-offer', ({ sdp, roomId }) => {
    if (!roomId || !sdp) return;
    socket.join(roomId);
    roomOffers.set(roomId, { sdp, from: socket.id, timestamp: Date.now() });
    socket.to(roomId).emit('signal-offer', {
      sdp,
      roomId,
      from: socket.id
    });
    console.log(`[PulseCare] Relayed & buffered signal-offer from ${socket.id} in room ${roomId}`);
  });

  // Relay SDP answer back to the offerer (with persistent buffer)
  socket.on('signal-answer', ({ sdp, roomId }) => {
    if (!roomId || !sdp) return;
    socket.join(roomId);
    roomAnswers.set(roomId, { sdp, from: socket.id, timestamp: Date.now() });
    socket.to(roomId).emit('signal-answer', {
      sdp,
      roomId,
      from: socket.id
    });
    console.log(`[PulseCare] Relayed & buffered signal-answer from ${socket.id} in room ${roomId}`);
  });

  // Relay ICE candidates with race-condition protection and persistent buffering
  socket.on('ice-candidate', ({ candidate, roomId }) => {
    if (!roomId || !candidate) return;
    socket.join(roomId);
    if (!roomCandidates.has(roomId)) {
      roomCandidates.set(roomId, []);
    }
    roomCandidates.get(roomId).push({ candidate, from: socket.id, timestamp: Date.now() });
    socket.to(roomId).emit('ice-candidate', {
      candidate,
      roomId,
      from: socket.id
    });
  });

  // Relay call termination / hangup to the other peer in the room and clean buffers
  socket.on('call-ended', ({ roomId }) => {
    if (roomId) {
      socket.to(roomId).emit('call-ended', {
        roomId,
        from: socket.id
      });
      clearRoomSignaling(roomId);
    }
  });

  // Dual-channel clinical emergency text relay over Socket.io
  socket.on('text-relay', ({ roomId, payload }) => {
    if (roomId) {
      socket.join(roomId);
      socket.to(roomId).emit('text-relay', {
        ...payload,
        roomId,
        from: socket.id
      });
    }
  });
}

