import React, { useState } from 'react';
import { Ambulance, PhoneCall, MapPin, ShieldAlert, CheckCircle2, Clock, X, Radio, ArrowRight } from 'lucide-react';

export default function AmbulanceDispatchModal({
  isOpen,
  onClose,
  patient,
  lang = 'en'
}) {
  if (!isOpen) return null;

  const isHi = lang === 'hi';
  const [stage, setStage] = useState(2); // 1: Alerted, 2: Dispatched, 3: En Route

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-rose-950/40 to-slate-950 text-white rounded-3xl w-full max-w-lg shadow-2xl border border-rose-500/40 overflow-hidden relative text-left">
        {/* Top Emergency Siren Banner */}
        <div className="px-6 py-4 bg-rose-600 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white text-rose-600 flex items-center justify-center font-black animate-pulse">
              <Ambulance className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-white uppercase">
                {isHi ? '108 आपातकालीन एम्बुलेंस डिस्पैच' : '108 Emergency EMS Dispatch'}
              </h3>
              <p className="text-xs text-rose-100 font-medium">
                {isHi ? 'राष्ट्रीय आपातकालीन जीवन रक्षक सेवा' : 'National Health Mission • Advanced Life Support (ALS)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Patient Emergency Context */}
          <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                {isHi ? 'मरीज़ एवं स्थान' : 'Patient & Location'}
              </span>
              <strong className="text-white text-sm">
                {patient?.name || 'Emergency Patient'} ({patient?.age || '52'}y)
              </strong>
              <span className="text-neutral-300 block">
                📍 {patient?.village || 'Kiosk Barabanki #08'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500 text-white animate-pulse">
                Critical Red
              </span>
              <span className="text-xs text-rose-300 block font-mono font-bold mt-1">
                Triage: {patient?.triageScore || '9.2/10'}
              </span>
            </div>
          </div>

          {/* Vehicle & Crew Telemetry */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Assigned ALS Unit</span>
              <strong className="text-emerald-400 text-sm font-mono block mt-0.5">UP-32-108-EMS</strong>
              <span className="text-[11px] text-neutral-300">Oxygen + Defib Equipped</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Pilot & Paramedic</span>
              <strong className="text-white text-sm block mt-0.5">Ramesh Yadav</strong>
              <span className="text-[11px] text-emerald-400 font-bold">● GPS Live Active</span>
            </div>
          </div>

          {/* Live Dispatch Timeline */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
              {isHi ? 'डिस्पैच प्रगति' : 'Real-Time Dispatch Pipeline'}
            </span>

            <div className="bg-black/40 p-4 rounded-2xl border border-white/10 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-white">1. Doctor Hub Emergency Signal Logged</div>
                  <div className="text-[11px] text-neutral-400">Transmitted over district telecommand relay</div>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">00:00</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-emerald-300">2. Ambulance UP-32-108 En Route to Kiosk</div>
                  <div className="text-[11px] text-neutral-300">Driver dispatched from District Base Station 4</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 font-mono">ETA 14m</span>
              </div>

              <div className="flex items-center gap-3 opacity-50">
                <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-neutral-300">3. Kiosk Evacuation & Hospital Admission</div>
                  <div className="text-[11px] text-neutral-400">Direct admission to ICU Ward 2 via priority green corridor</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <a
              href="tel:108"
              className="h-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>{isHi ? 'चालक को कॉल (+91 98765...)' : 'Call Ambulance Driver'}</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 transition-all active:scale-[0.98]"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>{isHi ? 'डिस्पैच मॉनिटरिंग बंद करें' : 'Monitor Live Dispatch'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
