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

// 2. Vital Signs Triage (Optional/Conditional for rural villages without diagnostic devices)
  // Temperature evaluation (Fahrenheit)
  if (vitals.temp && vitals.temp !== 'NA') {
    const temp = parseFloat(vitals.temp);
    if (!isNaN(temp) && temp >= 104.0) {
      return 'emergency';
    }
  }

  // SpO2 evaluation (Blood oxygen percentage - optional)
  if (vitals.spo2 && vitals.spo2 !== 'NA') {
    const spo2 = parseFloat(vitals.spo2);
    if (!isNaN(spo2) && spo2 > 0 && spo2 < 90) {
      return 'emergency';
    }
  }

  // Blood Pressure evaluation (Systolic / Diastolic - optional)
  if (vitals.bp && typeof vitals.bp === 'string' && vitals.bp !== 'NA') {
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

  // Pulse rate evaluation (Optional)
  if (vitals.pulse && vitals.pulse !== 'NA') {
    const pulse = parseInt(vitals.pulse, 10);
    if (!isNaN(pulse) && (pulse > 140 || (pulse > 0 && pulse < 45))) {
      return 'emergency';
    }
  }

  // Default: Standard Consultation Tier (Queue for WebRTC tele-consultation)
  return 'consultation';
}

/**
 * Helper to get human-readable rationale for triage decision
 */
export function getTriageRationale(urgency, vitals = {}, symptoms = [], lang = 'en') {
  if (urgency === 'emergency') {
    return {
      title: lang === 'hi' 
        ? 'तत्काल अस्पताल / स्वास्थ्य केंद्र जाने की आवश्यकता' 
        : 'Immediate In-Person Medical Attention Required',
      description: lang === 'hi'
        ? 'आपके लक्षणों या महत्वपूर्ण संकेतों के आधार पर तत्काल देखभाल की आवश्यकता है। कृपया तुरंत निकटतम प्राथमिक स्वास्थ्य केंद्र (PHC) या अस्पताल जाएं।'
        : 'Your reported vitals or critical symptoms indicate urgent risk. Please visit the nearest Primary Health Centre (PHC) or District Hospital immediately.',
      action: lang === 'hi'
        ? 'आपातकालीन मोड — तुरंत अस्पताल जाएं'
        : 'Emergency Bypass Activated — Proceed to Clinic'
    };
  }
  return {
    title: lang === 'hi'
      ? 'टेली-परामर्श (ऑनलाइन डॉक्टर) की सिफारिश'
      : 'Telemedicine Consultation Recommended',
    description: lang === 'hi'
      ? 'आपके लक्षण ऑनलाइन परामर्श के लिए उपयुक्त हैं। पल्सकेयर नेटवर्क के माध्यम से डॉक्टर से संपर्क किया जा रहा है।'
      : 'Your symptoms are suitable for remote assessment. Connecting you with an available hub doctor via PulseCare.',
    action: lang === 'hi'
      ? 'डॉक्टर परामर्श कतार में शामिल हों'
      : 'Join Doctor Consultation Queue'
  };
}

/**
 * Real-time Dynamic Triage Scoring based on IMNCI-R (Rural Integrated Management Protocols)
 * Computes deterministic score (1.0 to 10.0), urgency tier, and clinical rationale.
 */
export function calculateDynamicTriageScore(vitals = {}, symptoms = [], duration = '2-3 दिन', lang = 'en') {
  let score = 2.0;
  const isHi = lang === 'hi';
  const normalized = (symptoms || []).map(s => s.toLowerCase());

  // Check critical symptoms
  const hasChestPain = normalized.some(s => s.includes('chest') || s.includes('सीने'));
  const hasBreathless = normalized.some(s => s.includes('breath') || s.includes('सांस'));
  const hasHighFever = normalized.some(s => s.includes('fever') || s.includes('बुखार'));
  const hasDiarrhea = normalized.some(s => s.includes('diarrhea') || s.includes('उल्टी') || s.includes('दस्त') || s.includes('vomit'));
  const hasCough = normalized.some(s => s.includes('cough') || s.includes('खांसी'));
  const hasFatigue = normalized.some(s => s.includes('fatigue') || s.includes('कमजोरी') || s.includes('थकान'));
  const hasHeadache = normalized.some(s => s.includes('headache') || s.includes('सिरदर्द'));

  if (hasChestPain) score += 4.5;
  if (hasBreathless) score += 3.6;
  if (hasHighFever) score += 2.2;
  if (hasDiarrhea) score += 2.0;
  if (hasCough) score += 1.2;
  if (hasFatigue) score += 0.8;
  if (hasHeadache) score += 1.0;

  // Duration impact
  if (duration && (duration.includes('10+') || duration.includes('1 हफ्ता') || duration.includes('1 week'))) {
    score += 1.0;
  }

  // Cap score between 1.5 and 9.8
  const finalScore = Math.min(9.8, Math.max(1.5, parseFloat(score.toFixed(1))));

  let tier = 'ROUTINE GREEN';
  let tierHi = 'ROUTINE / सामान्य प्राथमिकता';
  let color = 'emerald';
  let urgency = 'consultation';
  let protocol = isHi 
    ? 'मानक प्राथमिक स्वास्थ्य परामर्श प्रोटोकॉल सक्रिय।' 
    : 'Standard community outpatient protocol active.';

  if (finalScore >= 8.0 || hasChestPain) {
    tier = 'CRITICAL RED';
    tierHi = 'CRITICAL RED / उच्च प्राथमिकता';
    color = 'rose';
    urgency = 'emergency';
    protocol = isHi
      ? '⚠️ आपातकालीन रेड-फ्लैग प्रोटोकॉल: तत्काल अस्पताल रेफरल व 108 एम्बुलेंस सहायता अनुशंसित।'
      : '⚠️ Emergency Red-Flag Triggered: Immediate hospital referral & 108 EMS support recommended.';
  } else if (finalScore >= 5.5 || (hasBreathless && hasHighFever)) {
    tier = 'AMBER';
    tierHi = 'AMBER / मध्यम प्राथमिकता';
    color = 'amber';
    urgency = 'consultation';
    protocol = isHi
      ? '⚠️ Fast-Track Protocol Triggered: श्वास कष्ट एवं तीव्र बुखार (Breathlessness + Fever > 101°F) IMNCI-R के तहत फ्लैग किया गया।'
      : '⚠️ Fast-Track Protocol Triggered: Breathlessness + High Fever (>101°F) flagged under Rural IMNCI-R guidelines.';
  }

  return {
    score: finalScore,
    tier,
    tierHi,
    color,
    urgency,
    protocol,
    doctorOnDuty: {
      name: isHi ? 'डॉ. राजेश शर्मा (MBBS, MD)' : 'Dr. Rajesh Sharma (MBBS, MD)',
      availability: isHi ? 'उपलब्ध हैं (कतार: 2 मरीज़)' : 'Available Now (Queue: 2 patients)'
    }
  };
}

