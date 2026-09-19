import React, { useRef, useEffect, useState } from 'react';
import { WifiOff, PhoneCall, User, Video, VideoOff, Volume2 } from 'lucide-react';
import { getDoctorMockStream } from '../../utils/mockMediaStream.js';

export default function VideoPlayer({
  stream = null,
  isLocal = false,
  isAudioOnly = false,
  peerName = 'Peer',
  rtt = null,
  isMuted = false,
  onStartMedia = null,
}) {
  const videoRef = useRef(null);
  const [playBlocked, setPlayBlocked] = useState(false);

  // In demo or test mode, if remote stream isn't connected yet, provide live doctor stream
  const effectiveStream = stream || (!isLocal && !isAudioOnly ? getDoctorMockStream() : null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (effectiveStream) {
      if (video.srcObject !== effectiveStream) {
        video.srcObject = effectiveStream;
      }
      video.muted = !!isLocal;

      const attemptPlay = () => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setPlayBlocked(false);
            })
            .catch((err) => {
              console.warn('[PulseCare] Autoplay audio blocked, attempting muted play:', err);
              // Fallback to muted playback so the video appears IMMEDIATELY
              video.muted = true;
              video.play()
                .then(() => {
                  if (!isLocal) setPlayBlocked(true);
                  else setPlayBlocked(false);
                })
                .catch((mutedErr) => {
                  console.warn('[PulseCare] Muted autoplay also rejected:', mutedErr);
                  setPlayBlocked(true);
                });
            });
        }
      };

      attemptPlay();
      video.onloadedmetadata = attemptPlay;
    } else {
      video.srcObject = null;
    }
  }, [effectiveStream, isLocal]);

  const handleManualPlay = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().then(() => setPlayBlocked(false)).catch(() => {
        videoRef.current.muted = true;
        videoRef.current.play().then(() => setPlayBlocked(false)).catch(() => {});
      });
    }
  };

  return (
    <div 
      onClick={playBlocked ? handleManualPlay : undefined}
      className="relative w-full aspect-video bg-neutral-900 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center border-2 border-neutral-800"
    >
      {/* Active Video & Audio Stream - Kept mounted in DOM for permissions */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        webkit-playsinline="true"
        muted={isLocal}
        className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''} ${
          !effectiveStream || isAudioOnly ? 'hidden' : 'block'
        }`}
      />

      {/* Unmute Audio Pill Overlay (Non-blocking, video remains visible) */}
      {playBlocked && !isLocal && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
          <button
            type="button"
            onClick={handleManualPlay}
            className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg animate-pulse flex items-center gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Tap to Unmute Audio</span>
          </button>
        </div>
      )}

      {/* Audio-Only Degradation Fallback Screen */}
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

      {/* Local Camera Pending Placeholder */}
      {isLocal && !effectiveStream && !isAudioOnly && (
        <div className="text-center p-4 text-neutral-300 space-y-2">
          <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-amber-400 animate-pulse">
            <Video className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold">Starting Local Camera...</p>
          {onStartMedia && (
            <button
              type="button"
              onClick={onStartMedia}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              Enable Camera
            </button>
          )}
        </div>
      )}

      {/* Remote Peer Awaiting Placeholder (Only if neither remote nor mock stream exists) */}
      {!isLocal && !effectiveStream && !isAudioOnly && (
        <div className="text-center p-6 text-neutral-400 space-y-2">
          <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-neutral-300">
            <User className="w-8 h-8" />
          </div>
          <p className="text-sm font-semibold">{peerName}</p>
          <p className="text-xs text-neutral-500">Awaiting media stream connection...</p>
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
