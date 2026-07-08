import type { GameMode, Language, LocalizedText } from "../types/sandhi";

export const UI_TEXT = {
  title: {
    en: "Sandhi Ninja",
    sa: "सन्धि निन्जा",
    te: "సంధి వీరుడు",
  },
  subtitle: {
    en: "Slice through living Sanskrit words and reveal the sandhi hidden inside.",
    sa: "जीवद्भिः संस्कृतपदैः सन्धिभेदः प्रकाश्यताम्।",
    te: "జీవంతమైన సంస్కృత పదాలను కోసి లోపలున్న సంధిని బయటపెట్టండి.",
  },
  selectKnife: {
    en: "Choose a sandhi knife",
    sa: "सन्धि-शस्त्रं चिनुत",
    te: "సంధి కత్తిని ఎంచుకోండి",
  },
  slicePrompt: {
    en: "Slice at the correct point",
    sa: "पदे यथास्थानं छिन्दतु",
    te: "పదములో సరైన చోట కోయండి",
  },
  correctSplit: {
    en: "Correct split",
    sa: "साधु!",
    te: "సాధు! సరైన విభాగం",
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
  arcadeMode: {
    en: "Arcade Slice",
    sa: "लीला-छेदः",
    te: "వేగ విభాగం",
  },
  fullSplitMode: {
    en: "Full Split",
    sa: "पूर्णभेदः",
    te: "మొత్తం విభాగం",
  },
  devStudioMode: {
    en: "Sandhi Explorer",
    sa: "सन्धि-अन्वेषणम्",
    te: "సంధి అన్వేషిణి",
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
  onboardingTitle: {
    en: "How to play",
    sa: "कथं खेलनीयम्",
    te: "ఆట తీరు",
  },
  onboardingBody: {
    en: "Select knife → slice inside word → split until all final padāni are green.",
    sa: "शस्त्रं वृणु → पदे छिन्दि → यावत् सर्वाणि अन्तिमपदानि हरितानि भवन्ति।",
    te: "కత్తిని ఎంచుకోండి → పదములో కోయండి → అంతిమ పదాలు అన్నీ ఆకుపచ్చగా మారే వరకు విభజించండి.",
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
    en: "Successful cuts will reveal the sūtra and three-language explanation here.",
    sa: "सफलच्छेदेन अत्र सूत्रं त्रिभाष्यं च दृश्यते।",
    te: "సరైన కోత పడితే ఇక్కడ సూత్రం, మూడు భాషల వివరణ కనిపిస్తుంది.",
  },
  nimittam: {
    en: "Nimittam",
    sa: "निमित्तम्",
    te: "నిమిత్తం",
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
  feedbackWrongRule: {
    en: "Valid boundary, wrong knife for this sandhi.",
    sa: "देशः साधुः, किन्तु शस्त्रं न युक्तम्।",
    te: "స్థానం సరైనదే, కానీ ఈ సంధికి కత్తి సరిపోలలేదు.",
  },
  feedbackWrongCut: {
    en: "Wrong slice. Try a different boundary inside the word.",
    sa: "अयुक्तच्छेदः। पदे अन्यं देशं प्रयतस्व।",
    te: "తప్పు కోత. పదములో వేరే విభాగస్థానాన్ని ప్రయత్నించండి.",
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
    en: "Practice mode: no clock — reveal the answer and reasoning any time.",
    sa: "अभ्यासविधौ कालः नास्ति — यदा इच्छसि तदा उत्तरं कारणं च पश्य।",
    te: "అభ్యాస విధానం: గడియారం లేదు — ఎప్పుడైనా సమాధానం, కారణం చూడవచ్చు.",
  },
} satisfies Record<string, LocalizedText>;

export const t = (key: keyof typeof UI_TEXT, language: Language) =>
  UI_TEXT[key][language];

export const modeLabel = (mode: GameMode, language: Language) => {
  if (mode === "arcade") {
    return t("arcadeMode", language);
  }

  if (mode === "fullSplit") {
    return t("fullSplitMode", language);
  }

  return t("devStudioMode", language);
};
