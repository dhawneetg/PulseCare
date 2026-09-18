// Canonical WebSocket and WebRTC event types per architecture.md Section 6

export const SOCKET_EVENTS = {
  JOIN_QUEUE: 'join-queue',
  QUEUE_UPDATED: 'queue-updated',
  CALL_INITIATE: 'call-initiate',
  SIGNAL_OFFER: 'signal-offer',
  SIGNAL_ANSWER: 'signal-answer',
  ICE_CANDIDATE: 'ice-candidate',
  CALL_ENDED: 'call-ended',
};

export const DATA_CHANNEL_MESSAGES = {
  NETWORK_DEGRADED: 'NETWORK_DEGRADED',
  NETWORK_RESTORED: 'NETWORK_RESTORED',
};

export const URGENCY_TIERS = {
  EMERGENCY: 'emergency',
  CONSULTATION: 'consultation',
};
