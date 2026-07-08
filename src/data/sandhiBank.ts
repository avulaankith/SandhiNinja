import type { SandhiCut, SandhiRule, SandhiRuleId, WordNode } from "../types/sandhi";
export { SANDHI_RULES } from "../../shared/core/rules.ts";
import { SANDHI_RULES } from "../../shared/core/rules.ts";
import { devanagariToIast, splitDevanagariAksharas } from "../utils/sanskrit";

const leaf = (
  id: string,
  devanagari: string,
  iast: string,
  telugu: string,
  aksharas: string[],
): WordNode => ({
  id,
  devanagari,
  iast,
  telugu,
  status: "final",
  aksharas,
  cuts: [],
});

const createCut = (cut: SandhiCut): SandhiCut => cut;

const RULE_LOOKUP = new Map<SandhiRuleId, SandhiRule>(
  SANDHI_RULES.map((rule) => [rule.id, rule]),
);

const autoLeaf = (id: string, devanagari: string, telugu: string) =>
  leaf(
    id,
    devanagari,
    devanagariToIast(devanagari) || devanagari,
    telugu,
    splitDevanagariAksharas(devanagari),
  );

type SimpleEntryConfig = {
  id: string;
  devanagari: string;
  telugu: string;
  ruleId: SandhiRuleId;
  left: {
    id: string;
    devanagari: string;
    telugu: string;
  };
  right: {
    id: string;
    devanagari: string;
    telugu: string;
  };
  nimitta?: {
    en: string;
    sa: string;
    te: string;
  };
  note?: string;
};

const createSimpleEntry = ({
  id,
  devanagari,
  telugu,
  ruleId,
  left,
  right,
  nimitta,
  note,
}: SimpleEntryConfig): WordNode => {
  const rule = RULE_LOOKUP.get(ruleId);

  if (!rule) {
    throw new Error(`Unknown sandhi rule: ${ruleId}`);
  }

  const leftNode = autoLeaf(left.id, left.devanagari, left.telugu);
  const rightNode = autoLeaf(right.id, right.devanagari, right.telugu);

  const cut = createCut({
    id: `${id}-split`,
    ruleId,
    cutAfterAksharaIndex: Math.max(leftNode.aksharas.length - 1, 0),
    left: leftNode,
    right: rightNode,
    explanation: {
      en: `${left.devanagari} + ${right.devanagari} becomes ${devanagari} by ${rule.label.en}.`,
      sa: `${left.devanagari} + ${right.devanagari} इत्यत्र ${rule.sutra.text} इति सूत्रेण ${devanagari} भवति।`,
      te: `${left.devanagari} + ${right.devanagari} కలిసినప్పుడు ${devanagari} అవుతుంది. ఇది ${rule.label.te}.`,
      nimitta,
      note,
    },
    sutra: rule.sutra,
  });

  return {
    id,
    devanagari,
    iast: devanagariToIast(devanagari) || devanagari,
    telugu,
    status: "splittable",
    aksharas: [...leftNode.aksharas, ...rightNode.aksharas],
    cuts: [cut],
  };
};

const PURVARUPA_NIMITTA = {
  en: "Nimittam: the first word ends in e or o, and the next word begins with a.",
  sa: "निमित्तम्: पूर्वपदं पदान्ते एङन्तं भवति, ततः परपदस्य आदौ अकारः भवति।",
  te: "నిమిత్తం: ముందటి పదం చివర ఏ లేదా ఓ ఉండి, తరువాతి పదం ఆరంభంలో అ ఉండటం.",
} as const;

const PARARUPA_NIMITTA = {
  en: "Nimittam: the first member ends in a or ā, and the next member begins with e or o.",
  sa: "निमित्तम्: पूर्वपदस्य अन्ते अकारः अथवा आकारः, परपदस्य आदौ एङ् भवति।",
  te: "నిమిత్తం: ముందటి భాగం చివర అ లేదా ఆ ఉండి, తరువాతి భాగం ఆరంభంలో ఏ లేదా ఓ రావటం.",
} as const;

const shivaAlaya = createCut({
  id: "shivalaya-split",
  ruleId: "savarna-dirgha",
  cutAfterAksharaIndex: 1,
  left: leaf("shiva", "शिव", "śiva", "శివ", ["शि", "व"]),
  right: leaf("alaya", "आलयः", "ālayaḥ", "ఆలయః", ["आ", "ल", "यः"]),
  explanation: {
    te: "शिव + आलयः ఇత్యత్ర అ + ఆ కలసి ఆ అవుతుంది.",
    sa: "अकः सवर्णे दीर्घः। अकारस्य आकारे परे दीर्घादेशः भवति।",
    en: "a + ā becomes ā by savarṇa dīrgha.",
  },
  sutra: {
    text: "अकः सवर्णे दीर्घः",
    number: "6.1.101",
  },
});

