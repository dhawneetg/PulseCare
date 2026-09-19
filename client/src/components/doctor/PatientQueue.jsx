import React, { useState } from 'react';
import { Users, Clock, AlertCircle, PhoneCall, ChevronRight, Search, Filter, X, MapPin, Activity, Sparkles, User } from 'lucide-react';

export default function PatientQueue({ 
  patients = [], 
  selectedPatientId, 
  onSelectPatient,
  onInitiateCall 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all'); // 'all' | 'critical' | 'urgent' | 'routine'

  const criticalCount = patients.filter(p => p.urgency === 'emergency').length;
  const urgentCount = patients.filter(p => p.urgency === 'consultation' && p.triageScore && parseFloat(p.triageScore) >= 6.0).length;
  const routineCount = patients.filter(p => p.urgency === 'consultation' && (!p.triageScore || parseFloat(p.triageScore) < 6.0)).length;

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

  const getScoreBadgeClass = (scoreStr) => {
    if (!scoreStr) return 'bg-white/10 text-white/80 border-white/20';
    const val = parseFloat(scoreStr);
    if (isNaN(val)) return 'bg-white/10 text-white/80 border-white/20';
    if (val >= 8.0) return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    if (val >= 5.0) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  };

  return (
    <aside className="h-full bg-gradient-to-b from-[#123C38] via-[#0e322f] to-[#0a2522] text-white flex flex-col rounded-2xl shadow-xl overflow-hidden border border-emerald-800/40">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/10 shrink-0 space-y-3 bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-teal-500/20 border border-white/15 flex items-center justify-center text-brand-marigold shadow-inner">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                Triage Waiting Room
              </h2>
              <p className="text-[11px] text-emerald-300/70 font-medium">Real-time tele-consult queue</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {patients.length} Waiting
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient, village, symptom..."
            className="w-full h-8 pl-8 pr-7 rounded-xl bg-black/30 border border-white/10 text-xs text-white placeholder-emerald-100/40 focus:outline-none focus:border-brand-marigold focus:ring-1 focus:ring-brand-marigold/40 transition-all"
          />
          <Search className="w-3.5 h-3.5 text-emerald-300/60 absolute left-2.5 top-1/2 -translate-y-1/2" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills with Counters and No-Scrollbar */}
        <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setFilterSeverity('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 border ${
              filterSeverity === 'all'
                ? 'bg-white text-emerald-950 border-white shadow-md'
                : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            All <span className="opacity-75">({patients.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterSeverity('critical')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 border ${
              filterSeverity === 'critical'
                ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/50'
                : 'bg-rose-950/30 border-rose-500/20 text-rose-300 hover:bg-rose-900/40'
            }`}
          >
            Critical <span className="opacity-80">({criticalCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterSeverity('urgent')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 border ${
              filterSeverity === 'urgent'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-950/50'
                : 'bg-amber-950/30 border-amber-500/20 text-amber-300 hover:bg-amber-900/40'
            }`}
          >
            Urgent <span className="opacity-80">({urgentCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterSeverity('routine')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 border ${
              filterSeverity === 'routine'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/50'
                : 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300 hover:bg-emerald-900/40'
            }`}
          >
            Routine <span className="opacity-80">({routineCount})</span>
          </button>
        </div>
      </div>

      {/* Queue List with Internal Custom Sleek Scrollbar */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
        {filteredPatients.length === 0 ? (
          <div className="p-8 text-center text-neutral-300 flex flex-col items-center justify-center h-48">
            <Clock className="w-8 h-8 mb-2 text-emerald-400/40" />
            <p className="text-sm font-semibold text-white">No patients in this view</p>
            <p className="text-xs text-emerald-200/60 mt-1 max-w-[200px]">
              Switch severity filters or submit a new triage from the patient portal.
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
                className={`p-3.5 rounded-xl transition-all cursor-pointer border text-left relative overflow-hidden group ${
                  isSelected
                    ? 'bg-white/[0.12] border-brand-marigold/80 shadow-md ring-1 ring-brand-marigold/40'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/20'
                }`}
              >
                {/* Subtle top indicator highlight for active item */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-marigold via-amber-300 to-brand-marigold" />
                )}

                {/* Patient Header */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-bold text-sm text-white truncate group-hover:text-emerald-200 transition-colors" title={patient.name}>
                    {patient.name}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {patient.triageScore && (
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getScoreBadgeClass(patient.triageScore)}`}>
                        {patient.triageScore}
                      </span>
                    )}
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 border ${
                        isEmergency
                          ? 'bg-rose-500/90 text-white border-rose-400 shadow-sm'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {patient.urgency || 'consultation'}
                    </span>
                  </div>
                </div>

                {/* Subtitle / Demographics */}
                <div className="text-[11px] text-neutral-300 flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1 truncate text-emerald-100/70">
                    <User className="w-3 h-3 text-neutral-400 shrink-0" />
                    {patient.age} yrs • {patient.village || 'Village Block'}
                  </span>
                  {patient.socketId ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-500/50 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Live Peer
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-neutral-400 bg-black/20 border border-white/5 px-2 py-0.5 rounded-full">
                      Sample Data
                    </span>
                  )}
                </div>

                {/* Symptoms Chips */}
                {patient.symptoms && patient.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {patient.symptoms.slice(0, 2).map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-black/30 border border-white/5 text-neutral-200 truncate max-w-[130px]"
                        title={s}
                      >
                        {s}
                      </span>
                    ))}
                    {patient.symptoms.length > 2 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/40 border border-white/5 text-neutral-400">
                        +{patient.symptoms.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Call Action Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onInitiateCall) onInitiateCall(patient);
                  }}
                  className={`w-full h-8.5 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98] ${
                    patient.socketId
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/40'
                      : 'bg-gradient-to-r from-brand-marigold to-[#a3591c] hover:from-[#d88237] hover:to-brand-marigold text-white shadow-black/30'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                  <span>{patient.socketId ? 'Connect Live Consultation' : 'Consult Patient'}</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Queue Demo Helper Footer */}
      <div className="p-3 bg-black/30 border-t border-white/10 text-[11px] text-emerald-100/75 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span>💡</span>
          <span><strong>Demo tip:</strong> Open <code className="text-amber-300 font-mono bg-black/40 px-1 py-0.5 rounded">/patient</code> in 2nd tab</span>
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
      </div>
    </aside>
  );
}

