import type { GameMode, Language, LocalizedText } from "../types/sandhi";

export const UI_TEXT = {
  title: {
    en: "Sandhi Ninja",
    sa: "सन्धि निन्जा",
    te: "సంధి నింజా",
  },
  subtitle: {
    en: "Split compounds apart or glue padani back together while learning the sandhi behind each move.",
    sa: "समस्तपदानि भित्वा वा पुनः संयोज्य वा प्रत्येकचरणे स्थितं सन्धिज्ञानं अधीयताम्।",
    te: "సమస్తపదాలను విడగొట్టండి లేదా మళ్లీ కలపండి; ప్రతి అడుగులో ఉన్న సంధిని అర్థం చేసుకోండి.",
  },
  selectKnife: {
    en: "Choose a sandhi knife",
    sa: "सन्धि-शस्त्रं चिनुत",
    te: "సంధి కత్తిని ఎంచుకోండి",
  },
  selectGlue: {
    en: "Choose a sandhi glue",
    sa: "सन्धि-लेपं चिनुत",
    te: "సంధి గ్లూని ఎంచుకోండి",
  },
  slicePrompt: {
    en: "Split at a marked point between aksharas",
    sa: "अक्षरयोर्मध्ये चिह्नितस्थाने भिन्धि",
    te: "అక్షరాల మధ్య గుర్తు చేసిన చోట విడగొట్టండి",
  },
  joinPrompt: {
    en: "Pick a rule, then join adjacent padani at the glowing glue points",
    sa: "नियमं चिनुत, ततः समीपस्थितपदानि दीप्तलेपबिन्दुषु संयोजयत्",
    te: "ముందుగా నియమాన్ని ఎంచుకుని, తరువాత పక్కపక్కన ఉన్న పదాలను మెరిసే గ్లూ బిందువుల వద్ద కలపండి",
  },
  correctSplit: {
    en: "Correct split",
    sa: "साधु!",
    te: "సాధు! సరైన విభాగం",
  },
  feedbackBothCorrect: {
    en: "Correct place and correct sandhi.",
    sa: "स्थानं सम्यक्, सन्धिश्च सम्यक्।",
    te: "స్థానం సరైంది, సంధి కూడా సరైంది.",
  },
  canSplitAgain: {
    en: "This can still be split",
    sa: "एतत् पुनः विभज्यते",
    te: "ఇది ఇంకా విడగొట్టవచ్చు",
  },
  finalWord: {
    en: "Final word",
    sa: "अन्तिमं पदम्",
    te: "ఇది అంతిమ పదం",
  },
  splitMode: {
    en: "Sandhi Splitting",
    sa: "सन्धि-भेदः",
    te: "సంధి విభజనం",
  },
  joinMode: {
    en: "Sandhi Joining",
    sa: "सन्धि-संयोगः",
    te: "సంధి కలయిక",
  },
  devStudioMode: {
    en: "Sandhi Explorer",
    sa: "सन्धि-अन्वेषणम्",
    te: "సంధి అన్వేషిణి",
  },
  familyTitle: {
    en: "Sandhi set",
    sa: "सन्धिसमूहः",
    te: "సంధి సమూహం",
  },
  familyMixed: {
    en: "Mixed",
    sa: "मिश्रितम्",
    te: "మిశ్రమం",
  },
  familySvara: {
    en: "Svara",
    sa: "स्वरः",
    te: "స్వరం",
  },
  familyVyanjana: {
    en: "Vyanjana",
    sa: "व्यञ्जनम्",
    te: "వ్యంజనం",
  },
  familyVisarga: {
    en: "Visarga",
    sa: "विसर्गः",
    te: "విసర్గం",
  },
  familyMixedHint: {
    en: "Show all enabled sandhi families together.",
    sa: "समर्थिताः सर्वे सन्धिप्रकाराः एकत्र दर्श्यन्ताम्।",
    te: "ఉన్న అన్ని సంధి సమూహాలను కలిపి చూపించు.",
  },
  familySvaraHint: {
    en: "Only vowel sandhis and their examples.",
    sa: "केवलं स्वर-सन्धयः तेषां च उदाहरणानि।",
    te: "స్వరసంధులు మరియు వాటి ఉదాహరణలే చూపించు.",
  },
  familyVyanjanaHint: {
    en: "Only consonant sandhis and their examples.",
    sa: "केवलं व्यञ्जन-सन्धयः तेषां च उदाहरणानि।",
    te: "వ్యంజనసంధులు మరియు వాటి ఉదాహరణలే చూపించు.",
  },
  familyVisargaHint: {
    en: "Visarga examples only: satva, repha, lopa, and otva practice from the textbook trail.",
    sa: "केवलं विसर्गोदाहरणानि: सत्व-, रेफ-, लोप-, ओत्व-प्रकाराणां अभ्यासः।",
    te: "విసర్గ ఉదాహరణలే: సత్వం, రేఫం, లోపం, ఓత్వం వంటి రూపాల అభ్యాసం.",
  },
  familyExamples: {
    en: "Likely knives",
    sa: "सम्भाव्यशस्त्राणि",
    te: "సాధారణ కత్తులు",
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
    en: "Timed",
    sa: "कालबद्धम्",
    te: "సమయపరిమితితో",
  },
  untimedMode: {
    en: "Untimed",
    sa: "अकालबद्धम्",
    te: "సమయపరిమితి లేకుండా",
  },
  timerStyle: {
    en: "Timer mode",
    sa: "कालविधिः",
    te: "సమయ విధానం",
  },
  studyMode: {
    en: "Study mode",
    sa: "अध्ययनविधिः",
    te: "అధ్యయన విధానం",
  },
  guidedMode: {
    en: "Guided",
    sa: "मार्गदर्शितम्",
    te: "మార్గదర్శి",
  },
  challengeMode: {
    en: "Challenge",
    sa: "आह्वानम्",
    te: "సవాలు",
  },
  guidedModeHint: {
    en: "Guided mode keeps the rule pattern visible and starts coaching after repeated misses.",
    sa: "मार्गदर्शितविधौ नियमरूपं दृश्यते, पुनःपुनर्विपलेषु शीघ्रं साहाय्यम् अपि लभ्यते।",
    te: "మార్గదర్శి విధానంలో నియమరూపం కనిపిస్తూనే ఉంటుంది; వరుసగా తప్పితే త్వరగా సహాయ సూచన కూడా వస్తుంది.",
  },
  challengeModeHint: {
    en: "Challenge mode trims pre-cut hints. Use the sutra, the word-form, and your own judgement before the app explains.",
    sa: "आह्वानविधौ पूर्वसाहाय्यं न्यूनं भवति। सूत्रं, पदरूपं, स्वबुद्धिं च आश्रित्य प्रथमं प्रयतस्व।",
    te: "సవాలు విధానంలో ముందస్తు సూచనలు తక్కువగా ఉంటాయి. ముందుగా సూత్రం, పదరూపం, మీ నిర్ణయాన్ని ఆధారంగా తీసుకుని ప్రయత్నించండి.",
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
    en: "Good cuts",
    sa: "सफलच्छेदाः",
    te: "సరైన కోతలు",
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
    en: "Choose the correct sandhi knife, then split only at the marked points between aksharas.",
    sa: "युक्तं सन्धि-शस्त्रं वृणु, ततः केवलं अक्षरयोर्मध्ये चिह्नितेषु स्थानेषु एव भिन्धि।",
    te: "సరైన సంధి కత్తిని ఎంచుకుని, అక్షరాల మధ్య గుర్తు చేసిన చోట్లనే విడగొట్టండి.",
  },
  onboardingJoinBody: {
    en: "Choose the correct sandhi glue, then rebuild the compound by joining only the adjacent padani that truly belong together.",
    sa: "युक्तं सन्धि-लेपं वृणु, ततः केवलं समीपस्थितानि यथार्थतया संयोजनीयानि पदानि एव पुनः संयोजय।",
    te: "సరైన సంధి గ్లూని ఎంచుకుని, నిజంగా కలవాల్సిన పక్కపక్కన ఉన్న పదాలనే మళ్లీ సమాసంగా కలపండి.",
  },
  onboardingStepOneTitle: {
    en: "1. Pick the knife",
    sa: "१. शस्त्रं चिनुत",
    te: "1. కత్తిని ఎంచుకోండి",
  },
  onboardingStepOneBody: {
    en: "Select the sandhi rule first. The game checks both the place and the chosen sandhi, and the feedback tells you which part is wrong.",
    sa: "प्रथमं सन्धिनियमं चिनुत। क्रीडा स्थानं च चयनितं सन्धिं च परीक्षते, तथा प्रतिक्रिया कथयति यत् किम् अयुक्तम्।",
    te: "ముందుగా సంధి నియమాన్ని ఎంచుకోండి. ఆట స్థానం, ఎంచుకున్న సంధి రెండింటినీ చూస్తుంది; ఏది తప్పో వెంటనే చెబుతుంది.",
  },
  onboardingStepTwoTitle: {
    en: "2. Cut between aksharas",
    sa: "२. अक्षरयोर्मध्ये छिन्धि",
    te: "2. అక్షరాల మధ్య కోయండి",
  },
  onboardingStepTwoBody: {
    en: "Do not cut through the middle of a letter. Use the subtle gold markers around the word as the valid split guides.",
    sa: "अक्षरमध्यं मा भिन्धि। पदस्य समीपे स्थितानि सूक्ष्मसुवर्णचिह्नानि एव ग्राह्यभेदमार्गदर्शकानि सन्ति।",
    te: "అక్షరాన్ని మధ్యలో కోయవద్దు. పదం చుట్టూ కనిపించే మృదువైన బంగారు గుర్తులే సరైన విడిపోటి సూచనలు.",
  },
  onboardingStepThreeTitle: {
    en: "3. Keep splitting",
    sa: "३. पुनः पुनः विभज",
    te: "3. పూర్తయ్యే వరకు విడగొట్టండి",
  },
  onboardingStepThreeBody: {
    en: "If the word can still be split, keep going until all final padani turn green. In practice mode, the solved word stays here until you click Next word.",
    sa: "यदि पदं पुनरपि विभाज्यम् अस्ति, तर्हि यावत् सर्वाणि अन्तिमपदानि हरितानि भवन्ति तावत् अग्रे गच्छ। अभ्यासविधौ तु सिद्धं पदम् अग्रिमपदं नुदेपर्यन्तं अत्रैव तिष्ठति।",
    te: "పదాన్ని ఇంకా విడగొట్టవచ్చంటే, అన్ని చివరి పదాలు ఆకుపచ్చగా మారే వరకు కొనసాగండి. అభ్యాస విధానంలో అయితే పూర్తైన పదం మీరు తదుపరి పదం నొక్కే వరకు ఇక్కడే ఉంటుంది.",
  },
  onboardingJoinStepOneTitle: {
    en: "1. Pick the glue",
    sa: "१. लेपं चिनुत",
    te: "1. గ్లూని ఎంచుకోండి",
  },
  onboardingJoinStepOneBody: {
    en: "Select the sandhi rule first. The game still checks both the join boundary and the chosen rule, and the feedback tells you which part was wrong.",
    sa: "प्रथमं सन्धिनियमं चिनुत। क्रीडा संयोजनसीमां च चयनितं नियमं च परीक्षते, तथा प्रतिक्रिया कथयति यत् किम् अयुक्तम्।",
    te: "ముందుగా సంధి నియమాన్ని ఎంచుకోండి. ఆట కలయిక సరిహద్దు, ఎంచుకున్న నియమం రెండింటినీ పరీక్షించి ఏది తప్పో చెబుతుంది.",
  },
  onboardingJoinStepTwoTitle: {
    en: "2. Join adjacent padani",
    sa: "२. समीपपदानि संयोजय",
    te: "2. పక్కపక్కన ఉన్న పదాలను కలపండి",
  },
  onboardingJoinStepTwoBody: {
    en: "Tap only the glowing glue point between neighboring pieces. If two visible padani are not direct siblings in the original compound tree, that boundary will not work.",
    sa: "केवलं समीपस्थितखण्डयोर्मध्यम् दीप्तलेपबिन्दुं स्पृश। यदि दृश्यपदे मूलसमासवृक्षे प्रत्यक्षभ्रातरौ न स्तः, तर्हि सा सीमा न कार्यकरा।",
    te: "పక్కపక్కన ఉన్న భాగాల మధ్య మెరిసే గ్లూ బిందువునే నొక్కండి. కనిపిస్తున్న రెండు పదాలు అసలు సమాసవృక్షంలో నేరుగా కలిసేవి కాకపోతే ఆ సరిహద్దు పని చేయదు.",
  },
  onboardingJoinStepThreeTitle: {
    en: "3. Rebuild the compound",
    sa: "३. समस्तपदं पुनर्निर्मात",
    te: "3. సమాసాన్ని మళ్లీ కట్టండి",
  },
  onboardingJoinStepThreeBody: {
    en: "Each correct join creates a larger visible chunk. Keep gluing until one compound remains. In practice mode, the solved word stays here until you click Next word.",
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
    en: "Correct splits or joins reveal the sutra, nimittam, target place, and explanation here. Wrong attempts also tell you whether the place, the sandhi, or both were wrong.",
    sa: "साधुभेदेन वा साधुसंयोगेन वा अत्र सूत्रं, निमित्तं, लक्ष्यस्थानं, व्याख्या च दृश्यते। असाधुप्रयासेषु अपि स्थानं, सन्धिः, उभयं वा किम् अयुक्तम् इति सूच्यते।",
    te: "సరైన విభాగం లేదా సరైన కలయిక పడితే ఇక్కడ సూత్రం, నిమిత్తం, లక్ష్య స్థానం, వివరణ కనిపిస్తాయి. తప్పు ప్రయత్నాల్లో స్థానం తప్పిందా, సంధి తప్పిందా, రెండూ తప్పాయా అని కూడా చెబుతుంది.",
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
    en: "Rule pattern",
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
    en: "Rule pattern:",
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
    en: "Add cut",
    sa: "भेदं योजय",
    te: "విభాగం చేరు",
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
    en: "Place is correct, but the selected sandhi is wrong. Keep the same split point and change the knife.",
    sa: "छेदस्थानं सम्यक्, किन्तु चयनितः सन्धिः न युक्तः। तदेव भेदस्थानं धारयित्वा शस्त्रं परिवर्तय।",
    te: "విడిపోటి స్థానం సరైంది, కానీ ఎంచుకున్న సంధి తప్పింది. అదే చోటు ఉంచి కత్తిని మార్చండి.",
  },
  feedbackWrongJoinRule: {
    en: "Join point is correct, but the selected sandhi is wrong. Keep the same boundary and change the glue.",
    sa: "संयोगसीमा सम्यक्, किन्तु चयनितः सन्धिः न युक्तः। तामेव सीमां धारयित्वा लेपं परिवर्तय।",
    te: "కలయిక స్థానం సరైంది, కానీ ఎంచుకున్న సంధి తప్పింది. అదే సరిహద్దు ఉంచి గ్లూని మార్చండి.",
  },
  feedbackWrongCut: {
    en: "Wrong place. Try a different split point between the aksharas.",
    sa: "अयुक्तं स्थानम्। अक्षरयोर्मध्ये अन्यत् भेदस्थानं प्रयतस्व।",
    te: "తప్పు స్థానం. అక్షరాల మధ్య మరో విడిపోటి స్థానాన్ని ప్రయత్నించండి.",
  },
  feedbackWrongJoinBoundary: {
    en: "Wrong boundary. Try a different glue point between adjacent padani.",
    sa: "अयुक्ता सीमा। समीपपदानां मध्ये अन्यं लेपबिन्दुं प्रयतस्व।",
    te: "తప్పు సరిహద్దు. పక్కపక్కన ఉన్న పదాల మధ్య మరో గ్లూ బిందువును ప్రయత్నించండి.",
  },
  feedbackWrongPlaceRightRule: {
    en: "The selected sandhi can work in this word, but not at this place. Try a different split point.",
    sa: "चयनितः सन्धिः अस्मिन् पदे शक्यः, किन्तु अस्मिन् स्थाने न। अन्यत् भेदस्थानं प्रयतस्व।",
    te: "ఎంచుకున్న సంధి ఈ పదంలో పనికొస్తుంది, కానీ ఈ స్థానంలో కాదు. మరో విడిపోటి స్థానాన్ని ప్రయత్నించండి.",
  },
  feedbackWrongJoinBoundaryRightRule: {
    en: "The selected sandhi can work in this compound, but not at this boundary. Try a different glue point.",
    sa: "चयनितः सन्धिः अस्मिन् समस्तपदे शक्यः, किन्तु अस्याम् सीमायां न। अन्यं लेपबिन्दुं प्रयतस्व।",
    te: "ఎంచుకున్న సంధి ఈ సమస్తపదంలో పనికొస్తుంది, కానీ ఈ సరిహద్దులో కాదు. మరో గ్లూ బిందువును ప్రయత్నించండి.",
  },
  feedbackWrongBoth: {
    en: "Both the split place and the selected sandhi are wrong.",
    sa: "भेदस्थानं च चयनितः सन्धिश्च उभयं अयुक्तम्।",
    te: "విడిపోటి స్థానం కూడా, ఎంచుకున్న సంధి కూడా రెండూ తప్పే.",
  },
  feedbackWrongJoinBoth: {
    en: "Both the join boundary and the selected sandhi are wrong.",
    sa: "संयोगसीमा च चयनितः सन्धिश्च उभयं अयुक्तम्।",
    te: "కలయిక సరిహద్దు కూడా, ఎంచుకున్న సంధి కూడా రెండూ తప్పే.",
  },
  feedbackFinal: {
    en: "This is already a final word.",
    sa: "इदम् एव अन्तिमं पदम्।",
    te: "ఇది ఇప్పటికే అంతిమ పదం.",
  },
  feedbackNoRule: {
    en: "Select the right knife, then slice again.",
    sa: "युक्तं शस्त्रं वृणु, पुनश्छिन्धि।",
    te: "సరైన కత్తిని ఎంచుకుని మళ్లీ కోయండి.",
  },
  anyRule: {
    en: "Any rule",
    sa: "यः कश्चन नियमः",
    te: "ఏ నియమమైనా",
  },
  knifeLocked: {
    en: "Knife locked",
    sa: "शस्त्रं नियतम्",
    te: "కత్తి ఖాయం",
  },
  glueLocked: {
    en: "Glue locked",
    sa: "लेपः नियतः",
    te: "గ్లూ ఖాయం",
  },
  fullSplitAnyRule: {
    en: "Full Split allows any valid split order, but the chosen knife must still match the sandhi.",
    sa: "पूर्णभेदे यः कश्चन साधुभेदक्रमः ग्राह्यः, किन्तु चयनितं शस्त्रं सन्धिना सह अवश्यं योज्यम्।",
    te: "మొత్తం విభాగ విధానంలో సరైన విభాగ క్రమం ఏదైనా పరవాలేదు, కానీ ఎంచుకున్న కత్తి మాత్రం సంధికి సరిపోవాలి.",
  },
  arcadeRuleRequired: {
    en: "Arcade still checks the selected knife against the cut.",
    sa: "लीलाछेदे चयनितं शस्त्रं भेदेन सह परीक्ष्यते।",
    te: "ఈ వేగవిధానంలో ఎంచుకున్న కత్తి సరైన సంధికే సరిపోవాలి.",
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
    en: "cuts",
    sa: "भेदाः",
    te: "విభాగాలు",
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
    en: "Stuck after 4 tries — answer shown. N: next · R: retry",
    sa: "चतुर्वारं यत्नानन्तरम् उत्तरं दर्शितम्। N: अग्रे · R: पुनः",
    te: "4 సార్లు తప్పాక సమాధానం చూపాం. N: తదుపరి · R: మళ్లీ",
  },
  revealRule: {
    en: "Correct sandhi",
    sa: "साधुः सन्धिः",
    te: "సరైన సంధి",
  },
  revealPlace: {
    en: "Split here",
    sa: "अत्र भेदः",
    te: "ఇక్కడ విడగొట్టండి",
  },
  practiceMode: {
    en: "Practice mode",
    sa: "अभ्यासविधिः",
    te: "అభ్యాస విధానం",
  },
  practiceOn: {
    en: "On",
    sa: "चालितम्",
    te: "ఆన్",
  },
  practiceOff: {
    en: "Off",
    sa: "निवृत्तम्",
    te: "ఆఫ్",
  },
  showAnswer: {
    en: "Show answer",
    sa: "उत्तरं दर्शय",
    te: "సమాధానం చూపు",
  },
  practiceHint: {
    en: "Practice mode: no clock. Reveal the answer any time, and after solving the word it stays on screen until you click Next word.",
    sa: "अभ्यासविधौ कालः नास्ति। यदा इच्छसि तदा उत्तरं पश्य, तथा पदसिद्धेः अनन्तरम् अग्रिमपदं नुदेपर्यन्तं तत् पदम् अत्रैव तिष्ठति।",
    te: "అభ్యాస విధానంలో గడియారం లేదు. ఎప్పుడైనా సమాధానం చూడవచ్చు; పదం పూర్తయిన తర్వాత కూడా మీరు తదుపరి పదం నొక్కే వరకు అదే పదం కనిపిస్తూనే ఉంటుంది.",
  },
  practiceNextHint: {
    en: "Practice mode keeps this solved word on screen. Click Next word when you are ready.",
    sa: "अभ्यासविधौ एतत् सिद्धं पदं अत्रैव तिष्ठति। यदा सिद्धः भवसि तदा अग्रिमपदं नुद।",
    te: "అభ్యాస విధానంలో ఈ పూర్తైన పదమే ఇక్కడ కనిపిస్తుంది. మీరు సిద్ధమైనప్పుడు తదుపరి పదాన్ని నొక్కండి.",
  },
  guidedCoachHint: {
    en: "Study the sutra, nimittam, and pattern shown here, then try the same word again.",
    sa: "अत्र दर्शितं सूत्रं, निमित्तं, नियमरूपं च निरीक्ष्य पुनरपि तदेव पदं प्रयतस्व।",
    te: "ఇక్కడ చూపిన సూత్రం, నిమిత్తం, నియమరూపాన్ని చూసి అదే పదాన్ని మళ్లీ ప్రయత్నించండి.",
  },
  challengeDockHint: {
    en: "Challenge mode keeps the pre-cut help lean. Full explanation appears after a correct move or reveal.",
    sa: "आह्वानविधौ पूर्वसाहाय्यं लघु भवति। साधुप्रयासे अथवा प्रकाशने पूर्णव्याख्या दृश्यते।",
    te: "సవాలు విధానంలో ముందస్తు సహాయం తగ్గించి ఉంచుతాం. సరైన ప్రయత్నం లేదా వెల్లడన తర్వాతే పూర్తి వివరణ కనిపిస్తుంది.",
  },
  correctJoin: {
    en: "Correct join. A larger compound chunk is ready.",
    sa: "साधुसंयोगः। बृहत्तरः समासखण्डः सिद्धः।",
    te: "సరైన కలయిక. పెద్ద సమాస భాగం సిద్ధమైంది.",
  },
  joinComplete: {
    en: "Correct join. The compound is rebuilt.",
    sa: "साधुसंयोगः। समस्तपदं पुनर्निर्मितम्।",
    te: "సరైన కలయిక. సమాసం మళ్లీ నిర్మితమైంది.",
  },
  splitMarkerHint: {
    en: "Subtle gold markers show the valid split points between aksharas.",
    sa: "सूक्ष्मसुवर्णचिह्नानि अक्षरयोर्मध्येषु ग्राह्यभेदस्थानानि सूचयन्ति।",
    te: "మృదువైన బంగారు గుర్తులు అక్షరాల మధ్య సరైన విడిపోటి స్థానాలను చూపిస్తాయి.",
  },
  splitRuleHint: {
    en: "A move counts only when both the split point and the selected knife are correct. The feedback will say whether the place, the sandhi, or both were wrong.",
    sa: "यदा भेदस्थानं च चयनितं शस्त्रं च उभयं सम्यक् भवतः तदा एव प्रयासः ग्राह्यः। प्रतिक्रिया तु स्थानं, सन्धिः, उभयं वा किम् अयुक्तम् इति वदति।",
    te: "విడిపోటి స్థానం, ఎంచుకున్న కత్తి రెండూ సరైనప్పుడే ప్రయత్నం లెక్కలోకి వస్తుంది. స్థానం తప్పిందా, సంధి తప్పిందా, రెండూ తప్పాయా అని సూచన చెబుతుంది.",
  },
  joinBoundaryHint: {
    en: "Glow points appear only between the currently visible neighboring padani. Join there, not across the whole line.",
    sa: "दीप्तबिन्दवः केवलं दृश्यसमीपपदानाम् मध्ये एव दृश्यन्ते। सम्पूर्णरेखां लङ्घयित्वा मा संयोजय।",
    te: "మెరిసే బిందువులు ప్రస్తుతం కనిపిస్తున్న పక్కపక్కన ఉన్న పదాల మధ్యనే ఉంటాయి. మొత్తం వరుస మీదుగా కాకుండా అక్కడే కలపండి.",
  },
  joinRuleHint: {
    en: "A join counts only when both the boundary and the selected glue are correct. Feedback tells you whether the place, the sandhi, or both were wrong.",
    sa: "यदा संयोजनसीमा च चयनितो लेपश्च उभयं सम्यक् भवतः तदा एव प्रयासः ग्राह्यः। प्रतिक्रिया तु स्थानं, सन्धिः, उभयं वा किम् अयुक्तम् इति वदति।",
    te: "కలయిక సరిహద్దు, ఎంచుకున్న గ్లూ రెండూ సరైనప్పుడే ప్రయత్నం లెక్కలోకి వస్తుంది. స్థానం తప్పిందా, సంధి తప్పిందా, రెండూ తప్పాయా అని సూచన చెబుతుంది.",
  },
  shortcutLegend: {
    en: "Knife keys",
    sa: "शस्त्रकुञ्जिकाः",
    te: "కత్తి కీలు",
  },
  glueShortcutLegend: {
    en: "Glue keys",
    sa: "लेपकुञ्जिकाः",
    te: "గ్లూ కీలు",
  },
  joinTarget: {
    en: "Build back to",
    sa: "पुनर्निर्माणलक्ष्यम्",
    te: "మళ్లీ కట్టాల్సిన పదం",
  },
  joinTap: {
    en: "Join",
    sa: "संयोजय",
    te: "కలపు",
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