const ramaIshvara = createCut({
  id: "rameshvara-split",
  ruleId: "guna",
  cutAfterAksharaIndex: 1,
  left: leaf("rama", "राम", "rāma", "రామ", ["रा", "म"]),
  right: leaf("ishvara", "ईश्वरः", "īśvaraḥ", "ఈశ్వరః", ["ई", "श्व", "रः"]),
  explanation: {
    te: "అ + ఈ కలిసి ఏ అవుతుంది. ఇది గుణ సంధి.",
    sa: "अकारे ईकारे परे गुणः भवति, अतः एादेशः।",
    en: "a + ī gives e by guṇa sandhi.",
  },
  sutra: {
    text: "आद्गुणः",
    number: "6.1.87",
  },
});

const mahaOshadhaVariantA = createCut({
  id: "mahaushadha-variant-a",
  ruleId: "vrddhi",
  cutAfterAksharaIndex: 1,
  left: leaf("maha", "महा", "mahā", "మహా", ["म", "हा"]),
  right: leaf("oshadha", "ओषधम्", "oṣadham", "ఓషధమ్", ["ओ", "ष", "धम्"]),
  explanation: {
    te: "అర్థాన్ని బట్టి మహా + ఓషధమ్ అనే విభాగం కూడా సాధ్యం.",
    sa: "विवक्षितार्थानुसारं महा + ओषधम् इति अपि ग्राह्यम्।",
    en: "One valid interpretation is mahā + oṣadham; intended meaning matters.",
    note: "This word has more than one contextual split. Do not force a single answer.",
  },
  sutra: {
    text: "वृद्धिरेचि",
    number: "6.1.88",
  },
});

const mahaAushadhaVariantB = createCut({
  id: "mahaushadha-variant-b",
  ruleId: "vrddhi",
  cutAfterAksharaIndex: 1,
  left: leaf("maha-b", "महा", "mahā", "మహా", ["म", "हा"]),
  right: leaf("aushadha", "औषधम्", "auṣadham", "ఔషధమ్", ["औ", "ष", "धम्"]),
  explanation: {
    te: "ఇంకొక విభాగం మహా + ఔషధమ్. భావసూచనపై ఆధారపడి రెండూ వాడుకలో రావచ్చు.",
    sa: "विवक्षितपदानुसारं महा + औषधम् इत्यपि युक्तम्।",
    en: "Another contextual interpretation is mahā + auṣadham.",
    note: "The intended split depends on the intended base word and meaning.",
  },
  sutra: {
    text: "वृद्धिरेचि",
    number: "6.1.88",
  },
});

const guruUpadesha = createCut({
  id: "guruupadesha-split",
  ruleId: "savarna-dirgha",
  cutAfterAksharaIndex: 1,
  left: leaf("guru", "गुरु", "guru", "గురు", ["गु", "रु"]),
  right: leaf("upadesha", "उपदेशः", "upadeśaḥ", "ఉపదేశః", ["उ", "प", "दे", "शः"]),
  explanation: {
    te: "ఉ + ఉ కలిసి ఊ అవుతుంది. ఇది సవర్ణ దీర్ఘ సంధి.",
    sa: "उकारयोः संयोगे ऊादेशः। सवर्णदीर्घसन्धिः।",
    en: "u + u becomes ū by savarṇa dīrgha.",
  },
  sutra: {
    text: "अकः सवर्णे दीर्घः",
    number: "6.1.101",
  },
});

const devaAlaya = createCut({
  id: "devalaya-split",
  ruleId: "savarna-dirgha",
  cutAfterAksharaIndex: 1,
  left: leaf("deva", "देव", "deva", "దేవ", ["दे", "व"]),
  right: leaf("alaya-deva", "आलयः", "ālayaḥ", "ఆలయః", ["आ", "ल", "यः"]),
  explanation: {
    te: "దేవ + ఆలయః లో అ + ఆ కలిసి ఆ అవుతుంది.",
    sa: "देव + आलयः इत्यत्र अकारे आकारे परे सवर्णदीर्घः भवति।",
    en: "deva + ālayaḥ becomes devālayaḥ by savarṇa dīrgha.",
  },
  sutra: {
    text: "अकः सवर्णे दीर्घः",
    number: "6.1.101",
  },
});

