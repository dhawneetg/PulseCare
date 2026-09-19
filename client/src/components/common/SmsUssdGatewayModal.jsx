import React, { useState } from 'react';
import { MessageSquare, Phone, X, Send, ShieldCheck, Terminal, Smartphone, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SmsUssdGatewayModal({ isOpen, onClose, lang = 'en' }) {
  if (!isOpen) return null;

  const isHi = lang === 'hi';
  const [activeTab, setActiveTab] = useState('ussd'); // 'ussd' | 'sms' | 'architecture'

  // USSD Interactive State
  const [ussdInput, setUssdInput] = useState('*144#');
  const [ussdScreen, setUssdScreen] = useState('main'); // 'idle' | 'main' | 'triage_age' | 'triage_symptom' | 'result'
  const [ussdAge, setUssdAge] = useState('');
  const [ussdSelectedOption, setUssdSelectedOption] = useState('');

  // SMS Simulator State
  const [smsSender, setSmsSender] = useState('+91 98765 12340');
  const [smsPayload, setSmsPayload] = useState('PC BRB08 RED 52 CHESTPAIN');
  const [parsedSms, setParsedSms] = useState(null);

  const handleDialUssd = (e) => {
    e.preventDefault();
    if (ussdInput.trim() === '*144#' || ussdInput.trim() === '*144') {
      setUssdScreen('main');
    }
  };

  const handleUssdSubmitOption = (e) => {
    e.preventDefault();
    const opt = ussdSelectedOption.trim();
    if (ussdScreen === 'main') {
      if (opt === '1') setUssdScreen('triage_symptom');
      else if (opt === '2') setUssdScreen('emergency_beacon');
      else setUssdScreen('main');
      setUssdSelectedOption('');
    } else if (ussdScreen === 'triage_symptom') {
      setUssdScreen('result');
      setUssdSelectedOption('');
    }
  };

  const handleParseSms = (e) => {
    e.preventDefault();
    const tokens = smsPayload.trim().split(/\s+/);
    if (tokens.length >= 4) {
      setParsedSms({
        prefix: tokens[0],
        villageCode: tokens[1],
        urgency: tokens[2].toUpperCase(),
        age: tokens[3],
        symptom: tokens.slice(4).join(' ') || 'General Illness',
        senderPhone: smsSender,
        timestamp: new Date().toLocaleTimeString(),
        status: 'Processed & Injected into District Tele-Hub Queue'
      });
    } else {
      setParsedSms({
        error: 'Invalid SMS syntax. Expected: PC <VILLAGE> <URGENCY> <AGE> <SYMPTOMS>'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 text-white rounded-3xl w-full max-w-2xl shadow-2xl border border-teal-500/30 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-teal-300">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {isHi ? 'ऑफ़लाइन SMS व USSD (*144#) गेटवे' : 'Offline SMS & USSD (*144#) Fallback Gateway'}
              </h3>
              <p className="text-xs text-teal-200/80 font-medium">
                {isHi ? 'शून्य-इंटरनेट वाले 2G/GSM क्षेत्रों के लिए टेलीमेडिसिन' : 'Telemedicine for zero-internet 2G cellular dead zones'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-black/20 text-xs font-bold">
          <button
            onClick={() => setActiveTab('ussd')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'ussd'
                ? 'border-emerald-400 text-emerald-300 bg-white/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            📱 USSD Simulator (*144#)
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'sms'
                ? 'border-emerald-400 text-emerald-300 bg-white/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            💬 GSM SMS Dispatch
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'architecture'
                ? 'border-emerald-400 text-emerald-300 bg-white/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            💡 Free Cloud Setup (Render)
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-4 text-left">
          {/* TAB 1: USSD GSM Simulator */}
          {activeTab === 'ussd' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Retro Feature Phone Screen Mockup */}
              <div className="md:col-span-6 bg-emerald-950/80 p-4 rounded-2xl border-4 border-slate-700 shadow-inner font-mono text-xs text-emerald-300 space-y-3">
                <div className="flex items-center justify-between text-[10px] text-emerald-500 border-b border-emerald-800 pb-1">
                  <span>📶 BSNL 2G (GSM)</span>
                  <span>NO DATA • VOICE/USSD ONLY</span>
                </div>

                {ussdScreen === 'main' && (
                  <div className="space-y-2">
                    <p className="font-bold text-white">
                      PulseCare Triage Service<br />
                      1. Check Patient Symptoms<br />
                      2. ASHA Emergency SOS<br />
                      3. Check PHC Doctor Status
                    </p>
                    <p className="text-[10px] text-emerald-400">Enter option (1-3):</p>
                  </div>
                )}

                {ussdScreen === 'triage_symptom' && (
                  <div className="space-y-2">
                    <p className="font-bold text-white">
                      Select Primary Symptom:<br />
                      1. Chest Pain / Breathless (Red)<br />
                      2. High Fever & Chills (Amber)<br />
                      3. General Cough & Cold (Green)
                    </p>
                    <p className="text-[10px] text-emerald-400">Reply 1, 2, or 3:</p>
                  </div>
                )}

                {ussdScreen === 'emergency_beacon' && (
                  <div className="space-y-2 text-rose-300">
                    <p className="font-bold text-rose-200">
                      🚨 ASHA SOS BROADCAST<br />
                      GPS Cell ID: UP-BRB-Sector 4<br />
                      Alerting District Tele-Hub & 108 EMS.
                    </p>
                    <p className="text-[10px] text-emerald-400">Press 0 to return to Menu.</p>
                  </div>
                )}

                {ussdScreen === 'result' && (
                  <div className="space-y-2 text-emerald-200">
                    <p className="font-bold text-white">
                      TRIAGE CODE: #TR-9821<br />
                      Urgency: CRITICAL RED<br />
                      Guidance: 108 Ambulance Alerted. Keep patient seated upright.
                    </p>
                    <p className="text-[10px] text-emerald-400">Press 0 to reset.</p>
                  </div>
                )}

                <form onSubmit={handleUssdSubmitOption} className="flex gap-2 pt-2 border-t border-emerald-800">
                  <input
                    type="text"
                    value={ussdSelectedOption}
                    onChange={(e) => setUssdSelectedOption(e.target.value)}
                    placeholder="Type reply..."
                    className="flex-1 bg-black/50 border border-emerald-600 px-2 py-1.5 text-xs text-white rounded focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs"
                  >
                    Send
                  </button>
                </form>
              </div>

              {/* USSD Explanation Side */}
              <div className="md:col-span-6 space-y-3 text-xs text-neutral-300">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>How USSD Works in Real Rural India</span>
                </h4>
                <p className="leading-relaxed">
                  USSD (Unstructured Supplementary Service Data) works on <strong>any ₹800 basic keypad feature phone</strong> with zero internet data or pack active.
                </p>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1 text-[11px]">
                  <p>• Uses GSM cellular signaling channel (zero packet data needed).</p>
                  <p>• Sessions are synchronous and cost virtually nothing to rural users.</p>
                  <p>• Perfect for ASHA workers in remote forest or desert hamlets.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUssdScreen('main')}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold"
                >
                  Restart USSD Session (*144#)
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SMS Simulator */}
          {activeTab === 'sms' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-300 leading-relaxed">
                When internet drops completely, ASHA workers send structured shortcodes to the District Telemedicine Gateway:
              </p>

              <form onSubmit={handleParseSms} className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                      ASHA Sender Phone
                    </label>
                    <input
                      type="text"
                      value={smsSender}
                      onChange={(e) => setSmsSender(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/15 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                      Target Gateway Number
                    </label>
                    <input
                      type="text"
                      disabled
                      value="51969 (National Health Mission)"
                      className="w-full h-9 px-3 rounded-lg bg-black/20 border border-white/10 text-neutral-400 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                    Structured SMS Text Body
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={smsPayload}
                      onChange={(e) => setSmsPayload(e.target.value)}
                      placeholder="PC <VILLAGE> <SEVERITY> <AGE> <SYMPTOMS>"
                      className="flex-1 h-10 px-3 rounded-lg bg-black/40 border border-white/15 text-white font-mono text-xs"
                    />
                    <button
                      type="submit"
                      className="px-4 h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Parse & Ingest</span>
                    </button>
                  </div>
                </div>
              </form>

              {parsedSms && (
                <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-2xl space-y-2 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>SMS Successfully Decoded & Queued</span>
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">{parsedSms.timestamp}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                    <div className="bg-black/30 p-2 rounded-lg">
                      <span className="text-neutral-400 block text-[10px]">Village Block</span>
                      <strong className="text-white">{parsedSms.villageCode}</strong>
                    </div>
                    <div className="bg-black/30 p-2 rounded-lg">
                      <span className="text-neutral-400 block text-[10px]">Triage Level</span>
                      <span className="text-rose-400 font-bold">{parsedSms.urgency}</span>
                    </div>
                    <div className="bg-black/30 p-2 rounded-lg">
                      <span className="text-neutral-400 block text-[10px]">Patient Age</span>
                      <strong className="text-white">{parsedSms.age} yrs</strong>
                    </div>
                    <div className="bg-black/30 p-2 rounded-lg">
                      <span className="text-neutral-400 block text-[10px]">Symptom</span>
                      <strong className="text-emerald-300">{parsedSms.symptom}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Architecture & Free Render Deployment Answer */}
          {activeTab === 'architecture' && (
            <div className="space-y-4 text-xs text-neutral-300 leading-relaxed">
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl space-y-2 text-emerald-200">
                <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>How We Keep This 100% Free on Render.com</span>
                </h4>
                <p>
                  <strong>No Paid Telecom Credits Needed for Demos:</strong> In commercial production, telecom aggregators (Twilio, MSG91) charge per SMS. But for your hackathon MVP, PulseCare features an internal <strong>mock cellular gateway</strong> that processes USSD and SMS queries with zero external dependencies.
                </p>
              </div>

              <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
                <h5 className="font-bold text-white text-xs uppercase tracking-wider">
                  How Judges Should See It:
                </h5>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-neutral-300">
                  <li><strong>Resilient 3-Tier Hierarchy:</strong> WebRTC Video (4G/Wi-Fi) ➔ Audio-Only / Text Relay (2G/3G) ➔ USSD/SMS Shortcodes (Offline GSM).</li>
                  <li><strong>Webhook Ready:</strong> An Express endpoint (<code className="text-amber-300 font-mono">POST /api/sms/inbound</code>) is architected to receive real incoming Webhooks from BSNL/C-DoT shortcodes with zero code rewrites.</li>
                  <li><strong>Zero Cost:</strong> Deploying the entire stack to Render.com remains 100% free under the hobby tier.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-black/40 border-t border-white/10 text-xs text-neutral-400 flex items-center justify-between">
          <span>PulseCare Low-Tech Resilience Layer</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs transition-colors"
          >
            Close Gateway
          </button>
        </div>
      </div>
    </div>
  );
}
