import { useState, useRef, useEffect, useCallback } from 'react';
import { DATA_CHANNEL_MESSAGES } from '../types/index.js';

// Canonical ICE config per architecture.md Section 3 (STUN + TURN Open Relay Project with full multi-port traversal)
export const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
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
];

// Baseline media constraints requested at call start per architecture.md Section 3
export const MEDIA_CONSTRAINTS = {
  video: { width: 320, height: 240, frameRate: 15 },
  audio: true,
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
  const dataChannelRef = useRef(null);
  const statsIntervalRef = useRef(null);
  const roomIdRef = useRef(null);
  const iceCandidateQueueRef = useRef([]);

  /**
   * Acquire local user media with 320x240/15fps baseline.
   * Gracefully falls back to audio-only if camera access is denied.
   */
  const startLocalMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
      localStreamRef.current = stream;
      setLocalStream(stream);
      setCameraError(null);
      return stream;
    } catch (err) {
      console.warn('[PulseCare] Video capture denied or unavailable, attempting audio-only:', err);
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = audioStream;
        setLocalStream(audioStream);
        setCameraError('Camera unavailable. Continuing with audio only.');
        setIsAudioOnly(true);
        return audioStream;
      } catch (audioErr) {
        console.error('[PulseCare] Fatal: Microphone access also denied:', audioErr);
        setCameraError('Microphone permission required for medical consultation.');
        return null;
      }
    }
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
   * Polls getStats() every 2000ms strictly measuring candidate-pair RTT
   */
  const startStatsMonitoring = useCallback(() => {
    if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);

    statsIntervalRef.current = setInterval(async () => {
      const pc = peerConnectionRef.current;
      if (!pc || pc.connectionState !== 'connected') return;

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

        // Fallback: find any active candidate-pair with RTT available
        if (!selectedCandidatePair) {
          stats.forEach((report) => {
            if (report.type === 'candidate-pair' && typeof report.currentRoundTripTime !== 'undefined') {
              selectedCandidatePair = report;
            }
          });
        }

        if (selectedCandidatePair && typeof selectedCandidatePair.currentRoundTripTime !== 'undefined') {
          const rttMs = selectedCandidatePair.currentRoundTripTime * 1000;
          setCurrentRtt(rttMs);
          if (onRttUpdate) onRttUpdate(rttMs);

          // Latency threshold evaluation (500ms)
          if (rttMs > RTT_THRESHOLD_MS && !isAudioOnly) {
            console.warn(`[PulseCare] High Latency Detected: RTT=${rttMs.toFixed(1)}ms > 500ms. Engaging audio-only fallback.`);
            setDegradedMode(true, rttMs);
          } else if (rttMs <= RTT_THRESHOLD_MS && isAudioOnly) {
            console.log(`[PulseCare] Network Latency Restored: RTT=${rttMs.toFixed(1)}ms <= 500ms. Restoring video stream.`);
            setDegradedMode(false, rttMs);
          }
        }
      } catch (err) {
        console.warn('[PulseCare] Error reading getStats:', err);
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
        }
      } catch (e) {
        console.error('[PulseCare] Failed to parse DataChannel payload:', e);
      }
    };

    channel.onclose = () => {
      console.log(`[PulseCare] RTCDataChannel '${channel.label}' closed.`);
    };
  }, [onDegradationStateChange]);

  /**
   * Initialize RTCPeerConnection instance
   */
  const createPeerConnection = useCallback((roomId) => {
    roomIdRef.current = roomId;
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
    endCall,
  };
}
