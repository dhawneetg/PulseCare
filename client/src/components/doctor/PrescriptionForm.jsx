import React, { useState } from 'react';
import { FileText, Send, Check, Truck, AlertCircle } from 'lucide-react';

export default function PrescriptionForm({ patient, onIssuePrescription }) {
  const [formData, setFormData] = useState({
    medication: 'Paracetamol 500mg & Cetirizine 10mg',
    dosage: '1 tablet twice a day after meals for 3 days',
    ashaDeliveryRoute: patient?.village ? `${patient.village} - Delivery Sector 1` : 'Village Block B - North Sector',
    ashaWorkerName: 'Pooja Devi (ASHA Worker)',
    ashaContact: '+91 98765 43210',
    clinicalNotes: 'Adequate hydration, rest, follow up if fever persists beyond 48 hours.',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const rxRecord = {
      rxId: `rx_${Date.now().toString().slice(-4)}`,
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
      disclaimer: 'Conceptual integration — not an active partnership with any ASHA program or health authority.'
    };

    setSubmitted(true);
    setTimeout(() => {
      if (onIssuePrescription) {
        onIssuePrescription(rxRecord);
      }
      setSubmitted(false);
    }, 800);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-marigold" />
          <h3 className="text-lg font-bold text-neutral-900">
            Digital Prescription & ASHA Routing
          </h3>
        </div>
        <span className="text-xs text-neutral-500 font-medium">
          Patient: <strong className="text-neutral-900">{patient?.name || 'Selected Patient'}</strong>
        </span>
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
    </div>
  );
}
