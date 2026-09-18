import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Gauge } from 'lucide-react';

export default function CallControls({
  isAudioMuted = false,
  isVideoDisabled = false,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
  onSimulateDegradation = null,
  isDegraded = false,
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-2.5 sm:p-4 bg-white/95 backdrop-blur rounded-2xl border border-neutral-200 shadow-sm">
      {/* Audio Mute */}
      <button
        type="button"
        onClick={onToggleAudio}
        className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${
          isAudioMuted
            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm'
            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
        }`}
        title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
      >
        {isAudioMuted ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
      </button>

      {/* Video Toggle */}
      <button
        type="button"
        onClick={onToggleVideo}
        className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${
          isVideoDisabled
            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm'
            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
        }`}
        title={isVideoDisabled ? 'Enable Video Track' : 'Disable Video Track'}
      >
        {isVideoDisabled ? <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Video className="w-4 h-4 sm:w-5 sm:h-5" />}
      </button>

      {/* Demo helper: Force / Simulate Network Cliff toggle */}
      {onSimulateDegradation && (
        <button
          type="button"
          onClick={onSimulateDegradation}
          className={`h-11 sm:h-12 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border shrink-0 ${
            isDegraded
              ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-500 shadow-sm'
              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200'
          }`}
          title="Simulate Network Latency Spike (>500ms RTT)"
        >
          <Gauge className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{isDegraded ? 'Recover' : 'Test Latency Drop'}</span>
        </button>
      )}

      {/* End Call */}
      <button
        type="button"
        onClick={onEndCall}
        className="h-11 sm:h-12 px-4 sm:px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-sm transition-colors shrink-0"
      >
        <PhoneOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>End Call</span>
      </button>
    </div>
  );
}
