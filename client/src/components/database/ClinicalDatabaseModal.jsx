import React, { useState } from 'react';
import { 
  Database, 
  Users, 
  Stethoscope, 
  Search, 
  Filter, 
  Download, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Eye, 
  ExternalLink,
  PhoneCall,
  FileSpreadsheet
} from 'lucide-react';

export const MOCK_DOCTORS_DB = [
  {
    id: 'DOC-01',
    name: 'Dr. Ananya Sharma',
    degree: 'MD (Internal Medicine), AIIMS New Delhi',
    council: 'Delhi & UP Medical Council',
    regNo: 'UP-MED-48201',
    specialty: 'Internal Medicine & Critical Care',
    hub: 'District Command Hub 3 (Barabanki)',
    status: 'Online',
    totalConsults: 1428,
    todayConsults: 14,
    shift: '08:00 - 16:00 IST',
    verified: true,
  },
  {
    id: 'DOC-02',
    name: 'Dr. Vikram Malhotra',
    degree: 'MBBS, DNB (Family Medicine)',
    council: 'Rajasthan Medical Council',
    regNo: 'RJ-MED-12904',
    specialty: 'Rural Family Health & Emergency',
    hub: 'District Hub 1 (Jaipur Rural)',
    status: 'In-Consult',
    totalConsults: 2190,
    todayConsults: 19,
    shift: '10:00 - 18:00 IST',
    verified: true,
  },
  {
    id: 'DOC-03',
    name: 'Dr. Priya Singh',
    degree: 'MS (Obstetrics & Gynaecology)',
    council: 'Bihar Medical Council',
    regNo: 'BR-MED-34011',
    specialty: 'Maternal & Reproductive Health',
    hub: 'Sub-District Hub 5 (Patna Outer)',
    status: 'Online',
    totalConsults: 980,
    todayConsults: 9,
    shift: '09:00 - 17:00 IST',
    verified: true,
  },
  {
    id: 'DOC-04',
    name: 'Dr. Rajesh Nair',
    degree: 'MD (Pediatrics)',
    council: 'National Medical Commission (NMC)',
    regNo: 'NMC-PED-88129',
    specialty: 'Pediatric Infectious Diseases',
    hub: 'District Command Hub 2 (Varanasi)',
    status: 'Offline',
    totalConsults: 3120,
    todayConsults: 0,
    shift: 'Off-Duty (On Call)',
    verified: true,
  },
  {
    id: 'DOC-05',
    name: 'Dr. Meenakshi Sunderam',
    degree: 'MBBS, MD (Dermatology)',
    council: 'Tamil Nadu Medical Council',
    regNo: 'TN-MED-65231',
    specialty: 'Tele-Dermatology & Skin Lesions',
    hub: 'State Tele-Specialist Hub',
    status: 'Online',
    totalConsults: 1640,
    todayConsults: 11,
    shift: '11:00 - 19:00 IST',
    verified: true,
  }
];

