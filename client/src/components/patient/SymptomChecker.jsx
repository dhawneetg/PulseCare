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
  ChevronUp,
  Calendar,
  Database,
  Zap,
  Check,
  Target,
  Clock,
  Radio
} from 'lucide-react';
import { evaluateSymptoms, getTriageRationale, calculateDynamicTriageScore } from '../../utils/triageTree.js';
import { TRANSLATIONS } from '../../utils/translations.js';

const CLINICAL_ZONES = [
  { id: 'chest', labelHi: 'छाती / फेफड़े (Chest)', labelEn: 'Chest / Lungs', shortHi: 'छाती', shortEn: 'Chest' },
  { id: 'head', labelHi: 'सिर (Head)', labelEn: 'Head / Neuro', shortHi: 'सिर', shortEn: 'Head' },
  { id: 'abdomen', labelHi: 'पेट (Abdomen)', labelEn: 'Abdomen / Gastro', shortHi: 'पेट', shortEn: 'Abdomen' },
  { id: 'general', labelHi: 'सामान्य / बदन', labelEn: 'General / Limbs', shortHi: 'सामान्य', shortEn: 'General' },
];

const ZONE_SYMPTOMS = {
  chest: [
    {
      id: 'shortness_of_breath',
      labelHi: 'सांस लेने में तकलीफ (Shortness of Breath)',
      labelEn: 'Shortness of Breath',
      descHi: 'Stridor / Wheezing noted at rest (विश्राम में भी घरघराहट)',
      descEn: 'Stridor / Wheezing noted at rest',
      isCritical: true,
      color: 'rose'
    },
    {
      id: 'high_fever',
      labelHi: 'तीव्र बुखार (>101°F High Fever)',
      labelEn: 'High Fever (>101°F)',
      descHi: 'Axillary temperature recorded: 102.4°F (तपन व कंपन)',
      descEn: 'Axillary temperature recorded: 102.4°F',
      color: 'emerald'
    },
    {
      id: 'dry_cough',
      labelHi: 'सूखी खांसी (Dry Cough - 3+ days)',
      labelEn: 'Dry Cough (3+ days)',
      descHi: 'Continuous nocturnal hacking (रात में लगातार तेज खांसी)',
      descEn: 'Continuous nocturnal hacking cough',
      color: 'teal'
    },
    {
      id: 'fatigue',
      labelHi: 'थकान / कमजोरी (Fatigue & Lethargy)',
      labelEn: 'Fatigue & Lethargy',
      descHi: 'Inability to perform normal chores (अत्यधिक शिथिलता)',
      descEn: 'Inability to perform normal daily chores',
      color: 'slate'
    },
    {
      id: 'chest_heaviness',
      labelHi: 'सीने में दबाव / दर्द (Chest Heaviness)',
      labelEn: 'Chest Heaviness / Pain',
      descHi: 'Pressure or squeezing sensation (जकड़न या भारीपन)',
      descEn: 'Pressure or squeezing sensation',
      isCritical: true,
      color: 'rose'
    },
  ],
  head: [
    {
      id: 'severe_headache',
      labelHi: 'गंभीर सिरदर्द (Severe Thunderclap Headache)',
      labelEn: 'Severe Thunderclap Headache',
      descHi: 'अचानक तेज सिरदर्द, प्रकाश से असहजता (Sudden acute pain)',
      descEn: 'Sudden onset severe cranial pain, photophobia',
      isCritical: true,
      color: 'rose'
    },
    {
      id: 'dizziness',
      labelHi: 'चक्कर / संतुलन खोना (Dizziness & Vertigo)',
      labelEn: 'Dizziness & Vertigo',
      descHi: 'खड़े होने पर चक्कर, रक्तचाप में गिरावट (Postural drop)',
      descEn: 'Postural hypotension, unsteady gait',
      color: 'amber'
    },
    {
      id: 'neck_stiffness',
      labelHi: 'गर्दन में अकड़न (Stiff Neck)',
      labelEn: 'Stiff Neck & Rigidity',
      descHi: 'गर्दन मोड़ने में दर्द व बुखार (मेनिन्जाइटिस जांच संकेत)',
      descEn: 'Inability to flex neck forward, meningeal sign',
      color: 'slate'
    },
  ],
  abdomen: [
    {
      id: 'acute_diarrhea',
      labelHi: 'तीव्र पानी जैसा दस्त (Acute Watery Diarrhea)',
      labelEn: 'Acute Watery Diarrhea',
      descHi: 'Severe fluid loss, rapid dehydration risk (निर्जलीकरण खतरा)',
      descEn: 'High fluid loss, rapid dehydration risk',
      isCritical: true,
      color: 'rose'
    },
    {
      id: 'severe_cramping',
      labelHi: 'पेट में मरोड़ व तेज दर्द (Severe Abdominal Cramps)',
      labelEn: 'Severe Abdominal Cramping',
      descHi: 'Localized tenderness, acute intestinal distress (मरोड़)',
      descEn: 'Localized tenderness, acute intestinal distress',
      color: 'amber'
    },
    {
      id: 'persistent_vomiting',
      labelHi: 'लगातार उल्टी (Persistent Vomiting)',
      labelEn: 'Persistent Vomiting',
      descHi: 'पानी या ओआरएस पचाने में असमर्थ (Unable to retain fluids)',
      descEn: 'Inability to retain oral fluids for > 6 hours',
      color: 'teal'
    },
  ],
  general: [
    {
      id: 'joint_muscle_pain',
      labelHi: 'जोड़ों व मांसपेशियों में दर्द (Joint & Muscle Pain)',
      labelEn: 'Joint & Muscle Pain',
      descHi: 'Viral arthralgia, knee & ankle inflammation (जोड़ों में सूजन)',
      descEn: 'Viral arthralgia, knee & ankle inflammation',
      color: 'teal'
    },
    {
      id: 'skin_rash',
      labelHi: 'त्वचा पर दाने / चकत्ते (Skin Rash / Petechiae)',
      labelEn: 'Skin Rash / Petechiae',
      descHi: 'बुखार के साथ लाल चकत्ते (डेंगू/वायरल निगरानी)',
      descEn: 'Erythematous rash with fever surveillance',
      color: 'amber'
    },
  ]
};

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

  // Active Anatomical Zone & Symptom Duration for Offline Deterministic Triage
  const [activeZone, setActiveZone] = useState('chest');
  const [symptomDuration, setSymptomDuration] = useState('2-3 दिन');

  // Dynamic Triage Score based on IMNCI-R Guidelines
  const dynamicTriage = calculateDynamicTriageScore(
    patientData.vitals,
    patientData.symptoms,
    symptomDuration,
    lang
  );

  const isZoneSymptomActive = (item) => {
    return patientData.symptoms.includes(item.id) ||
           patientData.symptoms.includes(item.labelHi) ||
           patientData.symptoms.includes(item.labelEn);
  };

  const toggleZoneSymptom = (item) => {
    const label = isHi ? item.labelHi : item.labelEn;
    const isSelected = isZoneSymptomActive(item);
    setPatientData(prev => ({
      ...prev,
      symptoms: isSelected
        ? prev.symptoms.filter(s => s !== item.id && s !== item.labelHi && s !== item.labelEn)
        : [...prev.symptoms, label]
    }));
  };

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
    setTriageResult({
      urgency,
      rationale,
      effectiveVitals,
      dynamicScore: dynamicTriage.score,
      protocol: dynamicTriage.protocol,
      tier: dynamicTriage.tier
    });
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
        urgency: triageResult?.urgency || dynamicTriage.urgency || 'consultation',
        triageScore: `${dynamicTriage.score}/10`
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

      {/* STEP 2: Vitals & Symptoms (Interactive Anatomical Body Map & Offline Deterministic IMNCI-R Triage) */}
      {step === 2 && (
        <div className="space-y-4 text-left">
          {/* Top Offline Engine & RuleSet Indicator */}
          <div className="flex items-center justify-between text-xs bg-slate-900/5 px-3 py-1.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% Offline: Local SQLite Engine</span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-bold text-[11px]">
              <Zap className="w-3 h-3" />
              <span>v4.2 RuleSet</span>
            </div>
          </div>

          {/* Step Header */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-teal-800 mb-1">
              <span>{isHi ? 'चरण 2 OF 4 • STEP 2 OF 4' : 'STEP 2 OF 4 • CLINICAL TRIAGE'}</span>
              <span className="bg-teal-50 text-teal-900 border border-teal-200 px-2 py-0.5 rounded-full">
                Chief Complaints
              </span>
            </div>
            <div className="w-full bg-teal-100 h-1.5 rounded-full overflow-hidden mb-2">
              <div className="bg-[#00594C] h-full w-1/2 rounded-full" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {isHi ? 'सहानुभूति लक्षण जांच' : 'Empathetic Symptom Assessment'}
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic Clinical Protocol • ASHA Assistant
            </p>
          </div>

          {/* Anatomical Body Map Selection Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <span className="text-lg">🧍‍♂️</span>
                <span>{isHi ? 'शारीरिक अंग चुनें (Select Zone)' : 'Select Anatomical Zone'}</span>
              </div>
              <span className="text-[11px] font-semibold bg-emerald-50 text-[#00594C] border border-emerald-200 px-2.5 py-0.5 rounded-md">
                Active: {CLINICAL_ZONES.find(z => z.id === activeZone)?.[isHi ? 'shortHi' : 'shortEn'] || activeZone}
              </span>
            </div>

            {/* Visual Body Schematic with Pins */}
            <div className="relative bg-gradient-to-b from-sky-50/50 to-blue-50/70 border border-sky-100 rounded-xl p-4 flex flex-col items-center justify-center min-h-[160px] overflow-hidden">
              {/* Silhouette Vector Graphic */}
              <div className="relative w-48 h-40 flex flex-col items-center justify-center">
                {/* SVG Silhouette */}
                <svg className="w-28 h-36 text-blue-200/80" viewBox="0 0 100 130" fill="currentColor">
                  {/* Head */}
                  <circle cx="50" cy="18" r="14" />
                  {/* Neck */}
                  <rect x="46" y="32" width="8" height="6" rx="2" />
                  {/* Torso */}
                  <path d="M26 38 C26 38, 38 36, 50 36 C62 36, 74 38, 74 38 C79 39, 82 45, 80 50 L73 86 C72 90, 68 93, 64 93 L36 93 C32 93, 28 90, 27 86 L20 50 C18 45, 21 39, 26 38 Z" />
                  {/* Legs */}
                  <rect x="34" y="93" width="12" height="34" rx="4" />
                  <rect x="54" y="93" width="12" height="34" rx="4" />
                </svg>

                {/* Head Pin */}
                <button
                  type="button"
                  onClick={() => setActiveZone('head')}
                  className={`absolute top-2 transition-all flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${
                    activeZone === 'head'
                      ? 'bg-[#00594C] text-white border-[#00594C] ring-2 ring-emerald-300 scale-105'
                      : 'bg-white/90 text-slate-700 border-slate-300 hover:bg-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>• सिर (Head)</span>
                </button>

                {/* Chest Pin (Center) */}
                <button
                  type="button"
                  onClick={() => setActiveZone('chest')}
                  className={`absolute top-14 transition-all flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full border shadow-md ${
                    activeZone === 'chest'
                      ? 'bg-[#00594C] text-white border-[#00473c] ring-2 ring-emerald-300 scale-105'
                      : 'bg-white/90 text-slate-700 border-slate-300 hover:bg-white'
                  }`}
                >
                  <Target className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                  <span>छाती (Chest)</span>
                </button>

                {/* Abdomen Pin */}
                <button
                  type="button"
                  onClick={() => setActiveZone('abdomen')}
                  className={`absolute bottom-6 transition-all flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${
                    activeZone === 'abdomen'
                      ? 'bg-[#00594C] text-white border-[#00594C] ring-2 ring-emerald-300 scale-105'
                      : 'bg-white/90 text-slate-700 border-slate-300 hover:bg-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>• पेट (Abdomen)</span>
                </button>
              </div>

              {/* Zone Button Pills underneath */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 w-full mt-2 pt-2 border-t border-sky-100">
                {CLINICAL_ZONES.map(z => (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setActiveZone(z.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      activeZone === z.id
                        ? 'bg-[#00594C] text-white shadow-sm ring-1 ring-emerald-400'
                        : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
                    }`}
                  >
                    {isHi ? z.labelHi : z.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Clinical Markers List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span>महत्वपूर्ण लक्षण (Active Clinical Markers)</span>
              </h3>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                {patientData.symptoms.length} {isHi ? 'चयनित (Selected)' : 'Selected'}
              </span>
            </div>

            <div className="space-y-2">
              {(ZONE_SYMPTOMS[activeZone] || []).map((item) => {
                const isSelected = isZoneSymptomActive(item);
                const isCritical = item.isCritical;

                let cardStyle = 'bg-white border-slate-200 hover:border-slate-300 text-slate-800';
                let iconBadge = 'bg-slate-100 text-slate-600';
                let checkStyle = 'text-slate-300';

                if (isSelected) {
                  if (isCritical) {
                    cardStyle = 'bg-rose-50/90 border-rose-300 text-rose-950 shadow-sm';
                    iconBadge = 'bg-rose-600 text-white';
                    checkStyle = 'text-rose-600';
                  } else if (item.color === 'emerald') {
                    cardStyle = 'bg-[#00594C] border-[#00473c] text-white shadow-sm';
                    iconBadge = 'bg-teal-700 text-white';
                    checkStyle = 'text-white';
                  } else {
                    cardStyle = 'bg-sky-50 border-sky-300 text-slate-900 shadow-sm';
                    iconBadge = 'bg-sky-600 text-white';
                    checkStyle = 'text-sky-700';
                  }
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleZoneSymptom(item)}
                    role="button"
                    tabIndex={0}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${cardStyle}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-black text-base shadow-sm ${iconBadge}`}>
                        {item.id.includes('breath') ? '✱' : item.id.includes('fever') ? '🌡' : item.id.includes('cough') ? '☼' : item.id.includes('fatigue') ? '🔋' : '♥'}
                      </div>
                      <div className="min-w-0">
                        <div className={`font-bold text-sm leading-snug truncate ${isSelected && item.color === 'emerald' ? 'text-white' : ''}`}>
                          {isHi ? item.labelHi : item.labelEn}
                        </div>
                        <div className={`text-[11px] leading-tight truncate ${isSelected && item.color === 'emerald' ? 'text-teal-100' : isSelected && isCritical ? 'text-rose-700' : 'text-slate-500'}`}>
                          {isHi ? item.descHi : item.descEn}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <CheckSquare className={`w-6 h-6 ${checkStyle}`} />
                      ) : (
                        <Square className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Symptom Input with Voice Input Mic */}
            <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>{isHi ? 'अन्य लक्षण (आवाज़ या टाइप करके जोड़ें)' : 'Other Symptom (Voice or Type)'}</span>
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{isListening ? (isHi ? 'सुन रहे हैं...' : 'Listening...') : (isHi ? 'बोलकर बताएं' : 'Voice')}</span>
                </button>
              </div>

              {speechNotice && (
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span>{speechNotice}</span>
                </div>
              )}

              <form onSubmit={handleAddCustomSymptom} className="flex gap-2">
                <input
                  type="text"
                  value={patientData.customSymptom}
                  onChange={(e) => setPatientData({ ...patientData, customSymptom: e.target.value })}
                  placeholder={isHi ? 'उदा. सिरदर्द, चक्कर आना...' : 'e.g. Headache, dizziness...'}
                  className="flex-1 h-10 px-3 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none focus:border-[#00594C]"
                />
                <button
                  type="submit"
                  className="px-3 h-10 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                >
                  {isHi ? 'जोड़ें' : 'Add'}
                </button>
              </form>
            </div>
          </div>

          {/* Symptom Duration Selector */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between text-sm font-bold text-slate-900">
              <span>{isHi ? 'लक्षण कितने दिनों से हैं? (Symptom Duration)' : 'Symptom Duration'}</span>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {['1 दिन', '2-3 दिन', '1 हफ्ता', '10+ दिन'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSymptomDuration(d)}
                  className={`py-2 rounded-lg font-bold text-xs transition-all text-center ${
                    symptomDuration === d
                      ? 'bg-[#00594C] text-white shadow-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Dynamic Triage Outcome Card (Deterministic IMNCI-R) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3.5">
            {/* Tier & Score Row */}
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wide ${
                dynamicTriage.color === 'rose'
                  ? 'bg-rose-100 text-rose-900 border border-rose-200'
                  : dynamicTriage.color === 'amber'
                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
              }`}>
                {isHi ? dynamicTriage.tierHi : dynamicTriage.tier}
              </span>

              <div className="text-right">
                <span className="text-2xl font-black text-slate-900">{dynamicTriage.score}</span>
                <span className="text-xs text-slate-400 font-bold"> / 10</span>
              </div>
            </div>

            {/* Fast-Track IMNCI-R Protocol Alert Box */}
            <div className={`p-3.5 rounded-xl border space-y-1 ${
              dynamicTriage.color === 'rose'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : dynamicTriage.color === 'amber'
                ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-center gap-2 font-black text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Fast-Track Protocol Triggered</span>
              </div>
              <p className="text-xs leading-relaxed font-medium">
                {dynamicTriage.protocol}
              </p>
            </div>

            {/* Available Doctor on Duty Box */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-teal-100 border border-teal-300 flex items-center justify-center font-bold text-teal-800 text-sm overflow-hidden shrink-0">
                  👨‍⚕️
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 leading-tight">
                    {dynamicTriage.doctorOnDuty.name}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{dynamicTriage.doctorOnDuty.availability}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Join Queue Primary Action Button */}
            <button
              type="button"
              onClick={handleProceedToQueue}
              className="w-full h-14 bg-[#00594C] hover:bg-[#00473c] text-white font-bold rounded-xl px-4 flex items-center justify-between shadow-md transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5" />
                <span className="text-sm sm:text-base font-black">
                  {isHi ? 'परामर्श कतार में जुड़ें / Join Doctor Queue' : 'Join Doctor Queue'}
                </span>
              </div>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* First Aid Protocol Link Action */}
            <button
              type="button"
              onClick={handleEvaluate}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>🏥</span>
              <span>{isHi ? 'घर पर प्राथमिक उपचार देखें / First Aid Protocol' : 'View First Aid & Home Protocols'}</span>
            </button>
          </div>

          {/* Bottom Edge Cache Badge */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium py-1">
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span>{isHi ? 'डेटा स्थानीय फोन में सुरक्षित संग्रहीत (Saved in IndexedDB edge cache)' : 'Data saved locally in IndexedDB edge cache'}</span>
          </div>

          {/* Collapsible Vitals Input Section */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  {isHi ? 'रोगी के महत्वपूर्ण संकेत (Vitals Record)' : 'Patient Vitals (Optional / Field Record)'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isHi ? 'यदि उपकरण उपलब्ध हों तो थर्मामीटर/बीपी दर्ज करें' : 'Record thermometer / BP if hardware available'}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setHasThermometer(!hasThermometer)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    hasThermometer ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-100 text-slate-400 line-through'
                  }`}
                >
                  {isHi ? 'थर्मामीटर' : 'Temp'}
                </button>
                <button
                  type="button"
                  onClick={() => setHasBpMonitor(!hasBpMonitor)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    hasBpMonitor ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-100 text-slate-400 line-through'
                  }`}
                >
                  {isHi ? 'बीपी' : 'BP'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">{t.temp}</label>
                <input
                  type="text"
                  disabled={!hasThermometer}
                  value={hasThermometer ? patientData.vitals.temp : 'NA'}
                  onChange={(e) => setPatientData({
                    ...patientData,
                    vitals: { ...patientData.vitals, temp: e.target.value }
                  })}
                  placeholder="98.6"
                  className="w-full h-9 px-2 rounded-lg border text-xs font-bold text-center bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">{t.bp}</label>
                <input
                  type="text"
                  disabled={!hasBpMonitor}
                  value={hasBpMonitor ? patientData.vitals.bp : 'NA'}
                  onChange={(e) => setPatientData({
                    ...patientData,
                    vitals: { ...patientData.vitals, bp: e.target.value }
                  })}
                  placeholder="120/80"
                  className="w-full h-9 px-2 rounded-lg border text-xs font-bold text-center bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">{t.pulse}</label>
                <input
                  type="text"
                  disabled={!hasPulseOximeter}
                  value={hasPulseOximeter ? patientData.vitals.pulse : 'NA'}
                  onChange={(e) => setPatientData({
                    ...patientData,
                    vitals: { ...patientData.vitals, pulse: e.target.value }
                  })}
                  placeholder="75"
                  className="w-full h-9 px-2 rounded-lg border text-xs font-bold text-center bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">{t.spo2}</label>
                <input
                  type="text"
                  disabled={!hasPulseOximeter}
                  value={hasPulseOximeter ? patientData.vitals.spo2 : 'NA'}
                  onChange={(e) => setPatientData({
                    ...patientData,
                    vitals: { ...patientData.vitals, spo2: e.target.value }
                  })}
                  placeholder="98"
                  className="w-full h-9 px-2 rounded-lg border text-xs font-bold text-center bg-white"
                />
              </div>
            </div>
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
