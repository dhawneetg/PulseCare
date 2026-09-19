import React, { useState, useRef } from 'react';
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
  Sparkles,
  ShieldCheck,
  CheckSquare,
  Square,
  Mic,
  MicOff,
  CreditCard,
  Leaf,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { evaluateSymptoms, getTriageRationale } from '../../utils/triageTree.js';
import { TRANSLATIONS } from '../../utils/translations.js';

const COMMON_SYMPTOMS = [
  { id: 'fever', labelEn: 'Fever / High Temperature', labelHi: 'तेज़ बुखार / तपन' },
  { id: 'cough', labelEn: 'Cough / Sore Throat', labelHi: 'खांसी / गले में खराश' },
  { id: 'body ache', labelEn: 'Body Ache / Fatigue', labelHi: 'बदन दर्द / थकान' },
  { id: 'headache', labelEn: 'Persistent Headache', labelHi: 'सिरदर्द / चक्कर' },
  { id: 'chest pain', labelEn: 'Chest Pain / Pressure (Critical)', labelHi: 'छाती में दर्द / दबाव (गंभीर)' },
  { id: 'difficulty breathing', labelEn: 'Difficulty Breathing (Critical)', labelHi: 'सांस लेने में तकलीफ (गंभीर)' },
  { id: 'vomiting', labelEn: 'Vomiting / Loose Motion', labelHi: 'उल्टी / दस्त / निर्जलीकरण' },
  { id: 'joint pain', labelEn: 'Joint / Knee Pain', labelHi: 'जोड़ों व घुटनों में दर्द' },
];

