import React from 'react';
import { PhoneCall, PhoneOff, UserCheck, Stethoscope, ShieldCheck, Activity } from 'lucide-react';

export default function IncomingCallModal({ 
  incomingCall, 
  onAccept, 
  onDecline,
  lang = 'en'
}) {
  if (!incomingCall) return null;

  const isHi = lang === 'hi';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#123C38] via-[#0E2E2A] to-[#081F1C] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-500/30 text-center overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-brand-marigold/20 rounded-full blur-2xl pointer-events-none" />

        {/* Animated Avatar / Ringing Badge */}
        <div className="relative mx-auto w-24 h-24 mb-5 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
          <span className="absolute inset-2 rounded-full bg-emerald-500/30 animate-pulse" />
          <div className="relative w-18 h-18 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 border-2 border-emerald-300 flex items-center justify-center shadow-lg shadow-emerald-950/60 text-white">
            <Stethoscope className="w-9 h-9" />
          </div>
        </div>

        {/* Call Details */}
        <div className="space-y-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <Activity className="w-3 h-3 animate-pulse" />
            {isHi ? 'आने वाली डॉक्टर कॉल' : 'Incoming Tele-Consultation'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {incomingCall.doctorName || (isHi ? 'डॉ. अनन्या शर्मा (जिला टेली-हब)' : 'Dr. Ananya Sharma')}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/70 font-medium">
            {isHi 
              ? 'जिला अस्पताल टेली-हब 3 • कम-बैंडविड्थ वीडियो/ऑडियो परामर्श'
              : 'District Hospital Tele-Hub 3 • Low-Bandwidth Medical Gateway'}
          </p>
        </div>

        {/* Connectivity info */}
        <div className="bg-black/30 border border-white/10 rounded-2xl p-3 mb-6 text-[11px] text-emerald-200/80 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {isHi 
              ? 'सुरक्षित WebRTC चैनल • 2G/3G नेटवर्क पर भी स्वतः सक्रिय' 
              : 'End-to-End Encrypted WebRTC • Auto fallback on 2G/3G'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onDecline}
            className="h-12 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <PhoneOff className="w-4 h-4" />
            <span>{isHi ? 'अस्वीकार करें' : 'Decline'}</span>
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all active:scale-[0.98] ring-2 ring-emerald-400/40"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>{isHi ? 'स्वीकार करें' : 'Accept Call'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