const devaIndra = createCut({
  id: "devendra-split",
  ruleId: "guna",
  cutAfterAksharaIndex: 1,
  left: leaf("deva-indra-left", "देव", "deva", "దేవ", ["दे", "व"]),
  right: leaf("indra", "इन्द्रः", "indraḥ", "ఇంద్రః", ["इ", "न्द्रः"]),
  explanation: {
    te: "దేవ + ఇంద్రః లో అ + ఇ కలిసి ఏ అవుతుంది.",
    sa: "देव + इन्द्रः इत्यत्र अकारे इकारे परे गुणः, अतः देवेन्द्रः।",
    en: "deva + indraḥ becomes devendraḥ by guṇa.",
  },
  sutra: {
    text: "आद्गुणः",
    number: "6.1.87",
  },
});

const mahaUtsava = createCut({
  id: "mahotsava-split",
  ruleId: "guna",
  cutAfterAksharaIndex: 1,
  left: leaf("maha-utsava-left", "महा", "mahā", "మహా", ["म", "हा"]),
  right: leaf("utsava", "उत्सवः", "utsavaḥ", "ఉత్సవః", ["उ", "त्स", "वः"]),
  explanation: {
    te: "మహా + ఉత్సవః లో ఆ + ఉ కలిసి ఓ అవుతుంది.",
    sa: "महा + उत्सवः इत्यत्र आकारे उकारे परे गुणादेशः, अतः महोत्सवः।",
    en: "mahā + utsavaḥ becomes mahotsavaḥ by guṇa.",
  },
  sutra: {
    text: "आद्गुणः",
    number: "6.1.87",
  },
});

const tathaEva = createCut({
  id: "tathaiva-split",
  ruleId: "vrddhi",
  cutAfterAksharaIndex: 1,
  left: leaf("tatha", "तथा", "tathā", "తథా", ["त", "था"]),
  right: leaf("eva", "एव", "eva", "ఏవ", ["ए", "व"]),
  explanation: {
    te: "తథా + ఏవ లో ఆ + ఏ కలిసి ఐ అవుతుంది.",
    sa: "तथा + एव इत्यत्र आकारे एकारे परे वृद्धिः, अतः तथैव।",
    en: "tathā + eva becomes tathaiva by vṛddhi.",
  },
  sutra: {
    text: "वृद्धिरेचि",
    number: "6.1.88",
  },
});

const suAgata = createCut({
  id: "svagata-split",
  ruleId: "yan",
  cutAfterAksharaIndex: 0,
  left: leaf("su", "सु", "su", "సు", ["सु"]),
  right: leaf("agata", "आगतम्", "āgatam", "ఆగతమ్", ["आ", "ग", "तम्"]),
  explanation: {
    te: "సు + ఆగతమ్ లో ఉకారం తరువాతి ఆకు ముందు వకారభావం పొందుతుంది.",
    sa: "सु + आगतम् इत्यत्र उकारस्य अचि परे वकारादेशः, अतः स्वागतम्।",
    en: "su + āgatam becomes svāgatam by yaṇ-style glide formation.",
  },
  sutra: {
    text: "इको यणचि",
    number: "6.1.77",
  },
});

const atiAcara = createCut({
  id: "atyachara-split",
  ruleId: "yan",
  cutAfterAksharaIndex: 1,
  left: leaf("ati", "अति", "ati", "అతి", ["अ", "ति"]),
  right: leaf("acara", "आचारः", "ācāraḥ", "ఆచారః", ["आ", "चा", "रः"]),
  explanation: {
    te: "అతి + ఆచారః లో ఇక్ స్వరం తరువాతి ఆ ముందు యకారసంబంధం కలిగి అత్యాచారః అవుతుంది.",
    sa: "अति + आचारः इत्यत्र इकारस्य अचि परे यणादेशः, अतः अत्याचारः।",
    en: "ati + ācāraḥ becomes atyācāraḥ by yaṇ.",
  },
  sutra: {
    text: "इको यणचि",
    number: "6.1.77",
  },
});

const paramaIshvara = createCut({
  id: "parameshvara-inner",
  ruleId: "guna",
  cutAfterAksharaIndex: 2,
  left: leaf("parama", "परम", "parama", "పరమ", ["प", "र", "म"]),
  right: leaf("ishvara-inner", "ईश्वरः", "īśvaraḥ", "ఈశ్వరః", ["ई", "श्व", "रः"]),
  explanation: {
    te: "పరమ + ఈశ్వరః లో అ + ఈ కలిసి ఏ అయ్యి పరమేశ్వరః అవుతుంది.",
    sa: "परम + ईश्वरः इत्यत्र अकारे ईकारे परे गुणः, अतः परमेश्वरः।",
    en: "parama + īśvaraḥ contracts to parameśvaraḥ by guṇa.",
  },
  sutra: {
    text: "आद्गुणः",
    number: "6.1.87",
  },
});

