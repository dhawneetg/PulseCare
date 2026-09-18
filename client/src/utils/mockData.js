/**
 * Hardcoded Mock Data for PulseCare MVP (Zero DB Dependencies)
 * Conforms directly to PRD.md Section 5 schema.
 */

export const MOCK_PATIENTS = [
  {
    id: "p_101",
    name: "Ramesh Kumar",
    age: 62,
    vitals: { temp: 99.1, bp: "88/54", pulse: 118, spo2: 89 },
    symptoms: ["Severe chest pain", "Shortness of breath", "Profuse sweating"],
    urgency: "emergency",
    triageScore: "9.1/10",
    village: "PHC Sitapur #02",
    ashaWorkerName: "Kamlesh Devi (ASHA)",
    chiefComplaint: "Acute retrosternal chest heaviness radiating to left shoulder, profuse diaphoresis for 45 mins. ECG snapshot uploaded via 2G edge packet.",
    socketId: null,
    joinedAt: Date.now() - 1000 * 60 * 12
  },
  {
    id: "p_102",
    name: "Baby Aarav (Mother: Meenu)",
    age: 1,
    vitals: { temp: 103.4, bp: "90/60", pulse: 132, spo2: 95 },
    symptoms: ["Severe acute watery diarrhea", "High fever spike", "Sunken fontanelle"],
    urgency: "emergency",
    triageScore: "8.5/10",
    village: "Kiosk Barabanki #08",
    ashaWorkerName: "Sita Verma (ANM)",
    chiefComplaint: "Severe acute watery diarrhea x 14 episodes over 12h, lethargy, skin pinch retracts very slowly (>2 secs). Oral rehydration vomited twice.",
    socketId: null,
    joinedAt: Date.now() - 1000 * 60 * 8
  },
  {
    id: "p_103",
    name: "Sunita Devi",
    age: 46,
    vitals: { temp: 101.2, bp: "135/88", pulse: 88, spo2: 96 },
    symptoms: ["Persistent productive cough", "Purulent sputum", "Exertional breathlessness"],
    urgency: "consultation",
    triageScore: "7.2/10",
    village: "Rampur PHC #04",
    ashaWorkerName: "Poonam Yadav (CHO)",
    chiefComplaint: "Persistent productive cough x 5 days with purulent sputum, exertional breathlessness, mild intercostal retraction. Digital stethoscope audio recorded.",
    socketId: null,
    joinedAt: Date.now() - 1000 * 60 * 18
  },
  {
    id: "p_104",
    name: "Mohd. Irfan",
    age: 35,
    vitals: { temp: 98.8, bp: "124/78", pulse: 82, spo2: 98 },
    symptoms: ["Deep forearm laceration", "Localized cellulitis", "Active discharge"],
    urgency: "consultation",
    triageScore: "6.8/10",
    village: "PHC Kiosk #09",
    ashaWorkerName: "Shabana Bano (ASHA)",
    chiefComplaint: "Deep laceration right forearm sustained via farm harvester machinery 36h ago. Margins indurated, active seropurulent discharge. Tetanus toxoid given by ASHA 2h ago.",
    socketId: null,
    joinedAt: Date.now() - 1000 * 60 * 28
  },
  {
    id: "p_105",
    name: "Lakshmi Bai",
    age: 54,
    vitals: { temp: 98.4, bp: "130/82", pulse: 74, spo2: 98 },
    symptoms: ["Type-2 Diabetes Refill", "Hypertension Checkup"],
    urgency: "consultation",
    triageScore: "3.1/10",
    village: "PHC Sitapur #01",
    ashaWorkerName: "Rani Devi (ASHA)",
    chiefComplaint: "Routine monthly refill for Type-2 Diabetes Mellitus & Primary Essential Hypertension. Random Glucose: 142 mg/dL. No symptoms of dizziness or blurred vision.",
    socketId: null,
    joinedAt: Date.now() - 1000 * 60 * 43
  }
];

export const MOCK_DOCTOR = {
  id: "doc_01",
  name: "Dr. Ananya Sharma, MBBS, MD",
  hubLocation: "District Civil Hospital, Hub 3",
  specialty: "General Medicine & Rural Health",
  available: true
};

export const MOCK_PRESCRIPTIONS = [
  {
    rxId: "rx_999",
    patientId: "p_101",
    patientName: "Ramesh Kumar",
    medication: "Paracetamol 500mg & Cetirizine 10mg",
    dosage: "1 tablet after meals twice a day for 3 days",
    ashaDeliveryRoute: "Village Block B - North Sector",
    ashaWorkerName: "Pooja Devi (ASHA)",
    ashaContact: "+91 98765 43210",
    status: "Routed to Local ASHA Worker",
    disclaimer: "Conceptual integration — not an active partnership with any ASHA program or health authority."
  }
];
