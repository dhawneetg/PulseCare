import React, { useRef, useEffect } from 'react';
import { WifiOff, PhoneCall, User, Video, VideoOff } from 'lucide-react';

export default function VideoPlayer({
  stream = null,
  isLocal = false,
  isAudioOnly = false,
  peerName = 'Peer',
  rtt = null,
  isMuted = false,
}) {
  const videoRef = useRef(null);
  const [playBlocked, setPlayBlocked] = React.useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlayBlocked(false);
          })
          .catch((err) => {
            console.warn('[PulseCare] Autoplay blocked on device, requiring tap:', err);
            setPlayBlocked(true);
          });
      }
    }
  }, [stream]);

  const handleManualPlay = () => {
    if (videoRef.current) {
      videoRef.current.play().then(() => setPlayBlocked(false)).catch(() => {});
    }
  };

  return (
    <div 
      onClick={playBlocked ? handleManualPlay : undefined}
      className="relative w-full aspect-video bg-neutral-900 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center border-2 border-neutral-800"
    >
      {/* Active Video & Audio Stream - Always kept mounted so audio tracks play uninterrupted */}
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''} ${
            isAudioOnly ? 'hidden' : 'block'
          }`}
        />
      )}

      {/* Mobile Autoplay Permission Overlay */}
      {playBlocked && !isLocal && (
        <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center p-4 text-center cursor-pointer">
          <button
            type="button"
            onClick={handleManualPlay}
            className="px-4 py-2 rounded-xl bg-brand-marigold hover:bg-brand-marigoldDark text-white text-xs font-bold shadow-lg animate-pulse"
          >
            Tap to Enable Video & Audio
          </button>
        </div>
      )}

      {/* Audio-Only Degradation Fallback Screen (The Core Differentiator) */}
      {isAudioOnly && (
        <div className="absolute inset-0 bg-amber-950/95 border-2 sm:border-4 border-amber-400 flex flex-col items-center justify-center text-center p-3 sm:p-6 space-y-2 sm:space-y-4 animate-fadeIn">
          <div className="relative">
            <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center border-2 border-amber-400 animate-pulse">
              <PhoneCall className="w-6 h-6 sm:w-10 sm:h-10" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 p-0.5 sm:p-1 rounded-full">
              <WifiOff className="w-3 h-3 sm:w-4 sm:h-4 stroke-[3]" />
            </div>
          </div>

          <div className="space-y-1 max-w-sm">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              <span>Adaptive Audio-Only Fallback</span>
            </div>
            <h4 className="text-sm sm:text-xl font-black text-amber-100 tracking-tight">
              {peerName} (Voice Active)
            </h4>
            <p className="text-[10px] sm:text-xs text-amber-200/90 leading-tight sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
              High network latency detected (RTT {rtt ? `${Math.round(rtt)}ms` : '>500ms'}). Video preemptively disabled to preserve crystal-clear audio consultation.
            </p>
          </div>
        </div>
      )}

      {/* No Stream / Offline Placeholder */}
      {!isAudioOnly && !stream && (
        <div className="text-center p-6 text-neutral-400 space-y-2">
          <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-neutral-300">
            <User className="w-8 h-8" />
          </div>
          <p className="text-sm font-semibold">{peerName}</p>
          <p className="text-xs text-neutral-500">Awaiting media stream connection...</p>
          {!isLocal && (
            <p className="text-[11px] text-brand-marigold bg-black/40 px-2.5 py-1 rounded max-w-xs mx-auto">
              Open <strong>/patient</strong> in another tab or phone to connect live 2-way call
            </p>
          )}
        </div>
      )}

      {/* Top Overlays */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <span className="bg-black/60 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-semibold text-white border border-white/10">
          {peerName} {isLocal && '(You)'}
        </span>
        {rtt !== null && (
          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
            rtt > 500
              ? 'bg-amber-500 text-amber-950'
              : 'bg-black/60 text-emerald-400 border border-emerald-500/30'
          }`}>
            RTT: {Math.round(rtt)}ms
          </span>
        )}
      </div>

      {/* Bottom Status indicators */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        {isAudioOnly ? (
          <span className="bg-amber-400 text-amber-950 font-black text-xs px-2.5 py-1 rounded-md flex items-center gap-1">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>AUDIO-ONLY</span>
          </span>
        ) : (
          <span className="bg-black/60 backdrop-blur text-emerald-400 text-xs px-2 py-0.5 rounded flex items-center gap-1 border border-white/10">
            <Video className="w-3 h-3" />
            <span>HD/SD Video</span>
          </span>
        )}
      </div>
    </div>
  );
}