const parameshvaraNode: WordNode = {
  id: "parameshvara",
  devanagari: "परमेश्वरः",
  iast: "parameśvaraḥ",
  telugu: "పరమేశ్వరః",
  status: "splittable",
  aksharas: ["प", "र", "म", "ई", "श्व", "रः"],
  cuts: [paramaIshvara],
};

const ishvaraAlaya = createCut({
  id: "ishvaralaya-split",
  ruleId: "savarna-dirgha",
  cutAfterAksharaIndex: 2,
  left: leaf("ishvara-alone", "ईश्वरः", "īśvaraḥ", "ఈశ్వరః", ["ई", "श्व", "रः"]),
  right: leaf("alaya-ishvara", "आलयः", "ālayaḥ", "ఆలయః", ["आ", "ल", "यः"]),
  explanation: {
    te: "ఈశ్వర + ఆలయః లో అ + ఆ కలిసి ఆ అవుతుంది.",
    sa: "ईश्वर + आलयः इत्यत्र सवर्णदीर्घः, अतः ईश्वरालयः।",
    en: "īśvara + ālayaḥ becomes īśvarālayaḥ by savarṇa dīrgha.",
  },
  sutra: {
    text: "अकः सवर्णे दीर्घः",
    number: "6.1.101",
  },
});

const ishvaralayaNode: WordNode = {
  id: "ishvaralaya",
  devanagari: "ईश्वरालयः",
  iast: "īśvarālayaḥ",
  telugu: "ఈశ్వరాలయః",
  status: "splittable",
  aksharas: ["ई", "श्व", "र", "आ", "ल", "यः"],
  cuts: [ishvaraAlaya],
};

const parameshvaralayaOuter = createCut({
  id: "parameshvaralaya-outer",
  ruleId: "savarna-dirgha",
  cutAfterAksharaIndex: 5,
  left: parameshvaraNode,
  right: leaf("alaya-inner", "आलयः", "ālayaḥ", "ఆలయః", ["आ", "ल", "यः"]),
  explanation: {
    te: "పరమేశ్వర + ఆలయః లో అ + ఆ కలిసి ఆ అవుతుంది.",
    sa: "परमेश्वर + आलयः इत्यत्र सवर्णदीर्घः दृश्यते।",
    en: "parameśvara + ālayaḥ contracts by savarṇa dīrgha.",
  },
  sutra: {
    text: "अकः सवर्णे दीर्घः",
    number: "6.1.101",
  },
});

const paramaIshvaralaya = createCut({
  id: "parameshvaralaya-inner-first",
  ruleId: "guna",
  cutAfterAksharaIndex: 2,
  left: leaf("parama-outer", "परम", "parama", "పరమ", ["प", "र", "म"]),
  right: ishvaralayaNode,
  explanation: {
    te: "పరమ + ఈశ్వరాలయః లో అ + ఈ కలిసి ఏ అవుతుంది. ఈ పదాన్ని ఈ లోపలి భాగం నుంచీ కూడా విభజించవచ్చు.",
    sa: "परम + ईश्वरालयः इत्यत्र गुणः भवति। अतः अस्य पदस्य अन्यः अपि साधुभेदक्रमः अस्ति।",
    en: "parama + īśvarālayaḥ also yields parameśvarālayaḥ, so this word supports an inner-first split path too.",
    note: "Full Split mode should accept either correct split order for this word.",
  },
  sutra: {
    text: "आद्गुणः",
    number: "6.1.87",
  },
});

const himalayaEntry = createSimpleEntry({
  id: "himalayah",
  devanagari: "हिमालयः",
  telugu: "హిమాలయః",
  ruleId: "savarna-dirgha",
  left: {
    id: "hima",
    devanagari: "हिम",
    telugu: "హిమ",
  },
  right: {
    id: "alaya-hima",
    devanagari: "आलयः",
    telugu: "ఆలయః",
  },
});

const chatravasaEntry = createSimpleEntry({
  id: "chatravasah",
  devanagari: "छात्रावासः",
  telugu: "ఛాత్రావాసః",
  ruleId: "savarna-dirgha",
  left: {
    id: "chatra",
    devanagari: "छात्र",
    telugu: "ఛాత్ర",
  },
  right: {
    id: "avasa",
    devanagari: "आवासः",
    telugu: "ఆవాసః",
  },
});

const mahashayaEntry = createSimpleEntry({
  id: "mahashayah",
  devanagari: "महाशयः",
  telugu: "మహాశయః",
  ruleId: "savarna-dirgha",
  left: {
    id: "maha-ashaya",
    devanagari: "महा",
    telugu: "మహా",
  },
  right: {
    id: "ashaya",
    devanagari: "आशयः",
    telugu: "ఆశయః",
  },
});

