import React from 'react';
import { 
  Radio, 
  Activity, 
  Wifi, 
  WifiOff, 
  Database, 
  ShieldCheck, 
  Ambulance, 
  HardDrive, 
  TrendingUp, 
  AlertCircle,
  MapPin,
  CheckCircle2,
  Lock
} from 'lucide-react';

export function CommandHeaderMetrics({ queueCount = 18, onDispatch108 }) {
  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-sm space-y-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <span>District Hub Consultation & Tele-Queue Command</span>
            </h1>
            <p className="text-xs text-neutral-500 font-medium">
              District Hospital Hub 3 • Low-Bandwidth Triage & Consultation Gateway
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDispatch108}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-900/30 active:scale-95 transition-all"
          >
            <Ambulance className="w-4 h-4 animate-pulse" />
            <span>108 EMS Dispatch</span>
          </button>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-teal/10 text-brand-teal text-xs font-bold border border-brand-teal/20">
            <Radio className="w-3.5 h-3.5" />
            <span>Low-Bandwidth Mode: Auto Fallback ON</span>
          </span>
        </div>
      </div>

      {/* 4 Metric Cards from Tele-Hub design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-left">
        {/* Metric 1 */}
        <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">
            Patients In Queue
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-900">{queueCount}</span>
            <span className="text-xs text-neutral-500">Awaiting MD</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold mt-1.5">
            <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">3 Critical</span>
            <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">7 Urgent</span>
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">8 Routine</span>
          </div>
        </div>

        {/* Metric 2: Active Consultations & Fallback Status */}
        <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">
            Active Consultations
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-900">4</span>
            <span className="text-xs text-emerald-700 font-bold">In Session</span>
          </div>
          <p className="text-[10px] text-neutral-500 mt-1.5">
            3 Full Video • <span className="text-amber-600 font-bold">1 Audio-Only Fallback</span>
          </p>
        </div>

        {/* Metric 3: WebRTC Latency Guard */}
        <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">
            Adaptive WebRTC Guard
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">500 ms</span>
            <span className="text-xs text-neutral-500">RTT Fallback</span>
          </div>
          <p className="text-[10px] text-neutral-500 mt-1.5">
            Auto-downgrades video track to protect 16kbps audio
          </p>
        </div>

        {/* Metric 4: Completed Consults */}
        <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">
            Completed Today
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-brand-marigold">32</span>
            <span className="text-xs text-neutral-500">Patients</span>
          </div>
          <p className="text-[10px] text-neutral-500 mt-1.5">
            Avg Duration: <strong>6.8 min</strong> • Digital Rx Dispatched
          </p>
        </div>
      </div>
    </div>
  );
}

export function VillageKioskMatrix() {
  const kiosks = [
    { name: 'PHC Sitapur Hub', ping: '42 ms', note: 'Broadband / Stable Full Video', status: 'stable' },
    { name: 'Rampur Sub-Centre', ping: '535 ms', note: '2G Fringe: Auto-Switched to Audio-Only', status: 'degraded' },
    { name: 'Kilanpur Health Kiosk', ping: '620 ms', note: 'High Jitter: Audio Track Protected (<20kbps)', status: 'critical' },
    { name: 'Barabanki Village PHC', ping: '118 ms', note: '3G Cellular: Dynamic Bitrate OK', status: 'stable' },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-brand-teal" />
          <h3 className="text-sm font-bold text-neutral-900">Sub-Centre WebRTC Connection Status</h3>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          Live RTT Monitoring
        </span>
      </div>

      <p className="text-xs text-neutral-500 leading-relaxed">
        Real-time WebRTC peer connection telemetry. When round-trip latency exceeds 500ms, PulseCare automatically stops video transmission so doctors never lose voice contact.
      </p>

      <div className="space-y-2">
        {kiosks.map((k, idx) => (
          <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
            <div>
              <span className="font-bold text-neutral-900 block">{k.name}</span>
              <span className="text-[10px] text-neutral-500">{k.note}</span>
            </div>
            <div className="text-right">
              <span className={`font-mono font-bold block ${
                k.status === 'critical' ? 'text-rose-600' : k.status === 'degraded' ? 'text-amber-600' : 'text-emerald-700'
              }`}>
                {k.ping}
              </span>
              <span className="text-[10px] text-neutral-400 capitalize">{k.status === 'degraded' ? 'Audio Fallback' : k.status === 'critical' ? 'High Latency' : 'Connected'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
        <span>WebRTC Signaling Relay:</span>
        <strong className="font-mono text-neutral-900">P2P Direct (Local Signaling)</strong>
      </div>
    </div>
  );
}

export function LocalEncryptedStorageWidget() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-brand-teal" />
          <h3 className="text-sm font-bold text-neutral-900">Local Encrypted Cache (Zero Cloud DB)</h3>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Lock className="w-3 h-3" />
          <span>Local IndexedDB</span>
        </span>
      </div>

      <p className="text-xs text-neutral-600 leading-relaxed">
        All patient intake records, offline triage logs, and digital prescriptions are securely encrypted and cached locally inside browser memory in full compliance with rural health data standards.
      </p>

      <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1 text-xs">
        <div className="flex justify-between text-neutral-500 text-[11px]">
          <span>Encrypted Local Space:</span>
          <span className="font-mono font-bold text-neutral-800">16.2 MB / 2.0 GB</span>
        </div>
        <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
          <div className="bg-brand-teal h-full rounded-full w-[8%]" />
        </div>
        <div className="text-[10px] text-emerald-700 font-semibold pt-1 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>Zero cloud persistence • 100% Privacy Preserved</span>
        </div>
      </div>
    </div>
  );
}
