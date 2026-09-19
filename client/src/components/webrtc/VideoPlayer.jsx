import React, { useRef, useEffect, useState } from 'react';
import { WifiOff, PhoneCall, User, Video, VideoOff, Volume2, Activity, RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react';

export default function VideoPlayer({
  stream = null,
  fallbackStream = null,
  isLocal = false,
  isAudioOnly = false,
  peerName = 'Peer',
  rtt = null,
  isMuted = false,
  onStartMedia = null,
}) {
  const videoRef = useRef(null);
  const [playBlocked, setPlayBlocked] = useState(false);
  const [useMirrorFeed, setUseMirrorFeed] = useState(false);

  // If user toggles mirror testing, use fallbackStream (e.g. localStream)
  const activeStream = useMirrorFeed && fallbackStream ? fallbackStream : stream;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (activeStream) {
      if (video.srcObject !== activeStream) {
        video.srcObject = activeStream;
      }
      video.muted = !!isLocal || useMirrorFeed;

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
                  if (!isLocal && !useMirrorFeed) setPlayBlocked(true);
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
  }, [activeStream, isLocal, useMirrorFeed]);

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
      {/* Real Active Video Stream */}
      {activeStream && !isAudioOnly && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          webkit-playsinline="true"
          muted={isLocal || useMirrorFeed}
          className={`w-full h-full object-cover ${(isLocal || useMirrorFeed) ? 'scale-x-[-1]' : ''}`}
        />
      )}

      {/* Unmute Audio Pill Overlay */}
      {playBlocked && !isLocal && !useMirrorFeed && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
          <button
            type="button"
            onClick={handleManualPlay}
            className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg animate-pulse flex items-center gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Tap to Enable Audio</span>
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
      {isLocal && !activeStream && !isAudioOnly && (
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

      {/* Interactive Live Doctor Tele-Consultation Studio (When awaiting remote peer / 1-device demo) */}
      {!isLocal && !activeStream && !isAudioOnly && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1b19] via-[#091514] to-[#050c0b] flex flex-col justify-between p-4 sm:p-6 text-white select-none">
          {/* Top Telehealth Status Strip */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-emerald-500/30 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-emerald-300">PulseCare Tele-Hub 3</span>
              <span className="text-neutral-500">•</span>
              <span className="text-neutral-300 font-medium">Encrypted Live Audio/Data</span>
            </div>

            {/* Quick Mirror Toggle for 1-Device Testing */}
            {fallbackStream && (
              <button
                type="button"
                onClick={() => setUseMirrorFeed(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                title="Test 2-way video by mirroring your local camera into the main view"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Mirror My Camera</span>
              </button>
            )}
          </div>

          {/* Center Doctor Consultation Feed */}
          <div className="flex flex-col items-center justify-center my-auto space-y-3 z-10 text-center">
            {/* Animated Doctor Avatar with Telemetry Halo */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-teal-500/30 to-emerald-600/20 border-2 border-emerald-400/60 p-1 flex items-center justify-center shadow-xl shadow-emerald-950/50">
                <div className="w-full h-full rounded-full bg-[#0d2825] border border-emerald-400/40 flex items-center justify-center text-4xl sm:text-5xl">
                  👨‍⚕️
                </div>
              </div>
              {/* Pulsing Stethoscope Badge */}
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-neutral-950 p-1.5 rounded-full border-2 border-neutral-900 shadow-md">
                <Activity className="w-4 h-4 animate-pulse" />
              </div>
            </div>

            {/* Doctor Demographics */}
            <div className="space-y-1 max-w-sm">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                <span>MBBS, MD • General Medicine</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {peerName || 'Dr. Ananya Sharma'}
              </h3>
              <p className="text-xs text-emerald-200/80 font-medium">
                Senior Telemedicine Medical Officer on Duty
              </p>
            </div>

            {/* Live Cardiac & Audio Telemetry Monitor */}
            <div className="flex items-center gap-3 bg-black/40 border border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-mono">
              <div className="flex items-center gap-1 text-emerald-400">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-bold">75 BPM</span>
              </div>
              <span className="text-neutral-600">|</span>
              <div className="flex items-center gap-1 text-sky-400">
                <span>SpO2:</span>
                <span className="font-bold">98%</span>
              </div>
              <span className="text-neutral-600">|</span>
              {/* Dynamic Soundwave Bars */}
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2" />
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3 delay-75" />
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-1.5 delay-150" />
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2.5 delay-100" />
              </div>
            </div>
          </div>

          {/* Bottom Banner with Multi-device Demo Instructions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 z-10 pt-2 border-t border-white/10 text-xs">
            <span className="text-emerald-100/75 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Ayushman Bharat ABDM Connected Hub</span>
            </span>

            <div className="flex items-center gap-2">
              <a
                href="/doctor"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-black/40 border border-amber-400/30 px-2.5 py-1 rounded-lg transition-colors"
              >
                <span>Connect 2nd Tab as Doctor</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Top Overlays */}
      <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
        <span className="bg-black/60 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-semibold text-white border border-white/10">
          {useMirrorFeed ? `${peerName} (Mirrored Preview)` : peerName} {isLocal && '(You)'}
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
      <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20">
        {useMirrorFeed && (
          <button
            type="button"
            onClick={() => setUseMirrorFeed(false)}
            className="bg-black/70 hover:bg-black/90 text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded border border-amber-400/40 flex items-center gap-1"
          >
            <span>Exit Mirror</span>
          </button>
        )}
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