const sudhakaraEntry = createSimpleEntry({
  id: "sudhakarah",
  devanagari: "सुधाकरः",
  telugu: "సుధాకరః",
  ruleId: "savarna-dirgha",
  left: {
    id: "sudha",
    devanagari: "सुधा",
    telugu: "సుధా",
  },
  right: {
    id: "akara",
    devanagari: "आकरः",
    telugu: "ఆకరః",
  },
});

const ativaEntry = createSimpleEntry({
  id: "ativa",
  devanagari: "अतीव",
  telugu: "అతీవ",
  ruleId: "savarna-dirgha",
  left: {
    id: "ati-iva-left",
    devanagari: "अति",
    telugu: "అతి",
  },
  right: {
    id: "iva",
    devanagari: "इव",
    telugu: "ఇవ",
  },
});

const itivaEntry = createSimpleEntry({
  id: "itiva",
  devanagari: "इतीव",
  telugu: "ఇతీవ",
  ruleId: "savarna-dirgha",
  left: {
    id: "iti-left",
    devanagari: "इति",
    telugu: "ఇతి",
  },
  right: {
    id: "iva-second",
    devanagari: "इव",
    telugu: "ఇవ",
  },
});

const kapishaEntry = createSimpleEntry({
  id: "kapishah",
  devanagari: "कपीशः",
  telugu: "కపీశః",
  ruleId: "savarna-dirgha",
  left: {
    id: "kapi",
    devanagari: "कपि",
    telugu: "కపి",
  },
  right: {
    id: "isha-kapi",
    devanagari: "ईशः",
    telugu: "ఈశః",
  },
});

const munishaEntry = createSimpleEntry({
  id: "munishah",
  devanagari: "मुनीशः",
  telugu: "మునీశః",
  ruleId: "savarna-dirgha",
  left: {
    id: "muni",
    devanagari: "मुनि",
    telugu: "ముని",
  },
  right: {
    id: "isha-muni",
    devanagari: "ईशः",
    telugu: "ఈశః",
  },
});

const maheshaEntry = createSimpleEntry({
  id: "maheshah",
  devanagari: "महेशः",
  telugu: "మహేశః",
  ruleId: "guna",
  left: {
    id: "maha-isha-left",
    devanagari: "महा",
    telugu: "మహా",
  },
  right: {
    id: "isha-maha",
    devanagari: "ईशः",
    telugu: "ఈశః",
  },
});

const devarshiEntry = createSimpleEntry({
  id: "devarshih",
  devanagari: "देवर्षिः",
  telugu: "దేవర్షిః",
  ruleId: "guna",
  left: {
    id: "deva-rshi-left",
    devanagari: "देव",
    telugu: "దేవ",
  },
  right: {
    id: "rshi",
    devanagari: "ऋषिः",
    telugu: "ఋషిః",
  },
});

const deshaikataEntry = createSimpleEntry({
  id: "deshaikata",
  devanagari: "देशैकता",
  telugu: "దేశైకతా",
  ruleId: "vrddhi",
  left: {
    id: "desha",
    devanagari: "देश",
    telugu: "దేశ",
  },
  right: {
    id: "ekata",
    devanagari: "एकता",
    telugu: "ఏకతా",
  },
});

const jalaughaEntry = createSimpleEntry({
  id: "jalaughah",
  devanagari: "जलौघः",
  telugu: "జలౌఘః",
  ruleId: "vrddhi",
  left: {
    id: "jala",
    devanagari: "जल",
    telugu: "జల",
  },
  right: {
    id: "ogha",
    devanagari: "ओघः",
    telugu: "ఓఘః",
  },
});

const harayeEntry = createSimpleEntry({
  id: "haraye",
  devanagari: "हरये",
  telugu: "హరయే",
  ruleId: "ayavayava",
  left: {
    id: "hare",
    devanagari: "हरे",
    telugu: "హరే",
  },
  right: {
    id: "ekaara",
    devanagari: "ए",
    telugu: "ఏ",
  },
});

const nayanamEntry = createSimpleEntry({
  id: "nayanam",
  devanagari: "नयनम्",
  telugu: "నయనం",
  ruleId: "ayavayava",
  left: {
    id: "ne",
    devanagari: "ने",
    telugu: "నే",
  },
  right: {
    id: "anam",
    devanagari: "अनम्",
    telugu: "అనం",
  },
});

const rishayeEntry = createSimpleEntry({
  id: "rishaye",
  devanagari: "ऋषये",
  telugu: "ఋషయే",
  ruleId: "ayavayava",
  left: {
    id: "rishe",
    devanagari: "ऋषे",
    telugu: "ఋషే",
  },
  right: {
    id: "e-rishi",
    devanagari: "ए",
    telugu: "ఏ",
  },
});

