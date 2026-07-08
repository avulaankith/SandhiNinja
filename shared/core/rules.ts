import type { SandhiRule } from "../contracts/sandhi.ts";

export const SANDHI_RULES: SandhiRule[] = [
  {
    id: "savarna-dirgha",
    shortcut: "1",
    accent: "#7df5c7",
    label: {
      en: "Savarṇa Dīrgha",
      sa: "सवर्णदीर्घः",
      te: "సవర్ణ దీర్ఘం",
    },
    helper: {
      en: "Use when like vowels lengthen into one long vowel.",
      sa: "समानस्वरेषु दीर्घादेशः भवति।",
      te: "సమాన స్వరాలు కలసి దీర్ఘ స్వరంగా మారినప్పుడు దీన్ని వాడండి.",
    },
    sutra: {
      text: "अकः सवर्णे दीर्घः",
      number: "6.1.101",
    },
  },
  {
    id: "guna",
    shortcut: "2",
    accent: "#6ac7ff",
    label: {
      en: "Guṇa",
      sa: "गुणः",
      te: "గుణం",
    },
    helper: {
      en: "a/ā before i, ī, u, ū shifts into guṇa sound.",
      sa: "अचि परे गुणादेशः दृश्यते।",
      te: "అ/ఆ తరువాతి స్వరంతో కలిసి గుణ స్వరంగా మారినప్పుడు దీన్ని వాడండి.",
    },
    sutra: {
      text: "आद्गुणः",
      number: "6.1.87",
    },
  },
  {
    id: "vrddhi",
    shortcut: "3",
    accent: "#ffbe70",
    label: {
      en: "Vṛddhi",
      sa: "वृद्धिः",
      te: "వృద్ధి",
    },
    helper: {
      en: "a/ā before e, ai, o, au expands to a stronger vowel.",
      sa: "एचि परे वृद्ध्यादेशः भवति।",
      te: "ఏచ్ స్వరాలకు ముందు వృద్ధి వచ్చినప్పుడు దీన్ని వాడండి.",
    },
    sutra: {
      text: "वृद्धिरेचि",
      number: "6.1.88",
    },
  },
  {
    id: "yan",
    shortcut: "4",
    accent: "#ec8bff",
    label: {
      en: "Yaṇ",
      sa: "यण्",
      te: "యణ్",
    },
    helper: {
      en: "i, u, ṛ, ḷ may glide into semivowels before vowels.",
      sa: "इको यणादेशः स्वरपरत्वे भवति।",
      te: "ఇక్ స్వరాలు తరువాతి స్వరానికి ముందు యణ్ రూపం దాల్చినప్పుడు దీన్ని వాడండి.",
    },
    sutra: {
      text: "इको यणचि",
      number: "6.1.77",
    },
  },
  {
    id: "ayavayava",
    shortcut: "5",
    accent: "#ff7f9f",
    label: {
      en: "Ayavāyāva",
      sa: "अयवायावः",
      te: "అయవాయావ",
    },
    helper: {
      en: "e, o, ai, au can unfold into ay/av/āy/āv before vowels.",
      sa: "एचः अयादयः स्वरपरत्वे भवन्ति।",
      te: "ఏచ్ స్వరాలు అయ్/అవ్ రూపాలలో విస్తరించినప్పుడు దీన్ని వాడండి.",
    },
    sutra: {
      text: "एचोऽयवायावः",
      number: "6.1.78",
    },
  },
  {
    id: "purvarupa",
    shortcut: "6",
    accent: "#a9ef7e",
    label: {
      en: "Pūrvarūpa",
      sa: "पूर्वरूपम्",
      te: "పూర్వరూపం",
    },
    helper: {
      en: "Nimittam: word-final e/o + initial a. The earlier vowel stays and avagraha often appears.",
      sa: "निमित्तम्: पदान्ते ए/ओ, परे आदौ अकारः। पूर्वस्वर एव तिष्ठति।",
      te: "నిమిత్తం: పదాంత ఏ/ఓ తరువాత ఆరంభ అ. ముందటి స్వరమే నిలిచి, చాలాసార్లు అవగ్రహం కనిపిస్తుంది.",
    },
    sutra: {
      text: "एङः पदान्तादति",
      number: "6.1.109",
    },
  },
  {
    id: "pararupa",
    shortcut: "7",
    accent: "#ffd96e",
    label: {
      en: "Pararūpa",
      sa: "पररूपम्",
      te: "పరరూపం",
    },
    helper: {
      en: "Nimittam: final a/ā + initial e/o. The later vowel remains as the visible form.",
      sa: "निमित्तम्: अन्ते अ/आ, परे आदौ ए/ओ। परस्वररूपम् एव दृश्यते।",
      te: "నిమిత్తం: చివర అ/ఆ, తరువాతి ఆరంభంలో ఏ/ఓ. కనిపించేది తరువాతి స్వరరూపమే.",
    },
    sutra: {
      text: "एङि पररूपम्",
      number: "6.1.94",
    },
  },
];
