export function setupSignalingHandlers(io, socket) {
  // Relay SDP offer to the other peer in the room
  socket.on('signal-offer', ({ sdp, roomId }) => {
    socket.to(roomId).emit('signal-offer', {
      sdp,
      roomId,
      from: socket.id
    });
  });

  // Relay SDP answer back to the offerer
  socket.on('signal-answer', ({ sdp, roomId }) => {
    socket.to(roomId).emit('signal-answer', {
      sdp,
      roomId,
      from: socket.id
    });
  });

  // Relay ICE candidates
  socket.on('ice-candidate', ({ candidate, roomId }) => {
    socket.to(roomId).emit('ice-candidate', {
      candidate,
      roomId,
      from: socket.id
    });
  });

  // Relay call termination / hangup to the other peer in the room
  socket.on('call-ended', ({ roomId }) => {
    socket.to(roomId).emit('call-ended', {
      roomId,
      from: socket.id
    });
  });
}
