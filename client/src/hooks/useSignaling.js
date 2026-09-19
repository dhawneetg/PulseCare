import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '../types/index.js';

const WS_ENDPOINT = import.meta.env.VITE_WS_ENDPOINT || window.location.origin;

/**
 * Custom hook for Socket.io signaling bridge per architecture.md Section 6.
 * Canonical Events:
 * - join-queue (Client -> Server)
 * - queue-updated (Server -> Doctor)
 * - call-initiate (Doctor -> Server -> Patient)
 * - signal-offer (Peer A -> Server -> Peer B)
 * - signal-answer (Peer B -> Server -> Peer A)
 * - ice-candidate (Peer -> Server -> Peer)
 */
export function useSignaling({
  onQueueUpdated,
  onIncomingCall,
  onOffer,
  onAnswer,
  onIceCandidate,
  onCallEnded,
  onTextRelay,
  onPeerJoined,
  onAudioChunk,
  onVideoFrame,
} = {}) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);

  // Keep latest callbacks in a mutable ref to eliminate stale closure bugs across mobile peers
  const callbacksRef = useRef({});
  useEffect(() => {
    callbacksRef.current = {
      onQueueUpdated,
      onIncomingCall,
      onOffer,
      onAnswer,
      onIceCandidate,
      onCallEnded,
      onTextRelay,
      onPeerJoined,
      onAudioChunk,
      onVideoFrame,
    };
  });

  useEffect(() => {
    const socket = io(WS_ENDPOINT, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setSocketId(socket.id);
      console.log(`[PulseCare] Signaling socket connected: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('[PulseCare] Signaling socket disconnected');
    });

    socket.on(SOCKET_EVENTS.QUEUE_UPDATED, (queue) => {
      callbacksRef.current.onQueueUpdated?.(queue);
    });

    socket.on(SOCKET_EVENTS.CALL_INITIATE, (data) => {
      callbacksRef.current.onIncomingCall?.(data);
    });

    socket.on(SOCKET_EVENTS.SIGNAL_OFFER, (data) => {
      callbacksRef.current.onOffer?.(data);
    });

    socket.on(SOCKET_EVENTS.SIGNAL_ANSWER, (data) => {
      callbacksRef.current.onAnswer?.(data);
    });

    socket.on(SOCKET_EVENTS.ICE_CANDIDATE, (data) => {
      callbacksRef.current.onIceCandidate?.(data);
    });

    socket.on(SOCKET_EVENTS.CALL_ENDED, (data) => {
      callbacksRef.current.onCallEnded?.(data);
    });

    socket.on(SOCKET_EVENTS.TEXT_RELAY, (data) => {
      callbacksRef.current.onTextRelay?.(data);
    });

    socket.on(SOCKET_EVENTS.PEER_JOINED, (data) => {
      callbacksRef.current.onPeerJoined?.(data);
    });

    socket.on('audio-chunk', (data) => {
      callbacksRef.current.onAudioChunk?.(data);
    });

    socket.on('video-frame', (data) => {
      callbacksRef.current.onVideoFrame?.(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinQueue = useCallback((patientPayload) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.JOIN_QUEUE, {
        ...patientPayload,
        socketId: socketRef.current.id,
      });
    }
  }, []);

  const joinRoom = useCallback((roomId, role) => {
    if (socketRef.current?.connected && roomId) {
      socketRef.current.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId, role });
    }
  }, []);

  const initiateCall = useCallback((targetPeerId, roomId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.CALL_INITIATE, {
        targetPeerId,
        roomId,
      });
    }
  }, []);

  const sendOffer = useCallback((sdp, roomId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.SIGNAL_OFFER, { sdp, roomId });
    }
  }, []);

  const sendAnswer = useCallback((sdp, roomId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.SIGNAL_ANSWER, { sdp, roomId });
    }
  }, []);

  const sendIceCandidate = useCallback((candidate, roomId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.ICE_CANDIDATE, { candidate, roomId });
    }
  }, []);

  const sendTextRelay = useCallback((roomId, payload) => {
    if (socketRef.current?.connected && roomId) {
      socketRef.current.emit(SOCKET_EVENTS.TEXT_RELAY, { roomId, payload });
    }
  }, []);

  const sendAudioChunk = useCallback((roomId, chunk) => {
    if (socketRef.current?.connected && roomId && chunk) {
      socketRef.current.emit('audio-chunk', { roomId, chunk });
    }
  }, []);

  const sendVideoFrame = useCallback((roomId, frame) => {
    if (socketRef.current?.connected && roomId && frame) {
      socketRef.current.emit('video-frame', { roomId, frame });
    }
  }, []);

  const endCallSignaling = useCallback((roomId) => {
    if (socketRef.current?.connected && roomId) {
      socketRef.current.emit(SOCKET_EVENTS.CALL_ENDED, { roomId });
      socketRef.current.emit(SOCKET_EVENTS.LEAVE_ROOM, { roomId });
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    socketId,
    joinQueue,
    joinRoom,
    initiateCall,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    sendTextRelay,
    sendAudioChunk,
    sendVideoFrame,
    endCallSignaling,
  };
}
