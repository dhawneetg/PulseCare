/**
 * PulseCare Localization Dictionary
 * Multilingual English, Hindi (हिन्दी), and Bengali (বাংলা - Regional) support
 * for rural, tribal, and district healthcare delivery across India.
 */

export const TRANSLATIONS = {
  en: {
    // Navigation
    appTitle: 'PulseCare',
    subtitle: 'Rural Telehealth',
    tagline: 'Low-Bandwidth Adaptive Telemedicine',
    navHome: 'Home',
    navPatient: 'Patient Triage',
    navDoctor: 'Doctor Hub',
    navAsha: 'ASHA Workload',
    navDatabase: 'Clinical Database',
    language: 'Language',

    // Landing Page
    heroBadge: 'Government of India • Ayushman Bharat Digital Mission (ABDM)',
    heroTitle: 'Lifesaving Telemedicine Over',
    heroHighlight: '2G Cellular Networks',
    heroDesc: 'PulseCare bridges rural PHCs, tribal kiosks, and district command hospitals with sub-40 kbps adaptive audio streaming, offline rule-based triage, and doorstep ASHA delivery.',
    startTriageBtn: 'Register as Rural Patient / Triage',
    openDoctorHubBtn: 'Access Doctor Tele-Hub',
    openDatabaseBtn: 'View Clinical Table Database',
    doctorLoginBtn: 'Doctor NMC Login',

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
    clinicalPhoto2G: '2G Photo Packet',
  },

  hi: {
    // Navigation
    appTitle: 'पल्सकेयर',
    subtitle: 'ग्रामीण टेलीहेल्थ',
    tagline: 'कम-बैंडविड्थ एडेप्टिव टेलीमेडिसिन',
    navHome: 'होम (मुख्य पृष्ठ)',
    navPatient: 'मरीज़ (रजिस्ट्रेशन)',
    navDoctor: 'डॉक्टर टेली-हब',
    navAsha: 'आशा कार्यभार (ASHA)',
    navDatabase: 'टेबल डेटाबेस / रजिस्ट्री',
    language: 'भाषा / Language',

    // Landing Page
    heroBadge: 'भारत सरकार • आयुष्मान भारत डिजिटल मिशन (ABDM)',
    heroTitle: 'दूरदराज क्षेत्रों में जीवनरक्षक स्वास्थ्य सेवा',
    heroHighlight: '2G नेटवर्क पर भी सुचारु',
    heroDesc: 'पल्सकेयर अत्यंत कम 2G इंटरनेट (40 kbps से कम) पर भी बिना रुके स्पष्ट आवाज, बिना इंटरनेट ऑफलाइन बीमारी जांच और घर-घर आशा कार्यकर्ता द्वारा दवा वितरण की सुविधा प्रदान करता है।',
    startTriageBtn: 'ग्रामीण मरीज़ पंजीकरण / लक्षण जांच',
    openDoctorHubBtn: 'डॉक्टर टेली-हब खोलें',
    openDatabaseBtn: 'क्लीनिकल टेबल डेटाबेस देखें',
    doctorLoginBtn: 'डॉक्टर NMC लॉगिन व सत्यापन',

    // Network & Status
    statusStable: '4G स्थिर',
    statusDegraded: '2G केवल ऑडियो फॉलबैक',
    statusOffline: 'ऑफलाइन कैश',
    tapToPlay: 'वीडियो और ऑडियो शुरू करने के लिए टैप करें',
    awaitingConnection: 'डॉक्टर से संपर्क स्थापित हो रहा है...',
    voiceActive: 'आवाज़ सक्रिय (ऑडियो फॉलबैक)',
    highLatencyAlert: 'धीमा इंटरनेट पाया गया (>500ms)। वीडियो बंद करके स्पष्ट ऑडियो चालू किया गया।',

    // Symptom Checker & Triage
    symptomCheckerTitle: 'मरीज़ की जानकारी और ट्राइएज (जांच)',
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
    clinicalPhoto2G: '2G फोटो पैकेट',
  },

  bn: {
    // Navigation (Regional: Bengali)
    appTitle: 'পালসকেয়ার',
    subtitle: 'গ্রামীণ টেলিহেলথ',
    tagline: 'স্বল্প-ব্যান্ডউইথ অভিযোজিত টেলিমেডিসিন',
    navHome: 'হোম',
    navPatient: 'রোগী ট্রায়াজ',
    navDoctor: 'ডাক্তার হাব',
    navAsha: 'আশা ওয়ার্কলোড',
    navDatabase: 'ক্লিনিক্যাল ডাটাবেস',
    language: 'ভাষা / Language',

    // Landing Page
    heroBadge: 'ভারত সরকার • আয়ুষ্মান ভারত ডিজিটাল মিশন (ABDM)',
    heroTitle: 'দূরবর্তী গ্রামে জীবনরক্ষাকারী টেলিমেডিসিন',
    heroHighlight: '২জি (2G) মোবাইল নেটওয়ার্কে',
    heroDesc: 'পালসকেয়ার অতি দুর্বল ২জি নেটওয়ার্কে নিরবচ্ছিন্ন অডিও পরামর্শ, অফলাইন ট্রায়াজ এবং আশা কর্মীদের মাধ্যমে ঘরে ওষুধ পৌঁছে দেয়।',
    startTriageBtn: 'রোগী নিবন্ধন ও লক্ষণ পরীক্ষা',
    openDoctorHubBtn: 'ডাক্তার টেলি-হাব খুলুন',
    openDatabaseBtn: 'ক্লিনিক্যাল টেবিল ডাটাবেস দেখুন',
    doctorLoginBtn: 'ডাক্তার NMC লগইন',

    // Network & Status
    statusStable: '৪জি স্থিতিশীল',
    statusDegraded: '২জি অডিও ফলব্যাক',
    statusOffline: 'অফলাইন ক্যাশ',
    tapToPlay: 'ভিডিও ও অডিও শুরু করতে ট্যাপ করুন',
    awaitingConnection: 'ডাক্তারের সাথে সংযোগ স্থাপন হচ্ছে...',
    voiceActive: 'ভয়েস সক্রিয় (অডিও ফলব্যাক)',
    highLatencyAlert: 'ধীরগতির ইন্টারনেট পাওয়া গেছে। ভিডিও বন্ধ করে পরিষ্কার অডিও চালু করা হয়েছে।',

    // Symptom Checker & Triage
    symptomCheckerTitle: 'রোগীর তথ্য ও ট্রায়াজ',
    symptomCheckerSubtitle: 'গ্রামীণ এলাকার জন্য সম্পূর্ণ অফলাইন স্বাস্থ্য পরীক্ষা ব্যবস্থা।',
    step1: 'প্রোফাইল',
    step2: 'লক্ষণ',
    step3: 'ট্রায়াজ সিদ্ধান্ত',
    fullName: 'রোগীর পুরো নাম *',
    age: 'বয়স (বছর) *',
    village: 'গ্রাম / ব্লকের নাম *',
    autofillDemo: 'ডেমো রোগী পূরণ করুন',
    proceedToSymptoms: 'লক্ষণ পরীক্ষার দিকে এগোন',

    // Common Symptoms
    symptomFever: 'তীব্র জ্বর / উচ্চ তাপমাত্রা',
    symptomCough: 'কাশি / গলা ব্যথা',
    symptomBodyAche: 'শরীর ব্যথা / ক্লান্তি',
    symptomHeadache: 'মাথাব্যথা',
    symptomChestPain: 'বুকে ব্যথা / চাপ (জরুরি)',
    symptomBreathing: 'শ্বাসকষ্ট (জরুরি)',
    symptomVomiting: 'বমি / পাতলা পায়খানা',
    symptomJointPain: 'হাঁটু ও জয়েন্টে ব্যথা',

    // Triage Results
    emergencyTitle: 'অবিলম্বে হাসপাতালে যাওয়া প্রয়োজন',
    emergencyDesc: 'গুরুতর লক্ষণ দেখা গেছে। অবিলম্বে নিকটস্থ স্বাস্থ্যকেন্দ্রে যোগাযোগ করুন।',
    emergencyAction: 'জরুরি অবস্থা — সরাসরি হাসপাতালে যান',
    consultationTitle: 'অনলাইন ডাক্তার পরামর্শের সুপারিশ',
    consultationDesc: 'আপনার লক্ষণগুলো টেলিমেডিসিনের মাধ্যমে মূল্যায়ন সম্ভব। ডাক্তারের সাথে যুক্ত করা হচ্ছে।',
    consultationAction: 'ডাক্তার পরামর্শ সারিতে যুক্ত হন',
    queueWaiting: 'অনলাইন ডাক্তারের জন্য অপেক্ষা করা হচ্ছে...',

    // Text Relay
    textRelayTitle: 'জরুরি লো-ব্যান্ডউইথ টেক্সট বার্তা',
    textRelayNotice: 'ভিডিও ব্যাহত হলেও জরুরি টেক্সট বার্তা নিরবচ্ছিন্ন কাজ করবে।',
    dataChannelOpen: 'নিরাপদ চ্যানেল সক্রিয়',
    textPlaceholder: 'বার্তা লিখুন...',
    send: 'পাঠান',
    quickChips: 'দ্রুত বার্তা:',

    // Doctor Text Templates
    docTemplate1: 'প্যারাসিটামল ৫০০ মিগ্রা খাবারের পর ৩ দিন খাবেন।',
    docTemplate2: 'ওআরএস (ORS) স্যালাইন ও প্রচুর জল পান করুন।',
    docTemplate3: 'গ্রামের আশা কর্মী পূজা দেবীকে জানানো হয়েছে।',
    docTemplate4: 'জরুরি ১০৮ অ্যাম্বুলেন্স পাঠানো হচ্ছে।',

    // Call Controls
    endCall: 'পরামর্শ শেষ করুন',
    toggleAudio: 'মাইক্রোফোন চালু/বন্ধ',
    toggleVideo: 'ক্যামেরা চালু/বন্ধ',
    toggleChat: 'টেক্সট বার্তা',
    testNetwork: 'নেটওয়ার্ক পরীক্ষা:',
    clinicalPhoto2G: '২জি ফটো প্যাকেট',
  }
};
