// data/educationData.js
// Medically vetted maternal health guidance aligned with WHO & National Health Mission (MoHFW) standards

const educationData = {
  en: {
    emergencyCare: {
      headline: 'Emergency Obstetric Warning Signs — Seek Immediate Hospital Care',
      tollFreeHelpline: '108 (Emergency Ambulance) / 102 (Janani Shishu Suraksha)',
      medicalHelpline: '104 (Health Advice Helpline)',
      dangerSigns: [
        {
          sign: 'Vaginal Bleeding',
          description: 'Any bleeding or spotting during pregnancy requires urgent clinical evaluation.',
          action: 'Go to the nearest maternity hospital or Primary Health Centre (PHC) immediately.',
        },
        {
          sign: 'Severe Headache with Blurred Vision',
          description: 'Persistent severe headache, spots before eyes, or sudden puffiness in face and hands may indicate pre-eclampsia (high blood pressure).',
          action: 'Have blood pressure checked urgently by a healthcare professional.',
        },
        {
          sign: 'High Fever & Chills',
          description: 'Fever above 38°C (100.4°F) can pose risks to maternal and fetal well-being.',
          action: 'Consult your health worker or doctor immediately. Do not self-medicate.',
        },
        {
          sign: 'Sudden Fluid Leakage (Water Break)',
          description: 'Continuous leaking or gushing of watery fluid before 37 weeks.',
          action: 'Head straight to the delivery facility.',
        },
        {
          sign: 'Reduced or Absent Fetal Movement',
          description: 'Noticeable drop in baby kicks (fewer than 10 movements in a 2-hour quiet monitoring period after week 28).',
          action: 'Contact your health worker or obstetrician without delay.',
        },
        {
          sign: 'Severe Abdominal Pain or Cramping',
          description: 'Intense or constant lower abdominal pain that does not subside.',
          action: 'Seek emergency evaluation.',
        },
      ],
    },
    trimesterGuidance: [
      {
        trimester: 1,
        weeks: 'Weeks 1 – 12',
        title: 'First Trimester: Foundation & Development',
        fetalDevelopment: 'During these first 12 weeks, your baby develops vital organs, heart beat, neural tube, limb buds, and facial features.',
        careChecklist: [
          'Register your pregnancy at your nearest PHC or clinic as soon as a period is missed.',
          'Start daily Folic Acid (400 mcg - 5 mg) immediately to prevent neural tube birth defects.',
          'Undergo baseline blood tests: Complete Blood Count, Blood Group & Rh factor, Blood Sugar, HIV, Syphilis, and Hepatitis B.',
          'Schedule your first dating & viability ultrasound between 7 to 11 weeks.',
          'Schedule Nuchal Translucency (NT) scan & Dual Marker test between 11 to 13 weeks + 6 days.',
        ],
        nutrition: [
          'Stay hydrated with 8–10 glasses of clean boiled/filtered water daily.',
          'Eat small, frequent meals to manage nausea and morning sickness.',
          'Include green leafy vegetables (spinach, methi), pulses, whole grains, and seasonal fruits.',
          'Avoid raw/undercooked meats, unpasteurized milk, and excess caffeine.',
        ],
      },
      {
        trimester: 2,
        weeks: 'Weeks 13 – 26',
        title: 'Second Trimester: Growth & Vitality',
        fetalDevelopment: 'The golden period of pregnancy. Fetal movement (quickening) begins between 18–20 weeks. Baby can hear sounds, swallow, and grow hair.',
        careChecklist: [
          'Receive Tetanus Toxoid (TT/Td) vaccination injection as per the national immunization schedule.',
          'Schedule the detailed Anomaly Ultrasound (TIFFA scan) between weeks 18 and 20.',
          'Start daily Iron & Folic Acid (IFA) and Calcium supplements (take at different times of day).',
          'Screen for Gestational Diabetes Mellitus (Oral Glucose Tolerance Test - OGTT) between 24 and 28 weeks.',
          'Monitor blood pressure and urine protein at every monthly ANC checkup.',
        ],
        nutrition: [
          'Increase calcium intake: milk, curd, paneer, ragi, and sesame to support baby bone structure.',
          'Boost iron absorption: eat vitamin C-rich fruits (amla, guava, lemon, oranges) alongside meals.',
          'Incorporate dietary fiber to prevent pregnancy-induced constipation.',
          'Never take Iron and Calcium tablets together; keep a gap of at least 2 hours.',
        ],
      },
      {
        trimester: 3,
        weeks: 'Weeks 27 – 40+',
        title: 'Third Trimester: Preparation for Delivery',
        fetalDevelopment: 'Rapid weight gain, lung maturation, and settling into the head-down (cephalic) birth position.',
        careChecklist: [
          'Increase ANC visit frequency: every 2 weeks until week 36, then weekly until delivery.',
          'Count baby kicks daily using the "Count to 10" method every evening.',
          'Finalize institutional birth preparedness: choose the hospital, arrange emergency transport, and pack maternal-infant kit.',
          'Attend labor preparation and breastfeeding orientation sessions.',
          'Review birth plan and identify blood donors if Rh negative.',
        ],
        nutrition: [
          'Consume protein-rich foods (dal, sprouts, paneer, eggs) for maternal stamina and fetal muscle mass.',
          'Limit heavy or spicy meals near bedtime to prevent heartburn; sleep on your left side.',
          'Continue IFA and Calcium supplementation uninterrupted.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Why are at least 4 to 8 Antenatal Care (ANC) visits crucial?',
        answer: 'Regular ANC visits allow early detection of complications like anaemia, pre-eclampsia, and gestational diabetes, ensuring safe delivery and optimal infant health.',
      },
      {
        question: 'Can I take Iron and Calcium supplements together?',
        answer: 'No. Calcium interferes with iron absorption. Take your Iron tablet in the morning (with lemonade or water) and Calcium tablet in the afternoon or evening after meals.',
      },
      {
        question: 'Why should I sleep on my left side?',
        answer: 'Sleeping on the left side improves blood flow to the placenta and kidneys, ensuring the fetus receives optimal oxygen and nutrients while reducing maternal swelling.',
      },
      {
        question: 'What documents should I keep ready for delivery?',
        answer: 'Keep your Mother-Child Protection (MCP) card, Aadhaar card, hospital registration file, and emergency contact numbers in an accessible folder.',
      },
    ],
  },
  mr: {
    emergencyCare: {
      headline: 'आपत्कालीन प्रसूती धोक्याची लक्षणे — ताबडतोब रुग्णालयात जा',
      tollFreeHelpline: '१०८ (आपत्कालीन रुग्णवाहिका) / १०२ (जननी शिशु सुरक्षा)',
      medicalHelpline: '१०४ (आरोग्य सल्ला हेल्पलाइन)',
      dangerSigns: [
        {
          sign: 'योनीतून रक्तस्त्राव होणे',
          description: 'गरोदरपणात कोणताही रक्तस्त्राव किंवा डाग दिसल्यास तातडीने वैद्यकीय तपासणी आवश्यक आहे.',
          action: 'जवळच्या प्राथमिक आरोग्य केंद्र (PHC) किंवा प्रसूती रुग्णालयात त्वरित जा.',
        },
        {
          sign: 'तीव्र डोकेदुखी आणि अंधुक दिसणे',
          description: 'सतत डोकेदुखी, डोळ्यांसमोर अंधारी किंवा चेहरा-हातावर अचानक सूज येणे उच्च रक्तदाबाचे (प्री-एक्लॅम्पसिया) लक्षण असू शकते.',
          action: 'त्वरित डॉक्टरांकडून रक्तदाब तपासून घ्या.',
        },
        {
          sign: 'तीव्र ताप आणि थंडी वाजणे',
          description: '३८°C (१००.४°F) पेक्षा जास्त ताप माता व गर्भासाठी धोकादायक ठरू शकतो.',
          action: 'आशा सेविका किंवा डॉक्टरांचा तातडीने सल्ला घ्या. परस्पर गोळ्या घेऊ नका.',
        },
        {
          sign: 'अचानक पाण्याचा स्त्राव होणे (पाणी सुटणे)',
          description: '३७ आठवड्यांपूर्वी योनीतून सतत पाणी वाहणे.',
          action: 'तात्काळ प्रसूती केंद्रात दाखल व्हा.',
        },
        {
          sign: 'बाळाची हालचाल कमी होणे किंवा थांबणे',
          description: '२८ आठवड्यांनंतर २ तासांच्या विश्रांतीत बाळाच्या १० पेक्षा कमी हालचाली जाणवणे.',
          action: 'आरोग्य सेविकेशी किंवा स्त्रीरोगतज्ज्ञांशी त्वरित संपर्क साधा.',
        },
        {
          sign: 'पोटात तीव्र वेदना किंवा पेटके येणे',
          description: 'पोटाच्या खालच्या भागात सतत किंवा असह्य कळा येणे.',
          action: 'तातडीने वैद्यकीय तपासणी करून घ्या.',
        },
      ],
    },
    trimesterGuidance: [
      {
        trimester: 1,
        weeks: 'आठवडे १ ते १२',
        title: 'पहिली तिमाही: पायाभरणी आणि विकास',
        fetalDevelopment: 'पहिल्या १२ आठवड्यांत बाळाचे अवयव, हृदयाचे ठोके, मेंदू व मज्जारज्जू, हात-पाय आणि चेहऱ्याचे अवयव तयार होतात.',
        careChecklist: [
          'मासिक पाळी चुकल्याबरोबर जवळच्या आरोग्य केंद्रात गरोदरपणाची नोंदणी करा.',
          'बाळाच्या मज्जारज्जूच्या संरक्षणासाठी दररोज फॉलिक ॲसिड (Folic Acid) गोळी सुरू करा.',
          'रक्तगट, हिमोग्लोबिन, साखर, एचआयव्ही, सिफिलीस व कावीळ तपासणी करा.',
          '७ ते ११ आठवड्यांच्या दरम्यान पहिली सोनोग्राफी करून घ्या.',
          '११ ते १३ आठवड्यांच्या दरम्यान एनटी स्कॅन (NT Scan) करून घ्या.',
        ],
        nutrition: [
          'दररोज ८-१० ग्लास स्वच्छ उकळलेले/गाळलेले पाणी प्या.',
          'मळमळ कमी करण्यासाठी थोडे-थोडे पण वारंवार जेवा.',
          'हिरव्या पालेभाज्या (पालक, मेथी), कडधान्ये, फळे आणि डाळींचा आहारात समावेश करा.',
          'कच्चे अन्न, जास्त चहा/कॉफी टाळा.',
        ],
      },
      {
        trimester: 2,
        weeks: 'आठवडे १३ ते २६',
        title: 'दुसरी तिमाही: वाढ आणि ऊर्जा',
        fetalDevelopment: 'गरोदरपणातील सुखद काळ. १८ ते २० आठवड्यांत बाळाची हालचाल जाणवू लागते. बाळ आवाज ऐकू शकते.',
        careChecklist: [
          'धनुर्वाताचे (TT/Td) लसीकरण वेळेवर करून घ्या.',
          '१८ ते २० आठवड्यांत बाळाच्या अवयवांची तपासणी करणारी सोनोग्राफी (TIFFA / Anomaly Scan) करा.',
          'लोह (IFA) आणि कॅल्शियमच्या गोळ्या सुरू करा (दोन्ही गोळ्या एकत्र घेऊ नका).',
          '२४ ते २८ आठवड्यांत गर्भावस्थेतील साखरेची तपासणी (OGTT) करा.',
          'दरमहा रक्तदाब व वजनाची नोंद ठेवा.',
        ],
        nutrition: [
          'दूध, दही, पनीर, नाचणी यातून भरपूर कॅल्शियम मिळवा.',
          'लोह वाढवण्यासाठी आवळा, पेरू, संत्री आणि डाळिंब यासारखी क जीवनसत्त्वयुक्त फळे खा.',
          'बद्धकोष्ठता टाळण्यासाठी चोथायुक्त (फायबर) आहार घ्या.',
          'लोह आणि कॅल्शियमच्या गोळ्यांमध्ये किमान २ तासांचे अंतर ठेवा.',
        ],
      },
      {
        trimester: 3,
        weeks: 'आठवडे २७ ते ४०+',
        title: 'तिसरी तिमाही: प्रसूतीची पूर्वतयारी',
        fetalDevelopment: 'बाळाचे वजन वेगाने वाढते, फुफ्फुसे परिपक्व होतात आणि बाळ जन्माच्या योग्य स्थितीत येते.',
        careChecklist: [
          '३६ आठवड्यांपर्यंत दर १५ दिवसांनी आणि त्यानंतर दर आठवड्याला तपासणी करा.',
          'दररोज संध्याकाळी बाळाच्या हालचाली मोजा (किमान १० हालचाली).',
          'प्रसूतीसाठी रुग्णालय निश्चित करा आणि आवश्यक कागदपत्रे व कपड्यांची पिशवी तयार ठेवा.',
          'स्तनपानाबाबत आरोग्य सेविकेकडून माहिती घ्या.',
          'वाहनाची आणि पैशांची पूर्वतयारी करून ठेवा.',
        ],
        nutrition: [
          'शक्तीसाठी डाळी, अंडी, उसळी व पौष्टिक लाडू यांसारखे प्रथिनयुक्त अन्न खा.',
          'छातीत जळजळ टाळण्यासाठी रात्री हलके जेवण करा व डाव्या कुशीवर झोपा.',
          'लोह आणि कॅल्शियमच्या गोळ्या अखंडपणे चालू ठेवा.',
        ],
      },
    ],
    faqs: [
      {
        question: 'किमान ४ ते ८ प्रसूतीपूर्व तपासण्या (ANC) का महत्त्वाच्या आहेत?',
        answer: 'नियमित तपासण्यांमुळे रक्तक्षय (ॲनिमिया), उच्च रक्तदाब व इतर धोके वेळेवर ओळखून सुरक्षित प्रसूती सुनिश्चित करता येते.',
      },
      {
        question: 'लोह आणि कॅल्शियमच्या गोळ्या एकत्र का घेऊ नयेत?',
        answer: 'कॅल्शियममुळे शरीरात लोह शोषले जात नाही. त्यामुळे लोहाची गोळी सकाळी आणि कॅल्शियमची गोळी संध्याकाळी जेवणानंतर घ्यावी.',
      },
      {
        question: 'डाव्या कुशीवर झोपणे का फायदेशीर आहे?',
        answer: 'डाव्या कुशीवर झोपल्याने गर्भाशयाला आणि बाळाला उत्तम रक्तपुरवठा व ऑक्सिजन मिळतो आणि पायांची सूज कमी होते.',
      },
      {
        question: 'प्रसूतीसाठी कोणती कागदपत्रे सोबत ठेवावीत?',
        answer: 'माता-बाल संरक्षण (MCP) कार्ड, आधार कार्ड, बँक पासबुक आणि आधीच्या सर्व तपासण्यांचे अहवाल सोबत ठेवावेत.',
      },
    ],
  },
};

module.exports = educationData;
