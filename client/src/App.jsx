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

  // Global Language state ('en' | 'hi')
  const [lang, setLang] = useState('en');
  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'hi' : 'en'));

  // In-memory queue of patients (initialized with mock data per PRD Section 5)
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState(MOCK_PATIENTS[0]);
  const [activePrescriptions, setActivePrescriptions] = useState(MOCK_PRESCRIPTIONS);

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

  // Keep activeRoomIdRef in sync for unload listeners
  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
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
      setIncomingCall({
        roomId,
        callerId,
        doctorName: 'Dr. Ananya Sharma (District Tele-Hub 3)',
      });
      playIncomingRingtone();
    },
    onOffer: async ({ sdp, roomId }) => {
      console.log('[PulseCare] Received SDP offer in room:', roomId);
      setActiveRoomId(roomId);
      // If patient is not yet actively in a call, prompt incoming consultation modal
      if (!isDoctorInCall && !isPatientInCall) {
        setIncomingCall({
          roomId,
          sdp,
          doctorName: 'Dr. Ananya Sharma (District Tele-Hub 3)',
        });
        playIncomingRingtone();
      } else {
        // Active renegotiation
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
      // If doctor is in call and patient joined, re-initiate offer so negotiation connects instantly
      if (isDoctorInCall && role === 'patient') {
        console.log('[PulseCare] Doctor re-initiating offer for newly joined patient peer');
        await webrtc.initiateOffer(roomId);
      }
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
    },
  });
  signalingRef.current = signaling;

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
        onToggleLang={toggleLang}
        onOpenSmsUssd={() => setShowSmsUssdModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* ROUTE 1: HOME LANDING PAGE */}
        {currentRoute === 'home' && (
          <LandingPage onNavigate={navigateTo} />
        )}

        {/* ROUTE 2: PATIENT VIEW */}
        {currentRoute === 'patient' && (
          <div className="flex-1 flex flex-col">
            {patientQueueState ? (
              <CallInterface
                patientData={patientQueueState}
                isInCall={isPatientInCall}
                doctor={MOCK_DOCTOR}
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
                      />
                      {/* Doctor Local Self Video */}
                      <VideoPlayer
                        stream={webrtc.localStream}
                        isLocal={true}
                        isAudioOnly={isVideoDisabled}
                        peerName="Dr. Ananya Sharma"
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
    </div>
  );
}
