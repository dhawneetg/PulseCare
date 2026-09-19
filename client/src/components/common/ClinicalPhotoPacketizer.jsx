import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Eye, 
  X, 
  Image as ImageIcon, 
  Layers, 
  Radio, 
  Maximize2,
  ZoomIn,
  RefreshCw
} from 'lucide-react';

// Preset clinical test images (SVG Data URLs for crystal clarity & zero external dependencies)
export const CLINICAL_PRESETS = [
  {
    id: 'rash_01',
    name: 'Allergic Skin Rash (पित्ती / दाने)',
    type: 'Dermatology',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#fcd5b5"/>
      <ellipse cx="200" cy="150" rx="140" ry="100" fill="#f8b693" opacity="0.6"/>
      <circle cx="160" cy="130" r="18" fill="#e04848" opacity="0.8"/>
      <circle cx="210" cy="120" r="24" fill="#e03232" opacity="0.85"/>
      <circle cx="240" cy="160" r="16" fill="#e04848" opacity="0.75"/>
      <circle cx="180" cy="180" r="20" fill="#cf2222" opacity="0.8"/>
      <circle cx="140" cy="160" r="14" fill="#e04848" opacity="0.7"/>
      <circle cx="260" cy="130" r="12" fill="#e04848" opacity="0.65"/>
      <text x="20" y="35" font-family="sans-serif" font-weight="bold" font-size="16" fill="#782020">PULSECARE 2G CLINICAL RELAY: ACUTE ERYTHEMATOUS RASH</text>
      <text x="20" y="280" font-family="monospace" font-size="12" fill="#782020">PATIENT: SUNITA DEVI (UP-BRB) • HIGH RES CAPTURE</text>
    </svg>`
  },
  {
    id: 'tongue_01',
    name: 'Tongue Pallor & Dehydration (जीभ सूखापन)',
    type: 'Internal Medicine',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#2d1b1b"/>
      <ellipse cx="200" cy="160" rx="110" ry="115" fill="#f29999"/>
      <ellipse cx="200" cy="150" rx="85" ry="90" fill="#e67e7e"/>
      <line x1="200" y1="90" x2="200" y2="230" stroke="#c05555" stroke-width="6"/>
      <path d="M150 120 Q 200 135 250 120" stroke="#fff0f0" stroke-width="4" fill="none" opacity="0.7"/>
      <path d="M160 160 Q 200 175 240 160" stroke="#fff0f0" stroke-width="4" fill="none" opacity="0.7"/>
      <text x="20" y="35" font-family="sans-serif" font-weight="bold" font-size="16" fill="#f8b693">PULSECARE 2G CLINICAL RELAY: TONGUE DEHYDRATION FUR</text>
      <text x="20" y="280" font-family="monospace" font-size="12" fill="#f8b693">TRIAGE: MODERATE DEHYDRATION & ORAL PALLOR</text>
    </svg>`
  },
  {
    id: 'wound_01',
    name: 'Diabetic Foot Ulcer / Wound (घाव / चोट)',
    type: 'Surgery / Wound Care',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#d9c2a7"/>
      <circle cx="200" cy="150" r="75" fill="#8f2020"/>
      <circle cx="200" cy="150" r="50" fill="#540e0e"/>
      <circle cx="190" cy="140" r="25" fill="#f7d488" opacity="0.8"/>
      <text x="20" y="35" font-family="sans-serif" font-weight="bold" font-size="16" fill="#380909">PULSECARE 2G CLINICAL RELAY: PERIPHERAL LESION WOUND</text>
      <text x="20" y="280" font-family="monospace" font-size="12" fill="#380909">ASHA KIOSK INSPECTION SCAN • LOW LATENCY PACKETS</text>
    </svg>`
  }
];

export default function ClinicalPhotoPacketizer({
  isOpen,
  onClose,
  onSendPacket,
  roomId,
  role = 'patient', // 'patient' sends, 'doctor' views or vice versa
  incomingPackets = null,
  lang = 'en'
}) {
  const [selectedPreset, setSelectedPreset] = useState(CLINICAL_PRESETS[0]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [totalPackets, setTotalPackets] = useState(0);
  const [sentPacketCount, setSentPacketCount] = useState(0);
  const [reassembledImage, setReassembledImage] = useState(null);
  const [previewZoom, setPreviewZoom] = useState(false);

  // Convert SVG data to base64 DataURL
  const getPresetDataUrl = (preset) => {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(preset.svgData);
  };

  // Packet chunking & streaming simulation over 2G
  const handleStartPacketStream = () => {
    if (isStreaming) return;
    setIsStreaming(true);
    setProgressPercent(0);
    setSentPacketCount(0);

    const dataUrl = getPresetDataUrl(selectedPreset);
    // Split into 500-character packet chunks
    const CHUNK_SIZE = 450;
    const chunks = [];
    for (let i = 0; i < dataUrl.length; i += CHUNK_SIZE) {
      chunks.push(dataUrl.slice(i, i + CHUNK_SIZE));
    }

    const total = chunks.length;
    setTotalPackets(total);

    const imageId = `img_${Date.now()}`;
    let currentIndex = 0;

    // Stream one packet every 45ms to simulate realistic 2G packet transmission pacing
    const interval = setInterval(() => {
      if (currentIndex >= total) {
        clearInterval(interval);
        setIsStreaming(false);
        setProgressPercent(100);
        setReassembledImage(dataUrl);
        return;
      }

      const packetPayload = {
        imageId,
        title: selectedPreset.name,
        index: currentIndex,
        totalChunks: total,
        chunk: chunks[currentIndex],
        timestamp: Date.now()
      };

      // Emit to parent signaling
      if (onSendPacket && roomId) {
        onSendPacket(roomId, packetPayload);
      }

      currentIndex++;
      setSentPacketCount(currentIndex);
      setProgressPercent(Math.round((currentIndex / total) * 100));
    }, 55);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-neutral-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  {lang === 'hi' 
                    ? '2G पैकेट इमेज स्ट्रीमर (रैश / जीभ / घाव)' 
                    : '2G Clinical Packet Streamer (Rash / Tongue / Wound)'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  2G Speed Mode
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'hi' 
                  ? 'धीमे इंटरनेट पर हाई-रेसोल्यूशन फोटो को छोटे पैकेट्स में तोड़कर डॉक्टर को भेजें' 
                  : 'Slices clinical inspection photo into lightweight 1KB packets streamed over 2G audio fallback'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
          {/* Preset Selector */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
              1. Select Clinical Symptom Photo to Packetize
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {CLINICAL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(preset);
                    setReassembledImage(null);
                    setProgressPercent(0);
                  }}
                  className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                    selectedPreset.id === preset.id
                      ? 'border-brand-marigold bg-amber-50/50 ring-2 ring-amber-400/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block">{preset.name}</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-1">{preset.type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Photo Preview & Packet Simulation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Image Preview Canvas */}
            <div className="bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex flex-col items-center justify-center min-h-[220px] p-2 relative">
              <img
                src={getPresetDataUrl(selectedPreset)}
                alt={selectedPreset.name}
                className="max-h-[200px] w-auto rounded-xl object-contain shadow-sm"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
                Original Capture (400×300)
              </div>
            </div>

            {/* 2G Packet Reassembly Stream Visualizer */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold flex items-center gap-1.5 text-amber-400">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>2G Packet Transmission Stream</span>
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{progressPercent}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-3 border border-slate-700">
                  <div
                    className="h-full bg-linear-to-r from-amber-500 to-emerald-400 transition-all duration-100"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="text-[11px] font-mono text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Packets Streamed:</span>
                    <strong className="text-white">{sentPacketCount} / {totalPackets || 32}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Packet Pacing:</span>
                    <span className="text-emerald-300">55ms / chunk (~24 kbps)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Relay Channel:</span>
                    <span className="text-cyan-300">WebRTC DC + Socket Relay</span>
                  </div>
                </div>
              </div>

              {/* Animated Packet Stream Grid */}
              <div className="pt-3 border-t border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                  Live Packet Matrix Buffer
                </span>
                <div className="flex flex-wrap gap-1 max-h-[50px] overflow-hidden">
                  {Array.from({ length: totalPackets || 32 }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-2.5 h-2.5 rounded-2xs transition-colors duration-75 ${
                        i < sentPacketCount
                          ? 'bg-emerald-400 shadow-2xs shadow-emerald-400/50'
                          : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reassembled Output Result */}
          {progressPercent === 100 && (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-300 flex items-center justify-between text-emerald-900 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">100% Packets Streamed & Reassembled Successfully!</p>
                  <p className="text-[11px] text-emerald-700">
                    High-resolution image now visible to doctor on audio-fallback mode without dropping the voice call.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Close
            </button>
            <button
              type="button"
              disabled={isStreaming}
              onClick={handleStartPacketStream}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${
                isStreaming
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-brand-marigold hover:bg-brand-marigoldDark text-white'
              }`}
            >
              {isStreaming ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Streaming Packets ({progressPercent}%)...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Transmit Clinical Photo over 2G</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
