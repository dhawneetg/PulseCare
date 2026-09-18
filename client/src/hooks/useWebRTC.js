import { useState, useRef, useEffect, useCallback } from 'react';
import { DATA_CHANNEL_MESSAGES } from '../types/index.js';

// Canonical ICE config per architecture.md Section 3 (STUN + Multi-Port TURN + Secure TLS TURN for mobile carrier traversal)
export const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:openrelay.metered.ca:80' },
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turns:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turns:openrelay.metered.ca:5349?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

// Baseline media constraints requested at call start per architecture.md Section 3
// Uses mobile-friendly ideal constraints with portrait/landscape tolerance and front camera preference
export const MEDIA_CONSTRAINTS = {
  video: {
    facingMode: 'user',
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { ideal: 24, max: 30 },
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

const RTT_THRESHOLD_MS = 500; // 500ms round trip time cliff threshold

/**
 * Native RTCPeerConnection lifecycle hook with adaptive bandwidth fallback.
 * Strictly native WebRTC APIs only (no third-party wrappers).
 */
export function useWebRTC({
  onRemoteStream,
  onDegradationStateChange,
  onRttUpdate,
  onChatMessage,
  onSendOffer,
  onSendAnswer,
  onSendIceCandidate,
} = {}) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [currentRtt, setCurrentRtt] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [callConnected, setCallConnected] = useState(false);

  // Persistent refs to prevent stale closure bugs inside event listeners
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const mediaPromiseRef = useRef(null);
  const dataChannelRef = useRef(null);
  const statsIntervalRef = useRef(null);
  const roomIdRef = useRef(null);
  const iceCandidateQueueRef = useRef([]);

  /**
   * Acquire local user media with mobile-safe 3-stage fallback and concurrency lock.
   * Stage 1: Front camera with ideal resolution
   * Stage 2: Generic { video: true, audio: true } (bypasses mobile OverconstrainedError)
   * Stage 3: Audio-only fallback
   */
  const startLocalMedia = useCallback(async () => {
    // If a media acquisition is currently pending, return the shared in-flight promise
    if (mediaPromiseRef.current) {
      return mediaPromiseRef.current;
    }

    // If local stream already active and has live tracks, reuse it directly
    if (localStreamRef.current && localStreamRef.current.getTracks().some((t) => t.readyState === 'live')) {
      return localStreamRef.current;
    }

    const acquireMedia = async () => {
      // Check for Secure Context / MediaDevices availability (Critical for mobile devices)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const isPlainHttp = window.location.protocol === 'http:' && 
          window.location.hostname !== 'localhost' && 
          window.location.hostname !== '127.0.0.1';
        const errorMsg = isPlainHttp
          ? 'Mobile browsers require HTTPS for camera and microphone. Please open via Render HTTPS URL or an SSL tunnel.'
          : 'Camera & Microphone access is not supported or blocked in this browser.';
        console.error('[PulseCare]', errorMsg);
        setCameraError(errorMsg);
        return null;
      }

      let stream = null;

      // Stage 1: Ideal mobile constraints with front/selfie camera
      try {
        stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
        setCameraError(null);
      } catch (err) {
        console.warn('[PulseCare] Stage 1 constraints failed, attempting generic video/audio:', err);
        // Stage 2: Generic video & audio (resolves mobile OverconstrainedError)
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setCameraError(null);
        } catch (videoErr) {
          console.warn('[PulseCare] Video capture denied or unavailable, attempting audio-only:', videoErr);
          // Stage 3: Audio-only fallback
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setCameraError('Camera unavailable. Continuing with audio only.');
            setIsAudioOnly(true);
          } catch (audioErr) {
            console.error('[PulseCare] Fatal: Microphone permission also denied:', audioErr);
            setCameraError('Microphone permission required for medical consultation.');
            return null;
          }
        }
      }

      if (stream) {
        localStreamRef.current = stream;
        setLocalStream(stream);

        // If peer connection already exists, dynamically attach tracks
        const pc = peerConnectionRef.current;
        if (pc && pc.signalingState !== 'closed') {
          const currentSenders = pc.getSenders();
          stream.getTracks().forEach((track) => {
            const existingSender = currentSenders.find((s) => s.track && s.track.kind === track.kind);
            if (existingSender) {
              existingSender.replaceTrack(track).catch((e) => console.warn('[PulseCare] replaceTrack error:', e));
            } else {
              try {
                pc.addTrack(track, stream);
              } catch (e) {
                console.warn('[PulseCare] addTrack error:', e);
              }
            }
          });
        }
      }

      return stream;
    };

    mediaPromiseRef.current = acquireMedia().finally(() => {
      mediaPromiseRef.current = null;
    });

    return mediaPromiseRef.current;
  }, []);

  /**
   * Send JSON message over RTCDataChannel ('ui-state-sync')
   */
  const sendDataChannelMessage = useCallback((payload) => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      dataChannelRef.current.send(JSON.stringify(payload));
    }
  }, []);

  /**
   * Send clinical emergency text message over RTCDataChannel
   */
  const sendChatMessage = useCallback((text, senderName) => {
    const payload = {
      type: DATA_CHANNEL_MESSAGES.CHAT_MESSAGE,
      text,
      sender: senderName || 'Peer',
      timestamp: Date.now(),
    };
    sendDataChannelMessage(payload);
    return payload;
  }, [sendDataChannelMessage]);

  /**
   * Apply bandwidth degradation or restoration
   */
  const setDegradedMode = useCallback((degraded, rttValue) => {
    setIsAudioOnly(degraded);
    if (onDegradationStateChange) {
      onDegradationStateChange(degraded, rttValue);
    }

    // Imperatively toggle video track enabled status (never stop tracks)
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !degraded;
      });
    }

    // Broadcast across data channel to peer
    const message = {
      type: degraded ? DATA_CHANNEL_MESSAGES.NETWORK_DEGRADED : DATA_CHANNEL_MESSAGES.NETWORK_RESTORED,
      rtt: rttValue ? rttValue / 1000 : 0.5,
      timestamp: Date.now(),
    };
    sendDataChannelMessage(message);
  }, [onDegradationStateChange, sendDataChannelMessage]);

  /**
   * Flow C: Adaptive Bandwidth Fallback Loop
   * Polls getStats() and probes active network latency to accurately catch DevTools throttling & real carrier spikes.
   */
  const startStatsMonitoring = useCallback(() => {
    if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);

    statsIntervalRef.current = setInterval(async () => {
      let candidateRtt = null;
      let probeRtt = null;

      // 1. Measure WebRTC Candidate Pair RTT if connected
      const pc = peerConnectionRef.current;
      if (pc && pc.connectionState === 'connected') {
        try {
          const stats = await pc.getStats();
          let selectedCandidatePair = null;

          stats.forEach((report) => {
            if (
              report.type === 'candidate-pair' &&
              (report.selected || (report.state === 'succeeded' && report.nominated))
            ) {
              selectedCandidatePair = report;
            }
          });

          if (!selectedCandidatePair) {
            stats.forEach((report) => {
              if (report.type === 'candidate-pair' && typeof report.currentRoundTripTime !== 'undefined') {
                selectedCandidatePair = report;
              }
            });
          }

          if (selectedCandidatePair && typeof selectedCandidatePair.currentRoundTripTime !== 'undefined') {
            candidateRtt = selectedCandidatePair.currentRoundTripTime * 1000;
          }
        } catch (err) {
          console.warn('[PulseCare] Error reading getStats:', err);
        }
      }

      // 2. Active network probe (accurately measures Chrome DevTools Slow 3G / Fast 3G throttling & carrier latency)
      if (window.navigator.onLine) {
        const probeStart = performance.now();
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3500);
          await fetch('/health?probe=' + Date.now(), { 
            method: 'GET', 
            signal: controller.signal, 
            cache: 'no-store' 
          });
          clearTimeout(timer);
          probeRtt = performance.now() - probeStart;
        } catch (e) {
          // If aborted or failed, network is severely throttled / degraded
          probeRtt = 1100;
        }
      } else {
        probeRtt = 999;
      }

      // Effective RTT reflects the actual network bottleneck
      const effectiveRtt = Math.max(candidateRtt || 0, probeRtt || 0) || 45;
      setCurrentRtt(effectiveRtt);
      if (onRttUpdate) onRttUpdate(effectiveRtt);

      // Latency threshold evaluation (500ms cliff per PRD Section 3 & Acceptance Criteria #1)
      if (effectiveRtt > RTT_THRESHOLD_MS && !isAudioOnly) {
        console.warn(`[PulseCare] High Latency Detected: RTT=${effectiveRtt.toFixed(0)}ms > 500ms. Engaging audio-only fallback.`);
        setDegradedMode(true, effectiveRtt);
      } else if (effectiveRtt <= RTT_THRESHOLD_MS && isAudioOnly && window.navigator.onLine) {
        console.log(`[PulseCare] Latency Restored: RTT=${effectiveRtt.toFixed(0)}ms <= 500ms. Restoring video stream.`);
        setDegradedMode(false, effectiveRtt);
      }
    }, 2000);
  }, [isAudioOnly, setDegradedMode, onRttUpdate]);

  /**
   * Setup RTCDataChannel listener
   */
  const attachDataChannelListeners = useCallback((channel) => {
    channel.onopen = () => {
      console.log(`[PulseCare] RTCDataChannel '${channel.label}' opened.`);
    };

    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[PulseCare] RTCDataChannel message received:', data);

        if (data.type === DATA_CHANNEL_MESSAGES.NETWORK_DEGRADED) {
          setIsAudioOnly(true);
          if (onDegradationStateChange) onDegradationStateChange(true, data.rtt * 1000);
        } else if (data.type === DATA_CHANNEL_MESSAGES.NETWORK_RESTORED) {
          setIsAudioOnly(false);
          if (onDegradationStateChange) onDegradationStateChange(false, data.rtt * 1000);
        } else if (data.type === DATA_CHANNEL_MESSAGES.CHAT_MESSAGE) {
          if (onChatMessage) onChatMessage(data);
        }
      } catch (e) {
        console.error('[PulseCare] Failed to parse DataChannel payload:', e);
      }
    };

    channel.onclose = () => {
      console.log(`[PulseCare] RTCDataChannel '${channel.label}' closed.`);
    };
  }, [onDegradationStateChange, onChatMessage]);

  /**
   * Initialize RTCPeerConnection instance
   */
  const createPeerConnection = useCallback((roomId) => {
    roomIdRef.current = roomId;
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {}
    }
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerConnectionRef.current = pc;

    // Attach local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote track reception (robust to single-track or multi-stream events)
    pc.ontrack = (event) => {
      console.log('[PulseCare] Remote track received:', event.track.kind);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        if (onRemoteStream) onRemoteStream(event.streams[0]);
      } else {
        const fallbackStream = new MediaStream([event.track]);
        setRemoteStream(fallbackStream);
        if (onRemoteStream) onRemoteStream(fallbackStream);
      }
    };

    // Relay ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && onSendIceCandidate) {
        onSendIceCandidate(event.candidate, roomIdRef.current);
      }
    };

    // Connection lifecycle
    pc.onconnectionstatechange = () => {
      console.log('[PulseCare] RTCPeerConnection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallConnected(true);
        startStatsMonitoring();
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        setCallConnected(false);
        if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
      }
    };

    return pc;
  }, [onRemoteStream, onSendIceCandidate, startStatsMonitoring]);

  /**
   * Peer A (Doctor): Initiate Offer & create ui-state-sync DataChannel
   */
  const initiateOffer = useCallback(async (roomId) => {
    let stream = localStreamRef.current;
    if (!stream) {
      stream = await startLocalMedia();
    }

    const pc = createPeerConnection(roomId);

    // Create DataChannel named 'ui-state-sync' per architecture.md Section 6
    const dataChannel = pc.createDataChannel('ui-state-sync');
    dataChannelRef.current = dataChannel;
    attachDataChannelListeners(dataChannel);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    if (onSendOffer) {
      onSendOffer(offer, roomId);
    }
  }, [startLocalMedia, createPeerConnection, attachDataChannelListeners, onSendOffer]);

  /**
   * Peer B (Patient): Receive Offer, create Answer, and listen for DataChannel
   */
  const handleReceiveOffer = useCallback(async (sdp, roomId) => {
    let stream = localStreamRef.current;
    if (!stream) {
      stream = await startLocalMedia();
    }

    const pc = createPeerConnection(roomId);

    // Listen for incoming DataChannel
    pc.ondatachannel = (event) => {
      dataChannelRef.current = event.channel;
      attachDataChannelListeners(event.channel);
    };

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    // Flush any early buffered ICE candidates
    await flushIceCandidates(pc);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    if (onSendAnswer) {
      onSendAnswer(answer, roomId);
    }
  }, [startLocalMedia, createPeerConnection, attachDataChannelListeners, onSendAnswer]);

  /**
   * Helper to flush buffered ICE candidates
   */
  const flushIceCandidates = useCallback(async (pc) => {
    if (!pc) return;
    while (iceCandidateQueueRef.current.length > 0) {
      const candidate = iceCandidateQueueRef.current.shift();
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('[PulseCare] Error adding buffered ICE candidate:', err);
      }
    }
  }, []);

  /**
   * Peer A: Handle Answer from Peer B
   */
  const handleReceiveAnswer = useCallback(async (sdp) => {
    const pc = peerConnectionRef.current;
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      await flushIceCandidates(pc);
    }
  }, [flushIceCandidates]);

  /**
   * Add ICE candidate received from signaling (with buffering for early candidates)
   */
  const handleAddIceCandidate = useCallback(async (candidate) => {
    if (!candidate) return;
    const pc = peerConnectionRef.current;
    if (pc && pc.remoteDescription && pc.remoteDescription.type) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('[PulseCare] Error adding ICE candidate:', err);
      }
    } else {
      // Buffer until setRemoteDescription completes
      iceCandidateQueueRef.current.push(candidate);
    }
  }, []);

  /**
   * End and cleanup consultation call (completely stops camera/mic hardware)
   */
  const endCall = useCallback(() => {
    iceCandidateQueueRef.current = [];
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }

    if (dataChannelRef.current) {
      try {
        dataChannelRef.current.close();
      } catch (e) {}
      dataChannelRef.current = null;
    }

    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.getSenders().forEach((sender) => {
          if (sender.track) {
            sender.track.stop();
            sender.track.enabled = false;
          }
        });
        peerConnectionRef.current.close();
      } catch (e) {}
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => {
        t.stop();
        t.enabled = false;
      });
      localStreamRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsAudioOnly(false);
    setCallConnected(false);
    setCurrentRtt(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    localStream,
    remoteStream,
    isAudioOnly,
    currentRtt,
    cameraError,
    callConnected,
    startLocalMedia,
    initiateOffer,
    handleReceiveOffer,
    handleReceiveAnswer,
    handleAddIceCandidate,
    setDegradedMode,
    sendChatMessage,
    endCall,
  };
}
