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
export function useSignaling({ onQueueUpdated, onIncomingCall, onOffer, onAnswer, onIceCandidate, onCallEnded } = {}) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);

  useEffect(() => {
    const socket = io(WS_ENDPOINT, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
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

    if (onQueueUpdated) {
      socket.on(SOCKET_EVENTS.QUEUE_UPDATED, (queue) => {
        onQueueUpdated(queue);
      });
    }

    if (onIncomingCall) {
      socket.on(SOCKET_EVENTS.CALL_INITIATE, (data) => {
        onIncomingCall(data);
      });
    }

    if (onOffer) {
      socket.on(SOCKET_EVENTS.SIGNAL_OFFER, (data) => {
        onOffer(data);
      });
    }

    if (onAnswer) {
      socket.on(SOCKET_EVENTS.SIGNAL_ANSWER, (data) => {
        onAnswer(data);
      });
    }

    if (onIceCandidate) {
      socket.on(SOCKET_EVENTS.ICE_CANDIDATE, (data) => {
        onIceCandidate(data);
      });
    }

    if (onCallEnded) {
      socket.on(SOCKET_EVENTS.CALL_ENDED, (data) => {
        onCallEnded(data);
      });
    }

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

  const endCallSignaling = useCallback((roomId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.CALL_ENDED, { roomId });
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    socketId,
    joinQueue,
    initiateCall,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    endCallSignaling,
  };
}
