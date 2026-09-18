/**
 * PulseCare Localization Dictionary
 * Bilingual English & Hindi (हिन्दी) support for rural and tribal health delivery.
 */

export const TRANSLATIONS = {
  en: {
    // Navigation
    appTitle: 'PulseCare',
    subtitle: 'Rural Telehealth',
    tagline: 'Low-Bandwidth Adaptive Telemedicine',
    navHome: 'Home',
    navPatient: 'Patient',
    navDoctor: 'Doctor',
    navAsha: 'ASHA Workload',
    language: 'Language',

    // Network & Status
    statusStable: '4G Stable',
    statusDegraded: '2G Audio Fallback',
    statusOffline: 'Offline Cache',
    tapToPlay: 'Tap to Enable Video & Audio',
    awaitingConnection: 'Awaiting media stream connection...',
    voiceActive: 'Voice Active (Audio Fallback)',
    highLatencyAlert: 'High network latency detected (>500ms). Video switched to low-bandwidth crystal audio.',

    // Symptom Checker & Triage
    symptomCheckerTitle: 'Patient Information & Triage',
    symptomCheckerSubtitle: 'Deterministic offline registration for village residents & ASHA workers.',
    step1: 'Profile',
    step2: 'Symptoms',
    step3: 'Triage',
    fullName: 'Patient Full Name *',
    age: 'Age (Years) *',
    village: 'Village / Tribal Block *',
    autofillDemo: 'Autofill Demo Patient (Ramesh Kumar)',
    proceedToSymptoms: 'Proceed to Vitals & Symptoms',
    
    // Vitals
    vitalsTitle: 'Current Vitals (Measured or Estimated)',
    vitalsOptionalHint: 'In remote villages without devices, you can leave BP or SpO2 blank.',
    temp: 'Temperature (°F)',
    bp: 'Blood Pressure (BP)',
    pulse: 'Pulse Rate (BPM)',
    spo2: 'Oxygen SpO2 (%)',
    deviceNotAvailable: 'Device not available / Skip',
    observedSymptomsTitle: 'Select Observed Symptoms',
    observedSymptomsSubtitle: 'Tap all symptoms that apply. Evaluated offline via deterministic decision rules.',
    customSymptomPlaceholder: 'Other specific symptom...',
    addSymptom: 'Add',
    evaluateAndTriage: 'Evaluate Symptoms & Triage',
    recheckSymptoms: 'Re-check Symptoms',

    // Common Symptoms
    symptomFever: 'Fever / High Temperature',
    symptomCough: 'Cough / Sore Throat',
    symptomBodyAche: 'Body Ache / Fatigue',
    symptomHeadache: 'Persistent Headache',
    symptomChestPain: 'Chest Pain / Pressure (Critical)',
    symptomBreathing: 'Difficulty Breathing (Critical)',
    symptomVomiting: 'Vomiting / Loose Motion',
    symptomJointPain: 'Joint / Knee Pain',

    // Triage Results
    emergencyTitle: 'Immediate In-Person Medical Attention Required',
    emergencyDesc: 'Your reported vitals or critical symptoms indicate urgent risk. Please visit the nearest PHC or Hospital immediately.',
    emergencyAction: 'Emergency Bypass Activated — Proceed to Clinic',
    consultationTitle: 'Telemedicine Consultation Recommended',
    consultationDesc: 'Your symptoms are suitable for remote assessment. Connecting you with an available hub doctor via PulseCare.',
    consultationAction: 'Join Doctor Consultation Queue',
    queueWaiting: 'Waiting for Doctor in Remote Consultation Queue...',

    // Text Relay
    textRelayTitle: 'Emergency Low-Bandwidth Text Relay',
    textRelayNotice: 'Bandwidth guard active: Instant two-way clinical text transmission during video/audio drop.',
    dataChannelOpen: 'Secure Peer-to-Peer Data Channel Open',
    textPlaceholder: 'Type clinical message...',
    send: 'Send',
    quickChips: 'Quick:',
    
    // Doctor Text Templates
    docTemplate1: 'Take Paracetamol 500mg after meals for 3 days.',
    docTemplate2: 'Drink oral rehydration salts (ORS) and rest.',
    docTemplate3: 'Assigned village ASHA worker Pooja Devi notified.',
    docTemplate4: 'Emergency 108 ambulance dispatch requested.',

    // Patient Text Templates
    patTemplate1: 'Patient has high fever and severe headache.',
    patTemplate2: 'Vitals logged at village kiosk: BP 120/80, SpO2 96%.',
    patTemplate3: 'Patient is unable to travel to district hospital.',
    patTemplate4: 'Medicine delivery requested at doorstep.',

    // ASHA Workload Dashboard
    ashaDashboardTitle: 'ASHA Community Health Workload',
    ashaDashboardSubtitle: 'Village Doorstep Care, Maternal Tracking & Medicine Delivery Pipeline',
    ashaWorker: 'ASHA Worker',
    assignedVillage: 'Assigned Village',
    todaysWorkload: "Today's Workload Overview",
    householdsCovered: 'Households Covered',
    pendingDeliveries: 'Pending Deliveries',
    highRiskFollowups: 'High-Risk Followups',
    kioskCheckups: 'Kiosk Checkups Today',
    deliveryQueueTitle: 'Active Doorstep Medicine Deliveries',
    markDelivered: 'Mark Delivered & Log Vitals',
    deliveredStatus: 'Delivered',
    inTransitStatus: 'In Transit',
    offlineSyncReady: 'Offline Sync Ready (IndexedDB)',
    syncedJustNow: 'All village visit records synced to Hub PHC',

    // Call Controls
    endCall: 'End Consultation',
    toggleAudio: 'Toggle Audio',
    toggleVideo: 'Toggle Video',
    toggleChat: 'Text Relay',
    testNetwork: 'Test Network Fallback:',
  },

  hi: {
    // Navigation
    appTitle: 'पल्सकेयर',
    subtitle: 'ग्रामीण टेलीहेल्थ',
    tagline: 'कम-बैंडविड्थ एडेप्टिव टेलीमेडिसिन',
    navHome: 'होम',
    navPatient: 'मरीज़ (रजिस्ट्रेशन)',
    navDoctor: 'डॉक्टर हब',
    navAsha: 'आशा कार्यभार (ASHA)',
    language: 'भाषा / Language',

    // Network & Status
    statusStable: '4G स्थिर',
    statusDegraded: '2G केवल ऑडियो फॉलबैक',
    statusOffline: 'ऑफलाइन कैश',
    tapToPlay: 'वीडियो और ऑडियो शुरू करने के लिए टैप करें',
    awaitingConnection: 'डॉक्टर से संपर्क स्थापित हो रहा है...',
    voiceActive: 'आवाज़ सक्रिय (ऑडियो फॉलबैक)',
    highLatencyAlert: 'धीमा इंटरनेट पाया गया (>500ms)। वीडियो बंद करके स्पष्ट ऑडियो चालू किया गया।',

    // Symptom Checker & Triage
    symptomCheckerTitle: 'मरीज़ की जानकारी और ट्राइएज',
    symptomCheckerSubtitle: 'ग्रामीण व आदिवासी क्षेत्रों के लिए 100% ऑफलाइन कार्यप्रणाली।',
    step1: 'प्रोफ़ाइल',
    step2: 'लक्षण व जांच',
    step3: 'निर्णय (ट्राइएज)',
    fullName: 'मरीज़ का पूरा नाम *',
    age: 'उम्र (वर्ष) *',
    village: 'गाँव / ब्लॉक का नाम *',
    autofillDemo: 'डेमो मरीज़ भरें (रमेश कुमार)',
    proceedToSymptoms: 'लक्षण व स्वास्थ्य जांच की ओर बढ़ें',

    // Vitals
    vitalsTitle: 'वर्तमान जांच (यदि उपकरण उपलब्ध हो)',
    vitalsOptionalHint: 'यदि गाँव में बीपी मशीन या ऑक्सीमीटर नहीं है, तो इसे खाली छोड़ सकते हैं।',
    temp: 'तापमान / बुखार (°F)',
    bp: 'ब्लड प्रेशर (BP)',
    pulse: 'नाड़ी गति (BPM)',
    spo2: 'ऑक्सीजन SpO2 (%)',
    deviceNotAvailable: 'उपकरण उपलब्ध नहीं है / छोड़ें',
    observedSymptomsTitle: 'दिख रहे लक्षण चुनें',
    observedSymptomsSubtitle: 'जो भी लक्षण हों उन पर टैप करें। यह पूरी तरह ऑफलाइन मूल्यांकित होता है।',
    customSymptomPlaceholder: 'कोई अन्य विशिष्ट लक्षण...',
    addSymptom: 'जोड़ें',
    evaluateAndTriage: 'लक्षणों का मूल्यांकन करें',
    recheckSymptoms: 'पुनः जांच करें',

    // Common Symptoms
    symptomFever: 'तेज़ बुखार / तपन',
    symptomCough: 'खांसी / गले में खराश',
    symptomBodyAche: 'बदन दर्द / थकान',
    symptomHeadache: 'सिरदर्द / चक्कर',
    symptomChestPain: 'छाती में दर्द / दबाव (गंभीर)',
    symptomBreathing: 'सांस लेने में तकलीफ (गंभीर)',
    symptomVomiting: 'उल्टी / दस्त / निर्जलीकरण',
    symptomJointPain: 'जोड़ों व घुटनों में दर्द',

    // Triage Results
    emergencyTitle: 'तत्काल अस्पताल / स्वास्थ्य केंद्र जाने की आवश्यकता',
    emergencyDesc: 'गंभीर लक्षण पाए गए हैं। कृपया बिना देर किए तुरंत निकटतम प्राथमिक स्वास्थ्य केंद्र (PHC) पहुंचें।',
    emergencyAction: 'आपातकालीन मोड — तुरंत अस्पताल जाएं',
    consultationTitle: 'टेली-परामर्श (ऑनलाइन डॉक्टर) की सिफारिश',
    consultationDesc: 'आपके लक्षणों का समाधान ऑनलाइन डॉक्टर द्वारा किया जा सकता है। पल्सकेयर द्वारा डॉक्टर से जोड़ा जा रहा है।',
    consultationAction: 'डॉक्टर परामर्श कतार में शामिल हों',
    queueWaiting: 'दूरस्थ परामर्श हेतु डॉक्टर की प्रतीक्षा की जा रही है...',

    // Text Relay
    textRelayTitle: 'आपातकालीन कम-बैंडविड्थ टेक्स्ट संदेश (Text Relay)',
    textRelayNotice: 'धीमे नेटवर्क पर भी डॉक्टर और मरीज़ के बीच तत्काल दो-तरफा टेक्स्ट संदेश सुरक्षित पहुंचेंगे।',
    dataChannelOpen: 'सुरक्षित पीयर-टू-पीयर चैनल खुला है',
    textPlaceholder: 'संदेश लिखें...',
    send: 'भेजें',
    quickChips: 'त्वरित संदेश:',

    // Doctor Text Templates
    docTemplate1: 'पैरासिटामोल 500mg भोजन के बाद 3 दिन तक लें।',
    docTemplate2: 'ओआरएस (ORS) का घोल पिएं और आराम करें।',
    docTemplate3: 'गाँव की आशा कार्यकर्ता पूजा देवी को सूचित किया गया।',
    docTemplate4: 'आपातकालीन 108 एम्बुलेंस सहायता रवाना की गई।',

    // Patient Text Templates
    patTemplate1: 'मरीज़ को तेज़ बुखार और सिर में असहनीय दर्द है।',
    patTemplate2: 'गाँव के कियोस्क पर जांच: BP 120/80, SpO2 96%।',
    patTemplate3: 'मरीज़ जिला अस्पताल जाने की स्थिति में नहीं है।',
    patTemplate4: 'घर पर आवश्यक दवाइयों की डिलीवरी का अनुरोध।',

    // ASHA Workload Dashboard
    ashaDashboardTitle: 'आशा कार्यकर्ता कार्यभार व वितरण डैशबोर्ड',
    ashaDashboardSubtitle: 'गाँव-गाँव घर-घर स्वास्थ्य सेवा, मातृत्व देखभाल व दवा वितरण',
    ashaWorker: 'आशा कार्यकर्ता',
    assignedVillage: 'आवंटित गाँव',
    todaysWorkload: 'आज का कार्यभार सारांश',
    householdsCovered: 'कवर किए गए परिवार',
    pendingDeliveries: 'लंबित दवा वितरण',
    highRiskFollowups: 'उच्च-जोखिम फॉलोअप (ANC)',
    kioskCheckups: 'कियोस्क पर आज की जांचें',
    deliveryQueueTitle: 'घर-घर दवा वितरण सूची',
    markDelivered: 'दवा पहुंचाई गई व जांच दर्ज करें',
    deliveredStatus: 'पहुंचा दी गई',
    inTransitStatus: 'वितरण जारी है',
    offlineSyncReady: 'ऑफलाइन मोड सक्रिय (लोकल सुरक्षित)',
    syncedJustNow: 'सभी ग्रामीण दौरे का डेटा प्राथमिक स्वास्थ्य केंद्र से सिंक है',

    // Call Controls
    endCall: 'परामर्श समाप्त करें',
    toggleAudio: 'माइक चालू/बंद',
    toggleVideo: 'कैमरा चालू/बंद',
    toggleChat: 'टेक्स्ट संदेश',
    testNetwork: 'नेटवर्क टेस्ट:',
  }
};
