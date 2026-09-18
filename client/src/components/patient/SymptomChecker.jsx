import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  HeartPulse, 
  Thermometer, 
  User, 
  MapPin, 
  PhoneCall, 
  ArrowRight, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { evaluateSymptoms, getTriageRationale } from '../../utils/triageTree.js';

const COMMON_SYMPTOMS = [
  { id: 'fever', label: 'Fever / High Temperature' },
  { id: 'cough', label: 'Cough / Sore Throat' },
  { id: 'body ache', label: 'Body Ache / Fatigue' },
  { id: 'headache', label: 'Persistent Headache' },
  { id: 'chest pain', label: 'Chest Pain / Pressure (Critical)' },
  { id: 'difficulty breathing', label: 'Difficulty Breathing (Critical)' },
  { id: 'vomiting', label: 'Vomiting / Loose Motion' },
  { id: 'joint pain', label: 'Joint / Knee Pain' },
];

export default function SymptomChecker({ onJoinQueue }) {
  const [step, setStep] = useState(1); // 1: Patient Details, 2: Vitals & Symptoms, 3: Triage Result
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    village: '',
    vitals: {
      temp: '98.6',
      bp: '120/80',
      pulse: '75',
      spo2: '98',
    },
    symptoms: [],
    customSymptom: '',
  });

  const [triageResult, setTriageResult] = useState(null);

  const toggleSymptom = (label) => {
    setPatientData(prev => {
      const exists = prev.symptoms.includes(label);
      return {
        ...prev,
        symptoms: exists
          ? prev.symptoms.filter(s => s !== label)
          : [...prev.symptoms, label]
      };
    });
  };

  const handleAddCustomSymptom = (e) => {
    e.preventDefault();
    if (!patientData.customSymptom.trim()) return;
    setPatientData(prev => ({
      ...prev,
      symptoms: [...prev.symptoms, prev.customSymptom.trim()],
      customSymptom: '',
    }));
  };

  const handleEvaluate = () => {
    const urgency = evaluateSymptoms(patientData.vitals, patientData.symptoms);
    const rationale = getTriageRationale(urgency, patientData.vitals, patientData.symptoms);
    setTriageResult({ urgency, rationale });
    setStep(3);
  };

  const handleReset = () => {
    setStep(1);
    setTriageResult(null);
    setPatientData({
      name: '',
      age: '',
      village: '',
      vitals: { temp: '98.6', bp: '120/80', pulse: '75', spo2: '98' },
      symptoms: [],
      customSymptom: '',
    });
  };

  const handleProceedToQueue = () => {
    if (onJoinQueue) {
      onJoinQueue({
        id: `p_${Date.now()}`,
        name: patientData.name || 'Anonymous Patient',
        age: parseInt(patientData.age, 10) || 35,
        village: patientData.village || 'Village Block',
        vitals: patientData.vitals,
        symptoms: patientData.symptoms.length > 0 ? patientData.symptoms : ['General Consultation'],
        urgency: triageResult?.urgency || 'consultation',
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full pb-28 pt-4 px-4">
      {/* Progress Indicator */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-brand-marigold text-white' : 'bg-neutral-200 text-neutral-600'}`}>
            1
          </span>
          <span className="text-sm font-medium text-neutral-700">Profile</span>
        </div>
        <div className="h-0.5 flex-1 mx-3 bg-neutral-200">
          <div className={`h-full bg-brand-marigold transition-all duration-300 ${step === 1 ? 'w-0' : step === 2 ? 'w-1/2' : 'w-full'}`} />
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-brand-marigold text-white' : 'bg-neutral-200 text-neutral-600'}`}>
            2
          </span>
          <span className="text-sm font-medium text-neutral-700">Symptoms</span>
        </div>
        <div className="h-0.5 flex-1 mx-3 bg-neutral-200">
          <div className={`h-full bg-brand-marigold transition-all duration-300 ${step <= 2 ? 'w-0' : 'w-full'}`} />
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 3 ? 'bg-brand-marigold text-white' : 'bg-neutral-200 text-neutral-600'}`}>
            3
          </span>
          <span className="text-sm font-medium text-neutral-700">Triage</span>
        </div>
      </div>

      {/* STEP 1: Basic Information */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Patient Information</h2>
            <p className="text-neutral-600 text-sm mt-1">
              Deterministic offline registration for village residents or ASHA workers.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-base font-semibold text-neutral-900 mb-2">
                Patient Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={patientData.name}
                  onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full h-14 pl-11 pr-4 rounded-xl border-2 border-neutral-200 focus:border-brand-marigold focus:outline-none text-lg text-neutral-900 font-medium"
                />
                <User className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-semibold text-neutral-900 mb-2">
                  Age (Years) *
                </label>
                <input
                  type="number"
                  value={patientData.age}
                  onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
                  placeholder="e.g. 45"
                  className="w-full h-14 px-4 rounded-xl border-2 border-neutral-200 focus:border-brand-marigold focus:outline-none text-lg text-neutral-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-neutral-900 mb-2">
                  Village / Block *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={patientData.village}
                    onChange={(e) => setPatientData({ ...patientData, village: e.target.value })}
                    placeholder="e.g. Rampur Block A"
                    className="w-full h-14 pl-10 pr-3 rounded-xl border-2 border-neutral-200 focus:border-brand-marigold focus:outline-none text-base text-neutral-900 font-medium"
                  />
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Quick Demo Autofill helper */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setPatientData({
                  name: 'Ramesh Kumar',
                  age: '45',
                  village: 'Rampur Village Block B',
                  vitals: { temp: '99.2', bp: '120/80', pulse: '76', spo2: '98' },
                  symptoms: ['Fever / High Temperature', 'Cough / Sore Throat'],
                  customSymptom: '',
                })}
                className="text-xs font-semibold text-brand-teal hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Autofill Demo Patient (Ramesh Kumar)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Vitals & Symptoms */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Vitals Card */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-brand-marigold" />
              <span>Current Vitals (Measured or Estimated)</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">
                  Temperature (°F)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={patientData.vitals.temp}
                    onChange={(e) => setPatientData({
                      ...patientData,
                      vitals: { ...patientData.vitals, temp: e.target.value }
                    })}
                    placeholder="98.6"
                    className="w-full h-12 pl-9 pr-3 rounded-lg border-2 border-neutral-200 focus:border-brand-marigold text-base font-semibold"
                  />
                  <Thermometer className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">
                  Blood Pressure (BP)
                </label>
                <input
                  type="text"
                  value={patientData.vitals.bp}
                  onChange={(e) => setPatientData({
                    ...patientData,
                    vitals: { ...patientData.vitals, bp: e.target.value }
                  })}
                  placeholder="120/80"
                  className="w-full h-12 px-3 rounded-lg border-2 border-neutral-200 focus:border-brand-marigold text-base font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">
                  Pulse Rate (BPM)
                </label>
                <input
                  type="text"
                  value={patientData.vitals.pulse}
                  onChange={(e) => setPatientData({
                    ...patientData,
                    vitals: { ...patientData.vitals, pulse: e.target.value }
                  })}
                  placeholder="75"
                  className="w-full h-12 px-3 rounded-lg border-2 border-neutral-200 focus:border-brand-marigold text-base font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">
                  Oxygen SpO2 (%)
                </label>
                <input
                  type="text"
                  value={patientData.vitals.spo2}
                  onChange={(e) => setPatientData({
                    ...patientData,
                    vitals: { ...patientData.vitals, spo2: e.target.value }
                  })}
                  placeholder="98"
                  className="w-full h-12 px-3 rounded-lg border-2 border-neutral-200 focus:border-brand-marigold text-base font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Symptoms Checklist */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-neutral-900">
              Select Observed Symptoms
            </h3>
            <p className="text-sm text-neutral-500">
              Tap all symptoms that apply. Evaluated offline via deterministic decision rules.
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {COMMON_SYMPTOMS.map((item) => {
                const isSelected = patientData.symptoms.includes(item.label);
                const isCritical = item.label.includes('(Critical)');

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSymptom(item.label)}
                    className={`h-14 px-4 rounded-xl border-2 text-left flex items-center justify-between font-semibold text-base transition-all ${
                      isSelected
                        ? isCritical
                          ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-sm'
                          : 'border-brand-marigold bg-brand-marigold/10 text-brand-marigoldDark shadow-sm'
                        : isCritical
                        ? 'border-neutral-200 hover:border-rose-300 text-neutral-800'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-800'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Symptom Input */}
            <form onSubmit={handleAddCustomSymptom} className="flex gap-2 pt-2">
              <input
                type="text"
                value={patientData.customSymptom}
                onChange={(e) => setPatientData({ ...patientData, customSymptom: e.target.value })}
                placeholder="Other specific symptom..."
                className="flex-1 h-12 px-3 rounded-lg border-2 border-neutral-200 focus:border-brand-marigold text-sm font-medium"
              />
              <button
                type="submit"
                className="px-4 h-12 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-semibold text-neutral-700 transition-colors"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STEP 3: Triage Result (Deterministic Output) */}
      {step === 3 && triageResult && (
        <div className="space-y-6">
          {triageResult.urgency === 'emergency' ? (
            /* Emergency Alert Banner & Screen */
            <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-6 text-rose-950 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider bg-rose-200 text-rose-900 px-2 py-0.5 rounded">
                    Critical Emergency Tier
                  </span>
                  <h3 className="text-2xl font-black text-rose-900 mt-0.5">
                    Immediate In-Person Care Required
                  </h3>
                </div>
              </div>

              <p className="text-base text-rose-900 font-medium leading-relaxed">
                The offline triage rule engine has detected critical red-flag indicators (critical symptoms or vital extremes). Remote telemedicine is bypassed to prevent delay.
              </p>

              <div className="bg-white/80 p-4 rounded-xl border border-rose-200 space-y-2">
                <div className="font-bold text-rose-950 text-sm">Action Plan:</div>
                <ul className="text-sm text-rose-900 space-y-1.5 list-disc list-inside">
                  <li>Proceed immediately to the nearest Primary Health Centre (PHC) or District Hospital.</li>
                  <li>Call National Emergency Medical Services (108 Ambulance).</li>
                  <li>Village ASHA worker has been flagged for emergency transit assistance.</li>
                </ul>
              </div>

              <div className="pt-2">
                <a
                  href="tel:108"
                  className="w-full h-16 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl px-6 flex items-center justify-center gap-2 text-xl shadow-md transition-colors"
                >
                  <PhoneCall className="w-6 h-6" />
                  <span>Call 108 Ambulance</span>
                </a>
              </div>
            </div>
          ) : (
            /* Standard Consultation Screen */
            <div className="bg-white border-2 border-emerald-300 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                    Triage Evaluated: Consultation Tier
                  </span>
                  <h3 className="text-2xl font-extrabold text-neutral-900 mt-0.5">
                    Ready for Hub Doctor Consultation
                  </h3>
                </div>
              </div>

              <p className="text-base text-neutral-700 leading-relaxed">
                {triageResult.rationale.description}
              </p>

              {/* Summary Card */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Patient:</span>
                  <span className="font-bold text-neutral-900">{patientData.name} ({patientData.age}y)</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Location:</span>
                  <span className="font-semibold text-neutral-900">{patientData.village}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Vitals:</span>
                  <span className="font-mono text-neutral-900">
                    {patientData.vitals.temp}°F | BP {patientData.vitals.bp} | SpO2 {patientData.vitals.spo2}%
                  </span>
                </div>
                <div className="pt-1 border-t border-neutral-200">
                  <span className="text-xs font-semibold text-neutral-500 block mb-1.5">Reported Symptoms:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {patientData.symptoms.map((s, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-md bg-white border border-neutral-200 font-medium text-neutral-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STICKY BOTTOM ACTION BAR (Touch-First, minimum h-14/h-16) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-neutral-200 p-4 z-40">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => (step === 3 ? handleReset() : setStep(step - 1))}
              className="h-16 px-5 rounded-xl border-2 border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold flex items-center justify-center transition-colors text-base"
            >
              {step === 3 ? <RotateCcw className="w-5 h-5" /> : 'Back'}
            </button>
          )}

          {step === 1 && (
            <button
              type="button"
              onClick={() => {
                if (!patientData.name) {
                  setPatientData({ ...patientData, name: 'Anonymous Patient' });
                }
                setStep(2);
              }}
              className="flex-1 h-16 bg-brand-marigold hover:bg-brand-marigoldDark text-white font-bold rounded-xl px-6 flex items-center justify-center gap-2 text-lg shadow-md transition-colors"
            >
              <span>Continue to Symptoms</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={handleEvaluate}
              className="flex-1 h-16 bg-brand-marigold hover:bg-brand-marigoldDark text-white font-bold rounded-xl px-6 flex items-center justify-center gap-2 text-lg shadow-md transition-colors"
            >
              <span>Evaluate Triage (Offline)</span>
              <HeartPulse className="w-5 h-5" />
            </button>
          )}

          {step === 3 && triageResult?.urgency !== 'emergency' && (
            <button
              type="button"
              onClick={handleProceedToQueue}
              className="flex-1 h-16 bg-brand-marigold hover:bg-brand-marigoldDark text-white font-bold rounded-xl px-6 flex items-center justify-center gap-2 text-lg shadow-md transition-colors"
            >
              <span>Join Doctor Consultation Queue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
