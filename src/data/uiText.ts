import type { GameMode, Language, LocalizedText } from "../types/sandhi";

export const UI_TEXT = {
  title: {
    en: "Sandhi Ninja",
    sa: "सन्धि निन्जा",
    te: "సంధి నింజా",
  },
  subtitle: {
    en: "Practice sandhi splits and sandhi joins while learning the sandhi behind each move.",
    sa: "सन्धिभेदान् सन्धिसंयोगांश्च अभ्यासन् प्रत्येकचरणे स्थितं सन्धिज्ञानम् अधीयताम्।",
    te: "సంధి విభాగాలు, సంధి కలయికలు సాధన చేస్తూ ప్రతి అడుగులో ఉన్న సంధిని అర్థం చేసుకోండి.",
  },
  selectKnife: {
    en: "1. Choose the sandhi",
    sa: "१. सन्धिं चिनुत",
    te: "1. సంధిని ఎంచుకోండి",
  },
  selectGlue: {
    en: "1. Choose the sandhi",
    sa: "१. सन्धिं चिनुत",
    te: "1. సంధిని ఎంచుకోండి",
  },
  slicePrompt: {
    en: "2. Tap a shown gold split line",
    sa: "प्रदर्शिते शिक्षणमार्गदर्शके एव भिन्धि",
    te: "చూపిన బోధనా సూచిక దగ్గరే విడగొట్టండి",
  },
  joinPrompt: {
    en: "Choose a sandhi, then make one shown sandhi join between neighboring padani",
    sa: "सन्धिं चिनुत, ततः दर्शितयोः समीपपदयोः संयोजनं कुरुत",
    te: "ముందుగా సంధిని ఎంచుకుని, తరువాత చూపిన పక్కపక్క పదజంటను కలపండి",
  },
  correctSplit: {
    en: "Correct sandhi split",
    sa: "सम्यक् सन्धिभेदः",
    te: "సరైన సంధి విభాగం",
  },
  feedbackBothCorrect: {
    en: "Correct place and correct sandhi.",
    sa: "स्थानं सम्यक्, सन्धिश्च सम्यक्।",
    te: "స్థానం సరైంది, సంధి కూడా సరైంది.",
  },
  canSplitAgain: {
    en: "This can still be split",
    sa: "एतत् पुनः विभज्यते",
    te: "ఇంకా విడగొట్టాలి",
  },
  finalWord: {
    en: "Final word",
    sa: "अन्तिमं पदम्",
    te: "ఇది తుది పదం",
  },
  splitMode: {
    en: "Sandhi Splitting",
    sa: "सन्धि-भेदः",
    te: "సంధి విభజనం",
  },
  joinMode: {
    en: "Sandhi Joining",
    sa: "सन्धि-संयोगः",
    te: "సంధి కలపడం",
  },
  devStudioMode: {
    en: "Sandhi Explorer",
    sa: "सन्धि-अन्वेषणम्",
    te: "సంధి అన్వేషిణి",
  },
  familyTitle: {
    en: "Sandhi set",
    sa: "सन्धिसमूहः",
    te: "సంధి వర్గం",
  },
  familyMixed: {
    en: "Mixed",
    sa: "मिश्रितम्",
    te: "మిశ్రితం",
  },
  familySvara: {
    en: "Svara",
    sa: "स्वरः",
    te: "స్వరసంధి",
  },
  familyVyanjana: {
    en: "Vyanjana",
    sa: "व्यञ्जनम्",
    te: "వ్యంజనసంధి",
  },
  familyVisarga: {
    en: "Visarga",
    sa: "विसर्गः",
    te: "విసర్గసంధి",
  },
  familyMixedHint: {
    en: "Show all enabled sandhi families together.",
    sa: "समर्थिताः सर्वे सन्धिप्रकाराः एकत्र दर्श्यन्ताम्।",
    te: "అందుబాటులో ఉన్న సంధులన్నింటినీ కలిసి చూపించు.",
  },
  familySvaraHint: {
    en: "Only svara-sandhis and their examples.",
    sa: "केवलं स्वर-सन्धयः तेषां च उदाहरणानि।",
    te: "స్వరసంధులు మరియు వాటి ఉదాహరణలనే చూపించు.",
  },
  familyVyanjanaHint: {
    en: "Only vyanjana-sandhis and their examples.",
    sa: "केवलं व्यञ्जन-सन्धयः तेषां च उदाहरणानि।",
    te: "వ్యంజనసంధులు మరియు వాటి ఉదాహరణలనే చూపించు.",
  },
  familyVisargaHint: {
    en: "Only visarga-sandhi examples: Visarga-Satva, Visarga-Repha, Visarga-Lopa, and Visarga-Ootvam.",
    sa: "केवलं विसर्गोदाहरणानि: विसर्ग-सत्व-, विसर्ग-रेफ-, विसर्ग-लोप-, विसर्ग-ओत्व-प्रकाराणां अभ्यासः।",
    te: "విసర్గసంధి ఉదాహరణలే చూపించు: విసర్గ-సత్వం, విసర్గ-రేఫం, విసర్గ-లోపం, విసర్గ-ఓత్వం మొదలైనవి.",
  },
  familyExamples: {
    en: "Likely sandhis",
    sa: "सम्भाव्यसन्धयः",
    te: "ఎక్కువగా వచ్చే సంధులు",
  },
  familyComingSoon: {
    en: "Coming soon",
    sa: "शीघ्रम्",
    te: "త్వరలో",
  },
  familyRulesLabel: {
    en: "rules",
    sa: "नियमाः",
    te: "నియమాలు",
  },
  familyWordsLabel: {
    en: "words",
    sa: "पदानि",
    te: "పదాలు",
  },
  timedMode: {
    en: "With clock",
    sa: "कालबद्धम्",
    te: "గడియారంతో",
  },
  untimedMode: {
    en: "No clock",
    sa: "अकालबद्धम्",
    te: "గడియారం లేకుండా",
  },
  timerStyle: {
    en: "Clock",
    sa: "कालगणना",
    te: "గడియారం",
  },
  studyMode: {
    en: "Guidance",
    sa: "साहाय्यस्तरः",
    te: "సహాయ స్థాయి",
  },
  guidedMode: {
    en: "Guided",
    sa: "सहायतया",
    te: "సూచనలతో",
  },
  challengeMode: {
    en: "Independent",
    sa: "परीक्षा",
    te: "పరీక్ష",
  },
  guidedModeHint: {
    en: "Guided keeps the sandhi helper, split guidance, and lesson notes visible. After 4 misses, the answer is shown and you can continue on the same word.",
    sa: "सहायतया स्मरणसाहाय्यं दृश्यते। प्रत्येकेषु चतुर्षु विपलेषु उत्तरं दृश्यते, ततः पुनः गणना आरभ्यते; अतः कठोरपराजयः न भवति।",
    te: "సూచనలతో ఆడితే గుర్తుపట్టేందుకు తోడు కనిపిస్తుంది. ప్రతి 4 తప్పుల తర్వాత జవాబు చూపించి, మళ్లీ లెక్క మొదలవుతుంది; కఠిన ఓటమి ఉండదు.",
  },
  challengeModeHint: {
    en: "Independent hides most teaching help. You get 4 lives on each word. When they finish, the answer is shown and the next step follows your After answer setting.",
    sa: "परीक्षायां स्मरणसाहाय्यं न्यूनं भवति, प्रत्येकपदे केवलं चत्वारि जीवनानि भवन्ति। सर्वेषु क्षीणेषु उत्तरं दर्श्यते, ततः अनन्तरपदगमनं तव उत्तरानन्तरविकल्पेन नियोज्यते।",
    te: "పరీక్ష రీతిలో తోడు సూచనలు తక్కువగా ఉంటాయి; ప్రతి పదానికి నిజమైన 4 అవకాశాలే. అవన్నీ పూర్తయితే జవాబు చూపించి, తరువాతి పదం 'జవాబు తర్వాత' ఎంపిక ప్రకారం మారుతుంది.",
  },
  afterAnswer: {
    en: "After answer",
    sa: "उत्तरानन्तरम्",
    te: "జవాబు తర్వాత",
  },
  autoNext: {
    en: "Auto next",
    sa: "स्वयमग्रे",
    te: "తానే ముందుకు",
  },
  waitForNext: {
    en: "Stay here",
    sa: "प्रतीक्षताम्",
    te: "ఇక్కడే ఉండు",
  },
  answerTime: {
    en: "Answer time",
    sa: "उत्तरकालः",
    te: "జవాబు కనిపించే వేళ",
  },
  answerTimeShort: {
    en: "12s",
    sa: "12s",
    te: "12s",
  },
  answerTimeMedium: {
    en: "16s",
    sa: "16s",
    te: "16s",
  },
  answerTimeLong: {
    en: "20s",
    sa: "20s",
    te: "20s",
  },
  resetWord: {
    en: "Reset word",
    sa: "पदं पुनः स्थापय",
    te: "పదాన్ని మళ్లీ ఉంచు",
  },
  nextWord: {
    en: "Next word",
    sa: "अन्यत् पदम्",
    te: "తదుపరి పదం",
  },
  score: {
    en: "Score",
    sa: "अङ्काः",
    te: "అంకె",
  },
  streak: {
    en: "Streak",
    sa: "अनुक्रमः",
    te: "వరుస విజయాలు",
  },
  lives: {
    en: "Lives",
    sa: "जीवनानि",
    te: "అవకాశాలు",
  },
  revealLives: {
    en: "Reveal lives",
    sa: "प्रकाशन-जीवनानि",
    te: "సమాధాన జీవాలు",
  },
  timer: {
    en: "Timer",
    sa: "कालः",
    te: "సమయలెక్క",
  },
  highScore: {
    en: "High score",
    sa: "श्रेष्ठाङ्कः",
    te: "గరిష్ఠ అంకె",
  },
  completed: {
    en: "Completed",
    sa: "समाप्तानि",
    te: "పూర్తైనవి",
  },
  successfulCuts: {
    en: "Correct sandhi splits",
    sa: "सम्यक् सन्धिभेदाः",
    te: "సరైన సంధి విభాగాలు",
  },
  splitsLeft: {
    en: "Splits left",
    sa: "अवशिष्टच्छेदाः",
    te: "మిగిలిన విభాగాలు",
  },
  onboardingTitle: {
    en: "How to play",
    sa: "कथं खेलनीयम्",
    te: "ఆట తీరు",
  },
  onboardingBody: {
    en: "First choose the sandhi. Then tap one shown gold sandhi-split line in the word.",
    sa: "प्रथमं सन्धिं वृणु, ततः पदे दर्शितेषु सुवर्णरेखासु एव भिन्धि।",
    te: "ముందుగా సంధిని ఎంచుకుని, తరువాత పదంలో చూపిన బంగారు విభాగరేఖల దగ్గరే విడగొట్టండి.",
  },
  onboardingJoinBody: {
    en: "First choose the sandhi. Then tap one shown sandhi-join point between the padani that truly combine.",
    sa: "प्रथमं सन्धिं वृणु, ततः यथार्थतया संयोजनीययोः पदयोः मध्ये दर्शितं संयोजनबिन्दुं स्पृश।",
    te: "ముందుగా సంధిని ఎంచుకుని, నిజంగా కలవాల్సిన పదజంట మధ్య చూపిన కలయిక సూచికను నొక్కండి.",
  },
  onboardingStepOneTitle: {
    en: "1. Choose the sandhi",
    sa: "१. सन्धिं चिनुत",
    te: "1. సంధిని ఎంచుకోండి",
  },
  onboardingStepOneBody: {
    en: "Select the sandhi below first. The game checks both the chosen sandhi-split place and the chosen sandhi.",
    sa: "प्रथमं सन्धिनियमं चिनुत। क्रीडा स्थानं च चयनितं सन्धिं च परीक्षते, तथा प्रतिक्रिया कथयति यत् किम् अयुक्तम्।",
    te: "ముందుగా సంధి నియమాన్ని ఎంచుకోండి. ఆట స్థానం, ఎంచుకున్న సంధి రెండింటినీ చూస్తుంది; ఏది తప్పో వెంటనే చెబుతుంది.",
  },
  onboardingStepTwoTitle: {
    en: "2. Tap a gold sandhi-split line",
    sa: "२. अक्षरयोर्मध्ये छिन्धि",
    te: "2. అక్షరాల మధ్య కోయండి",
  },
  onboardingStepTwoBody: {
    en: "Tap one shown gold line where the cheda should happen. Because sandhi changes the surface form, the right line may sit inside one joined visible shape.",
    sa: "दर्शितान् सुवर्णमार्गदर्शकान् एव गृहाण। विकृतसन्धिरूपेषु शिक्षणभेदः कदाचित् एकस्मिन् दृश्यसमूहे अपि तिष्ठेत्।",
    te: "చూపిన బంగారు సూచికలనే ఉపయోగించండి. రూపం మారిన సంధి పదాల్లో బోధనా విభాగం ఒకేలా కనిపించే అక్షరగుచ్ఛం లోపల కూడా ఉండవచ్చు.",
  },
  onboardingStepThreeTitle: {
    en: "3. Finish all remaining sandhi splits",
    sa: "३. अवशिष्टान् सन्धिभेदान् पूर्णय",
    te: "3. మిగిలిన సంధి విభాగాలన్నీ పూర్తి చేయండి",
  },
  onboardingStepThreeBody: {
    en: "If the word still divides, make the remaining sandhi splits until only final padani remain. In Practice, the solved word stays here until you press Next word.",
    sa: "यदि पदं पुनरपि विभाज्यम् अस्ति, तर्हि यावत् केवलानि अन्तिमपदानि शिष्यन्ते तावत् अवशिष्टान् सन्धिभेदान् कुरुत। अभ्यासविधौ तु सिद्धं पदम् अग्रिमपदं नुदेपर्यन्तं अत्रैव तिष्ठति।",
    te: "పదాన్ని ఇంకా విడగొట్టవచ్చంటే, చివరి పదాలు మాత్రమే మిగిలే వరకు మిగిలిన సంధి విభాగాలను చేయండి. అభ్యాస విధానంలో అయితే పూర్తైన పదం మీరు తదుపరి పదం నొక్కే వరకు ఇక్కడే ఉంటుంది.",
  },
  onboardingJoinStepOneTitle: {
    en: "1. Choose the sandhi",
    sa: "१. सन्धिं चिनुत",
    te: "1. సంధిని ఎంచుకోండి",
  },
  onboardingJoinStepOneBody: {
    en: "Select the sandhi below first. The game checks both the chosen sandhi-join place and the chosen sandhi.",
    sa: "प्रथमं सन्धिनियमं चिनुत। क्रीडा संयोजनसीमां च चयनितं नियमं च परीक्षते, तथा प्रतिक्रिया कथयति यत् किम् अयुक्तम्।",
    te: "ముందుగా సంధి నియమాన్ని ఎంచుకోండి. ఆట కలయిక సరిహద్దు, ఎంచుకున్న నియమం రెండింటినీ పరీక్షించి ఏది తప్పో చెబుతుంది.",
  },
  onboardingJoinStepTwoTitle: {
    en: "2. Tap one sandhi-join point",
    sa: "२. समीपपदानि संयोजय",
    te: "2. పక్కపక్కన ఉన్న పదాలను కలపండి",
  },
  onboardingJoinStepTwoBody: {
    en: "Tap one glowing point only between neighboring padani that truly combine at this step.",
    sa: "केवलं समीपस्थितपदयोर्मध्ये दीप्तं संयोजनबिन्दुं स्पृश। यदि ते पदे मूलसमासवृक्षे प्रत्यक्षं न युज्येते, तर्हि सा सीमा न कार्यकरा।",
    te: "పక్కపక్కన ఉన్న పదాల మధ్య మెరిసే కలయిక సూచికనেই నొక్కండి. అవి అసలు సమాసంలో నేరుగా కలిసేవి కాకపోతే ఆ సరిహద్దు పని చేయదు.",
  },
  onboardingJoinStepThreeTitle: {
    en: "3. Build the full samasta padam",
    sa: "३. समस्तपदं पुनर्निर्मात",
    te: "3. సమాసాన్ని మళ్లీ కట్టండి",
  },
  onboardingJoinStepThreeBody: {
    en: "Each correct sandhi join creates a larger visible piece. Continue until one full samasta padam remains. In Practice, the solved word stays here until you press Next word.",
    sa: "प्रत्येकः साधुसंयोगः बृहत्तरं दृश्यखण्डं जनयति। यावत् एकमेव समस्तपदं शिष्यते तावत् संयोजय। अभ्यासविधौ तु सिद्धं पदम् अग्रिमपदं नुदेपर्यन्तं अत्रैव तिष्ठति।",
    te: "ప్రతి సరైన కలయికతో పెద్ద భాగం తయారవుతుంది. ఒక్క సమస్తపదం మిగిలే వరకు కొనసాగండి. అభ్యాస విధానంలో అయితే పూర్తైన పదం మీరు తదుపరి పదం నొక్కే వరకు ఇక్కడే ఉంటుంది.",
  },
  close: {
    en: "Enter arena",
    sa: "रङ्गं प्रविश",
    te: "ఆటలోకి రండి",
  },
  currentLesson: {
    en: "Lesson panel",
    sa: "पाठफलकम्",
    te: "పాఠ పలక",
  },
  noLesson: {
    en: "Solve a sandhi split or sandhi join to see the sūtra, nimittam, split place, and explanation here. Wrong attempts will tell you whether the place, the sandhi, or both were wrong.",
    sa: "सम्यक् सन्धिभेदेन वा सम्यक् सन्धिसंयोगेन वा अत्र सूत्रं, निमित्तं, लक्ष्यस्थानं, व्याख्या च दृश्यते। असाधुप्रयासेषु अपि स्थानं, सन्धिः, उभयं वा किम् अयुक्तम् इति सूच्यते।",
    te: "సరైన సంధి విభాగం లేదా సరైన సంధి కలయిక పడితే ఇక్కడ సూత్రం, నిమిత్తం, లక్ష్య స్థానం, వివరణ కనిపిస్తాయి. తప్పు ప్రయత్నాల్లో స్థానం తప్పిందా, సంధి తప్పిందా, రెండూ తప్పాయా అని కూడా చెబుతుంది.",
  },
  nimittam: {
    en: "Nimittam",
    sa: "निमित्तम्",
    te: "నిమిత్తం",
  },
  rememberRule: {
    en: "Quick memory",
    sa: "स्मरणसूत्रम्",
    te: "త్వరిత జ్ఞాపకం",
  },
  rulePattern: {
    en: "Sandhi form",
    sa: "नियमरूपम्",
    te: "నియమ రూపం",
  },
  sutraNumber: {
    en: "Sūtra number",
    sa: "सूत्रसंख्या",
    te: "సూత్ర సంఖ్య",
  },
  sourceTrail: {
    en: "Source trail",
    sa: "स्रोतःपन्थाः",
    te: "మూల సూచనలు",
  },
  loadingArena: {
    en: "Sharpening the arena…",
    sa: "रङ्गः सुस्पष्टीक्रियते…",
    te: "ఆటరంగం తీర్చిదిద్దుతున్నాం…",
  },
  studioTitle: {
    en: "Explorer + Builder",
    sa: "अन्वेषणं तथा रचनागारः",
    te: "అన్వేషిణి + కూర్పుశాల",
  },
  analyzerTitle: {
    en: "Sandhi Explorer",
    sa: "सन्धि-अन्वेषणम्",
    te: "సంధి అన్వేషిణి",
  },
  analyzerBody: {
    en: "Enter any samasta padam and let the app try supported svara-sandhi chedas step by step.",
    sa: "यत्किञ्चित् समस्तपदं लिखतु, ततः समर्थिताः स्वर-सन्धिभेदाः क्रमशः परीक्ष्यन्ताम्।",
    te: "ఏ సమస్తపదమైనా ఇవ్వండి; మద్దతున్న స్వరసంధి చేదాలను దశలవారీగా ప్రయత్నించి చూపిస్తుంది.",
  },
  analyzerScope: {
    en: "This explores supported svara-sandhi reversals only: Savarṇa Dīrgha, Guṇa, Vṛddhi, Yaṇ, Ayavāyāva, Pūrvarūpa, and Pararūpa. It returns candidate analyses for new words too.",
    sa: "अत्र केवलं समर्थिताः स्वर-सन्धिविपर्यासाः परीक्ष्यन्ते - सवर्णदीर्घः, गुणः, वृद्धिः, यण्, अयवायावः, पूर्वरूपम्, पररूपम्। नवीनपदेष्वपि सम्भाव्यविश्लेषणानि प्रदर्श्यन्ते।",
    te: "ఇక్కడ మద్దతున్న స్వరసంధి విప్పులు మాత్రమే ప్రయత్నిస్తాం - సవర్ణ దీర్ఘం, గుణం, వృద్ధి, యణ్, అయవాయావ, పూర్వరూపం, పరరూపం. కొత్త పదాలకు కూడా సాధ్యమైన విశ్లేషణలు ఇస్తుంది.",
  },
  analyzerWord: {
    en: "Samasta padam",
    sa: "समस्तपदम्",
    te: "సమస్తపదం",
  },
  analyzerScript: {
    en: "Input script",
    sa: "प्रवेशलिपिः",
    te: "ఇన్పుట్ లిపి",
  },
  analyzerAuto: {
    en: "Auto detect",
    sa: "स्वयंचिनु",
    te: "తానే గుర్తించు",
  },
  analyzerIast: {
    en: "IAST",
    sa: "IAST",
    te: "IAST",
  },
  analyzerSanskrit: {
    en: "Sanskrit",
    sa: "संस्कृतम्",
    te: "సంస్కృతం",
  },
  analyzerTelugu: {
    en: "Telugu",
    sa: "तेलुगु",
    te: "తెలుగు",
  },
  analyzerRun: {
    en: "Analyze",
    sa: "विश्लेषय",
    te: "విశ్లేషించు",
  },
  analyzerLoading: {
    en: "Analyzing...",
    sa: "विश्लेषणं चलति...",
    te: "విశ్లేషణ జరుగుతోంది...",
  },
  analyzerNormalized: {
    en: "Normalized forms",
    sa: "समीकृतरूपाणि",
    te: "సమీకరించిన రూపాలు",
  },
  analyzerResults: {
    en: "Candidate analyses",
    sa: "सम्भाव्यविश्लेषणानि",
    te: "సాధ్య విశ్లేషణలు",
  },
  analyzerCandidates: {
    en: "results",
    sa: "फलानि",
    te: "ఫలితాలు",
  },
  analyzerCandidate: {
    en: "Path",
    sa: "मार्गः",
    te: "మార్గం",
  },
  analyzerFinalWords: {
    en: "Final words",
    sa: "अन्तिमपदानि",
    te: "చివరి పదాలు",
  },
  analyzerStep: {
    en: "Step",
    sa: "क्रमः",
    te: "దశ",
  },
  analyzerPattern: {
    en: "Sandhi form:",
    sa: "नियमरूपम्:",
    te: "నియమ రూపం:",
  },
  analyzerSave: {
    en: "Save to game",
    sa: "क्रीडायां रक्ष",
    te: "ఆటలో దాచు",
  },
  analyzerSavedMessage: {
    en: "This analysis was saved into the custom game bank.",
    sa: "अयं विश्लेषः स्वक्रीडाभाण्डारे रक्षितः।",
    te: "ఈ విశ్లేషణ స్వీయ ఆటభాండాగారంలో దాచబడింది.",
  },
  analyzerInputRequired: {
    en: "Enter a word in IAST, Sanskrit, or Telugu first.",
    sa: "प्रथमं IAST, संस्कृत, अथवा तेलुगु लिप्या पदं लिखतु।",
    te: "ముందుగా IAST, సంస్కృతం లేదా తెలుగు లిపిలో పదం నమోదు చేయండి.",
  },
  analyzerNoResults: {
    en: "No supported svara-sandhi cheda was found for this input.",
    sa: "अस्य प्रविष्टेः कश्चन समर्थितः स्वर-सन्धिभेदः न लब्धः।",
    te: "ఈ పదానికి మద్దతున్న స్వరసంధి చేదా దొరకలేదు.",
  },
  analyzerTruncated: {
    en: "Showing the strongest candidate analyses first.",
    sa: "प्रबलानि सम्भाव्यविश्लेषणानि प्रथमं दर्श्यन्ते।",
    te: "ముందుగా బలమైన సాధ్య విశ్లేషణలనే చూపిస్తున్నాం.",
  },
  analyzerRequestFailed: {
    en: "The analysis request failed. Try again.",
    sa: "विश्लेषणप्रार्थना असफलाभूत्। पुनः प्रयतस्व।",
    te: "విశ్లేషణ అభ్యర్థన విఫలమైంది. మళ్లీ ప్రయత్నించండి.",
  },
  studioBody: {
    en: "Analyze any samasta padam below, or build your own custom game word with guided split steps.",
    sa: "अधः यत्किञ्चित् समस्तपदं विश्लेषय, अथवा निर्देशितभेदक्रमेण स्वक्रीडापदं निर्मा।",
    te: "కింద ఏ సమస్తపదమైనా విశ్లేషించండి, లేక దశల వారీ మార్గదర్శకంతో మీ స్వంత ఆటపదాన్ని తయారు చేయండి.",
  },
  openExplorer: {
    en: "Open Sandhi Explorer",
    sa: "सन्धि-अन्वेषणं उद्घाटय",
    te: "సంధి అన్వేషిణిని తెరువు",
  },
  backToGame: {
    en: "Back to game",
    sa: "क्रीडां प्रति गच्छ",
    te: "ఆటకు తిరుగు",
  },
  studioAutoFill: {
    en: "You only enter the compound word, the split pieces, and the rule for each step. IDs, IAST, sutras, explanations, and akṣaras are auto-filled.",
    sa: "भवान् केवलं समस्तपदं, भेदितपदानि, प्रत्येकभेदस्य नियमं च लिखतु। परिचयचिह्नानि, IAST-रूपम्, सूत्राणि, व्याख्यानानि, अक्षराणि च स्वयमेव पूर्यन्ते।",
    te: "మీరు సమాసపదం, విడిపోయే ముక్కలు, ప్రతి దశకు సంధి నియమం మాత్రమే ఇస్తే చాలు. గుర్తులు, IAST రూపం, సూత్రాలు, వివరణలు, అక్షరగుచ్ఛాలు అన్నీ ఆటే నింపుతుంది.",
  },
  studioWord: {
    en: "Compound word",
    sa: "समस्तपदम्",
    te: "సమాసపదం",
  },
  studioSteps: {
    en: "Number of split steps",
    sa: "भेदपदानां संख्या",
    te: "విభాగ దశలు ఎన్ని",
  },
  studioStep: {
    en: "Step",
    sa: "क्रमः",
    te: "దశ",
  },
  studioStepHint: {
    en: "Fill the earlier split first.",
    sa: "पूर्वभेदं प्रथमं पूरयतु।",
    te: "ముందరి విభాగాన్ని ముందుగా నింపండి.",
  },
  studioSplitThis: {
    en: "Split this visible word",
    sa: "एतत् दृश्यपदं भिन्धि",
    te: "ఇప్పుడు విడగొట్టేది",
  },
  studioRule: {
    en: "Sandhi rule",
    sa: "सन्धिनियमः",
    te: "సంధి నియమం",
  },
  studioLeft: {
    en: "Left result",
    sa: "वामफलम्",
    te: "ఎడమ ఫలితం",
  },
  studioRight: {
    en: "Right result",
    sa: "दक्षिणफलम्",
    te: "కుడి ఫలితం",
  },
  studioPlan: {
    en: "Split plan",
    sa: "भेदयोजना",
    te: "విభాగ క్రమం",
  },
  studioEmpty: {
    en: "Saved custom words will appear here. Import JSON if you want more complex alternate trees.",
    sa: "रक्षिताः स्वपदाः अत्र दृश्यन्ते। अधिकजटिलवैकल्पिकवृक्षार्थं JSON आयच्छतु।",
    te: "మీరు దాచిన పదాలు ఇక్కడ కనిపిస్తాయి. మరింత క్లిష్టమైన ప్రత్యామ్నాయ వృక్షాల కోసం JSON దస్త్రాన్ని దిగుమతి చేయండి.",
  },
  saveEntry: {
    en: "Save entry",
    sa: "प्रविष्टिं रक्ष",
    te: "పదాన్ని దాచు",
  },
  updateEntry: {
    en: "Update entry",
    sa: "प्रविष्टिं परिष्कुरु",
    te: "పదాన్ని నవీకరించు",
  },
  cancelEdit: {
    en: "Cancel edit",
    sa: "सम्पादनं निरस्य",
    te: "మార్పు రద్దుచేయి",
  },
  addCut: {
    en: "Add sandhi split",
    sa: "सन्धिभेदं योजय",
    te: "సంధి విభాగం చేరు",
  },
  exportJson: {
    en: "Export JSON",
    sa: "JSON निर्गच्छ",
    te: "JSON దస్త్రం దించు",
  },
  importJson: {
    en: "Import JSON",
    sa: "JSON आयच्छ",
    te: "JSON దస్త్రం ఎక్కించు",
  },
  customEntries: {
    en: "Custom entries",
    sa: "स्वप्रविष्टयः",
    te: "స్వపదాలు",
  },
  adminExamples: {
    en: "Admin example bank",
    sa: "प्रशासकीय-उदाहरणसञ्चयः",
    te: "నిర్వాహక ఉదాహరణ భాండాగారం",
  },
  builtInEntry: {
    en: "Built-in",
    sa: "मूलभूतम्",
    te: "మూలంగా ఉన్నది",
  },
  customEntry: {
    en: "Custom",
    sa: "स्वकीयम्",
    te: "స్వీయము",
  },
  customOverrideEntry: {
    en: "Override",
    sa: "अधिलेखः",
    te: "ఓవర్‌రైడ్",
  },
  editInBuilder: {
    en: "Edit in builder",
    sa: "रचनायन्त्रे सम्पादय",
    te: "బిల్డర్లో సవరించు",
  },
  deleteEntry: {
    en: "Delete",
    sa: "लोपय",
    te: "తొలగించు",
  },
  builderSinglePathOnly: {
    en: "This example has multiple valid branches. Edit it through JSON or a future multi-variant editor.",
    sa: "अस्मिन् उदाहरणे बहवः साधुविकल्पाः सन्ति। JSON-द्वारा वा भाविमल्टिवैरियण्ट्-सम्पादकेन एव सम्पादनीयम्।",
    te: "ఈ ఉదాహరణకు అనేక సరైన శాఖలు ఉన్నాయి. దీనిని JSON ద్వారా లేదా భవిష్యత్తు multi-variant editor ద్వారా మాత్రమే సవరించాలి.",
  },
  studioEditingLoaded: {
    en: "Entry loaded into the builder for editing.",
    sa: "सम्पादनार्थं प्रविष्टिः रचनायन्त्रे आरोपिता।",
    te: "సవరించడానికి పదం బిల్డర్లో లోడ్ అయింది.",
  },
  feedbackWrongRule: {
    en: "Sandhi-split place is correct, but the selected sandhi is wrong. Keep the same split point and choose another sandhi.",
    sa: "छेदस्थानं सम्यक्, किन्तु चयनितः सन्धिः न युक्तः। तदेव भेदस्थानं धारयित्वा अन्यं सन्धिं चिनुत।",
    te: "విడిపోటి స్థానం సరైంది, కానీ ఎంచుకున్న సంధి తప్పింది. అదే చోటు ఉంచి మరో సంధిని ఎంచుకోండి.",
  },
  feedbackWrongJoinRule: {
    en: "Sandhi-join place is correct, but the selected sandhi is wrong. Keep the same boundary and choose another sandhi.",
    sa: "संयोगसीमा सम्यक्, किन्तु चयनितः सन्धिः न युक्तः। तामेव सीमां धारयित्वा अन्यं सन्धिं चिनुत।",
    te: "కలయిక స్థానం సరైంది, కానీ ఎంచుకున్న సంధి తప్పింది. అదే సరిహద్దు ఉంచి మరో సంధిని ఎంచుకోండి.",
  },
  feedbackWrongCut: {
    en: "Wrong place. Try another shown guide in the word.",
    sa: "अयुक्तं स्थानम्। पदे दर्शितं अन्यत् मार्गदर्शकं प्रयतस्व।",
    te: "తప్పు స్థానం. పదంలో చూపిన మరో సూచికను ప్రయత్నించండి.",
  },
  feedbackWrongJoinBoundary: {
    en: "Wrong boundary. Try a different shown sandhi-join point between adjacent padani.",
    sa: "अयुक्ता सीमा। समीपपदानां मध्ये अन्यं संयोजनबिन्दुं प्रयतस्व।",
    te: "తప్పు సరిహద్దు. పక్కపక్కన ఉన్న పదాల మధ్య మరో కలయిక సూచికను ప్రయత్నించండి.",
  },
  feedbackWrongPlaceRightRule: {
    en: "The selected sandhi can work in this word, but not at this sandhi-split place. Try a different split point.",
    sa: "चयनितः सन्धिः अस्मिन् पदे शक्यः, किन्तु अस्मिन् स्थाने न। अन्यत् भेदस्थानं प्रयतस्व।",
    te: "ఎంచుకున్న సంధి ఈ పదంలో పనికొస్తుంది, కానీ ఈ స్థానంలో కాదు. మరో విడిపోటి స్థానాన్ని ప్రయత్నించండి.",
  },
  feedbackWrongJoinBoundaryRightRule: {
    en: "The selected sandhi can work in this compound, but not at this boundary. Try a different sandhi-join point.",
    sa: "चयनितः सन्धिः अस्मिन् समस्तपदे शक्यः, किन्तु अस्याम् सीमायां न। अन्यं संयोजनबिन्दुं प्रयतस्व।",
    te: "ఎంచుకున్న సంధి ఈ సమస్తపదంలో పనికొస్తుంది, కానీ ఈ సరిహద్దులో కాదు. మరో కలయిక సూచికను ప్రయత్నించండి.",
  },
  feedbackWrongBoth: {
    en: "Both the sandhi-split place and the selected sandhi are wrong.",
    sa: "सन्धिभेदस्थानं च चयनितः सन्धिश्च उभयं अयुक्तम्।",
    te: "సంధి విభాగ స్థానం కూడా, ఎంచుకున్న సంధి కూడా రెండూ తప్పే.",
  },
  feedbackWrongJoinBoth: {
    en: "Both the sandhi-join boundary and the selected sandhi are wrong.",
    sa: "सन्धिसंयोगसीमा च चयनितः सन्धिश्च उभयं अयुक्तम्।",
    te: "సంధి కలయిక సరిహద్దు కూడా, ఎంచుకున్న సంధి కూడా రెండూ తప్పే.",
  },
  feedbackFinal: {
    en: "This is already a final word.",
    sa: "इदम् एव अन्तिमं पदम्।",
    te: "ఇది ఇప్పటికే అంతిమ పదం.",
  },
  feedbackNoRule: {
    en: "Choose the right sandhi, then try again.",
    sa: "युक्तं सन्धिं वृणु, पुनः प्रयतस्व।",
    te: "సరైన సంధిని ఎంచుకుని మళ్లీ ప్రయత్నించండి.",
  },
  anyRule: {
    en: "Any rule",
    sa: "यः कश्चन नियमः",
    te: "ఏ నియమమైనా",
  },
  knifeLocked: {
    en: "Selected sandhi",
    sa: "चयनितः सन्धिः",
    te: "ఎంచుకున్న సంధి",
  },
  glueLocked: {
    en: "Selected sandhi",
    sa: "चयनितः सन्धिः",
    te: "ఎంచుకున్న సంధి",
  },
  fullSplitAnyRule: {
    en: "Full Split allows any valid sandhi-split order, but the chosen sandhi must still match the split.",
    sa: "पूर्णभेदे यः कश्चन साधुभेदक्रमः ग्राह्यः, किन्तु चयनितः सन्धिः भेदेन सह अवश्यं योज्यः।",
    te: "మొత్తం విభాగ విధానంలో సరైన విభాగ క్రమం ఏదైనా పరవాలేదు, కానీ ఎంచుకున్న సంధి మాత్రం ఆ విభాగానికి సరిపోవాలి.",
  },
  arcadeRuleRequired: {
    en: "Sandhi Splitting still checks the selected sandhi against the chosen sandhi split.",
    sa: "सन्धिभेदे चयनितः सन्धिः भेदेन सह परीक्ष्यते।",
    te: "ఈ సంధి విభాగ విధానంలో ఎంచుకున్న సంధి సరైన విభాగానికి సరిపోవాలి.",
  },
  timeUp: {
    en: "Time is up. Reset or move to the next word.",
    sa: "कालः समाप्तः। पुनः स्थापय अथवा अग्रे गच्छ।",
    te: "సమయం ముగిసింది. పదాన్ని మళ్లీ ఉంచండి లేదా తదుపరి పదానికి వెళ్లండి.",
  },
  studioId: {
    en: "ID",
    sa: "परिचयचिह्नम्",
    te: "గుర్తు",
  },
  studioIast: {
    en: "IAST",
    sa: "IAST",
    te: "IAST రూపం",
  },
  studioAksharas: {
    en: "Akṣaras",
    sa: "अक्षराणि",
    te: "అక్షరగుచ్ఛాలు",
  },
  studioCuts: {
    en: "sandhi splits",
    sa: "सन्धिभेदाः",
    te: "సంధి విభాగాలు",
  },
  importNoValidEntries: {
    en: "Import found no valid entries.",
    sa: "आयाते काचिदपि युक्ता प्रविष्टिः न लब्धा।",
    te: "దిగుమతిలో సరైన పదాలు ఏవీ దొరకలేదు.",
  },
  studioWordRequired: {
    en: "Enter the compound word in Devanagari.",
    sa: "समस्तपदं देवनागरीलिप्या लिखतु।",
    te: "సమాసపదాన్ని దేవనాగరి లిపిలో నమోదు చేయండి.",
  },
  studioPiecesRequired: {
    en: "Fill the left and right words for every split step.",
    sa: "प्रत्येकभेदक्रमाय वामदक्षिणपदे पूरयतु।",
    te: "ప్రతి దశకు ఎడమ, కుడి పదాలను పూర్తి చేయండి.",
  },
  studioTargetInvalid: {
    en: "One of the split targets is no longer valid. Recheck the split order.",
    sa: "भेद्यपदानां किञ्चिदयुक्तम्। भेदक्रमं पुनः परीक्षताम्।",
    te: "విభజించాల్సిన పదాల్లో ఒకటి సరిపోలలేదు. క్రమాన్ని మళ్లీ చూసండి.",
  },
  studioDuplicateSplit: {
    en: "That word already has a split in this builder.",
    sa: "अस्मिन् रचनायन्त्रे तत्पदस्य भेदः पूर्वमेव अस्ति।",
    te: "ఈ కూర్పులో ఆ పదం ఇప్పటికే విడగొట్టబడింది.",
  },
  studioBuildFailed: {
    en: "The builder could not create this entry.",
    sa: "अनेन रचनायन्त्रेण एषा प्रविष्टिः निर्मातुं न शक्यते।",
    te: "ఈ కూర్పుతో పదాన్ని తయారు చేయలేకపోయాం.",
  },
  studioSavedMessage: {
    en: "Entry saved locally with auto-filled ids, sutras, and akṣaras.",
    sa: "प्रविष्टिः स्थानीयतः रक्षिता। परिचयचिह्नानि सूत्राणि अक्षराणि च स्वयमेव पूरितानि।",
    te: "పదం దాచబడింది. గుర్తులు, సూత్రాలు, అక్షరగుచ్ఛాలు ఆటే నింపబడ్డాయి.",
  },
  studioUpdatedMessage: {
    en: "Entry updated locally.",
    sa: "प्रविष्टिः स्थानीयतः परिष्कृता।",
    te: "పదం స్థానికంగా నవీకరించబడింది.",
  },
  studioImportedMessage: {
    en: "JSON imported.",
    sa: "JSON आयातम् सम्पन्नम्।",
    te: "JSON దస్త్రం ఎక్కించబడింది.",
  },
  studioImportFailed: {
    en: "Import failed. Check the JSON shape.",
    sa: "आयातः असफलः। JSON-रूपं परीक्षताम्।",
    te: "దిగుమతి విఫలమైంది. JSON రూపాన్ని చూసి మళ్లీ ప్రయత్నించండి.",
  },
  revealTitle: {
    en: "Answer revealed",
    sa: "उत्तरं प्रकाशितम्",
    te: "సమాధానం చూపబడింది",
  },
  revealChip: {
    en: "Stuck after 4 tries — answer shown. You can still solve this word. N: next · R: retry",
    sa: "चतुर्वारं यत्नानन्तरम् उत्तरं दर्शितम्। एतत् पदं अद्यापि साधयितुं शक्यते। N: अग्रे · R: पुनः",
    te: "4 సార్లు తప్పాక సమాధానం చూపాం. ఈ పదాన్ని ఇంకా మీరు పూర్తిచేయవచ్చు. N: తదుపరి · R: మళ్లీ",
  },
  challengeOutOfLives: {
    en: "Out of lives — answer shown. This round is over. N: next · R: retry",
    sa: "जीवनानि क्षीणानि — उत्तरं दर्शितम्। अयं क्रमः समाप्तः। N: अग्रे · R: पुनः",
    te: "అవకాశాలు పూర్తయ్యాయి — సమాధానం చూపాం. ఈ రౌండ్ ముగిసింది. N: తదుపరి · R: మళ్లీ",
  },
  revealRule: {
    en: "Correct sandhi",
    sa: "साधुः सन्धिः",
    te: "సరైన సంధి",
  },
  revealPlace: {
    en: "Sandhi split",
    sa: "अत्र सन्धिभेदः",
    te: "ఇక్కడ సంధి విభాగం",
  },
  practiceMode: {
    en: "Round type",
    sa: "अभ्यासप्रकारः",
    te: "సాధన తీరు",
  },
  practiceOn: {
    en: "Practice",
    sa: "मुक्ताभ्यासः",
    te: "స్వేచ్ఛా సాధన",
  },
  practiceOff: {
    en: "Scored",
    sa: "अङ्कक्रमः",
    te: "అంకాల ఆట",
  },
  showAnswer: {
    en: "Show answer",
    sa: "उत्तरं दर्शय",
    te: "సమాధానం చూపు",
  },
  practiceHint: {
    en: "Practice has no clock. You may reveal the answer any time, and the solved word stays here until you press Next word.",
    sa: "मुक्ताभ्यासे कालः नास्ति। यदा इच्छसि तदा उत्तरं पश्य, तथा पदसिद्धेः अनन्तरम् अग्रिमपदं नुदेपर्यन्तं तत् पदम् अत्रैव तिष्ठति।",
    te: "స్వేచ్ఛా సాధనలో గడియారం ఉండదు. ఎప్పుడైనా జవాబు చూడవచ్చు; పదం పూర్తయిన తరువాత కూడా మీరు 'తదుపరి పదం' నొక్కే వరకు అదే పదం ఇక్కడే ఉంటుంది.",
  },
  practiceNextHint: {
    en: "This solved word stays here in Practice. Press Next word when you are ready.",
    sa: "मुक्ताभ्यासे एतत् सिद्धं पदं अत्रैव तिष्ठति। यदा सिद्धः भवसि तदा अग्रिमपदं नुद।",
    te: "స్వేచ్ఛా సాధనలో ఈ పూర్తైన పదమే ఇక్కడ కనిపిస్తుంది. మీరు సిద్ధమైనప్పుడు తదుపరి పదాన్ని నొక్కండి.",
  },
  answerWaitHint: {
    en: "The answer stays on screen. Press Next word when you are ready.",
    sa: "उत्तरम् अत्रैव तिष्ठति। यदा सिद्धः भवसि तदा अग्रिमपदं नुद।",
    te: "జవాబు ఇక్కడే ఉంటుంది. మీరు సిద్ధమైనప్పుడు తదుపరి పదాన్ని నొక్కండి.",
  },
  joinCanJoin: {
    en: "Can still take a sandhi join",
    sa: "इदं पुनः सन्धिसंयोजनीयम्",
    te: "ఇంకా సంధి కలయిక చేయాలి",
  },
  joinBuilt: {
    en: "Sandhi join complete",
    sa: "सन्धिसंयोगः सम्पन्नः",
    te: "సంధి కలయిక పూర్తైంది",
  },
  guidedCoachHint: {
    en: "Study the sutra, nimittam, and pattern shown here, then try the same word again.",
    sa: "अत्र दर्शितं सूत्रं, निमित्तं, नियमरूपं च निरीक्ष्य पुनरपि तदेव पदं प्रयतस्व।",
    te: "ఇక్కడ చూపిన సూత్రం, నిమిత్తం, నియమరూపాన్ని చూసి అదే పదాన్ని మళ్లీ ప్రయత్నించండి.",
  },
  challengeDockHint: {
    en: "Independent mode keeps the prompt compact. Full teaching notes appear after solve or reveal.",
    sa: "आह्वानविधौ अत्र केवलं मूलप्रेरणा तिष्ठति। स्मरणसाहाय्यं क्रमिकोपदेशश्च सिद्धौ अथवा प्रकाशने एव दृश्येते।",
    te: "సవాలు విధానంలో ఇక్కడ ప్రధాన సూచన మాత్రమే ఉంటుంది. జ్ఞాపక సహాయం, దశలవారీ బోధన మీరు సాధించిన తర్వాత లేదా వెల్లడించిన తర్వాత మాత్రమే కనిపిస్తాయి.",
  },
  correctJoin: {
    en: "Correct sandhi join",
    sa: "सम्यक् सन्धिसंयोगः",
    te: "సరైన సంధి కలయిక",
  },
  joinComplete: {
    en: "Correct sandhi join complete",
    sa: "सम्यक् सन्धिसंयोगः सम्पन्नः",
    te: "సరైన సంధి కలయిక పూర్తైంది",
  },
  splitMarkerHint: {
    en: "Tap one shown gold sandhi-split line in the word. Because sandhi changes the surface form, the right cheda may sit inside one joined visible shape.",
    sa: "सुवर्णमार्गदर्शकाः शिक्षणभेदस्थानानि दर्शयन्ति। विकृतसन्धिरूपेषु मार्गदर्शकः कदाचित् एकस्मिन् दृश्यसमूहे अपि तिष्ठेत्।",
    te: "బంగారు సూచనలు బోధనా విభాగ స్థానాలను చూపిస్తాయి. రూపం మారిన సంధి పదాల్లో ఒక సూచిక ఒకేలా కనిపించే అక్షరగుచ్ఛం లోపల కూడా ఉండవచ్చు.",
  },
  splitRuleHint: {
    en: "A move counts only when both the chosen sandhi-split place and the chosen sandhi are correct.",
    sa: "यदा भेदस्थानं च चयनितः सन्धिश्च उभयं सम्यक् भवतः तदा एव प्रयासः ग्राह्यः। प्रतिक्रिया तु स्थानं, सन्धिः, उभयं वा किम् अयुक्तम् इति वदति।",
    te: "విడిపోటి స్థానం, ఎంచుకున్న సంధి రెండూ సరైనప్పుడే ప్రయత్నం లెక్కలోకి వస్తుంది. స్థానం తప్పిందా, సంధి తప్పిందా, రెండూ తప్పాయా అని సూచన చెబుతుంది.",
  },
  joinBoundaryHint: {
    en: "Tap one glowing sandhi-join point only between the neighboring padani shown in this step.",
    sa: "दीप्तबिन्दवः केवलं दृश्यसमीपपदानाम् मध्ये एव दृश्यन्ते। सम्पूर्णरेखां लङ्घयित्वा मा संयोजय।",
    te: "మెరిసే బిందువులు ప్రస్తుతం కనిపిస్తున్న పక్కపక్కన ఉన్న పదాల మధ్యనే ఉంటాయి. మొత్తం వరుస మీదుగా కాకుండా అక్కడే కలపండి.",
  },
  joinRuleHint: {
    en: "A move counts only when both the chosen sandhi-join place and the chosen sandhi are correct.",
    sa: "यदा संयोजनसीमा च चयनितः सन्धिश्च उभयं सम्यक् भवतः तदा एव प्रयासः ग्राह्यः। प्रतिक्रिया तु स्थानं, सन्धिः, उभयं वा किम् अयुक्तम् इति वदति।",
    te: "కలయిక సరిహద్దు, ఎంచుకున్న సంధి రెండూ సరైనప్పుడే ప్రయత్నం లెక్కలోకి వస్తుంది. స్థానం తప్పిందా, సంధి తప్పిందా, రెండూ తప్పాయా అని సూచన చెబుతుంది.",
  },
  shortcutLegend: {
    en: "Sandhi keys",
    sa: "सन्धिकुञ्जिकाः",
    te: "సంధి కీలు",
  },
  glueShortcutLegend: {
    en: "Sandhi keys",
    sa: "सन्धिकुञ्जिकाः",
    te: "సంధి కీలు",
  },
  joinTarget: {
    en: "2. Build back into this samasta padam",
    sa: "२. एतत् समस्तपदं पुनर्निर्मात",
    te: "2. ఈ సమస్తపదాన్ని మళ్లీ కట్టండి",
  },
  joinTap: {
    en: "Sandhi join",
    sa: "सन्धिं संयोजय",
    te: "సంధి కలయిక",
  },
} satisfies Record<string, LocalizedText>;

export const t = (key: keyof typeof UI_TEXT, language: Language) =>
  UI_TEXT[key][language];

export const modeLabel = (mode: GameMode, language: Language) => {
  if (mode === "arcade") {
    return t("splitMode", language);
  }

  if (mode === "join") {
    return t("joinMode", language);
  }

  return t("devStudioMode", language);
};
