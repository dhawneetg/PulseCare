import React, { useEffect } from 'react';
import { PhoneCall, Clock, CheckCircle2, User, Stethoscope, AlertTriangle, Video, ArrowRight, Sparkles } from 'lucide-react';
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
  onStartCall = null,
  onStartMedia = null,
  messages = [],
  onSendMessage,
  isChatOpen = false,
  onToggleChat,
  onReconnect = null,
  lang = 'en',
}) {
  const isHi = lang === 'hi';

  // Automatically start local camera stream when component mounts or call enters
  useEffect(() => {
    if (!localStream && onStartMedia) {
      onStartMedia();
    }
  }, [localStream, onStartMedia]);

  if (!isInCall) {
    return (
      <div className="max-w-xl mx-auto w-full px-4 py-6 text-left">
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-5">
          {/* Header with Doctor Availability */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center font-black text-xl text-emerald-800">
                👨‍⚕️
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-900 leading-tight">
                  {doctor?.name || 'Dr. Rajesh Sharma (MBBS, MD)'}
                </h3>
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isHi ? 'चिकित्सक लाइव उपलब्ध हैं • कतार में आपकी बारी है' : 'Medical Officer Online • Your Turn in Queue'}</span>
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs border border-emerald-300">
              #{queuePosition} {isHi ? 'क्रम' : 'Queue'}
            </span>
          </div>

          {/* Instant Connect Primary Action */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{isHi ? 'त्वरित वीडियो परामर्श सक्रिय' : 'Instant Video Tele-Consultation'}</span>
              </span>
              <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                WebRTC 2-Way HD
              </span>
            </div>

            <button
              type="button"
              onClick={onStartCall || onStartMedia}
              className="w-full h-14 bg-[#00594C] hover:bg-[#00473c] text-white font-black rounded-xl px-4 flex items-center justify-between shadow-md transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <Video className="w-5 h-5 animate-pulse" />
                <span className="text-sm sm:text-base">
                  {isHi ? 'वीडियो कॉल अभी शुरू करें / Start Video Now' : 'Start Video Call Now'}
                </span>
              </div>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Local Camera Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-600">
              <span>{isHi ? 'आपके कैमरे का पूर्वावलोकन (Camera Check)' : 'Your Camera Preview'}</span>
              {!localStream && onStartMedia && (
                <button
                  type="button"
                  onClick={onStartMedia}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  {isHi ? 'कैमरा चालू करें' : 'Enable Camera'}
                </button>
              )}
            </div>
            <div className="w-full h-44 rounded-xl overflow-hidden bg-neutral-900 border-2 border-neutral-200 relative">
              <VideoPlayer
                stream={localStream}
                isLocal={true}
                isAudioOnly={false}
                peerName={patientData?.name || 'You'}
                onStartMedia={onStartMedia}
              />
            </div>
          </div>

          {/* Consultation Summary */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-1">
            <div className="font-bold text-neutral-900 text-xs mb-1">{isHi ? 'मरीज़ सारांश (Patient Triage):' : 'Consultation Summary:'}</div>
            <div>{isHi ? 'नाम' : 'Patient'}: <strong className="text-neutral-900">{patientData?.name || (isHi ? 'अज्ञात मरीज़' : 'Anonymous Patient')} ({patientData?.age || 30}y)</strong> • {patientData?.village || 'Rampur Village'}</div>
            <div>{isHi ? 'लक्षण' : 'Symptoms'}: <strong className="text-neutral-900">{Array.isArray(patientData?.symptoms) ? patientData.symptoms.join(', ') : (patientData?.symptoms || 'General Consultation')}</strong></div>
            <div>{isHi ? 'संकेत' : 'Vitals'}: <strong className="text-neutral-900 font-mono">Temp: {patientData?.vitals?.temp || '98.6'}°F | BP: {patientData?.vitals?.bp || '120/80'}</strong></div>
          </div>

          <div className="pt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={onEndCall}
              className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-600 hover:bg-neutral-100 text-xs font-semibold transition-colors"
            >
              {isHi ? 'रद्द करें व पीछे जाएं' : 'Cancel & Return to Checker'}
            </button>

            <button
              type="button"
              onClick={onStartCall || onStartMedia}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
            >
              {isHi ? 'कॉल कनेक्ट करें' : 'Connect Video Call'}
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
          fallbackStream={localStream}
          isLocal={false}
          isAudioOnly={isAudioOnly}
          peerName={doctor?.name || 'Dr. Ananya Sharma, MBBS, MD'}
          rtt={rtt}
          onReconnect={onReconnect}
        />

        {/* Self Mini Tile */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-28 sm:w-36 aspect-video rounded-xl overflow-hidden border-2 border-white/60 shadow-lg bg-neutral-900">
          <VideoPlayer
            stream={localStream}
            isLocal={true}
            isAudioOnly={isVideoDisabled}
            peerName="You"
            onStartMedia={onStartMedia}
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
        onReconnect={onReconnect}
        lang={lang}
      />

      {/* Emergency Low-Bandwidth Text Relay Drawer (Auto-opened on fallback / 2G / audio-only) */}
      {(isChatOpen || isAudioOnly || networkStatus === 'degraded' || networkStatus === 'offline') && (
        <EmergencyTextRelay
          messages={messages}
          onSendMessage={onSendMessage}
          currentUserRole="Patient"
          isOffline={networkStatus === 'offline'}
          isAudioOnly={isAudioOnly || networkStatus === 'degraded'}
          lang={lang}
        />
      )}
    </div>
  );
}