const munayeEntry = createSimpleEntry({
  id: "munaye",
  devanagari: "मुनये",
  telugu: "మునయే",
  ruleId: "ayavayava",
  left: {
    id: "mune",
    devanagari: "मुने",
    telugu: "మునే",
  },
  right: {
    id: "e-muni",
    devanagari: "ए",
    telugu: "ఏ",
  },
});

const sadhaveEntry = createSimpleEntry({
  id: "sadhave",
  devanagari: "साधवे",
  telugu: "సాధవే",
  ruleId: "ayavayava",
  left: {
    id: "sadho",
    devanagari: "साधो",
    telugu: "సాధో",
  },
  right: {
    id: "e-sadho",
    devanagari: "ए",
    telugu: "ఏ",
  },
});

const dhenaveEntry = createSimpleEntry({
  id: "dhenave",
  devanagari: "धेनवे",
  telugu: "ధేనవే",
  ruleId: "ayavayava",
  left: {
    id: "dheno",
    devanagari: "धेनो",
    telugu: "ధేనో",
  },
  right: {
    id: "e-dheno",
    devanagari: "ए",
    telugu: "ఏ",
  },
});

const nayakaEntry = createSimpleEntry({
  id: "nayakah",
  devanagari: "नायकः",
  telugu: "నాయకః",
  ruleId: "ayavayava",
  left: {
    id: "nai",
    devanagari: "नै",
    telugu: "నై",
  },
  right: {
    id: "akah",
    devanagari: "अकः",
    telugu: "అకః",
  },
});

const sayakaEntry = createSimpleEntry({
  id: "sayakah",
  devanagari: "शायकः",
  telugu: "శాయకః",
  ruleId: "ayavayava",
  left: {
    id: "shai",
    devanagari: "शै",
    telugu: "శై",
  },
  right: {
    id: "akah-shai",
    devanagari: "अकः",
    telugu: "అకః",
  },
});

const pavakaEntry = createSimpleEntry({
  id: "pavakah",
  devanagari: "पावकः",
  telugu: "పావకః",
  ruleId: "ayavayava",
  left: {
    id: "pau",
    devanagari: "पौ",
    telugu: "పౌ",
  },
  right: {
    id: "akah-pau",
    devanagari: "अकः",
    telugu: "అకః",
  },
});

const pavanahEntry = createSimpleEntry({
  id: "pavanah",
  devanagari: "पावनः",
  telugu: "పావనః",
  ruleId: "ayavayava",
  left: {
    id: "pau-second",
    devanagari: "पौ",
    telugu: "పౌ",
  },
  right: {
    id: "anah-pau",
    devanagari: "अनः",
    telugu: "అనః",
  },
});

const meAcyutaEntry = createSimpleEntry({
  id: "me-acyuta",
  devanagari: "मेऽच्युत",
  telugu: "మేఽచ్యుత",
  ruleId: "purvarupa",
  left: {
    id: "me",
    devanagari: "मे",
    telugu: "మే",
  },
  right: {
    id: "acyuta",
    devanagari: "अच्युत",
    telugu: "అచ్యుత",
  },
  nimitta: PURVARUPA_NIMITTA,
  note: "The avagraha marks the dropped initial a of the second word.",
});

const tumuloBhavatEntry = createSimpleEntry({
  id: "tumulo-bhavat",
  devanagari: "तुमुलोऽभवत्",
  telugu: "తుములోఽభవత్",
  ruleId: "purvarupa",
  left: {
    id: "tumulo",
    devanagari: "तुमुलो",
    telugu: "తుములో",
  },
  right: {
    id: "abhavat",
    devanagari: "अभवत्",
    telugu: "అభవత్",
  },
  nimitta: PURVARUPA_NIMITTA,
  note: "The avagraha marks the dropped initial a of the second word.",
});

const prejateEntry = createSimpleEntry({
  id: "prejate",
  devanagari: "प्रेजते",
  telugu: "ప్రేజతే",
  ruleId: "pararupa",
  left: {
    id: "pra",
    devanagari: "प्र",
    telugu: "ప్ర",
  },
  right: {
    id: "ejate",
    devanagari: "एजते",
    telugu: "ఏజతే",
  },
  nimitta: PARARUPA_NIMITTA,
});

const upopatiEntry = createSimpleEntry({
  id: "upopati",
  devanagari: "उपोपति",
  telugu: "ఉపోపతి",
  ruleId: "pararupa",
  left: {
    id: "upa",
    devanagari: "उप",
    telugu: "ఉప",
  },
  right: {
    id: "opati",
    devanagari: "ओपति",
    telugu: "ఓపతి",
  },
  nimitta: PARARUPA_NIMITTA,
});

