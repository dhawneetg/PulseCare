import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Gauge, MessageSquare, Radio, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { TRANSLATIONS } from '../../utils/translations.js';

export default function CallControls({
  isAudioMuted = false,
  isVideoDisabled = false,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
  onSimulateDegradation = null,
  onSetNetworkMode = null,
  networkStatus = 'stable',
  currentRtt = null,
  isDegraded = false,
  isChatOpen = false,
  onToggleChat = null,
  onReconnect = null,
  unreadCount = 0,
  lang = 'en',
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return (
    <div className="flex flex-col gap-2.5 p-3 sm:p-4 bg-white/95 backdrop-blur rounded-2xl border border-slate-200 shadow-sm w-full">
      {/* Top Action Row: Mic, Camera, Text Chat, End Call */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        
        {/* Left Group: Mic & Camera */}
        <div className="flex items-center gap-2">
          {/* Audio Mute */}
          <button
            type="button"
            onClick={onToggleAudio}
            className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              isAudioMuted
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
            title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isAudioMuted ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Video Toggle */}
          <button
            type="button"
            onClick={onToggleVideo}
            className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              isVideoDisabled
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
            title={isVideoDisabled ? 'Enable Video Track' : 'Disable Video Track'}
          >
            {isVideoDisabled ? <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Video className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Emergency Text Relay Toggle */}
          {onToggleChat && (
            <button
              type="button"
              onClick={onToggleChat}
              className={`h-11 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 relative ${
                isChatOpen
                  ? 'bg-brand-teal text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
              title="Toggle Emergency Low-Bandwidth Text Relay"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">{t.toggleChat}</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Right Group: Re-sync & End Call */}
        <div className="flex items-center gap-2">
          {onReconnect && (
            <button
              type="button"
              onClick={onReconnect}
              className="h-11 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              title="Re-negotiate WebRTC Stream (Force Refresh)"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              <span className="hidden sm:inline">Re-sync Video</span>
            </button>
          )}

          <button
            type="button"
            onClick={onEndCall}
            className="h-11 px-4 sm:px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-sm transition-colors shrink-0"
          >
            <PhoneOff className="w-4 h-4" />
            <span>{t.endCall}</span>
          </button>
        </div>

      </div>

      {/* 4-Tier Network Simulation Bar: Critical for Hackathon Demo */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
          <Radio className="w-3.5 h-3.5 text-brand-teal" />
          <span>{t.testNetwork}</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => onSetNetworkMode ? onSetNetworkMode('4g') : onSimulateDegradation && onSimulateDegradation('4g')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
              networkStatus === 'stable' && (currentRtt === null || currentRtt < 100)
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4G Video (40ms)
          </button>
          <button
            type="button"
            onClick={() => onSetNetworkMode ? onSetNetworkMode('3g') : onSimulateDegradation && onSimulateDegradation('3g')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
              networkStatus === 'stable' && currentRtt >= 100 && currentRtt <= 500
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3G Adaptive (180ms)
          </button>
          <button
            type="button"
            onClick={() => onSetNetworkMode ? onSetNetworkMode('2g') : onSimulateDegradation && onSimulateDegradation('2g')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
              networkStatus === 'degraded'
                ? 'bg-brand-marigold text-white shadow-xs animate-pulse'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2G Audio (&gt;500ms)
          </button>
          <button
            type="button"
            onClick={() => onSetNetworkMode ? onSetNetworkMode('offline') : onSimulateDegradation && onSimulateDegradation('offline')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
              networkStatus === 'offline'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Zero Signal (Text)
          </button>
        </div>
      </div>
    </div>
  );
}
