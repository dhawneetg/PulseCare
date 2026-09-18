import React, { useState } from 'react';
import { 
  PackageCheck, 
  Truck, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Phone, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  Calendar,
  Users,
  Baby,
  HeartPulse,
  Database,
  Check,
  ChevronRight
} from 'lucide-react';
import { MOCK_PRESCRIPTIONS } from '../../utils/mockData.js';
import { TRANSLATIONS } from '../../utils/translations.js';

export default function AshaTimeline({ prescription = null, onBack, lang = 'en' }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const isHi = lang === 'hi';

  const activeRx = prescription || MOCK_PRESCRIPTIONS[0];

  // ASHA Community Field Workload State
  const [deliveries, setDeliveries] = useState([
    {
      id: activeRx.rxId || 'RX-78901',
      patient: activeRx.patientName || 'Sunita Devi',
      village: activeRx.ashaDeliveryRoute || 'Rampur Village Block B',
      medication: activeRx.medication || 'Paracetamol 500mg, ORS Electrolyte Powder',
      status: 'pending', // 'pending' | 'delivered'
      urgency: 'high',
      phone: activeRx.ashaContact || '+91 98765 43210'
    },
    {
      id: 'RX-78902',
      patient: 'Harish Chandra',
      village: 'Rampur Village Block A (Near Primary School)',
      medication: 'Amlodipine 5mg (BP Maintenance)',
      status: 'pending',
      urgency: 'normal',
      phone: '+91 94140 11223'
    },
    {
      id: 'RX-78903',
      patient: 'Meena Bai (ANC 3rd Trimester)',
      village: 'Rampur Tribal Hamlet Sector 4',
      medication: 'Iron & Folic Acid Supplements, Calcium',
      status: 'delivered',
      urgency: 'high',
      phone: '+91 97850 44556'
    }
  ]);

  const [offlineSynced, setOfflineSynced] = useState(true);

  const handleMarkDelivered = (id) => {
    setDeliveries(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, status: d.status === 'delivered' ? 'pending' : 'delivered' };
      }
      return d;
    }));
  };

  const timelineSteps = [
    {
      title: isHi ? 'टेली-परामर्श संपन्न व पर्चा जारी' : 'Consultation Complete & Rx Generated',
      time: '10:15 AM',
      description: isHi ? 'हब डॉक्टर द्वारा वेबआरटीसी परामर्श के बाद डिजिटल पर्चा हस्ताक्षरित।' : 'Hub Doctor completed WebRTC consultation and signed digital prescription.',
      status: 'completed',
    },
    {
      title: isHi ? 'औषधालय से दवाइयां रवाना (PHC हब)' : 'Pharmacy Dispatch (District Hub PHC)',
      time: '11:00 AM',
      description: isHi ? 'ब्लॉक सेंट्रल डिस्पेंसरी में आवश्यक जेनेरिक दवाइयों का सत्यापन और पैकेजिंग।' : 'Essential generic medications verified and packaged at Block Central Dispensary.',
      status: 'completed',
    },
    {
      title: isHi ? 'आशा कार्यकर्ता को सौंपी गई' : 'Assigned to Village ASHA Worker',
      time: '01:30 PM',
      description: isHi ? `दौरे हेतु आशा कार्यकर्ता ${activeRx.ashaWorkerName || 'पूजा देवी'} को सुपुर्द।` : `Handed over to ${activeRx.ashaWorkerName || 'Local ASHA Worker'} for scheduled block field rounds.`,
      status: 'active',
    },
    {
      title: isHi ? 'घर पर दवा वितरण व स्वास्थ्य जांच' : 'Doorstep Delivery & Vitals Check',
      time: isHi ? 'आज शाम 4:30 बजे तक अनुमानित' : 'Estimated 4:30 PM Today',
      description: isHi ? `${activeRx.ashaDeliveryRoute || 'रामपुर गाँव'} में मरीज़ के घर डिलीवरी निर्धारित।` : `Scheduled delivery to patient home in ${activeRx.ashaDeliveryRoute || 'Village Block'}.`,
      status: 'upcoming',
    },
  ];

  const pendingCount = deliveries.filter(d => d.status === 'pending').length;

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
      {/* Top Banner with ASHA Profile & Jurisdictional Scope */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-marigold/15 text-brand-marigold flex items-center justify-center shrink-0 border border-brand-marigold/30 shadow-2xs">
              <Truck className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded">
                  {t.ashaWorker}
                </span>
                <span className="text-[10px] sm:text-xs text-neutral-500 font-mono">
                  ID: AS-RAJ-4029
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mt-0.5">
                {activeRx.ashaWorkerName || 'Pooja Devi (पूजा देवी)'}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-neutral-600 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                <span>{t.assignedVillage}: <strong>Rampur Tribal Block A & B</strong></span>
              </div>
            </div>
          </div>

          {/* Sync & Field Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 shadow-2xs">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.offlineSyncReady}</span>
            </div>
            {activeRx.ashaContact && (
              <a
                href={`tel:${activeRx.ashaContact}`}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white text-xs font-semibold transition-colors shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{activeRx.ashaContact}</span>
              </a>
            )}
          </div>
        </div>

        {/* 4 Workload Metric Cards */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-xs font-medium">{t.householdsCovered}</span>
              <Users className="w-4 h-4 text-brand-teal" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-neutral-900">28 / 35</div>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1">80% Round Target</span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-800 mb-1">
              <span className="text-xs font-medium">{t.pendingDeliveries}</span>
              <PackageCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-950">{pendingCount}</div>
            <span className="text-[10px] text-amber-700 font-semibold mt-1">{isHi ? 'घर पर वितरण बाकी' : 'Awaiting Doorstep'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-800 mb-1">
              <span className="text-xs font-medium">{t.highRiskFollowups}</span>
              <Baby className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-950">2</div>
            <span className="text-[10px] text-rose-700 font-semibold mt-1">{isHi ? 'गर्भवती महिला व शिशु' : 'Maternal ANC Care'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-xs font-medium">{t.kioskCheckups}</span>
              <HeartPulse className="w-4 h-4 text-brand-marigold" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-neutral-900">9</div>
            <span className="text-[10px] text-neutral-500 font-semibold mt-1">{isHi ? 'बीपी/SpO2 लॉग दर्ज' : 'Vitals Logged Today'}</span>
          </div>
        </div>
      </div>

      {/* Community Doorstep Medicine Delivery Pipeline */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-brand-marigold" />
              <span>{t.deliveryQueueTitle}</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isHi ? 'दवा वितरण पूरा करने पर टैप करें — डेटा ऑफलाइन सुरक्षित रहता है।' : 'Tap item to mark delivered and record doorstep vitals verification.'}
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {deliveries.length} {isHi ? 'कुल पार्सल' : 'Active Parcels'}
          </span>
        </div>

        <div className="space-y-3">
          {deliveries.map((item) => {
            const isDelivered = item.status === 'delivered';
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDelivered 
                    ? 'bg-emerald-50/40 border-emerald-200' 
                    : 'bg-white border-neutral-200 hover:border-brand-marigold/60 shadow-2xs'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 text-sm sm:text-base">
                      {item.patient}
                    </span>
                    <span className="text-[10px] font-mono bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600">
                      {item.id}
                    </span>
                    {item.urgency === 'high' && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                        {isHi ? 'प्राथमिकता' : 'High Priority'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-tealDark font-semibold">
                    {item.medication}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                    <MapPin className="w-3 h-3 text-neutral-400" />
                    <span>{item.village}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMarkDelivered(item.id)}
                    className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                      isDelivered
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-brand-marigold hover:bg-brand-marigoldDark text-white'
                    }`}
                  >
                    {isDelivered ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.deliveredStatus}</span>
                      </>
                    ) : (
                      <>
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>{t.markDelivered}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Delivery Timeline from Primary Prescription */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-marigold" />
          <span>{isHi ? 'डिस्पैच व ग्राम वितरण चरण' : 'Village Round Progress Timeline'}</span>
        </h3>

        <div className="relative pl-6 space-y-7 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
          {timelineSteps.map((s, index) => {
            const isCompleted = s.status === 'completed';
            const isActive = s.status === 'active';

            return (
              <div key={index} className="relative group">
                {/* Circle marker */}
                <span
                  className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : isActive
                      ? 'bg-brand-marigold border-brand-marigold text-white animate-pulse'
                      : 'bg-white border-neutral-300 text-transparent'
                  }`}
                >
                  {isCompleted && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                </span>

                <div className="ml-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-neutral-500">{s.time}</span>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded bg-brand-marigold/10 text-brand-marigoldDark font-bold uppercase text-[10px]">
                        {t.inTransitStatus}
                      </span>
                    )}
                  </div>
                  <h4 className={`text-sm sm:text-base font-bold ${isActive ? 'text-brand-marigoldDark' : 'text-neutral-900'}`}>
                    {s.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory ASHA Disclaimer Caption */}
      <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-200 text-center">
        <div className="flex items-center justify-center gap-1.5 text-neutral-500 text-xs mb-1 font-semibold uppercase tracking-wider">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Notice</span>
        </div>
        <p className="text-xs text-neutral-600 font-medium italic">
          "Conceptual integration — not an active partnership with any ASHA program or health authority."
        </p>
      </div>
    </div>
  );
}