export const DEFAULT_SANDHI_BANK: WordNode[] = [
  {
    id: "shivalayah",
    devanagari: "शिवालयः",
    iast: "śivālayaḥ",
    telugu: "శివాలయః",
    status: "splittable",
    aksharas: ["शि", "व", "आ", "ल", "यः"],
    cuts: [shivaAlaya],
  },
  himalayaEntry,
  chatravasaEntry,
  {
    id: "rameshvarah",
    devanagari: "रामेश्वरः",
    iast: "rāmeśvaraḥ",
    telugu: "రామేశ్వరః",
    status: "splittable",
    aksharas: ["रा", "म", "ई", "श्व", "रः"],
    cuts: [ramaIshvara],
  },
  maheshaEntry,
  {
    id: "mahaushadham",
    devanagari: "महौषधम्",
    iast: "mahauṣadham",
    telugu: "మహౌషధమ్",
    status: "splittable",
    aksharas: ["म", "हा", "औ", "ष", "धम्"],
    cuts: [mahaOshadhaVariantA, mahaAushadhaVariantB],
  },
  {
    id: "guruupadeshah",
    devanagari: "गुरूपदेशः",
    iast: "gurūpadeśaḥ",
    telugu: "గురూపదేశః",
    status: "splittable",
    aksharas: ["गु", "रु", "उ", "प", "दे", "शः"],
    cuts: [guruUpadesha],
  },
  ativaEntry,
  itivaEntry,
  kapishaEntry,
  munishaEntry,
  {
    id: "devalayah",
    devanagari: "देवालयः",
    iast: "devālayaḥ",
    telugu: "దేవాలయః",
    status: "splittable",
    aksharas: ["दे", "व", "आ", "ल", "यः"],
    cuts: [devaAlaya],
  },
  {
    id: "devendrah",
    devanagari: "देवेन्द्रः",
    iast: "devendraḥ",
    telugu: "దేవేంద్రః",
    status: "splittable",
    aksharas: ["दे", "व", "इ", "न्द्रः"],
    cuts: [devaIndra],
  },
  devarshiEntry,
  {
    id: "mahotsavah",
    devanagari: "महोत्सवः",
    iast: "mahotsavaḥ",
    telugu: "మహోత్సవః",
    status: "splittable",
    aksharas: ["म", "हा", "उ", "त्स", "वः"],
    cuts: [mahaUtsava],
  },
  {
    id: "tathaiva",
    devanagari: "तथैव",
    iast: "tathaiva",
    telugu: "తథైవ",
    status: "splittable",
    aksharas: ["त", "था", "ए", "व"],
    cuts: [tathaEva],
  },
  deshaikataEntry,
  jalaughaEntry,
  {
    id: "svagatam",
    devanagari: "स्वागतम्",
    iast: "svāgatam",
    telugu: "స్వాగతమ్",
    status: "splittable",
    aksharas: ["सु", "आ", "ग", "तम्"],
    cuts: [suAgata],
  },
  {
    id: "atyacharah",
    devanagari: "अत्याचारः",
    iast: "atyācāraḥ",
    telugu: "అత్యాచారః",
    status: "splittable",
    aksharas: ["अ", "ति", "आ", "चा", "रः"],
    cuts: [atiAcara],
  },
  mahashayaEntry,
  sudhakaraEntry,
  nayanamEntry,
  harayeEntry,
  rishayeEntry,
  munayeEntry,
  sadhaveEntry,
  dhenaveEntry,
  nayakaEntry,
  sayakaEntry,
  pavakaEntry,
  pavanahEntry,
  meAcyutaEntry,
  tumuloBhavatEntry,
  prejateEntry,
  upopatiEntry,
  {
    id: "pitraajna-review",
    devanagari: "पित्राज्ञा",
    iast: "pitrājñā",
    telugu: "పిత్రాజ్ఞా",
    status: "splittable",
    aksharas: ["पि", "तृ", "आ", "ज्ञा"],
    reviewNeeded: true,
    cuts: [
      {
        id: "pitraajna-review-cut",
        ruleId: "yan",
        cutAfterAksharaIndex: 1,
        left: leaf("pitr", "पितृ", "pitṛ", "పితృ", ["पि", "तृ"]),
        right: leaf("ajna", "आज्ञा", "ājñā", "ఆజ్ఞా", ["आ", "ज्ञा"]),
        explanation: {
          te: "ఇది సమీక్షకు పెట్టిన ఉదాహరణ. ధృవీకరణ పూర్తయ్యే వరకు గేమ్‌లో చూపించము.",
          sa: "अयं परीक्षार्थं निहितः उदाहरणः, निश्चयात् पूर्वं न प्रदर्श्यते।",
          en: "This example is marked for review and stays out of gameplay until verified.",
        },
        sutra: {
          text: "इको यणचि",
          number: "6.1.77",
        },
        reviewNeeded: true,
      },
    ],
  },
  {
    id: "parameshvaralayah",
    devanagari: "परमेश्वरालयः",
    iast: "parameśvarālayaḥ",
    telugu: "పరమేశ్వరాలయః",
    status: "splittable",
    aksharas: ["प", "र", "म", "ई", "श्व", "र", "आ", "ल", "यः"],
    cuts: [parameshvaralayaOuter, paramaIshvaralaya],
  },
];