export default function ClinicalDatabaseModal({
  isOpen,
  onClose,
  patients = [],
  onSelectPatientForCall,
  lang = 'en'
}) {
  const [activeTab, setActiveTab] = useState('patients'); // 'patients' | 'doctors'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');

  if (!isOpen) return null;

  // Filter patients
  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.village && p.village.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.id && p.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.symptoms && p.symptoms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesSeverity = 
      filterSeverity === 'all' ? true :
      filterSeverity === 'red' ? (p.priority === 'Red' || p.triageScore >= 80) :
      filterSeverity === 'yellow' ? (p.priority === 'Yellow' || (p.triageScore >= 40 && p.triageScore < 80)) :
      (p.priority === 'Green' || p.triageScore < 40);

    return matchesSearch && matchesSeverity;
  });

  // Filter doctors
  const filteredDoctors = MOCK_DOCTORS_DB.filter(d => {
    return (
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.hub.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Export to CSV Functionality
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (activeTab === 'patients') {
      csvContent += "ID,Patient Name,Age,Village,Symptoms,Triage Priority,Score,Status,Applied Time\n";
      filteredPatients.forEach(p => {
        const symptomsStr = `"${(p.symptoms || []).join('; ')}"`;
        csvContent += `"${p.id || 'P-01'}","${p.name || ''}","${p.age || ''}","${p.village || ''}",${symptomsStr},"${p.priority || 'Yellow'}","${p.triageScore || 50}","${p.status || 'Waiting'}","${p.timestamp ? new Date(p.timestamp).toLocaleTimeString() : 'Recent'}"\n`;
      });
    } else {
      csvContent += "Doctor ID,Name,Reg Number,Specialization,Medical Council,Command Hub,Status,Total Consultations\n";
      filteredDoctors.forEach(d => {
        csvContent += `"${d.id}","${d.name}","${d.regNo}","${d.specialty}","${d.council}","${d.hub}","${d.status}","${d.totalConsults}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pulsecare_${activeTab}_registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl border border-neutral-300 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-marigold flex items-center justify-center text-white shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">
                  {lang === 'hi' ? 'क्लीनिकल रजिस्ट्री और टेबल डेटाबेस' : 'Clinical Registry & Table Database'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">
                  Live ABDM Synced
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'hi' 
                  ? 'पंजीकृत डॉक्टरों की सूची और कतार में आए मरीज़ों का पूर्ण रिकॉर्ड' 
                  : 'Relational registry of registered medical officers and triaged rural patients'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title="Download table data as CSV spreadsheet"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{lang === 'hi' ? 'CSV एक्सपोर्ट' : 'Export CSV'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Header / Tabs & Search Controls */}
        <div className="p-4 bg-slate-50 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tab buttons */}
          <div className="flex items-center gap-2 bg-neutral-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('patients')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'patients'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-neutral-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'hi' ? 'आवेदित मरीज़ (Patients Applied)' : 'Applied Patients Registry'}</span>
              <span className="px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-800 text-[10px]">
                {patients.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('doctors')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'doctors'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-neutral-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-brand-marigold" />
              <span>{lang === 'hi' ? 'पंजीकृत डॉक्टर सूची (Doctor List)' : 'Registered Doctors Directory'}</span>
              <span className="px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-800 text-[10px]">
                {MOCK_DOCTORS_DB.length}
              </span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'patients' ? "Search patient, village..." : "Search doctor, specialty, reg no..."}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-neutral-300 rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:border-brand-marigold"
              />
            </div>

            {activeTab === 'patients' && (
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="py-1.5 px-3 bg-white border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 focus:outline-none focus:border-brand-marigold"
              >
                <option value="all">All Triage (सभी ट्राइएज)</option>
                <option value="red">Red (आपातकाल / High Risk)</option>
                <option value="yellow">Yellow (टेलीपरामर्श / Medium)</option>
                <option value="green">Green (सामान्य / Low)</option>
              </select>
            )}
          </div>
        </div>

        {/* Database Table Container */}
        <div className="flex-1 overflow-auto p-4 bg-white">
          {activeTab === 'patients' ? (
            /* PATIENTS TABLE */
            <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider font-bold border-b border-neutral-200">
                    <th className="p-3">Patient ID</th>
                    <th className="p-3">Demographics</th>
                    <th className="p-3">Village / Block</th>
                    <th className="p-3">Reported Symptoms</th>
                    <th className="p-3">Triage Priority</th>
                    <th className="p-3">ABHA Token</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium text-slate-700">
                  {filteredPatients.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {p.id || `PC-${100 + idx}`}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                        <div className="text-[11px] text-slate-500">{p.age} Yrs • {p.gender || 'Female'}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-800">{p.village}</span>
                        <div className="text-[10px] text-slate-400">PHC Sector 04</div>
                      </td>
                      <td className="p-3 max-w-[220px]">
                        <div className="flex flex-wrap gap-1">
                          {(p.symptoms || ['Fever', 'Headache']).map((s, si) => (
                            <span key={si} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          p.priority === 'Red' || p.triageScore >= 80
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : p.priority === 'Yellow' || p.triageScore >= 40
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            p.priority === 'Red' || p.triageScore >= 80 ? 'bg-rose-600' :
                            p.priority === 'Yellow' || p.triageScore >= 40 ? 'bg-amber-600' : 'bg-emerald-600'
                          }`} />
                          <span>{p.priority || (p.triageScore >= 80 ? 'Red (High)' : 'Yellow (Medium)')}</span>
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>91-4821-{p.age || '30'}91</span>
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {p.status || 'Queue (Waiting)'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {onSelectPatientForCall && (
                          <button
                            onClick={() => {
                              onSelectPatientForCall(p);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-brand-teal text-white hover:bg-brand-tealDark text-xs font-bold inline-flex items-center gap-1 transition-colors"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Consult</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* DOCTORS TABLE */
            <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider font-bold border-b border-neutral-200">
                    <th className="p-3">Doctor ID</th>
                    <th className="p-3">Medical Officer</th>
                    <th className="p-3">Council Reg No</th>
                    <th className="p-3">Specialty</th>
                    <th className="p-3">Command Hub Center</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Shift Hours</th>
                    <th className="p-3 text-right">Teleconsults</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium text-slate-700">
                  {filteredDoctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {doc.id}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{doc.name}</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Verified Medical Practitioner" />
                        </div>
                        <div className="text-[11px] text-slate-500">{doc.degree}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono font-bold text-brand-tealDark bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {doc.regNo}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{doc.council}</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {doc.specialty}
                      </td>
                      <td className="p-3 text-slate-600">
                        {doc.hub}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.status === 'Online'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.status === 'In-Consult'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            doc.status === 'Online' ? 'bg-emerald-600' :
                            doc.status === 'In-Consult' ? 'bg-amber-600' : 'bg-slate-400'
                          }`} />
                          <span>{doc.status}</span>
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-600">
                        {doc.shift}
                      </td>
                      <td className="p-3 text-right">
                        <span className="font-bold font-mono text-slate-900 text-sm">{doc.totalConsults}</span>
                        <span className="text-[10px] text-slate-400 block">({doc.todayConsults} today)</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-neutral-200 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Relational schema synced with Ayushman Bharat Digital Mission (ABDM) & FHIR format</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">Database Engine: SQLite / IndexedDB Local-First Cache</span>
        </div>
      </div>
    </div>
  );
}
