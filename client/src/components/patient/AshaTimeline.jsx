import React from 'react';
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
  Calendar
} from 'lucide-react';
import { MOCK_PRESCRIPTIONS } from '../../utils/mockData.js';

export default function AshaTimeline({ prescription = null, onBack }) {
  const activeRx = prescription || MOCK_PRESCRIPTIONS[0];

  const timelineSteps = [
    {
      title: 'Consultation Complete & Rx Generated',
      time: '10:15 AM',
      description: 'Hub Doctor completed WebRTC consultation and signed digital prescription.',
      status: 'completed',
    },
    {
      title: 'Pharmacy Dispatch (District Hub PHC)',
      time: '11:00 AM',
      description: 'Essential generic medications verified and packaged at Block Central Dispensary.',
      status: 'completed',
    },
    {
      title: 'Assigned to Village ASHA Worker',
      time: '01:30 PM',
      description: `Handed over to ${activeRx.ashaWorkerName || 'Local ASHA Worker'} for scheduled block field rounds.`,
      status: 'active',
    },
    {
      title: 'Doorstep Delivery & Vitals Check',
      time: 'Estimated 4:30 PM Today',
      description: `Scheduled delivery to patient home in ${activeRx.ashaDeliveryRoute || 'Village Block'}.`,
      status: 'upcoming',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded">
                Logistics Routing
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                Rx ID: {activeRx.rxId}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mt-1">
              ASHA Community Delivery Route
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{activeRx.status || 'Active Route'}</span>
            </span>
          </div>
        </div>

        {/* Prescription Summary */}
        <div className="mt-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-neutral-500 tracking-wider">Prescribed Medication</span>
            <span className="text-xs font-medium text-neutral-600">Patient: {activeRx.patientName}</span>
          </div>
          <p className="text-base font-bold text-neutral-900">
            {activeRx.medication}
          </p>
          <div className="text-sm text-neutral-600 font-medium">
            Dosage: <span className="text-neutral-900">{activeRx.dosage}</span>
          </div>
        </div>
      </div>

      {/* ASHA Field Worker Contact Card */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-marigold/10 text-brand-marigold flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-neutral-500 font-medium uppercase tracking-wide">Assigned Health Worker</span>
            <h3 className="text-lg font-bold text-neutral-900">{activeRx.ashaWorkerName}</h3>
            <div className="flex items-center gap-1 text-xs text-neutral-600 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span>{activeRx.ashaDeliveryRoute}</span>
            </div>
          </div>
        </div>

        {activeRx.ashaContact && (
          <a
            href={`tel:${activeRx.ashaContact}`}
            className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white text-sm font-semibold transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>{activeRx.ashaContact}</span>
          </a>
        )}
      </div>

      {/* Delivery Timeline */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-marigold" />
          <span>Village Round Progress</span>
        </h3>

        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
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
                        In Transit
                      </span>
                    )}
                  </div>
                  <h4 className={`text-base font-bold ${isActive ? 'text-brand-marigoldDark' : 'text-neutral-900'}`}>
                    {s.title}
                  </h4>
                  <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MANDATORY ASHA DISCLAIMER CAPTION */}
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
