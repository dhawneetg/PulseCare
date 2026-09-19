import React, { useState, useEffect, useRef } from 'react';
import { Activity, User, Stethoscope, ShieldCheck, Wifi, Truck, HeartPulse } from 'lucide-react';
import Navbar from './components/common/Navbar.jsx';
import SymptomChecker from './components/patient/SymptomChecker.jsx';
import CallInterface from './components/patient/CallInterface.jsx';
import AshaTimeline from './components/patient/AshaTimeline.jsx';
import PatientQueue from './components/doctor/PatientQueue.jsx';
import PatientVitals from './components/doctor/PatientVitals.jsx';
import PrescriptionForm from './components/doctor/PrescriptionForm.jsx';
import VideoPlayer from './components/webrtc/VideoPlayer.jsx';
import CallControls from './components/webrtc/CallControls.jsx';
import { useSignaling } from './hooks/useSignaling.js';
import { useWebRTC } from './hooks/useWebRTC.js';
import LandingPage from './components/common/LandingPage.jsx';
import { CommandHeaderMetrics, VillageKioskMatrix, LocalEncryptedStorageWidget } from './components/doctor/TelecommandWidgets.jsx';
import EmergencyTextRelay from './components/common/EmergencyTextRelay.jsx';
import IncomingCallModal from './components/common/IncomingCallModal.jsx';
import AmbulanceDispatchModal from './components/doctor/AmbulanceDispatchModal.jsx';
import SmsUssdGatewayModal from './components/common/SmsUssdGatewayModal.jsx';
import ClinicalDatabaseModal from './components/database/ClinicalDatabaseModal.jsx';
import DoctorLoginModal from './components/doctor/DoctorLoginModal.jsx';
import ClinicalPhotoPacketizer from './components/common/ClinicalPhotoPacketizer.jsx';
import { playIncomingRingtone, stopIncomingRingtone } from './utils/audioChime.js';
import { MOCK_PATIENTS, MOCK_PRESCRIPTIONS, MOCK_DOCTOR } from './utils/mockData.js';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    const path = window.location.pathname;
    if (path.includes('/doctor')) return 'doctor';
    if (path.includes('/patient')) return 'patient';
    if (path.includes('/asha')) return 'asha';
    return 'home';
  });

  // Global Language state ('en' | 'hi' | 'bn')
  const [lang, setLang] = useState('en');
  const cycleLang = () => {
    setLang((prev) => {
      if (prev === 'en') return 'hi';
      if (prev === 'hi') return 'bn';
      return 'en';
    });
  };

  // In-memory queue of patients (initialized with mock data per PRD Section 5)
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState(MOCK_PATIENTS[0]);
  const [activePrescriptions, setActivePrescriptions] = useState(MOCK_PRESCRIPTIONS);

  // New Clinical Database, Doctor Login, and 2G Clinical Photo States
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showDoctorLoginModal, setShowDoctorLoginModal] = useState(false);
  const [showClinicalPhotoModal, setShowClinicalPhotoModal] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(MOCK_DOCTOR);
  const [incomingImageStream, setIncomingImageStream] = useState(null);
  const packetBuffersRef = useRef({});

  // Patient view state
  const [patientQueueState, setPatientQueueState] = useState(null); // null = filling questionnaire, object = in queue/call
  const [activeRoomId, setActiveRoomId] = useState(null);
  const activeRoomIdRef = useRef(null);

  // Active call & WebRTC state
  const [isDoctorInCall, setIsDoctorInCall] = useState(false);
  const [isPatientInCall, setIsPatientInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [networkStatus, setNetworkStatus] = useState('stable'); // 'stable' | 'degraded' | 'offline'
  const [simulatedRtt, setSimulatedRtt] = useState(42);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showSmsUssdModal, setShowSmsUssdModal] = useState(false);
  const [remoteRelayFrame, setRemoteRelayFrame] = useState(null);

  // Keep activeRoomIdRef in sync for unload listeners
  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
    if (!activeRoomId) {
      setRemoteRelayFrame(null);
    }
  }, [activeRoomId]);

  const signalingRef = useRef(null);

  // WebRTC Hook
  const webrtc = useWebRTC({
    onRemoteStream: (stream) => {
      console.log('[PulseCare] Attached remote stream');
    },
    onDegradationStateChange: (degraded, rttValue) => {
      setNetworkStatus(degraded ? 'degraded' : 'stable');
      if (rttValue) setSimulatedRtt(rttValue);
      if (degraded) {
        setIsChatOpen(true);
      }
    },
    onRttUpdate: (rttValue) => {
      if (rttValue) setSimulatedRtt(rttValue);
    },
    onChatMessage: (msg) => {
      console.log('[PulseCare] WebRTC DataChannel message:', msg);
      setChatMessages((prev) => {
        const exists = prev.some(
          (m) => (m.id && msg.id && m.id === msg.id) ||
                 (m.text === msg.text && Math.abs((m.timestamp || 0) - (msg.timestamp || 0)) < 2000)
        );
        if (exists) return prev;
        return [...prev, msg];
      });
      setIsChatOpen(true);
    },
    onSendOffer: (sdp, roomId) => {
      signalingRef.current?.sendOffer(sdp, roomId);
    },
    onSendAnswer: (sdp, roomId) => {
      signalingRef.current?.sendAnswer(sdp, roomId);
    },
    onSendIceCandidate: (candidate, roomId) => {
      signalingRef.current?.sendIceCandidate(candidate, roomId);
    },
  });

  // Signaling Bridge Hook
  const signaling = useSignaling({
    onQueueUpdated: (serverQueue) => {
      if (serverQueue && serverQueue.length > 0) {
        // Merge server queue with mock baseline so demo always has rich data
        const serverIds = new Set(serverQueue.map((p) => p.id));
        const combined = [...serverQueue, ...MOCK_PATIENTS.filter((p) => !serverIds.has(p.id))];
        setPatients(combined);
      }
    },
    onIncomingCall: async ({ callerId, roomId }) => {
      console.log(`[PulseCare] Incoming call from doctor ${callerId} in room ${roomId}`);
      setActiveRoomId(roomId);
      // Immediately join room so any server-buffered SDP offers & ICE candidates arrive
      signaling.joinRoom(roomId, 'patient');

      if (isPatientInCall || currentRoute === 'patient') {
        // Patient is already on the tele-consultation screen waiting for MD: auto-connect
        console.log('[PulseCare] Patient already on consultation screen, auto-activating media...');
        setIsPatientInCall(true);
        await webrtc.startLocalMedia();
      } else {
        setIncomingCall({
          roomId,
          callerId,
          doctorName: 'Dr. Ananya Sharma (District Tele-Hub 3)',
        });
        playIncomingRingtone();
      }
    },
    onOffer: async ({ sdp, roomId }) => {
      console.log('[PulseCare] Received SDP offer in room:', roomId);
      setActiveRoomId(roomId);

      // If on patient screen or already in call, accept offer immediately
      if (currentRoute === 'patient' || isPatientInCall) {
        setIsPatientInCall(true);
        stopIncomingRingtone();
        setIncomingCall(null);
        await webrtc.handleReceiveOffer(sdp, roomId);
      } else if (!isDoctorInCall && !isPatientInCall) {
        setIncomingCall((prev) => ({
          ...(prev || {}),
          roomId,
          sdp,
          doctorName: 'Dr. Ananya Sharma (District Tele-Hub 3)',
        }));
        playIncomingRingtone();
      } else {
        await webrtc.handleReceiveOffer(sdp, roomId);
      }
    },
    onAnswer: async ({ sdp }) => {
      console.log('[PulseCare] Received SDP answer');
      await webrtc.handleReceiveAnswer(sdp);
    },
    onIceCandidate: async ({ candidate }) => {
      await webrtc.handleAddIceCandidate(candidate);
    },
    onTextRelay: (payload) => {
      console.log('[PulseCare] Received Socket.io Text Relay:', payload);
      setChatMessages((prev) => {
        const exists = prev.some(
          (m) => (m.id && payload.id && m.id === payload.id) ||
                 (m.text === payload.text && Math.abs((m.timestamp || 0) - (payload.timestamp || 0)) < 2000)
        );
        if (exists) return prev;
        return [...prev, payload];
      });
      setIsChatOpen(true);
    },
    onPeerJoined: async ({ peerId, roomId, role }) => {
      console.log(`[PulseCare] Peer ${peerId} (${role}) joined room ${roomId}`);
      // If doctor is in call, re-initiate offer & candidates so peer connects without manual refresh
      if (isDoctorInCall) {
        console.log('[PulseCare] Doctor re-negotiating offer for newly joined peer');
        await webrtc.initiateOffer(roomId);
      }
    },
    onAudioChunk: ({ chunk }) => {
      try {
        const blob = new Blob([chunk], { type: 'audio/webm;codecs=opus' });
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.volume = 1.0;
        audio.play().catch(() => {});
      } catch (e) {}
    },
    onVideoFrame: ({ frame }) => {
      setRemoteRelayFrame(frame);
    },
    onImagePacket: ({ packet }) => {
      handleIncomingImagePacket(packet);
    },
    onCallEnded: ({ reason } = {}) => {
      console.log('[PulseCare] Remote peer ended consultation:', reason || 'Disconnected');
      stopIncomingRingtone();
      setIncomingCall(null);
      webrtc.endCall();
      setIsDoctorInCall(false);
      setIsPatientInCall(false);
      setActiveRoomId(null);
      setPatientQueueState(null);
      setRemoteRelayFrame(null);
    },
  });
  signalingRef.current = signaling;

  // Handle incoming 2G packet chunks
  const handleIncomingImagePacket = (packet) => {
    if (!packet || !packet.imageId) return;
    const { imageId, title, index, totalChunks, chunk } = packet;

    if (!packetBuffersRef.current[imageId]) {
      packetBuffersRef.current[imageId] = {
        title,
        chunks: new Array(totalChunks).fill(null),
        received: 0,
        totalChunks
      };
    }

    const buf = packetBuffersRef.current[imageId];
    if (!buf.chunks[index]) {
      buf.chunks[index] = chunk;
      buf.received++;
    }

    const progress = Math.round((buf.received / totalChunks) * 100);

    if (buf.received >= totalChunks) {
      const fullDataUrl = buf.chunks.join('');
      setIncomingImageStream({
        imageId,
        title,
        progress: 100,
        dataUrl: fullDataUrl,
        complete: true
      });
      setShowClinicalPhotoModal(true);
    } else {
      setIncomingImageStream({
        imageId,
        title,
        progress,
        received: buf.received,
        total: totalChunks,
        complete: false
      });
    }
  };

  // Stream local audio chunks over Socket.io as low-bandwidth fallback (bypasses NAT / carrier firewalls)
  useEffect(() => {
    if (!activeRoomId || !webrtc.localStream || isAudioMuted) return;
    const audioTracks = webrtc.localStream.getAudioTracks();
    if (audioTracks.length === 0) return;

    let mediaRecorder = null;
    try {
      const audioStream = new MediaStream(audioTracks);
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';

      mediaRecorder = mimeType ? new MediaRecorder(audioStream, { mimeType }) : new MediaRecorder(audioStream);
      mediaRecorder.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0 && activeRoomIdRef.current) {
          const buffer = await e.data.arrayBuffer();
          signalingRef.current?.sendAudioChunk(activeRoomIdRef.current, buffer);
        }
      };
      mediaRecorder.start(800); // 800ms chunks for smooth speech
    } catch (err) {
      console.warn('[PulseCare] Audio recorder fallback note:', err);
    }

    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        try { mediaRecorder.stop(); } catch (e) {}
      }
    };
  }, [activeRoomId, webrtc.localStream, isAudioMuted]);

  // Stream local video snapshots over Socket.io as adaptive 2G visual fallback (1.5 FPS, ~4KB per frame)
  useEffect(() => {
    if (!activeRoomId || !webrtc.localStream || isVideoDisabled) return;
    const videoTracks = webrtc.localStream.getVideoTracks();
    if (videoTracks.length === 0) return;

    const offscreenVideo = document.createElement('video');
    offscreenVideo.muted = true;
    offscreenVideo.playsInline = true;
    offscreenVideo.srcObject = webrtc.localStream;
    offscreenVideo.play().catch(() => {});

    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');

    const frameInterval = setInterval(() => {
      if (!activeRoomIdRef.current) return;
      if (offscreenVideo.videoWidth > 0) {
        ctx.drawImage(offscreenVideo, 0, 0, 320, 240);
        const frameData = canvas.toDataURL('image/jpeg', 0.4);
        signalingRef.current?.sendVideoFrame(activeRoomIdRef.current, frameData);
      }
    }, 700);

    return () => {
      clearInterval(frameInterval);
      offscreenVideo.srcObject = null;
    };
  }, [activeRoomId, webrtc.localStream, isVideoDisabled]);

  const handleReconnectConsultation = async () => {
    if (activeRoomId) {
      console.log('[PulseCare] User initiated manual WebRTC stream reconnection:', activeRoomId);
      if (currentRoute === 'doctor' || isDoctorInCall) {
        await webrtc.forceRenegotiate(activeRoomId);
      } else {
        await webrtc.startLocalMedia();
        signaling.joinRoom(activeRoomId, 'patient');
      }
    }
  };

  const handleAcceptIncomingCall = async () => {
    stopIncomingRingtone();
    const callData = incomingCall;
    setIncomingCall(null);
    if (!callData) return;

    setIsPatientInCall(true);
    signaling.joinRoom(callData.roomId, 'patient');
    if (callData.sdp) {
      await webrtc.handleReceiveOffer(callData.sdp, callData.roomId);
    } else {
      await webrtc.startLocalMedia();
    }
  };

  const handleDeclineIncomingCall = () => {
    stopIncomingRingtone();
    if (incomingCall?.roomId) {
      signaling.sendCallEnded(incomingCall.roomId, 'Patient declined consultation');
    }
    setIncomingCall(null);
  };

  const navigateTo = (route) => {
    const path = route === 'home' ? '/' : `/${route}`;
    window.history.pushState({}, '', path);
    setCurrentRoute(route);
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.includes('/doctor')) setCurrentRoute('doctor');
      else if (path.includes('/patient')) setCurrentRoute('patient');
      else if (path.includes('/asha')) setCurrentRoute('asha');
      else setCurrentRoute('home');
    };

    const handleOnline = () => {
      console.log('[PulseCare] Browser reports online state');
      setNetworkStatus('stable');
      webrtc.setDegradedMode(false, 42);
      setSimulatedRtt(42);
    };

    const handleOffline = () => {
      console.warn('[PulseCare] Browser reports offline state');
      setNetworkStatus('offline');
      webrtc.setDegradedMode(true, 999, 'offline');
      setSimulatedRtt(999);
    };

    // Broadcast call-ended immediately if user closes or reloads the tab
    const handleBeforeUnload = () => {
      if (activeRoomIdRef.current) {
        signaling.endCallSignaling(activeRoomIdRef.current);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [webrtc, signaling]);

  // Handle patient joining queue from offline SymptomChecker - launches video consultation immediately
  const handleJoinQueue = (newPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setSelectedPatient(newPatient);
    setPatientQueueState(newPatient);
    setIsPatientInCall(true); // Launch consultation immediately so video starts
    webrtc.startLocalMedia(); // Immediately activate camera

    // Emit join-queue to signaling server
    signaling.joinQueue(newPatient);
  };

  // Doctor initiates consultation with selected patient
  const handleInitiateCall = async (patient) => {
    setSelectedPatient(patient);
    setIsDoctorInCall(true);
    const roomId = `room_${patient.id || 'p'}_${Date.now()}`;
    setActiveRoomId(roomId);

    // Doctor joins socket room explicitly
    signaling.joinRoom(roomId, 'doctor');

    // Emit call-initiate via signaling
    signaling.initiateCall(patient.socketId || patient.id, roomId);

    // Doctor initiates offer
    await webrtc.initiateOffer(roomId);

    if (patientQueueState && patientQueueState.id === patient.id) {
      setIsPatientInCall(true);
    }
  };

  // Multi-tier Network State Switcher: 4G -> 3G -> 2G (Audio Fallback) -> Offline (Text Relay)
  const handleSetNetworkMode = (mode) => {
    if (mode === '4g') {
      webrtc.setDegradedMode(false, 40, '4g');
      setNetworkStatus('stable');
      setSimulatedRtt(40);
    } else if (mode === '3g') {
      webrtc.setDegradedMode(false, 185, '3g');
      setNetworkStatus('stable');
      setSimulatedRtt(185);
    } else if (mode === '2g') {
      webrtc.setDegradedMode(true, 580, '2g');
      setNetworkStatus('degraded');
      setSimulatedRtt(580);
      setIsChatOpen(true);
    } else if (mode === 'offline') {
      webrtc.setDegradedMode(true, 999, 'offline');
      setNetworkStatus('offline');
      setSimulatedRtt(999);
      setIsChatOpen(true);
    }
  };

  const handleSimulateDegradation = (targetMode) => {
    if (targetMode && typeof targetMode === 'string') {
      handleSetNetworkMode(targetMode);
      return;
    }
    if (networkStatus === 'stable') {
      handleSetNetworkMode('2g');
    } else {
      handleSetNetworkMode('4g');
    }
  };

  // Dual-channel Clinical Emergency Text Relay (WebRTC DataChannel + Socket.io fallback)
  const handleSendChatMessage = (text) => {
    const role = currentRoute === 'doctor' ? 'Doctor' : 'Patient';
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const payload = {
      id: msgId,
      type: 'CHAT_MESSAGE',
      text,
      sender: role,
      timestamp: Date.now(),
    };

    // 1. Send via WebRTC DataChannel (if open)
    try {
      webrtc.sendChatMessage(text, role);
    } catch (e) {
      console.warn('[PulseCare] WebRTC DataChannel send failed, using socket fallback:', e);
    }

    // 2. Dual-channel fail-safe: Send via Socket.io signaling relay to room
    if (activeRoomId) {
      signaling.sendTextRelay(activeRoomId, payload);
    }

    // 3. Optimistic local update
    setChatMessages((prev) => [...prev, payload]);
  };

  const handleEndConsultation = () => {
    if (activeRoomId) {
      signaling.endCallSignaling(activeRoomId);
    }
    webrtc.endCall();
    setIsDoctorInCall(false);
    setIsPatientInCall(false);
    setActiveRoomId(null);
    setPatientQueueState(null);
  };

  // Doctor issues prescription -> syncs to ASHA timeline
  const handleIssuePrescription = (rxRecord) => {
    setActivePrescriptions((prev) => [rxRecord, ...prev]);
    setPatients((prev) => prev.filter((p) => p.id !== rxRecord.patientId));
    handleEndConsultation();
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900">
      {/* Universal Top Header */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        networkStatus={networkStatus}
        rtt={simulatedRtt}
        lang={lang}
        onCycleLang={cycleLang}
        onOpenSmsUssd={() => setShowSmsUssdModal(true)}
        onOpenDatabase={() => setShowDatabaseModal(true)}
        onOpenDoctorLogin={() => setShowDoctorLoginModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* ROUTE 1: HOME LANDING PAGE */}
        {currentRoute === 'home' && (
          <LandingPage 
            onNavigate={navigateTo} 
            lang={lang}
            onOpenDatabase={() => setShowDatabaseModal(true)}
            onOpenDoctorLogin={() => setShowDoctorLoginModal(true)}
          />
        )}

        {/* ROUTE 2: PATIENT VIEW */}
        {currentRoute === 'patient' && (
          <div className="flex-1 flex flex-col">
            {patientQueueState ? (
              <CallInterface
                patientData={patientQueueState}
                isInCall={isPatientInCall}
                doctor={currentDoctor}
                localStream={webrtc.localStream}
                remoteStream={webrtc.remoteStream}
                isAudioOnly={networkStatus === 'degraded'}
                rtt={simulatedRtt}
                networkStatus={networkStatus}
                cameraError={webrtc.cameraError}
                isAudioMuted={isAudioMuted}
                isVideoDisabled={isVideoDisabled}
                onToggleAudio={() => setIsAudioMuted(!isAudioMuted)}
                onToggleVideo={() => setIsVideoDisabled(!isVideoDisabled)}
                onEndCall={handleEndConsultation}
                onSimulateDegradation={handleSimulateDegradation}
                onSetNetworkMode={handleSetNetworkMode}
                onStartCall={() => {
                  setIsPatientInCall(true);
                  webrtc.startLocalMedia();
                }}
                onStartMedia={webrtc.startLocalMedia}
                messages={chatMessages}
                onSendMessage={handleSendChatMessage}
                isChatOpen={isChatOpen}
                onToggleChat={() => setIsChatOpen(!isChatOpen)}
                onReconnect={handleReconnectConsultation}
                onOpenClinicalPhoto={() => setShowClinicalPhotoModal(true)}
                relayFrame={remoteRelayFrame}
                lang={lang}
              />
            ) : (
              <SymptomChecker onJoinQueue={handleJoinQueue} lang={lang} />
            )}
          </div>
        )}

        {/* ROUTE 3: DOCTOR HUB WORKSPACE (CSS Grid grid-cols-12 per design.md) */}
        {currentRoute === 'doctor' && (
          <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
            {/* Top Telecommand Header Bar */}
            <CommandHeaderMetrics 
              queueCount={patients.length} 
              onDispatch108={() => setShowDispatchModal(true)}
              onOpenDatabase={() => setShowDatabaseModal(true)}
              onOpenDoctorLogin={() => setShowDoctorLoginModal(true)}
              lang={lang}
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[calc(100vh-8rem)]">
              {/* Left Sidebar: Patient Queue + Kiosk Telemetry + Local Storage */}
              <div className={`md:col-span-5 lg:col-span-4 space-y-6 ${isDoctorInCall ? 'order-2 md:order-1' : 'order-1'}`}>
                <div className="h-[460px] md:h-[600px]">
                  <PatientQueue
                    patients={patients}
                    selectedPatientId={selectedPatient?.id}
                    onSelectPatient={(p) => setSelectedPatient(p)}
                    onInitiateCall={handleInitiateCall}
                  />
                </div>
                <VillageKioskMatrix />
                <LocalEncryptedStorageWidget />
              </div>

              {/* Main Canvas: Video Grid + Vitals + Rx Generator */}
              <div className={`md:col-span-7 lg:col-span-8 space-y-6 ${isDoctorInCall ? 'order-1 md:order-2' : 'order-2'}`}>
                {/* Active Video Call Interface */}
                {isDoctorInCall && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Patient Remote Video */}
                      <VideoPlayer
                        stream={webrtc.remoteStream}
                        fallbackStream={webrtc.localStream}
                        isLocal={false}
                        isAudioOnly={networkStatus === 'degraded'}
                        peerName={selectedPatient?.name || 'Patient'}
                        rtt={simulatedRtt}
                        onStartMedia={webrtc.startLocalMedia}
                        onReconnect={handleReconnectConsultation}
                        relayFrame={remoteRelayFrame}
                      />
                      {/* Doctor Local Self Video */}
                      <VideoPlayer
                        stream={webrtc.localStream}
                        isLocal={true}
                        isAudioOnly={isVideoDisabled}
                        peerName={currentDoctor?.name || "Dr. Ananya Sharma"}
                        onStartMedia={webrtc.startLocalMedia}
                      />
                    </div>

                    <CallControls
                      isAudioMuted={isAudioMuted}
                      isVideoDisabled={isVideoDisabled}
                      onToggleAudio={() => setIsAudioMuted(!isAudioMuted)}
                      onToggleVideo={() => setIsVideoDisabled(!isVideoDisabled)}
                      onEndCall={handleEndConsultation}
                      onSimulateDegradation={handleSimulateDegradation}
                      onSetNetworkMode={handleSetNetworkMode}
                      networkStatus={networkStatus}
                      currentRtt={simulatedRtt}
                      isDegraded={networkStatus === 'degraded'}
                      isChatOpen={isChatOpen}
                      onToggleChat={() => setIsChatOpen(!isChatOpen)}
                      onReconnect={handleReconnectConsultation}
                      onOpenClinicalPhoto={() => setShowClinicalPhotoModal(true)}
                      lang={lang}
                    />

                    {/* Emergency Clinical Text Relay for Doctor */}
                    {(isChatOpen || networkStatus === 'degraded' || networkStatus === 'offline') && (
                      <EmergencyTextRelay
                        messages={chatMessages}
                        onSendMessage={handleSendChatMessage}
                        currentUserRole="Doctor"
                        isOffline={networkStatus === 'offline'}
                        isAudioOnly={networkStatus === 'degraded'}
                        lang={lang}
                      />
                    )}
                  </div>
                )}

                {/* Patient Clinical Vitals Summary */}
                <PatientVitals 
                  patient={selectedPatient} 
                  onDispatch108={() => setShowDispatchModal(true)}
                />

                {/* Prescription & ASHA Dispatch Form */}
                <PrescriptionForm
                  patient={selectedPatient}
                  onIssuePrescription={handleIssuePrescription}
                />
              </div>
            </div>
          </div>
        )}

        {/* ROUTE 4: ASHA COMMUNITY WORKLOAD & LOGISTICS DASHBOARD */}
        {currentRoute === 'asha' && (
          <AshaTimeline
            prescription={activePrescriptions[0]}
            onBack={() => navigateTo('home')}
            lang={lang}
          />
        )}
      </main>

      {/* 2G Clinical Photo Stream Notification Toast */}
      {incomingImageStream && (
        <div className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-amber-400/40 max-w-sm animate-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>2G Clinical Packet Relay Active</span>
              </div>
              <p className="text-sm font-bold text-white mt-1">
                {incomingImageStream.title || 'Clinical Photo'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {incomingImageStream.complete 
                  ? '✅ 100% Reassembled via 2G Packets' 
                  : `Receiving: ${incomingImageStream.progress}% (${incomingImageStream.received}/${incomingImageStream.total} packets)`}
              </p>
            </div>
            <button
              onClick={() => setShowClinicalPhotoModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 shadow-sm"
            >
              {incomingImageStream.complete ? 'Inspect Photo' : 'View Stream'}
            </button>
          </div>
        </div>
      )}

      {/* Global Incoming Doctor Consultation Banner & Ringtone Modal */}
      <IncomingCallModal
        incomingCall={incomingCall}
        onAccept={handleAcceptIncomingCall}
        onDecline={handleDeclineIncomingCall}
        lang={lang}
      />

      {/* 108 Emergency Ambulance Dispatch Modal */}
      <AmbulanceDispatchModal
        isOpen={showDispatchModal}
        onClose={() => setShowDispatchModal(false)}
        patient={selectedPatient}
        lang={lang}
      />

      {/* Offline SMS and USSD (*144#) Fallback Gateway Modal */}
      <SmsUssdGatewayModal
        isOpen={showSmsUssdModal}
        onClose={() => setShowSmsUssdModal(false)}
        lang={lang}
      />

      {/* Clinical Relational Database Modal (Doctors & Applied Patients Registry Table) */}
      <ClinicalDatabaseModal
        isOpen={showDatabaseModal}
        onClose={() => setShowDatabaseModal(false)}
        patients={patients}
        onSelectPatientForCall={(p) => {
          setSelectedPatient(p);
          if (currentRoute !== 'doctor') navigateTo('doctor');
        }}
        lang={lang}
      />

      {/* Doctor Council Credentials Verification & Login Modal */}
      <DoctorLoginModal
        isOpen={showDoctorLoginModal}
        onClose={() => setShowDoctorLoginModal(false)}
        currentDoctor={currentDoctor}
        onLoginSuccess={(updatedDoc) => setCurrentDoctor(updatedDoc)}
        lang={lang}
      />

      {/* 2G High-Res Clinical Photo Packetizer Modal */}
      <ClinicalPhotoPacketizer
        isOpen={showClinicalPhotoModal}
        onClose={() => setShowClinicalPhotoModal(false)}
        roomId={activeRoomId}
        onSendPacket={(rId, packet) => {
          signalingRef.current?.sendImagePacket(rId, packet);
        }}
        incomingPackets={incomingImageStream}
        lang={lang}
      />
    </div>
  );
}
