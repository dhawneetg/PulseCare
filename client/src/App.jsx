import React, { useState, useEffect } from 'react';
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
import { MOCK_PATIENTS, MOCK_PRESCRIPTIONS, MOCK_DOCTOR } from './utils/mockData.js';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    const path = window.location.pathname;
    if (path.includes('/doctor')) return 'doctor';
    if (path.includes('/patient')) return 'patient';
    if (path.includes('/asha')) return 'asha';
    return 'home';
  });

  // In-memory queue of patients (initialized with mock data per PRD Section 5)
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState(MOCK_PATIENTS[0]);
  const [activePrescriptions, setActivePrescriptions] = useState(MOCK_PRESCRIPTIONS);

  // Patient view state
  const [patientQueueState, setPatientQueueState] = useState(null); // null = filling questionnaire, object = in queue/call
  const [activeRoomId, setActiveRoomId] = useState(null);

  // Active call & WebRTC state
  const [isDoctorInCall, setIsDoctorInCall] = useState(false);
  const [isPatientInCall, setIsPatientInCall] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('stable'); // 'stable' | 'degraded'
  const [simulatedRtt, setSimulatedRtt] = useState(120);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // WebRTC Hook
  const webrtc = useWebRTC({
    onRemoteStream: (stream) => {
      console.log('[PulseCare] Attached remote stream');
    },
    onDegradationStateChange: (degraded, rttValue) => {
      setNetworkStatus(degraded ? 'degraded' : 'stable');
      if (rttValue) setSimulatedRtt(rttValue);
    },
    onRttUpdate: (rttValue) => {
      if (rttValue) setSimulatedRtt(rttValue);
    },
    onChatMessage: (msg) => {
      setChatMessages((prev) => [...prev, msg]);
      setIsChatOpen(true);
    },
    onSendOffer: (offer, roomId) => {
      signaling.sendOffer(offer, roomId);
    },
    onSendAnswer: (answer, roomId) => {
      signaling.sendAnswer(answer, roomId);
    },
    onSendIceCandidate: (candidate, roomId) => {
      signaling.sendIceCandidate(candidate, roomId);
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
      setIsPatientInCall(true);
      await webrtc.startLocalMedia();
    },
    onOffer: async ({ sdp, roomId }) => {
      console.log('[PulseCare] Received SDP offer');
      setActiveRoomId(roomId);
      await webrtc.handleReceiveOffer(sdp, roomId);
    },
    onAnswer: async ({ sdp }) => {
      console.log('[PulseCare] Received SDP answer');
      await webrtc.handleReceiveAnswer(sdp);
    },
    onIceCandidate: async ({ candidate }) => {
      await webrtc.handleAddIceCandidate(candidate);
    },
    onCallEnded: () => {
      console.log('[PulseCare] Remote peer ended the consultation');
      webrtc.endCall();
      setIsDoctorInCall(false);
      setIsPatientInCall(false);
      setActiveRoomId(null);
      setPatientQueueState(null);
    },
  });

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
      webrtc.setDegradedMode(false, 95);
      setSimulatedRtt(95);
    };

    const handleOffline = () => {
      console.warn('[PulseCare] Browser reports offline state');
      setNetworkStatus('offline');
      webrtc.setDegradedMode(true, 999);
      setSimulatedRtt(999);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [webrtc]);

  // Handle patient joining queue from offline SymptomChecker
  const handleJoinQueue = (newPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setSelectedPatient(newPatient);
    setPatientQueueState(newPatient);

    // Emit join-queue to signaling server
    signaling.joinQueue(newPatient);
  };

  // Doctor initiates consultation with selected patient
  const handleInitiateCall = async (patient) => {
    setSelectedPatient(patient);
    setIsDoctorInCall(true);
    const roomId = `room_${patient.id}_${Date.now()}`;
    setActiveRoomId(roomId);

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
      webrtc.setDegradedMode(false, 38);
      setNetworkStatus('stable');
      setSimulatedRtt(38);
    } else if (mode === '3g') {
      webrtc.setDegradedMode(false, 185);
      setNetworkStatus('stable');
      setSimulatedRtt(185);
    } else if (mode === '2g') {
      webrtc.setDegradedMode(true, 580);
      setNetworkStatus('degraded');
      setSimulatedRtt(580);
    } else if (mode === 'offline') {
      webrtc.setDegradedMode(true, 999);
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

  const handleSendChatMessage = (text) => {
    const role = currentRoute === 'doctor' ? 'Doctor' : 'Patient';
    const payload = webrtc.sendChatMessage(text, role);
    if (payload) {
      setChatMessages((prev) => [...prev, payload]);
    }
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
                messages={chatMessages}
                onSendMessage={handleSendChatMessage}
                isChatOpen={isChatOpen}
                onToggleChat={() => setIsChatOpen(!isChatOpen)}
              />
            ) : (
              <SymptomChecker onJoinQueue={handleJoinQueue} />
            )}
          </div>
        )}

        {/* ROUTE 3: DOCTOR HUB WORKSPACE (CSS Grid grid-cols-12 per design.md) */}
        {currentRoute === 'doctor' && (
          <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
            {/* Top Telecommand Header Bar */}
            <CommandHeaderMetrics queueCount={patients.length} />

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
                        isLocal={false}
                        isAudioOnly={networkStatus === 'degraded'}
                        peerName={selectedPatient?.name || 'Patient'}
                        rtt={simulatedRtt}
                      />
                      {/* Doctor Local Self Video */}
                      <VideoPlayer
                        stream={webrtc.localStream}
                        isLocal={true}
                        isAudioOnly={isVideoDisabled}
                        peerName="Dr. Ananya Sharma"
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
                    />

                    {/* Emergency Clinical Text Relay for Doctor */}
                    {(isChatOpen || networkStatus === 'offline') && (
                      <EmergencyTextRelay
                        messages={chatMessages}
                        onSendMessage={handleSendChatMessage}
                        currentUserRole="Doctor"
                        isOffline={networkStatus === 'offline'}
                        isAudioOnly={networkStatus === 'degraded'}
                      />
                    )}
                  </div>
                )}

                {/* Patient Clinical Vitals Summary */}
                <PatientVitals patient={selectedPatient} />

                {/* Prescription & ASHA Dispatch Form */}
                <PrescriptionForm
                  patient={selectedPatient}
                  onIssuePrescription={handleIssuePrescription}
                />
              </div>
            </div>
          </div>
        )}

        {/* ROUTE 4: ASHA DELIVERY TIMELINE (Static Mockup per PRD Section 4.4 & Flow D) */}
        {currentRoute === 'asha' && (
          <AshaTimeline
            prescription={activePrescriptions[0]}
            onBack={() => navigateTo('home')}
          />
        )}
      </main>
    </div>
  );
}
