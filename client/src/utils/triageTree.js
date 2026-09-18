/**
 * Client-Side Deterministic Triage Rule Engine
 * STRICT RULE: Hardcoded if/else rules only. NO ML models, NO external APIs.
 * Runs 100% offline on low-end devices.
 * 
 * @param {Object} vitals - e.g. { temp: 101.2, bp: "120/80", pulse: 85, spo2: 96 }
 * @param {Array<string>} symptoms - list of symptom strings
 * @returns {"emergency" | "consultation"}
 */
export function evaluateSymptoms(vitals = {}, symptoms = []) {
  const normalizedSymptoms = (symptoms || []).map(s => s.toLowerCase().trim());

  // 1. Critical Red-Flag Symptoms -> Immediate Emergency
  const emergencySymptoms = [
    'chest pain',
    'severe chest pain',
    'difficulty breathing',
    'severe shortness of breath',
    'loss of consciousness',
    'fainting',
    'uncontrolled bleeding',
    'seizure',
    'slurred speech',
    'sudden weakness / paralysis',
    'severe allergic reaction',
    'coughing blood'
  ];

  for (const es of emergencySymptoms) {
    if (normalizedSymptoms.some(s => s.includes(es))) {
      return 'emergency';
    }
  }

  // 2. Vital Signs Triage
  // Temperature evaluation (Fahrenheit)
  const temp = parseFloat(vitals.temp);
  if (!isNaN(temp) && temp >= 104.0) {
    return 'emergency';
  }

  // SpO2 evaluation (Blood oxygen percentage)
  const spo2 = parseFloat(vitals.spo2);
  if (!isNaN(spo2) && spo2 > 0 && spo2 < 90) {
    return 'emergency';
  }

  // Blood Pressure evaluation (Systolic / Diastolic)
  if (vitals.bp && typeof vitals.bp === 'string') {
    const parts = vitals.bp.split('/');
    if (parts.length === 2) {
      const systolic = parseInt(parts[0].trim(), 10);
      const diastolic = parseInt(parts[1].trim(), 10);

      // Hypertensive crisis or acute hypotension/shock
      if (!isNaN(systolic) && (systolic >= 180 || systolic < 85)) {
        return 'emergency';
      }
      if (!isNaN(diastolic) && (diastolic >= 120 || diastolic < 55)) {
        return 'emergency';
      }
    }
  }

  // Pulse rate evaluation
  const pulse = parseInt(vitals.pulse, 10);
  if (!isNaN(pulse) && (pulse > 140 || (pulse > 0 && pulse < 45))) {
    return 'emergency';
  }

  // Default: Standard Consultation Tier (Queue for WebRTC tele-consultation)
  return 'consultation';
}

/**
 * Helper to get human-readable rationale for triage decision
 */
export function getTriageRationale(urgency, vitals = {}, symptoms = []) {
  if (urgency === 'emergency') {
    return {
      title: 'Immediate In-Person Medical Attention Required',
      description: 'Your reported vitals or critical symptoms indicate urgent risk. Please visit the nearest Primary Health Centre (PHC) or District Hospital immediately.',
      action: 'Emergency Bypass Activated — Proceed to Clinic'
    };
  }
  return {
    title: 'Telemedicine Consultation Recommended',
    description: 'Your symptoms are suitable for remote assessment. Connecting you with an available hub doctor via PulseCare.',
    action: 'Join Doctor Consultation Queue'
  };
}
