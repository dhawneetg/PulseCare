import React from 'react';
import { PhoneCall, Clock, CheckCircle2, User, Stethoscope, AlertTriangle } from 'lucide-react';
import VideoPlayer from '../webrtc/VideoPlayer.jsx';
import CallControls from '../webrtc/CallControls.jsx';

import EmergencyTextRelay from '../common/EmergencyTextRelay.jsx';

export default function CallInterface({
  patientData,
  queuePosition = 1,
  isInCall = false,
  doctor = null,
  localStream = null,
  remoteStream = null,
  isAudioOnly = false,
  rtt = null,
  networkStatus = 'stable',
  cameraError = null,
  isAudioMuted = false,
  isVideoDisabled = false,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
  onSimulateDegradation,
  onSetNetworkMode,
  messages = [],
  onSendMessage,
  isChatOpen = false,
  onToggleChat,
}) {
  if (!isInCall) {
    return (
      <div className="max-w-xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 rounded-full bg-brand-marigold/15 text-brand-marigold flex items-center justify-center animate-pulse">
              <Clock className="w-10 h-10" />
            </div>
            <span className="absolute top-0 right-0 w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-sm">
              #{queuePosition}
            </span>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>In Queue • Triage Completed</span>
            </span>
            <h2 className="text-2xl font-black text-neutral-900">
              Waiting for Hub Doctor
            </h2>
            <p className="text-sm text-neutral-600 mt-2 max-w-sm mx-auto leading-relaxed">
              Your triage summary has been transmitted to the District Hub queue. An available medical officer will connect via video momentarily.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-left text-xs text-neutral-600 space-y-1.5">
            <div className="font-bold text-neutral-900 text-sm mb-1">Consultation Details:</div>
            <div>Patient: <strong className="text-neutral-900">{patientData?.name} ({patientData?.age}y)</strong></div>
            <div>Location: <strong className="text-neutral-900">{patientData?.village}</strong></div>
            <div>Symptoms: <strong className="text-neutral-900">{patientData?.symptoms?.join(', ')}</strong></div>
            <div>Vitals: <strong className="text-neutral-900 font-mono">Temp: {patientData?.vitals?.temp}°F | BP: {patientData?.vitals?.bp}</strong></div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onEndCall}
              className="px-6 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-semibold transition-colors inline-flex items-center gap-2 shadow-xs"
            >
              <span>Cancel & Exit Waiting Room</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto w-full px-4 py-4 space-y-4">
      {/* Camera / Permission Alert */}
      {cameraError && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Remote Doctor Feed */}
      <div className="relative">
        <VideoPlayer
          stream={remoteStream}
          isLocal={false}
          isAudioOnly={isAudioOnly}
          peerName={doctor?.name || 'Dr. Ananya Sharma (Hub MD)'}
          rtt={rtt}
        />

        {/* Self Mini Tile */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-24 sm:w-28 aspect-video rounded-xl overflow-hidden border-2 border-white/40 shadow-lg bg-neutral-900">
          <VideoPlayer
            stream={localStream}
            isLocal={true}
            isAudioOnly={isVideoDisabled}
            peerName="You"
          />
        </div>
      </div>

      {/* Call Controls */}
      <CallControls
        isAudioMuted={isAudioMuted}
        isVideoDisabled={isVideoDisabled}
        onToggleAudio={onToggleAudio}
        onToggleVideo={onToggleVideo}
        onEndCall={onEndCall}
        onSimulateDegradation={onSimulateDegradation}
        onSetNetworkMode={onSetNetworkMode}
        networkStatus={networkStatus}
        currentRtt={rtt}
        isDegraded={isAudioOnly}
        isChatOpen={isChatOpen}
        onToggleChat={onToggleChat}
      />

      {/* Emergency Low-Bandwidth Text Relay Drawer (Active during call / fallback) */}
      {(isChatOpen || networkStatus === 'offline') && (
        <EmergencyTextRelay
          messages={messages}
          onSendMessage={onSendMessage}
          currentUserRole="Patient"
          isOffline={networkStatus === 'offline'}
          isAudioOnly={isAudioOnly}
        />
      )}
    </div>
  );
}