export const STORAGE_KEYS = {
  customEntries: "sandhi-ninja.custom-entries",
  progress: "sandhi-ninja.progress",
} as const;

export const cloneWordNode = (node: WordNode): WordNode => ({
  ...node,
  cuts: node.cuts.map((cut) => ({
    ...cut,
    explanation: {
      ...cut.explanation,
      nimitta: cut.explanation.nimitta
        ? { ...cut.explanation.nimitta }
        : undefined,
    },
    sutra: { ...cut.sutra },
    left: cloneWordNode(cut.left),
    right: cloneWordNode(cut.right),
  })),
});

export const isFurtherSplittable = (node: WordNode) =>
  node.status === "splittable" &&
  node.cuts.some((cut) => !cut.reviewNeeded);

export const isGameplayEligible = (node: WordNode) =>
  !node.reviewNeeded && isFurtherSplittable(node);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const parseWordNode = (value: unknown): WordNode | null => {
  if (!isRecord(value)) {
    return null;
  }

  const {
    id,
    devanagari,
    iast,
    telugu,
    status,
    aksharas,
    cuts,
    reviewNeeded,
  } = value;

  if (
    typeof id !== "string" ||
    typeof devanagari !== "string" ||
    typeof iast !== "string" ||
    (telugu !== undefined && typeof telugu !== "string") ||
    (status !== "splittable" && status !== "final") ||
    !isStringArray(aksharas) ||
    !Array.isArray(cuts)
  ) {
    return null;
  }

  const parsedCuts = cuts
    .map((entry) => parseCut(entry))
    .filter((entry): entry is SandhiCut => entry !== null);

  return {
    id,
    devanagari,
    iast,
    telugu,
    status,
    aksharas,
    cuts: parsedCuts,
    reviewNeeded: typeof reviewNeeded === "boolean" ? reviewNeeded : undefined,
  };
};

const parseCut = (value: unknown): SandhiCut | null => {
  if (!isRecord(value)) {
    return null;
  }

  const {
    id,
    ruleId,
    cutAfterAksharaIndex,
    left,
    right,
    explanation,
    sutra,
    reviewNeeded,
  } = value;

  if (
    typeof id !== "string" ||
    (ruleId !== "savarna-dirgha" &&
      ruleId !== "guna" &&
      ruleId !== "vrddhi" &&
      ruleId !== "yan" &&
      ruleId !== "ayavayava" &&
      ruleId !== "purvarupa" &&
      ruleId !== "pararupa") ||
    typeof cutAfterAksharaIndex !== "number" ||
    !isRecord(explanation) ||
    !isRecord(sutra)
  ) {
    return null;
  }

  const leftNode = parseWordNode(left);
  const rightNode = parseWordNode(right);

  if (!leftNode || !rightNode) {
    return null;
  }

  if (
    typeof explanation.en !== "string" ||
    typeof explanation.sa !== "string" ||
    typeof explanation.te !== "string" ||
    typeof sutra.text !== "string" ||
    typeof sutra.number !== "string"
  ) {
    return null;
  }

  return {
    id,
    ruleId,
    cutAfterAksharaIndex,
    left: leftNode,
    right: rightNode,
    explanation: {
      en: explanation.en,
      sa: explanation.sa,
      te: explanation.te,
      nimitta:
        isRecord(explanation.nimitta) &&
        typeof explanation.nimitta.en === "string" &&
        typeof explanation.nimitta.sa === "string" &&
        typeof explanation.nimitta.te === "string"
          ? {
              en: explanation.nimitta.en,
              sa: explanation.nimitta.sa,
              te: explanation.nimitta.te,
            }
          : undefined,
      note: typeof explanation.note === "string" ? explanation.note : undefined,
    },
    sutra: {
      text: sutra.text,
      number: sutra.number,
    },
    reviewNeeded: typeof reviewNeeded === "boolean" ? reviewNeeded : undefined,
  };
};

export const parseWordEntries = (value: unknown): WordNode[] => {
  if (!Array.isArray(value)) {
    const single = parseWordNode(value);
    return single ? [single] : [];
  }

  return value
    .map((entry) => parseWordNode(entry))
    .filter((entry): entry is WordNode => entry !== null);
};
