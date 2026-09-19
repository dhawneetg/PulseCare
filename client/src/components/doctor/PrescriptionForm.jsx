import React, { useState } from 'react';
import { FileText, Send, Check, Truck, AlertCircle, Share2, Printer, X, Download, ShieldCheck, QrCode } from 'lucide-react';
import QrCodeSvg from '../common/QrCodeSvg.jsx';

export default function PrescriptionForm({ patient, onIssuePrescription }) {
  const [formData, setFormData] = useState({
    medication: 'Paracetamol 500mg & Cetirizine 10mg',
    dosage: '1 tablet twice a day after meals for 3 days',
    ashaDeliveryRoute: patient?.village ? `${patient.village} - Delivery Sector 1` : 'Village Block B - North Sector',
    ashaWorkerName: 'Pooja Devi (ASHA Worker)',
    ashaContact: '+91 98765 43210',
    clinicalNotes: 'Adequate hydration, warm water gargles, follow up if fever persists beyond 48 hours.',
  });

  const [submitted, setSubmitted] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showWhatsAppQrModal, setShowWhatsAppQrModal] = useState(false);
  const [lastRxId, setLastRxId] = useState(() => `RX-${Math.floor(1000 + Math.random() * 9000)}`);

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentId = `RX-${Date.now().toString().slice(-4)}`;
    setLastRxId(currentId);

    const rxRecord = {
      rxId: currentId,
      patientId: patient?.id || 'p_unknown',
      patientName: patient?.name || 'Patient',
      medication: formData.medication,
      dosage: formData.dosage,
      ashaDeliveryRoute: formData.ashaDeliveryRoute,
      ashaWorkerName: formData.ashaWorkerName,
      ashaContact: formData.ashaContact,
      clinicalNotes: formData.clinicalNotes,
      status: 'Routed to Local ASHA Worker',
      issuedAt: Date.now(),
      disclaimer: 'National Telemedicine Gateway — District Hospital Hub 3 e-Prescription'
    };

    setSubmitted(true);
    setTimeout(() => {
      if (onIssuePrescription) {
        onIssuePrescription(rxRecord);
      }
      setSubmitted(false);
    }, 800);
  };

  const getWhatsAppMessageText = () => {
    return `📋 *PulseCare Tele-Prescription (जिला टेली-हब 3)*\n` +
      `👤 *Patient:* ${patient?.name || 'Sunita Devi'} (${patient?.age || '46'} yrs)\n` +
      `📍 *Village:* ${patient?.village || 'Rampur PHC #04'}\n` +
      `💊 *Medication:* ${formData.medication}\n` +
      `⏱ *Schedule:* ${formData.dosage}\n` +
      `👩‍⚕️ *Doctor:* Dr. Ananya Sharma (Reg. #UP-MED-48201)\n` +
      `📦 *ASHA Contact:* ${formData.ashaWorkerName} (${formData.ashaContact})\n` +
      `📝 *Advice:* ${formData.clinicalNotes}\n` +
      `🔗 *ABDM Telehealth Token:* https://pulsecare.gov.in/verify/${lastRxId}`;
  };

  const getWhatsAppUrl = () => {
    const text = getWhatsAppMessageText();
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const handleShareWhatsApp = () => {
    const url = getWhatsAppUrl();
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-marigold" />
          <h3 className="text-lg font-bold text-neutral-900">
            Digital Prescription & ASHA Routing
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowWhatsAppQrModal(true)}
            title="Scan QR to open prescription directly on phone WhatsApp"
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-400 flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Scan WhatsApp QR</span>
          </button>
          <button
            type="button"
            onClick={handleShareWhatsApp}
            title="Share Prescription via WhatsApp Web"
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 flex items-center gap-1.5 transition-all"
          >
            <span>Open Web</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            title="Preview Printable Prescription with QR Code"
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-slate-700" />
            <span>Print Slip</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-neutral-600 mb-1.5">
            Prescribed Medications & Formulation *
          </label>
          <input
            type="text"
            required
            value={formData.medication}
            onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
            placeholder="e.g. Paracetamol 500mg, ORS Sachets"
            className="w-full h-11 px-3 rounded-lg border-2 border-neutral-200 focus:border-brand-marigold text-sm font-medium text-neutral-900"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-neutral-600 mb-1.5">
            Dosage & Administration Schedule *
          </label>
          <input
            type="text"
            required
            value={formData.dosage}
            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            placeholder="e.g. 1 tablet twice a day after meals"
            className="w-full h-11 px-3 rounded-lg border-2 border-neutral-200 focus:border-brand-marigold text-sm font-medium text-neutral-900"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600 mb-1.5">
              Assigned ASHA Worker
            </label>
            <input
              type="text"
              value={formData.ashaWorkerName}
              onChange={(e) => setFormData({ ...formData, ashaWorkerName: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600 mb-1.5">
              Village Logistics Route
            </label>
            <input
              type="text"
              value={formData.ashaDeliveryRoute}
              onChange={(e) => setFormData({ ...formData, ashaDeliveryRoute: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-neutral-600 mb-1.5">
            Clinical Advice / Dietary Notes
          </label>
          <textarea
            rows={2}
            value={formData.clinicalNotes}
            onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
            className="w-full p-2.5 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-800 focus:outline-none focus:border-brand-marigold"
          />
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 italic">
            <Truck className="w-3.5 h-3.5 text-brand-marigold shrink-0" />
            <span>Syncs with ASHA community delivery timeline mockup</span>
          </div>

          <button
            type="submit"
            disabled={submitted || !patient}
            className={`h-11 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all w-full sm:w-auto ${
              submitted
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-marigold hover:bg-brand-marigoldDark text-white'
            } ${!patient ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {submitted ? (
              <>
                <Check className="w-4 h-4" />
                <span>Prescription Dispatched!</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Sign & Route Prescription</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Printable Prescription Slip Modal with Dynamic SVG QR Code */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-neutral-300 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Actions Bar (hidden in real print) */}
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Official e-Prescription Verification Slip</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Kiosk Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-1 hover:bg-white/20 rounded text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Slip Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-slate-900 bg-neutral-50 text-left font-sans">
              {/* Slip Header */}
              <div className="border-b-2 border-slate-800 pb-3 flex items-start justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight uppercase">
                    Department of Health & Family Welfare
                  </h2>
                  <p className="text-xs text-slate-600 font-bold">
                    District Telemedicine Command Hub 3 • Ayushman Bharat Digital Network
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Kiosk ID: <strong className="text-slate-800">{patient?.village ? `${patient.village} #08` : 'UP-BRB-08'}</strong> • Rx No: <strong className="text-emerald-700">{lastRxId}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date & Time</span>
                  <span className="text-xs font-mono font-bold text-slate-700">{new Date().toLocaleString()}</span>
                </div>
              </div>

              {/* Patient Demographics Box */}
              <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Name</span>
                  <strong className="text-slate-900 text-sm">{patient?.name || 'Sunita Devi'}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Age / Gender</span>
                  <span className="font-semibold text-slate-800">{patient?.age || '46'} Yrs • Female</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">ABHA ID (Verified)</span>
                  <span className="font-mono font-bold text-emerald-700">91-4821-3091-7712</span>
                </div>
              </div>

              {/* Prescription Body */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">Rx Medications</span>
                  <span className="text-[11px] font-bold text-slate-400">Oral Formulations</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{formData.medication}</p>
                      <p className="text-slate-600 font-medium">{formData.dosage}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      ASHA Kit Stocked
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Clinical Advice & Diet</span>
                    <p className="text-slate-700 italic text-[11px]">{formData.clinicalNotes}</p>
                  </div>
                </div>
              </div>

              {/* Footer with QR Code and Doctor Stamp */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 gap-4">
                <div className="flex items-center gap-3">
                  <QrCodeSvg 
                    value={getWhatsAppUrl()} 
                    size={84} 
                  />
                  <div className="text-[10px] text-slate-500 max-w-[180px] leading-tight">
                    <p className="font-bold text-slate-800">Scan via Mobile Camera</p>
                    <p>Instant verification & direct WhatsApp delivery for patient & ASHA.</p>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div className="inline-block border-b border-slate-400 pb-1 mb-1 font-serif italic text-sm text-slate-800">
                    Dr. Ananya Sharma
                  </div>
                  <p className="font-bold text-slate-900 text-[11px]">Dr. Ananya Sharma, MD</p>
                  <p className="text-[10px] text-slate-500">Reg No: UP-MED-48201</p>
                  <p className="text-[10px] text-emerald-700 font-bold">Digitally Signed via PulseCare</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instant WhatsApp QR Code Scanner Modal for Judges & Mobile Phones */}
      {showWhatsAppQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-neutral-200 overflow-hidden text-center p-6 space-y-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto">
              <Share2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Scan via Phone Camera / WhatsApp
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Point any phone camera or Google Lens to instantly open this e-prescription on WhatsApp.
              </p>
            </div>

            {/* Scannable WhatsApp QR Code */}
            <div className="flex justify-center p-2 bg-slate-50 rounded-2xl border border-slate-200">
              <QrCodeSvg 
                value={getWhatsAppUrl()} 
                size={180} 
              />
            </div>

            <div className="text-xs font-medium text-slate-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Ready to scan • Opens WhatsApp automatically</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Open in WhatsApp Web
              </button>
              <button
                type="button"
                onClick={() => setShowWhatsAppQrModal(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

