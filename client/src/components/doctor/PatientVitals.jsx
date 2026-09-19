import React from 'react';
import { 
  User, 
  MapPin, 
  Thermometer, 
  Heart, 
  Activity, 
  Gauge, 
  CheckCircle2, 
  AlertTriangle,
  FileSpreadsheet,
  Ambulance
} from 'lucide-react';
import { getTriageRationale } from '../../utils/triageTree.js';

export default function PatientVitals({ patient, onDispatch108 }) {
  if (!patient) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm text-center text-neutral-500">
        <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 text-neutral-400" />
        <h3 className="text-lg font-bold text-neutral-800">No Patient Selected</h3>
        <p className="text-sm text-neutral-500 mt-1">
          Select a patient from the waiting queue on the left to view pre-gathered vitals and symptoms.
        </p>
      </div>
    );
  }

  const rationale = getTriageRationale(patient.urgency, patient.vitals, patient.symptoms);
  const isEmergency = patient.urgency === 'emergency';

  return (
    <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-6 text-left">
      {/* Critical Red Emergency Quick Dispatch Banner */}
      {isEmergency && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-950 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-900">Critical Red Triage Flag</p>
              <p className="text-xs text-rose-800 font-medium">Patient condition requires immediate Advanced Life Support (ALS) transport to District ICU.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDispatch108}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-900/30 shrink-0 transition-all active:scale-95"
          >
            <Ambulance className="w-4 h-4" />
            <span>Dispatch 108 EMS</span>
          </button>
        </div>
      )}

      {/* Patient Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-neutral-900">{patient.name}</h2>
            <span
              className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                isEmergency
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              {patient.urgency || 'consultation'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-600 mt-1">
            <span>{patient.age} years old</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              {patient.village || 'Village Block'}
            </span>
            <span>•</span>
            <span className="text-xs text-neutral-400 font-mono">ID: {patient.id}</span>
          </div>
        </div>

        <div className="text-xs text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-lg">
          Pre-triage gathered via offline questionnaire
        </div>
      </div>

      {/* Vitals Grid (High Contrast Cards) */}
      <div>
        <h3 className="text-sm font-bold uppercase text-neutral-500 tracking-wider mb-3">
          Clinical Vitals
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Temperature */}
          <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-neutral-500 block">Temperature</span>
              <span className="text-lg font-bold text-neutral-900 font-mono">
                {patient.vitals?.temp ? `${patient.vitals.temp}°F` : '98.6°F'}
              </span>
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-neutral-500 block">Blood Pressure</span>
              <span className="text-lg font-bold text-neutral-900 font-mono">
                {patient.vitals?.bp || '120/80'}
              </span>
            </div>
          </div>

          {/* Pulse */}
          <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-neutral-500 block">Pulse Rate</span>
              <span className="text-lg font-bold text-neutral-900 font-mono">
                {patient.vitals?.pulse ? `${patient.vitals.pulse} BPM` : '76 BPM'}
              </span>
            </div>
          </div>

          {/* SpO2 */}
          <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-neutral-500 block">Oxygen SpO2</span>
              <span className="text-lg font-bold text-neutral-900 font-mono">
                {patient.vitals?.spo2 ? `${patient.vitals.spo2}%` : '98%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reported Symptoms */}
      <div>
        <h3 className="text-sm font-bold uppercase text-neutral-500 tracking-wider mb-2">
          Reported Symptoms
        </h3>
        <div className="flex flex-wrap gap-2">
          {patient.symptoms && patient.symptoms.length > 0 ? (
            patient.symptoms.map((s, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-neutral-100 border border-neutral-200 text-neutral-800"
              >
                {s}
              </span>
            ))
          ) : (
            <span className="text-sm text-neutral-500">None specified</span>
          )}
        </div>
      </div>

      {/* Triage Rationale Box */}
      <div
        className={`p-4 rounded-xl border ${
          isEmergency
            ? 'bg-rose-50 border-rose-200 text-rose-950'
            : 'bg-emerald-50 border-emerald-200 text-emerald-950'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-sm mb-1">
          {isEmergency ? (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span>Deterministic Triage Evaluation: {rationale.title}</span>
        </div>
        <p className="text-xs leading-relaxed opacity-90">{rationale.description}</p>
      </div>
    </div>
  );
}