export default function SymptomChecker({ onJoinQueue, lang = 'en' }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const isHi = lang === 'hi';

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

  // Optional ABHA ID (Ayushman Bharat Digital Mission) State
  const [abhaId, setAbhaId] = useState('');
  const [abhaVerified, setAbhaVerified] = useState(false);
  const [abhaRecord, setAbhaRecord] = useState(null);

  // Speech-to-Text Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [speechNotice, setSpeechNotice] = useState(null);
  const recognitionRef = useRef(null);

  // Ayush accordion state
  const [showAyushAdvice, setShowAyushAdvice] = useState(true);

  // Conditional Vitals Options for Remote/Tribal Villages without medical hardware
  const [hasBpMonitor, setHasBpMonitor] = useState(true);
  const [hasPulseOximeter, setHasPulseOximeter] = useState(true);
  const [hasThermometer, setHasThermometer] = useState(true);

  const [triageResult, setTriageResult] = useState(null);

  // Toggle Voice Recognition for ASHA / Patient
  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechNotice(isHi ? 'इस ब्राउज़र में आवाज़ पहचान समर्थित नहीं है।' : 'Voice recognition not supported in this browser.');
      setTimeout(() => setSpeechNotice(null), 3000);
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isHi ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechNotice(isHi ? 'बोलिए... आपकी आवाज़ रिकॉर्ड हो रही है' : 'Listening... Speak your symptoms');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          const spokenText = transcript.trim();
          setPatientData(prev => ({
            ...prev,
            symptoms: [...prev.symptoms, spokenText]
          }));
          setSpeechNotice(`${isHi ? 'जोड़ा गया: ' : 'Added: '} "${spokenText}"`);
          setTimeout(() => setSpeechNotice(null), 3500);
        }
        setIsListening(false);
      };

      recognition.onerror = (err) => {
        console.warn('[PulseCare] Speech recognition notice:', err);
        setIsListening(false);
        setSpeechNotice(isHi ? 'माइक्रोफ़ोन अनुमति या आवाज़ समझ नहीं आई।' : 'Microphone error or could not capture voice.');
        setTimeout(() => setSpeechNotice(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('[PulseCare] Speech recognition init failed:', err);
      setIsListening(false);
    }
  };

  const handleVerifyAbha = () => {
    const cleanId = abhaId.trim() || '91-4821-3091-7712';
    setAbhaId(cleanId);
    setAbhaVerified(true);
    setAbhaRecord({
      abhaNumber: cleanId,
      pmjayCoverage: '₹5,00,000 (Active Ayushman Card)',
      bloodGroup: 'B+ Positive',
      linkedPhc: 'Barabanki Sub-Center #04',
      allergies: 'None recorded'
    });
  };

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
    // Build normalized vitals reflecting hardware availability
    const effectiveVitals = {
      temp: hasThermometer ? patientData.vitals.temp : 'NA',
      bp: hasBpMonitor ? patientData.vitals.bp : 'NA',
      pulse: hasPulseOximeter ? patientData.vitals.pulse : 'NA',
      spo2: hasPulseOximeter ? patientData.vitals.spo2 : 'NA',
    };

    const urgency = evaluateSymptoms(effectiveVitals, patientData.symptoms);
    const rationale = getTriageRationale(urgency, effectiveVitals, patientData.symptoms, lang);
    setTriageResult({ urgency, rationale, effectiveVitals });
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
        name: patientData.name || (isHi ? 'अज्ञात मरीज़' : 'Anonymous Patient'),
        age: parseInt(patientData.age, 10) || 35,
        village: patientData.village || (isHi ? 'गाँव केंद्र' : 'Village Block'),
        vitals: triageResult?.effectiveVitals || patientData.vitals,
        symptoms: patientData.symptoms.length > 0 ? patientData.symptoms : [isHi ? 'सामान्य परामर्श' : 'General Consultation'],
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
          <span className="text-sm font-medium text-neutral-700">{t.step1}</span>
        </div>
        <div className="h-0.5 flex-1 mx-3 bg-neutral-200">
          <div className={`h-full bg-brand-marigold transition-all duration-300 ${step === 1 ? 'w-0' : step === 2 ? 'w-1/2' : 'w-full'}`} />
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-brand-marigold text-white' : 'bg-neutral-200 text-neutral-600'}`}>
            2
          </span>
          <span className="text-sm font-medium text-neutral-700">{t.step2}</span>
        </div>
        <div className="h-0.5 flex-1 mx-3 bg-neutral-200">
          <div className={`h-full bg-brand-marigold transition-all duration-300 ${step <= 2 ? 'w-0' : 'w-full'}`} />
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 3 ? 'bg-brand-marigold text-white' : 'bg-neutral-200 text-neutral-600'}`}>
            3
          </span>
          <span className="text-sm font-medium text-neutral-700">{t.step3}</span>
        </div>
      </div>

      {/* STEP 1: Basic Information */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">{t.symptomCheckerTitle}</h2>
            <p className="text-neutral-600 text-sm mt-1">
              {t.symptomCheckerSubtitle}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-base font-semibold text-neutral-900 mb-2">
                {t.fullName}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={patientData.name}
                  onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                  placeholder={isHi ? 'उदा. रमेश कुमार' : 'e.g. Ramesh Kumar'}
                  className="w-full h-14 pl-11 pr-4 rounded-xl border-2 border-neutral-200 focus:border-brand-marigold focus:outline-none text-lg text-neutral-900 font-medium"
                />
                <User className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-semibold text-neutral-900 mb-2">
                  {t.age}
                </label>
                <input
                  type="number"
                  value={patientData.age}
                  onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
                  placeholder="45"
                  className="w-full h-14 px-4 rounded-xl border-2 border-neutral-200 focus:border-brand-marigold focus:outline-none text-lg text-neutral-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-neutral-900 mb-2">
                  {t.village}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={patientData.village}
                    onChange={(e) => setPatientData({ ...patientData, village: e.target.value })}
                    placeholder={isHi ? 'उदा. रामपुर ब्लॉक बी' : 'e.g. Rampur Block B'}
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
                  symptoms: [isHi ? 'तेज़ बुखार / तपन' : 'Fever / High Temperature', isHi ? 'खांसी / गले में खराश' : 'Cough / Sore Throat'],
                  customSymptom: '',
                })}
                className="text-xs font-semibold text-brand-teal hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t.autofillDemo}
              </button>
            </div>

            {/* Optional ABHA ID (Ayushman Bharat Digital Mission) Integration */}
            <div className="pt-3 border-t border-neutral-100 text-left">
              <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-800" />
                    <span className="text-xs font-bold uppercase text-emerald-950 tracking-wider">
                      {isHi ? 'आयुष्मान भारत ABHA पहचान' : 'Ayushman Bharat ABHA ID'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full border border-emerald-300">
                    {isHi ? 'ऐच्छिक / Optional' : 'Optional (वैकल्पिक)'}
                  </span>
                </div>

                <p className="text-[11px] text-emerald-900/80 leading-snug">
                  {isHi 
                    ? 'यदि उपलब्ध हो तो 14-अंकीय आभा संख्या दर्ज करें। यह अनिवार्य नहीं है।' 
                    : 'Link 14-digit ABHA ID for digital health history retrieval. Non-mandatory.'}
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={abhaId}
                    onChange={(e) => {
                      setAbhaId(e.target.value);
                      if (abhaVerified) setAbhaVerified(false);
                    }}
                    placeholder={isHi ? 'उदा. 91-4821-3091-7712' : 'e.g. 91-4821-3091-7712'}
                    className="flex-1 h-10 px-3 rounded-lg border border-emerald-300 focus:border-emerald-600 focus:outline-none text-xs font-mono font-medium text-emerald-950 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyAbha}
                    className="px-3 h-10 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{abhaVerified ? (isHi ? 'सत्यापित' : 'Verified') : (isHi ? 'सत्यापित करें' : 'Verify')}</span>
                  </button>
                </div>

                {abhaVerified && abhaRecord && (
                  <div className="bg-white p-3 rounded-lg border border-emerald-300 text-[11px] space-y-1 animate-in fade-in">
                    <div className="flex items-center justify-between text-emerald-950 font-bold">
                      <span className="flex items-center gap-1 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ABDM Active: {abhaRecord.abhaNumber}</span>
                      </span>
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Blood: {abhaRecord.bloodGroup}
                      </span>
                    </div>
                    <p className="text-neutral-600 text-[10px]">
                      <strong>PMJAY Cover:</strong> {abhaRecord.pmjayCoverage} • <strong>Center:</strong> {abhaRecord.linkedPhc}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Vitals & Symptoms (With Conditional Devices Option) */}
      {step === 2 && (
        <div className="space-y-6 text-left">
          {/* Vitals Card */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-brand-marigold" />
                  <span>{t.vitalsTitle}</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {t.vitalsSubtitle}
                </p>
              </div>

              {/* Hardware Toggles for Remote Clinics */}
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setHasThermometer(!hasThermometer)}
                  className={`px-2.5 py-1 rounded-md border transition-colors ${
                    hasThermometer ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-neutral-100 border-neutral-200 text-neutral-500 line-through'
                  }`}
                >
                  {isHi ? 'थर्मामीटर' : 'Thermometer'}
                </button>
                <button
                  type="button"
                  onClick={() => setHasBpMonitor(!hasBpMonitor)}
                  className={`px-2.5 py-1 rounded-md border transition-colors ${
                    hasBpMonitor ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-neutral-100 border-neutral-200 text-neutral-500 line-through'
                  }`}
                >
                  {isHi ? 'बीपी मॉनिटर' : 'BP Monitor'}
                </button>
                <button
                  type="button"
                  onClick={() => setHasPulseOximeter(!hasPulseOximeter)}
                  className={`px-2.5 py-1 rounded-md border transition-colors ${
                    hasPulseOximeter ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-neutral-100 border-neutral-200 text-neutral-500 line-through'
                  }`}
                >
                  {isHi ? 'पल्स ऑक्सीमीटर' : 'Pulse Oximeter'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1 flex items-center justify-between">
                  <span>{t.temp}</span>
                  {!hasThermometer && <span className="text-[10px] text-amber-600 font-bold">{isHi ? 'छोड़ा गया' : 'Skipped'}</span>}
                </label>
                <input
                  type="text"
                  disabled={!hasThermometer}
                  value={hasThermometer ? patientData.vitals.temp : 'NA'}
                  onChange={(e) => setPatientData({
                    ...patientData,
                    vitals: { ...patientData.vitals, temp: e.target.value }
                  })}
                  placeholder="98.6"
                  className={`w-full h-12 px-3 rounded-lg border-2 text-base font-semibold ${
                    hasThermometer
                      ? 'border-neutral-200 focus:border-brand-marigold bg-white'
                      : 'border-neutral-200 bg-neutral-100 text-neutral-400'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1 flex items-center justify-between">
                  <span>{t.bp}</span>
                  {!hasBpMonitor && <span className="text-[10px] text-amber-600 font-bold">{isHi ? 'छोड़ा गया' : 'Skipped'}</span>}
                </label>
                <input
                  type="text"
                  disabled={!hasBpMonitor}
                  value={hasBpMonitor ? patientData.vitals.bp : 'NA'}
                  onChange={(e) => setPatientData({
                    ...patientData,
                    vitals: { ...patientData.vitals, bp: e.target.value }
                  })}
                  placeholder="120/80"
                  className={`w-full h-12 px-3 rounded-lg border-2 text-base font-semibold ${
                    hasBpMonitor
                      ? 'border-neutral-200 focus:border-brand-marigold bg-white'
                      : 'border-neutral-200 bg-neutral-100 text-neutral-400'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1 flex items-center justify-between">
                  <span>{t.pulse}</span>
                  {!hasPulseOximeter && <span className="text-[10px] text-amber-600 font-bold">{isHi ? 'छोड़ा गया' : 'Skipped'}</span>}
                </label>
                <input
                  type="text"
                  disabled={!hasPulseOximeter}
                  value={hasPulseOximeter ? patientData.vitals.pulse : 'NA'}
                  onChange={(e) => setPatientData({
                    ...patientData,
                    vitals: { ...patientData.vitals, pulse: e.target.value }
                  })}
                  placeholder="75"
                  className={`w-full h-12 px-3 rounded-lg border-2 text-base font-semibold ${
                    hasPulseOximeter
                      ? 'border-neutral-200 focus:border-brand-marigold bg-white'
                      : 'border-neutral-200 bg-neutral-100 text-neutral-400'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1 flex items-center justify-between">
                  <span>{t.spo2}</span>
                  {!hasPulseOximeter && <span className="text-[10px] text-amber-600 font-bold">{isHi ? 'छोड़ा गया' : 'Skipped'}</span>}
                </label>
                <input
                  type="text"
                  disabled={!hasPulseOximeter}
                  value={hasPulseOximeter ? patientData.vitals.spo2 : 'NA'}
                  onChange={(e) => setPatientData({
                    ...patientData,
                    vitals: { ...patientData.vitals, spo2: e.target.value }
                  })}
                  placeholder="98"
                  className={`w-full h-12 px-3 rounded-lg border-2 text-base font-semibold ${
                    hasPulseOximeter
                      ? 'border-neutral-200 focus:border-brand-marigold bg-white'
                      : 'border-neutral-200 bg-neutral-100 text-neutral-400'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Symptoms Checklist */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">
                  {t.observedSymptomsTitle}
                </h3>
                <p className="text-sm text-neutral-500">
                  {t.observedSymptomsSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleVoiceInput}
                title="Speak symptoms (Hindi / English)"
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-600" />}
                <span>{isListening ? (isHi ? 'सुन रहे हैं...' : 'Listening...') : (isHi ? 'बोलकर दर्ज करें' : 'Voice Input')}</span>
              </button>
            </div>

            {/* Live voice speech indicator */}
            {speechNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span>{speechNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2.5">
              {COMMON_SYMPTOMS.map((item) => {
                const label = isHi ? item.labelHi : item.labelEn;
                const isSelected = patientData.symptoms.includes(label) || 
                  patientData.symptoms.includes(item.labelEn) || 
                  patientData.symptoms.includes(item.labelHi);
                const isCritical = item.id === 'chest pain' || item.id === 'difficulty breathing';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSymptom(label)}
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
                    <span>{label}</span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Symptom Input with Voice Mic */}
            <form onSubmit={handleAddCustomSymptom} className="flex gap-2 pt-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={patientData.customSymptom}
                  onChange={(e) => setPatientData({ ...patientData, customSymptom: e.target.value })}
                  placeholder={t.customSymptomPlaceholder}
                  className="w-full h-12 pl-3 pr-10 rounded-lg border-2 border-neutral-200 focus:border-brand-marigold text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-neutral-500 hover:text-emerald-700 transition-colors"
                  title="Speak in Hindi/English"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
              <button
                type="submit"
                className="px-4 h-12 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-semibold text-neutral-700 transition-colors"
              >
                {t.addSymptom}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STEP 3: Triage Result (Deterministic Output) */}
      {step === 3 && triageResult && (
        <div className="space-y-6 text-left">
          {triageResult.urgency === 'emergency' ? (
            /* Emergency Alert Banner & Screen */
            <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-6 text-rose-950 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider bg-rose-200 text-rose-900 px-2 py-0.5 rounded">
                    {isHi ? 'गंभीर आपातकालीन स्तर' : 'Critical Emergency Tier'}
                  </span>
                  <h3 className="text-2xl font-black text-rose-900 mt-0.5">
                    {triageResult.rationale.title}
                  </h3>
                </div>
              </div>

              <p className="text-base text-rose-900 font-medium leading-relaxed">
                {triageResult.rationale.description}
              </p>

              {/* Ayush Warning for Critical Emergencies */}
              <div className="bg-rose-950/10 p-3.5 rounded-xl border border-rose-400/40 text-rose-950 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{isHi ? '⚠️ देसी व घरेलू उपचार से परहेज चेतावनी:' : '⚠️ Traditional & Home Remedy Critical Caution:'}</span>
                </div>
                <p className="leading-relaxed">
                  {isHi
                    ? 'सीने में दर्द, सांस फूलने या बेहोशी में केवल घरेलू काढ़े या चूरन पर निर्भर न रहें। तुरंत अस्पताल ले जाएं, देरी जानलेवा हो सकती है।'
                    : 'Do not delay clinical care with herbal decoctions for cardiac symptoms or respiratory distress. Immediate hospital intervention is vital.'}
                </p>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-rose-200 space-y-2">
                <div className="font-bold text-rose-950 text-sm">
                  {isHi ? 'कार्य योजना:' : 'Action Plan:'}
                </div>
                <ul className="text-sm text-rose-900 space-y-1.5 list-disc list-inside">
                  <li>{isHi ? 'तुरंत नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) या जिला अस्पताल पहुंचें।' : 'Proceed immediately to the nearest Primary Health Centre (PHC) or District Hospital.'}</li>
                  <li>{isHi ? 'राष्ट्रीय आपातकालीन एम्बुलेंस 108 पर कॉल करें।' : 'Call National Emergency Medical Services (108 Ambulance).'}</li>
                  <li>{isHi ? 'गाँव की आशा कार्यकर्ता को आपातकालीन सहायता हेतु सूचित किया गया है।' : 'Village ASHA worker has been flagged for emergency transit assistance.'}</li>
                </ul>
              </div>

              <div className="pt-2">
                <a
                  href="tel:108"
                  className="w-full h-16 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl px-6 flex items-center justify-center gap-2 text-xl shadow-md transition-colors"
                >
                  <PhoneCall className="w-6 h-6" />
                  <span>{isHi ? '108 एम्बुलेंस को कॉल करें' : 'Call 108 Ambulance'}</span>
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
                    {isHi ? 'ट्राइएज मूल्यांकित: परामर्श स्तर' : 'Triage Evaluated: Consultation Tier'}
                  </span>
                  <h3 className="text-2xl font-extrabold text-neutral-900 mt-0.5">
                    {triageResult.rationale.title}
                  </h3>
                </div>
              </div>

              <p className="text-base text-neutral-700 leading-relaxed">
                {triageResult.rationale.description}
              </p>

              {/* Summary Card */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">{isHi ? 'मरीज़:' : 'Patient:'}</span>
                  <span className="font-bold text-neutral-900">{patientData.name} ({patientData.age}y)</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">{isHi ? 'स्थान:' : 'Location:'}</span>
                  <span className="font-semibold text-neutral-900">{patientData.village}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">{isHi ? 'जांच (Vitals):' : 'Vitals:'}</span>
                  <span className="font-mono text-neutral-900 text-xs sm:text-sm">
                    {triageResult.effectiveVitals?.temp !== 'NA' ? `${triageResult.effectiveVitals.temp}°F` : 'Temp NA'} | 
                    BP {triageResult.effectiveVitals?.bp} | 
                    SpO2 {triageResult.effectiveVitals?.spo2 !== 'NA' ? `${triageResult.effectiveVitals.spo2}%` : 'NA'}
                  </span>
                </div>
                <div className="pt-1 border-t border-neutral-200">
                  <span className="text-xs font-semibold text-neutral-500 block mb-1.5">
                    {isHi ? 'दर्ज लक्षण:' : 'Reported Symptoms:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {patientData.symptoms.map((s, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-md bg-white border border-neutral-200 font-medium text-neutral-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* The Ayush & Desi First-Aid Bridge Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/70 p-4 rounded-xl border border-emerald-200 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowAyushAdvice(!showAyushAdvice)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-emerald-700" />
                    <div>
                      <h4 className="font-bold text-sm text-emerald-950">
                        {isHi ? '🌿 आयुष व समुदाय प्राथमिक घरेलू उपचार' : '🌿 Ayush & Home First-Aid Guidance'}
                      </h4>
                      <p className="text-[11px] text-emerald-800/80">
                        {isHi ? 'डॉक्टर परामर्श तक सुरक्षित प्राथमिक देखभाल' : 'Safe complementary supportive care pending consultation'}
                      </p>
                    </div>
                  </div>
                  {showAyushAdvice ? <ChevronUp className="w-4 h-4 text-emerald-700" /> : <ChevronDown className="w-4 h-4 text-emerald-700" />}
                </button>

                {showAyushAdvice && (
                  <div className="pt-2 border-t border-emerald-200/80 text-xs text-emerald-950 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                        <strong className="text-emerald-900 block mb-0.5">
                          {isHi ? '• जीवन रक्षक घोल (ORS):' : '• Hydration / ORS Formula:'}
                        </strong>
                        <span>
                          {isHi 
                            ? '1 लीटर उबले ठंडे पानी में 6 चम्मच चीनी व 1/2 चम्मच नमक। दस्त या कमजोरी में थोड़ा-थोड़ा पिएं।' 
                            : '1 liter boiled water + 6 level tsp sugar + 1/2 tsp salt. Sip continuously.'}
                        </span>
                      </div>
                      <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                        <strong className="text-emerald-900 block mb-0.5">
                          {isHi ? '• तुलसी-अदरक व भाप:' : '• Herbal Infusion & Steam:'}
                        </strong>
                        <span>
                          {isHi 
                            ? 'गले में खराश या हल्के बुखार में सादे पानी की भाप लें, गर्म पानी में सेंधा नमक के गरारे करें।' 
                            : 'Steam inhalation, warm salt water gargles, warm ginger-tulsi infusion for sore throat.'}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-emerald-800 italic pt-1">
                      {isHi 
                        ? 'सूचना: यह प्राथमिक प्राथमिक-उपचार है। डॉक्टर द्वारा बताई गई दवाओं का स्थान नहीं लेता।' 
                        : 'Note: Complementary first-aid advice recognized by health guidelines. Does not substitute prescribed medicines.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-neutral-200 p-4 z-40">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => (step === 3 ? handleReset() : setStep(step - 1))}
              className="h-16 px-5 rounded-xl border-2 border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold flex items-center justify-center transition-colors text-base"
            >
              {step === 3 ? <RotateCcw className="w-5 h-5" /> : (isHi ? 'पीछे' : 'Back')}
            </button>
          )}

          {step === 1 && (
            <button
              type="button"
              onClick={() => {
                if (!patientData.name) {
                  setPatientData({ ...patientData, name: isHi ? 'अज्ञात मरीज़' : 'Anonymous Patient' });
                }
                setStep(2);
              }}
              className="flex-1 h-16 bg-brand-marigold hover:bg-brand-marigoldDark text-white font-bold rounded-xl px-6 flex items-center justify-center gap-2 text-lg shadow-md transition-colors"
            >
              <span>{t.proceedToSymptoms}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={handleEvaluate}
              className="flex-1 h-16 bg-brand-marigold hover:bg-brand-marigoldDark text-white font-bold rounded-xl px-6 flex items-center justify-center gap-2 text-lg shadow-md transition-colors"
            >
              <span>{t.evaluateAndTriage}</span>
              <HeartPulse className="w-5 h-5" />
            </button>
          )}

          {step === 3 && triageResult?.urgency !== 'emergency' && (
            <button
              type="button"
              onClick={handleProceedToQueue}
              className="flex-1 h-16 bg-brand-marigold hover:bg-brand-marigoldDark text-white font-bold rounded-xl px-6 flex items-center justify-center gap-2 text-lg shadow-md transition-colors"
            >
              <span>{t.consultationAction}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
