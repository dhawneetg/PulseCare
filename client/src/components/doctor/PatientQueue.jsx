import React, { useState } from 'react';
import { Users, Clock, AlertCircle, PhoneCall, ChevronRight, Search, Filter } from 'lucide-react';

export default function PatientQueue({ 
  patients = [], 
  selectedPatientId, 
  onSelectPatient,
  onInitiateCall 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all'); // 'all' | 'critical' | 'urgent' | 'routine'

  const filteredPatients = patients.filter((patient) => {
    // Search match
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.village && patient.village.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.symptoms && patient.symptoms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));

    if (!matchesSearch) return false;

    // Severity filter
    if (filterSeverity === 'critical') return patient.urgency === 'emergency';
    if (filterSeverity === 'urgent') return patient.urgency === 'consultation' && patient.triageScore && parseFloat(patient.triageScore) >= 6.0;
    if (filterSeverity === 'routine') return patient.urgency === 'consultation' && (!patient.triageScore || parseFloat(patient.triageScore) < 6.0);
    return true;
  });

  return (
    <aside className="h-full bg-brand-tealDark text-white flex flex-col rounded-2xl shadow-sm overflow-hidden border border-brand-tealDark">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/10 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-marigold" />
            <h2 className="text-base font-bold tracking-tight">Triage Waiting Room</h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-teal text-white border border-white/20">
            {patients.length} Waiting
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Patient, Village, ASHA..."
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-black/30 border border-white/10 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-brand-marigold"
          />
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filter Pills from Tele-Hub design */}
        <div className="flex items-center gap-1 text-[11px] overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFilterSeverity('all')}
            className={`px-2 py-0.5 rounded-md font-bold transition-colors shrink-0 ${
              filterSeverity === 'all' ? 'bg-white text-brand-tealDark' : 'bg-white/10 text-neutral-300 hover:text-white'
            }`}
          >
            All ({patients.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterSeverity('critical')}
            className={`px-2 py-0.5 rounded-md font-bold transition-colors shrink-0 ${
              filterSeverity === 'critical' ? 'bg-rose-500 text-white' : 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/50'
            }`}
          >
            Critical Red
          </button>
          <button
            type="button"
            onClick={() => setFilterSeverity('urgent')}
            className={`px-2 py-0.5 rounded-md font-bold transition-colors shrink-0 ${
              filterSeverity === 'urgent' ? 'bg-amber-500 text-amber-950' : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/50'
            }`}
          >
            Urgent Amber
          </button>
          <button
            type="button"
            onClick={() => setFilterSeverity('routine')}
            className={`px-2 py-0.5 rounded-md font-bold transition-colors shrink-0 ${
              filterSeverity === 'routine' ? 'bg-emerald-500 text-white' : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50'
            }`}
          >
            Routine Green
          </button>
        </div>
      </div>

      {/* Queue List with Internal Scroll */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredPatients.length === 0 ? (
          <div className="p-8 text-center text-neutral-300">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No matching patients in queue.</p>
            <p className="text-xs text-neutral-400 mt-1">
              Clear filters or submit a new patient from the symptom checker.
            </p>
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const isSelected = selectedPatientId === patient.id;
            const isEmergency = patient.urgency === 'emergency';

            return (
              <div
                key={patient.id}
                onClick={() => onSelectPatient(patient)}
                className={`p-3.5 rounded-xl transition-all cursor-pointer border text-left ${
                  isSelected
                    ? 'bg-white/15 border-brand-marigold shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 border-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="font-bold text-base text-white truncate">
                    {patient.name}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {patient.triageScore && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-amber-300 font-bold border border-amber-400/30">
                        {patient.triageScore}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shrink-0 ${
                        isEmergency
                          ? 'bg-rose-500 text-white'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      }`}
                    >
                      {patient.urgency || 'consultation'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-neutral-300 flex items-center justify-between mb-2">
                  <span>{patient.age} yrs • {patient.village || 'Village Block'}</span>
                  {patient.socketId ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Peer
                    </span>
                  ) : (
                    <span className="text-[10px] font-normal text-neutral-400 bg-white/5 px-2 py-0.5 rounded">
                      Sample Data
                    </span>
                  )}
                </div>

                {patient.symptoms && patient.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {patient.symptoms.slice(0, 2).map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-neutral-200 truncate max-w-[120px]"
                      >
                        {s}
                      </span>
                    ))}
                    {patient.symptoms.length > 2 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-neutral-400">
                        +{patient.symptoms.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Call Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onInitiateCall) onInitiateCall(patient);
                  }}
                  className={`w-full h-9 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm ${
                    patient.socketId
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-brand-marigold hover:bg-brand-marigoldDark text-white'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{patient.socketId ? 'Connect Live Consultation' : 'Consult Patient'}</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Queue Demo Helper Footer */}
      <div className="p-3 bg-black/20 border-t border-white/10 text-[11px] text-neutral-300">
        💡 <strong>Demo tip:</strong> Open <span className="text-brand-marigold font-mono">/patient</span> in a second tab or phone to submit a live peer.
      </div>
    </aside>
  );
}
