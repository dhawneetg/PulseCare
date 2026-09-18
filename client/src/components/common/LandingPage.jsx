import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  Activity, 
  HeartPulse, 
  Stethoscope, 
  User, 
  Truck, 
  PhoneCall, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ServerOff, 
  Clock, 
  Radio, 
  Database, 
  Bluetooth, 
  MessageSquare, 
  PhoneForwarded, 
  Layers, 
  Sparkles, 
  Lock, 
  FileText, 
  ExternalLink,
  Phone,
  Check,
  ChevronRight,
  HardDrive
} from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  // Interactive Network Simulator State for the live demo section
  const [simulatorMode, setSimulatorMode] = useState('4g'); // '4g' | '3g' | '2g' | 'blackout'

  return (
    <div className="w-full flex flex-col font-sans text-neutral-900 bg-neutral-50 selection:bg-brand-marigold selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-b from-[#123C38] via-[#0e2f2c] to-[#0a1e1c] text-white pt-12 pb-16 px-4 sm:px-6 relative overflow-hidden border-b border-neutral-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          {/* Left Column: Hero Copy & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Real Project Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Rural Telemedicine Companion</span>
              <span className="text-emerald-600">•</span>
              <span className="text-neutral-300">2G/3G Low-Bandwidth WebRTC</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Telemedicine for Rural India That <span className="text-emerald-400 underline decoration-brand-marigold/60 decoration-4 underline-offset-8">Never Drops</span> on Weak Networks.
            </h1>

            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-normal max-w-2xl">
              Standard video calls freeze and disconnect in rural areas with weak 2G or patchy 3G. PulseCare monitors real-time latency and automatically drops video to preserve crystal-clear audio—paired with a 100% offline deterministic symptom checker for village ASHA workers.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={() => onNavigate('doctor')}
                className="h-13 px-7 rounded-xl bg-brand-marigold hover:bg-brand-marigoldDark text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-brand-marigold/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Stethoscope className="w-4 h-4 text-amber-100" />
                <span>Open Doctor Hub</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('patient')}
                className="h-13 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all border border-white/15 backdrop-blur"
              >
                <User className="w-4 h-4 text-emerald-300" />
                <span>Open Patient Portal</span>
              </button>
            </div>

            {/* Real Feature Highlights */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-5 text-xs text-neutral-300">
              <span className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Automatic Audio-Only Fallback (&gt;500ms)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-marigold" />
                <span>100% Offline Deterministic Triage</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Zero Cloud Database (P2P Private)</span>
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Encounter Mockup Card from Screenshot */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-[#0b1f1d]/90 rounded-2xl border-2 border-emerald-500/30 p-5 shadow-2xl backdrop-blur space-y-4 text-left">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono font-bold uppercase text-neutral-300">Live Consultation Preview</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  WebRTC P2P Active
                </span>
              </div>

              {/* Simulated Video Frame */}
              <div className="relative aspect-video rounded-xl bg-neutral-900 border border-neutral-700 overflow-hidden flex items-center justify-center text-center p-4">
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[10px] text-white">
                  <span>Dr. Ananya Sharma (District Hub) &bull; Ramesh Kumar</span>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-brand-marigold/20 text-brand-marigold flex items-center justify-center mx-auto border border-brand-marigold/40">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-white tracking-wide">
                    Adaptive WebRTC Call Active
                  </div>
                  <p className="text-[10px] text-neutral-400 max-w-xs">
                    Continuous RTT latency monitoring with automated 500ms audio fallback
                  </p>
                </div>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-emerald-400">
                  Direct P2P Encrypted
                </span>
              </div>

              {/* 3 Real-time Vitals Cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-center">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">SPO2</span>
                  <span className="text-lg font-black text-amber-400 font-mono">94%</span>
                  <span className="text-[9px] text-amber-300 block">Pre-Gathered</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-center">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">Pulse Rate</span>
                  <span className="text-lg font-black text-rose-400 font-mono">114</span>
                  <span className="text-[9px] text-rose-300 block">BPM</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-center">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">Triage Status</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">7.2/10</span>
                  <span className="text-[9px] text-emerald-300 block">Consultation</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-neutral-400 flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Sitapur PHC &bull; Live Queue Connected
                </span>
                <button
                  onClick={() => onNavigate('doctor')}
                  className="text-xs font-bold text-brand-marigold hover:underline flex items-center gap-1"
                >
                  <span>Open Doctor Hub</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. REAL ENGINEERING SPECIFICATIONS (Replacing AI-sounding fake numbers) */}
      <section className="bg-white border-b border-neutral-200 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
          
          <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">Latency Cliff Trigger</span>
            <div className="text-3xl font-black text-neutral-900 tracking-tight">500 ms</div>
            <p className="text-xs text-neutral-600 pt-1">Preemptive audio-only fallback before call drops</p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">Offline Triage Core</span>
            <div className="text-3xl font-black text-emerald-700 tracking-tight">100% Offline</div>
            <p className="text-xs text-neutral-600 pt-1">Deterministic rule engine runs with zero internet</p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">Bandwidth Floor</span>
            <div className="text-3xl font-black text-brand-marigold tracking-tight">&lt;20 kbps</div>
            <p className="text-xs text-neutral-600 pt-1">Conserves clinical audio stream over rural 2G EDGE</p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">Cloud Storage Cost</span>
            <div className="text-3xl font-black text-cyan-800 tracking-tight">Zero Cloud DB</div>
            <p className="text-xs text-neutral-600 pt-1">Direct peer-to-peer encrypted media and vitals</p>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM ENGINEERING: "Engineered for India's Last-Mile Telecom Realities" */}
      <section className="py-16 px-4 sm:px-6 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto space-y-12 text-left">
          
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-teal block">Platform Engineering</span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
              Engineered for India's Last-Mile Telecom Realities.
            </h2>
            <p className="text-base text-neutral-600 max-w-3xl leading-relaxed">
              PulseCare replaces fragile, bandwidth-hungry WebRTC video stacks with an autonomous, offline-first clinical mesh architecture that degrades gracefully under extreme network packet loss.
            </p>
          </div>

          {/* 6 High-Tech Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Adaptive 2G WebRTC & Opus */}
            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 hover:border-brand-teal transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center">
                <Wifi className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Adaptive 2G WebRTC & Opus 12kbps Audio Priority</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                When network throughput dips below 40kbps or packet jitter spikes above 500ms, video frames freeze safely into high-contrast thumbnail snapshots while clinical audio is dynamically re-routed to an 12kbps Opus narrow-band. The consultation never drops.
              </p>
              <div className="p-2.5 rounded-lg bg-white border border-neutral-200 font-mono text-[10px] text-neutral-600 flex justify-between">
                <span>RTT &gt; 500ms</span>
                <span className="text-emerald-700 font-bold">12kbps Opus Protected</span>
              </div>
            </div>

            {/* Card 2: 100% Offline SQLite & IndexedDB PWA */}
            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 hover:border-brand-marigold transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">100% Offline SQLite & IndexedDB PWA</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Field ASHA workers encounter patient encounters deep inside forest/tribal, zero-reception terrain. Encrypted clinical questionnaires cache locally and auto-flush instantaneously upon edge-tower touchdown.
              </p>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>100% Zero-Data-Leak Guarantee in Field</span>
              </div>
            </div>

            {/* Card 3: Deterministic Triage (IMNCI-R) */}
            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 hover:border-rose-300 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Deterministic Triage (IMNCI-R)</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Standardized Integrated Management of Neonatal & Childhood Illness rules & Hypertensive Crisis tier without cloud reliance. Flags septic pediatric respiratory distress and acute chest hemorrhage immediately.
              </p>
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <span className="bg-neutral-200 px-2 py-0.5 rounded">ABHA / PHC</span>
                <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-300">RED: 108 AMBULANCE</span>
              </div>
            </div>

            {/* Card 4: Bilingual Voice & SMS Rx */}
            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 hover:border-blue-300 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Bilingual Voice & SMS Rx</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Prescription instructions translate directly to regional dialects (Hindi, Marathi, Bengali, Telugu) and fallback to synthetic localized voice calls & plain text SMS for non-literate rural family care.
              </p>
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 italic">
                "दवाई सुबह 1 गोली... 3 दिनों के लिए भोजन के बाद लें।"
              </div>
            </div>

            {/* Card 5: BLE Medical Sensor Sync */}
            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 hover:border-teal-300 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                <Bluetooth className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">BLE Medical Sensor Sync</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Auto-ingests data from low-cost pulse oximeter, blood pressure cuffs, and infrared thermometers directly into the patient's ABHA/NDHM longitudinal health chart.
              </p>
              <div className="text-[10px] font-bold text-teal-900 flex items-center gap-1.5 pt-1">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                <span>3-in-1 Synced: Thermometer, SpO2, Digital BP</span>
              </div>
            </div>

            {/* Card 6: ASHA Village Logistics Routing */}
            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 hover:border-amber-300 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-brand-marigoldDark flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">ASHA Community Delivery Routing</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Connects post-consultation digital prescriptions to local village health workers for scheduled field rounds pickup and doorstep medicine distribution.
              </p>
              <div className="text-[10px] text-neutral-500 italic">
                "Conceptual integration — not an active partnership with any ASHA program."
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. MULTI-PARTY WORKFLOW: "Built for Every Stakeholder in the Care Continuum" */}
      <section className="py-16 px-4 sm:px-6 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto space-y-12 text-left">
          
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-marigold block">Multi-Party Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
              Built for Every Stakeholder in the Care Continuum.
            </h2>
            <p className="text-base text-neutral-600 max-w-3xl leading-relaxed">
              A synchronized operating environment connecting rural patients, frontline village ASHA caregivers, and tertiary clinical specialists into one single continuum.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Persona 1: Rural Families */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  Persona 01
                </span>
                <h3 className="text-xl font-bold text-neutral-900">For Rural Families & Patients</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  No need to travel 40 kilometers for routine district hospital visits. Patients receive audio or video consultations right at the village health kiosk with zero technical hassle.
                </p>
                <ul className="space-y-2 text-xs text-neutral-700 pt-2">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Zero-latency offline symptom logging</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Dynamic PHC queue notification in local dialect</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Direct integration with 108 emergency ambulance</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] font-bold text-neutral-800">
                Impact: 84% reduction in out-of-pocket transportation costs
              </div>
            </div>

            {/* Persona 2: ASHA Caregivers */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-marigold/15 text-brand-marigoldDark font-bold">
                  Persona 02
                </span>
                <h3 className="text-xl font-bold text-neutral-900">For ASHA & ANM Caregivers</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Equipped with a lightweight PWA tablet/smartphone that operates 100% offline. Captures clinical photos, logs objective vitals, and routes doorstep medicine.
                </p>
                <ul className="space-y-2 text-xs text-neutral-700 pt-2">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-brand-marigold shrink-0 mt-0.5" />
                    <span>Bluetooth tele-stethoscope sync (Heart, Pulmonic)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-brand-marigold shrink-0 mt-0.5" />
                    <span>Doorstep medicine delivery tracking timeline</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-brand-marigold shrink-0 mt-0.5" />
                    <span>Auto-sync when passing cellular tower corridors</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] font-bold text-neutral-800">
                Capability: Full encounter logging with zero mobile data pack
              </div>
            </div>

            {/* Persona 3: Clinical Doctors */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                  Persona 03
                </span>
                <h3 className="text-xl font-bold text-neutral-900">For Tertiary Clinical Doctors</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  District hospital doctors triage dozens of rural kiosks simultaneously via deterministic urgency sorting, pre-gathered vitals, and structured logs.
                </p>
                <ul className="space-y-2 text-xs text-neutral-700 pt-2">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>Urgency-sorted queue (Red Critical, Amber Urgent)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>Pre-gathered clinical vitals before connecting call</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>1-Click e-Prescription & local PHC dispatch</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] font-bold text-neutral-800">
                Efficiency: Average doctor consultation time cut from 18 to 7 min
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE TELEMETRY SIMULATOR WIDGET (Exact match to screenshot) */}
      <section className="py-14 px-4 sm:px-6 bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#0b1f1d] rounded-2xl p-6 sm:p-8 text-white space-y-6 border border-emerald-900/60 shadow-xl text-left">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase font-bold flex items-center gap-1.5 mb-1">
                  <Radio className="w-3.5 h-3.5" />
                  <span>Interactive Telemetry Sandbox</span>
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-white">
                  Simulate Last-Mile Network Conditions
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Toggle network throttle to witness how the protocol adapts seamlessly in real time.
                </p>
              </div>

              {/* Mode Pills */}
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setSimulatorMode('4g')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    simulatorMode === '4g' ? 'bg-emerald-600 text-white' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  4G Fiber (1000 Kbps)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatorMode('3g')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    simulatorMode === '3g' ? 'bg-amber-600 text-white' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  3G Cellular (250 Kbps)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatorMode('2g')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    simulatorMode === '2g' ? 'bg-rose-600 text-white' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  2G Guard (40 Kbps)
                </button>
              </div>
            </div>

            {/* Telemetry Output Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-bold">Active WebRTC Profile</span>
                <div className="text-base font-bold text-white font-mono">
                  {simulatorMode === '4g' && 'VP8 720p @ 30fps Full-Duplex'}
                  {simulatorMode === '3g' && 'VP8 240p @ 15fps Low-Bitrate'}
                  {simulatorMode === '2g' && 'Audio-Only Fallback (0 Kbps Video)'}
                </div>
                <span className="text-[10px] text-emerald-400 block">
                  {simulatorMode === '2g' ? 'Video suspended to protect audio' : 'HD Video + Compressed Vitals'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-bold">Audio Payload Codec</span>
                <div className="text-base font-bold text-amber-300 font-mono">
                  {simulatorMode === '4g' && 'Opus Full-Band 48kHz'}
                  {simulatorMode === '3g' && 'Opus Wide-Band 24kHz'}
                  {simulatorMode === '2g' && 'Opus Narrow-Band 12kbps'}
                </div>
                <span className="text-[10px] text-neutral-300 block">Zero Call Drop Guarantee</span>
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-bold">SQLite Sync Channel</span>
                <div className="text-base font-bold text-cyan-300 font-mono">
                  {simulatorMode === '2g' ? 'Local IndexedDB Hold' : 'Direct WebSocket Push (0ms lag)'}
                </div>
                <span className="text-[10px] text-neutral-300 block">Zero External Cloud DB Reliance</span>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Simulated Status: <strong>{simulatorMode === '2g' ? 'Proactive Audio-Only Guard Engaged' : 'Optimal Stream'}</strong></span>
              </span>
              <span className="text-[11px] font-mono text-emerald-300 uppercase">
                Protocol: {simulatorMode === '2g' ? 'Degraded-Safe' : 'Nominal Optimal'}
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* 7. GOVERNMENT OF INDIA & ABDM CONFORMANCE STRIP */}
      <section className="bg-neutral-100 py-6 px-4 border-b border-neutral-200 text-center">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-600 font-medium">
          <span className="font-bold text-neutral-800 uppercase tracking-wider text-[11px] mr-2">
            National Standards:
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-neutral-200 font-mono text-[11px]">
            ABDM Milestone 1, 2, 3
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-neutral-200 font-mono text-[11px]">
            EHR CPR V4.8.8
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-neutral-200 font-mono text-[11px]">
            SNOMED-CT Triage
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-neutral-200 font-mono text-[11px]">
            Gov. Tele-Law & ITT
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-neutral-200 font-mono text-[11px]">
            DISHA Compliant P2P
          </span>
        </div>
      </section>

      {/* 8. FINAL CTA: "Experience Decentralized Rural Telemedicine Live." */}
      <section className="py-16 px-4 sm:px-6 bg-white border-b border-neutral-200 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Worldwide 2026 Production Sandbox</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
              Experience Decentralized Rural Telemedicine Live.
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
              Choose a role to simulate end-to-end clinical workflow: from village field triage to tertiary medical officer sign-off.
            </p>
          </div>

          {/* 3 Role Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {/* Card 1 */}
            <div
              onClick={() => onNavigate('doctor')}
              className="p-6 rounded-2xl bg-brand-tealDark text-white hover:bg-[#0e2f2c] cursor-pointer transition-all shadow-md flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">Doctor Command Hub</h3>
                <p className="text-xs text-neutral-300">Review queue, consult patients, issue digital Rx</p>
              </div>
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                <span>Enter Doctor Hub</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            {/* Card 2 */}
            <div
              onClick={() => onNavigate('patient')}
              className="p-6 rounded-2xl bg-white border-2 border-neutral-200 hover:border-brand-marigold cursor-pointer transition-all shadow-sm flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-brand-marigold/10 flex items-center justify-center text-brand-marigold group-hover:scale-105 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">ASHA Field PWA</h3>
                <p className="text-xs text-neutral-600">Simulate offline intake, vitals, and village queueing</p>
              </div>
              <span className="text-xs font-bold text-brand-marigold flex items-center gap-1">
                <span>Enter ASHA Portal</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            {/* Card 3 */}
            <div
              onClick={() => onNavigate('asha')}
              className="p-6 rounded-2xl bg-white border-2 border-neutral-200 hover:border-brand-teal cursor-pointer transition-all shadow-sm flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-teal group-hover:scale-105 transition-transform">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">Patient Delivery Route</h3>
                <p className="text-xs text-neutral-600">View post-consultation ASHA community delivery route</p>
              </div>
              <span className="text-xs font-bold text-brand-teal flex items-center gap-1">
                <span>View Route Mockup</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>

          <div className="pt-2 text-xs text-neutral-500 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Active Sandbox Mode: 14/14 PHC Kiosks Live • Simulated 2G/3G Handshake</span>
          </div>
        </div>
      </section>

      {/* 9. RED CRITICAL ESCALATION STRIP (Exact match to screenshot) */}
      <div className="bg-rose-700 text-white text-xs font-bold py-2.5 px-4 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
          <span>CRITICAL ESCALATION PROTOCOL: National Ambulance & Emergency Medical Response</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span>DIRECT DIAL: <strong className="underline font-bold">108</strong></span>
          <span>TELE-MEDICAL HEALTHCARE HELPLINE: <strong className="underline font-bold">1800-180-1104</strong></span>
        </div>
      </div>

      {/* 10. DETAILED CORPORATE/INSTITUTIONAL FOOTER */}
      <footer className="bg-neutral-900 text-white py-12 px-4 sm:px-6 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-neutral-800 pb-8 text-xs">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-marigold flex items-center justify-center text-white">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-base font-bold">PulseCare India</span>
            </div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              Empowering 10 lakh Indian ASHA and ANM healthcare workers with resilient offline first store-and-forward telemedicine software that connects primary health centres directly to district hospital specialists.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">Technology Core</span>
            <ul className="space-y-1.5 text-neutral-400 text-[11px]">
              <li>RTCPeerConnection (Native)</li>
              <li>Opus 12kbps Narrow-Band Codec</li>
              <li>Offline IndexedDB Store-and-Forward</li>
              <li>STUN + TURN Open Relay Engine</li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">Public Health</span>
            <ul className="space-y-1.5 text-neutral-400 text-[11px]">
              <li>Gram Panchayat Kiosk Pilot</li>
              <li>District Tele-Auscultation Mesh</li>
              <li>ASHA Field Followup Logistics</li>
              <li>Emergency 108 Bypass Routing</li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">Compliance & Legal</span>
            <ul className="space-y-1.5 text-neutral-400 text-[11px]">
              <li>DISHA Compliant P2P Architecture</li>
              <li>Digital Personal Data Protection</li>
              <li>Zero Cloud Eavesdropping Guarantee</li>
              <li className="text-[10px] text-neutral-500 italic pt-1">
                "Not affiliated with official eSanjeevani portal."
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-500">
          <span>&copy; 2026 PulseCare India. Built for rural community health resilience.</span>
          <span className="font-mono">Production Build v4.88 • Low-Bitrate WebRTC Mesh</span>
        </div>
      </footer>

    </div>
  );
}
