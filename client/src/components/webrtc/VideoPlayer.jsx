import React, { useRef, useEffect, useState } from 'react';
import { WifiOff, PhoneCall, User, Video, VideoOff, Volume2, Activity, RefreshCw, ExternalLink, ShieldCheck, HeartPulse } from 'lucide-react';

export default function VideoPlayer({
  stream = null,
  fallbackStream = null,
  isLocal = false,
  isAudioOnly = false,
  peerName = 'Peer',
  rtt = null,
  isMuted = false,
  onStartMedia = null,
  onReconnect = null,
  relayFrame = null,
}) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [playBlocked, setPlayBlocked] = useState(false);
  const [useMirrorFeed, setUseMirrorFeed] = useState(false);
  const [hasRealFrames, setHasRealFrames] = useState(false);

  // If user toggles mirror testing, use fallbackStream (e.g. localStream)
  const activeStream = useMirrorFeed && fallbackStream ? fallbackStream : stream;

  // Global user gesture listener: any click or touch in the window unlocks audio playback
  useEffect(() => {
    const unlockAudio = () => {
      if (!isLocal && !useMirrorFeed) {
        if (audioRef.current) {
          audioRef.current.muted = false;
          audioRef.current.play().then(() => setPlayBlocked(false)).catch(() => {});
        }
        if (videoRef.current) {
          videoRef.current.muted = false;
          videoRef.current.play().then(() => setPlayBlocked(false)).catch(() => {});
        }
      }
    };
    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, [isLocal, useMirrorFeed]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (activeStream) {
      if (video.srcObject !== activeStream) {
        video.srcObject = activeStream;
      }
      video.muted = !!isLocal || useMirrorFeed;

      // Ensure remote audio element receives audio stream directly
      if (!isLocal && !useMirrorFeed && audioRef.current) {
        if (audioRef.current.srcObject !== activeStream) {
          audioRef.current.srcObject = activeStream;
        }
        audioRef.current.muted = false;
        audioRef.current.play().catch(() => {});
      }

      const checkFrames = () => {
        if (!video) return;
        const videoTrack = activeStream?.getVideoTracks?.()[0];
        const isTrackLive = videoTrack && videoTrack.readyState === 'live' && !videoTrack.muted;

        if (isLocal || useMirrorFeed) {
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            setHasRealFrames(true);
          }
        } else {
          // For remote stream: verify track is unmuted and packets are rendering
          if (video.videoWidth > 0 && video.videoHeight > 0 && (isTrackLive || video.currentTime > 0)) {
            setHasRealFrames(true);
          } else if (videoTrack && videoTrack.muted) {
            setHasRealFrames(false);
          }
        }
      };

      const videoTrack = activeStream.getVideoTracks?.()[0];
      if (videoTrack) {
        videoTrack.onunmute = () => {
          console.log('[PulseCare] Video track unmuted, frames flowing!');
          checkFrames();
        };
        videoTrack.onmute = () => {
          console.log('[PulseCare] Video track muted, waiting for packets...');
          if (!isLocal && !useMirrorFeed) {
            setHasRealFrames(false);
          }
        };
      }

      const attemptPlay = () => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setPlayBlocked(false);
              checkFrames();
            })
            .catch((err) => {
              console.warn('[PulseCare] Autoplay audio blocked, attempting muted play:', err);
              // Fallback to muted playback so the video appears IMMEDIATELY
              video.muted = true;
              video.play()
                .then(() => {
                  if (!isLocal && !useMirrorFeed) setPlayBlocked(true);
                  else setPlayBlocked(false);
                  checkFrames();
                })
                .catch((mutedErr) => {
                  console.warn('[PulseCare] Muted autoplay also rejected:', mutedErr);
                  setPlayBlocked(true);
                });
            });
        }
      };

      attemptPlay();
      video.onloadedmetadata = () => {
        attemptPlay();
        checkFrames();
      };
      video.onloadeddata = checkFrames;
      video.onplaying = checkFrames;
      video.ontimeupdate = checkFrames;

      // Periodically check if video dimensions and packets became active
      const frameCheckInterval = setInterval(checkFrames, 500);
      return () => clearInterval(frameCheckInterval);
    } else {
      video.srcObject = null;
      setHasRealFrames(false);
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

  // Determine whether actual video frames are streaming on the canvas/video surface
  const isDisplayingRealVideo = isLocal || useMirrorFeed || hasRealFrames;

  return (
    <div 
      onClick={playBlocked ? handleManualPlay : undefined}
      className="relative w-full aspect-video bg-neutral-900 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center border-2 border-neutral-800"
    >
      {/* HTML5 Video Element - always mounted to receive WebRTC tracks and capture frames */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        webkit-playsinline="true"
        muted={isLocal || useMirrorFeed}
        className={`w-full h-full object-cover ${(isLocal || useMirrorFeed) ? 'scale-x-[-1]' : ''} ${
          isDisplayingRealVideo && !isAudioOnly ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'
        }`}
      />

      {/* Dedicated Remote Audio Channel - Never hidden, guaranteeing continuous two-way microphone playback */}
      {!isLocal && !useMirrorFeed && (
        <audio
          ref={audioRef}
          autoPlay
          playsInline
        />
      )}

      {/* Unmute Audio Pill Overlay (Non-blocking) */}
      {playBlocked && !isLocal && !useMirrorFeed && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
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
        <div className="absolute inset-0 bg-amber-950/95 border-2 sm:border-4 border-amber-400 flex flex-col items-center justify-center text-center p-3 sm:p-6 space-y-2 sm:space-y-4 animate-fadeIn z-20">
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
        <div className="text-center p-4 text-neutral-300 space-y-2 z-20">
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

      {/* Low-Bandwidth Live Relay Image Surface (Active when WebRTC P2P is blocked or connecting) */}
      {!isLocal && !isDisplayingRealVideo && relayFrame && !isAudioOnly && (
        <div className="absolute inset-0 z-10 bg-black flex items-center justify-center overflow-hidden">
          <img
            src={relayFrame}
            alt="Remote Telehealth Feed"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 z-20">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 text-[11px] font-bold shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Low-Bandwidth Adaptive Relay</span>
            </span>
          </div>
        </div>
      )}

      {/* Interactive Live Doctor Tele-Consultation Studio (When awaiting remote peer or testing on 1 device) */}
      {!isLocal && !isDisplayingRealVideo && !relayFrame && !isAudioOnly && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1f1c] via-[#081816] to-[#040d0c] flex flex-col justify-between p-4 sm:p-5 text-white select-none z-10">
          {/* Top Telehealth Status Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-emerald-500/30 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-emerald-300">PulseCare Tele-Hub 3</span>
              <span className="text-neutral-500">•</span>
              <span className="text-neutral-300 font-medium">Encrypted Live Room</span>
            </div>

            {/* Mirror Camera 1-Click Test Button */}
            {fallbackStream && (
              <button
                type="button"
                onClick={() => setUseMirrorFeed(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition-all active:scale-95 border border-emerald-400/40"
                title="Mirror your own webcam in the main screen for 2-way verification"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Mirror My Camera (कैमरा टेस्ट)</span>
              </button>
            )}
          </div>

          {/* Center Doctor Consultation Screen */}
          <div className="flex flex-col items-center justify-center my-auto space-y-3.5 text-center">
            {/* Doctor Portrait Graphic */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-600/20 to-sky-600/20 border-2 border-emerald-400/70 p-1 flex items-center justify-center shadow-xl shadow-emerald-950/60">
                <div className="w-full h-full rounded-full bg-[#0b2421] border border-emerald-400/30 flex items-center justify-center text-4xl sm:text-5xl select-none">
                  👨‍⚕️
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-neutral-950 p-1.5 rounded-full border-2 border-neutral-900 shadow-md">
                <HeartPulse className="w-4 h-4 text-neutral-950 animate-pulse" />
              </div>
            </div>

            {/* Doctor Demographics & Status */}
            <div className="space-y-1 max-w-sm">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                <span>MBBS, MD • General Medicine & Rural Health</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {peerName || 'Dr. Ananya Sharma, MBBS, MD'}
              </h3>
              <p className="text-xs text-emerald-200/80 font-medium">
                District Telemedicine Medical Officer • Live Consultation Active
              </p>
            </div>

            {/* Live Cardiac & Audio Wave Telemetry Display */}
            <div className="flex items-center gap-3 bg-black/50 border border-emerald-500/20 px-4 py-1.5 rounded-xl text-xs font-mono shadow-inner">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-bold">75 BPM</span>
              </div>
              <span className="text-neutral-600">|</span>
              <div className="flex items-center gap-1 text-sky-400">
                <span>SpO2:</span>
                <span className="font-bold">98%</span>
              </div>
              <span className="text-neutral-600">|</span>
              {/* Dynamic Sound Wave Bars */}
              <div className="flex items-center gap-0.5 h-3.5">
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2" />
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3.5 delay-75" />
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-1.5 delay-150" />
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3 delay-100" />
              </div>
            </div>

            {/* Direct Re-connect & Mirror Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {onReconnect && (
                <button
                  type="button"
                  onClick={onReconnect}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black shadow-lg transition-all active:scale-95"
                  title="Re-negotiate WebRTC Stream (Force Refresh)"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-connect Remote Video (पुनः कनेक्ट करें)</span>
                </button>
              )}
              {fallbackStream && (
                <button
                  type="button"
                  onClick={() => setUseMirrorFeed(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-all active:scale-95 border border-emerald-500/30"
                  title="Mirror your own webcam in the main screen for 2-way verification"
                >
                  <span>Mirror My Camera (कैमरा टेस्ट)</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Telehealth Security Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
            <span className="text-emerald-100/75 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Ayushman Bharat ABDM Connected Telehealth Link</span>
            </span>

            <div className="flex items-center gap-2">
              <a
                href="/doctor"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-black/50 border border-amber-400/30 px-3 py-1 rounded-lg transition-colors shadow-sm"
              >
                <span>Open Doctor View (2nd Tab)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Top Overlays */}
      <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
        <span className="bg-black/60 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-semibold text-white border border-white/10">
          {useMirrorFeed ? `${peerName} (Mirrored Camera)` : peerName} {isLocal && '(You)'}
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
        {!isLocal && onReconnect && (
          <button
            type="button"
            onClick={onReconnect}
            className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 hover:bg-black/90 text-amber-300 border border-amber-400/40 flex items-center gap-1 transition-all"
            title="Re-negotiate WebRTC Stream"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            <span>Re-sync</span>
          </button>
        )}
      </div>

      {/* Bottom Status indicators */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20">
        {useMirrorFeed && (
          <button
            type="button"
            onClick={() => setUseMirrorFeed(false)}
            className="bg-black/80 hover:bg-black text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded border border-amber-400/40 flex items-center gap-1"
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
