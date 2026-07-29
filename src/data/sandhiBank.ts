import type {
  LocalizedText,
  SandhiCut,
  SandhiRule,
  SandhiRuleId,
  WordNode,
} from "../types/sandhi";
export { SANDHI_RULES } from "../../shared/core/rules.ts";
import { SANDHI_RULES } from "../../shared/core/rules.ts";
import {
  devanagariToIast,
  iastToTelugu,
  splitDevanagariAksharas,
} from "../utils/sanskrit";

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

const autoTeluguFromDevanagari = (devanagari: string) =>
  iastToTelugu(devanagariToIast(devanagari) || devanagari);

const autoLeaf = (id: string, devanagari: string, telugu?: string) =>
  leaf(
    id,
    devanagari,
    devanagariToIast(devanagari) || devanagari,
    telugu ?? autoTeluguFromDevanagari(devanagari),
    splitDevanagariAksharas(devanagari),
  );

type SimpleEntryConfig = {
  id: string;
  devanagari: string;
  telugu?: string;
  ruleId: SandhiRuleId;
  left: {
    id: string;
    devanagari: string;
    telugu?: string;
  };
  right: {
    id: string;
    devanagari: string;
    telugu?: string;
  };
  nimitta?: {
    en: string;
    sa: string;
    te: string;
  };
  note?: LocalizedText | string;
};

const localizeNote = (note?: LocalizedText | string) =>
  typeof note === "string"
    ? {
        en: note,
        sa: note,
        te: note,
      }
    : note;

const buildSimpleExplanation = (
  surface: string,
  rule: SandhiRule,
  left: string,
  right: string,
): LocalizedText => ({
  en: `Split ${surface} as ${left} + ${right}. ${rule.helper.en} At this junction the visible result is ${surface}. Pāṇini: ${rule.sutra.text} (${rule.sutra.number}).`,
  sa: `${surface} इति रूपं ${left} + ${right} इति विभज्यते। ${rule.helper.sa} अतः अस्मिन् संयोगे ${surface} इदं रूपं भवति। पाणिनीयसूत्रम् — ${rule.sutra.text} (${rule.sutra.number})।`,
  te: `${surface} ను ${left} + ${right}గా విభజించాలి. ${rule.helper.te} ఈ సంగమంలో అందుకే ${surface} రూపం వస్తుంది. పాణినీ సూత్రం: ${rule.sutra.text} (${rule.sutra.number}).`,
});

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
      ...buildSimpleExplanation(
        devanagari,
        rule,
        left.devanagari,
        right.devanagari,
      ),
      nimitta,
      note: localizeNote(note),
    },
    sutra: rule.sutra,
  });

  return {
    id,
    devanagari,
    iast: devanagariToIast(devanagari) || devanagari,
    telugu: telugu ?? autoTeluguFromDevanagari(devanagari),
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

const GUNA_NIMITTA = {
  en: "Nimittam: a or ā meets i/ī, u/ū, ṛ, or ḷ and settles into the guṇa vowel.",
  sa: "निमित्तम्: अ/आ परे इ/ई/उ/ऊ/ऋ/लृ सति गुणादेशः भवति।",
  te: "నిమిత్తం: అ లేదా ఆ తరువాత ఇ/ఈ/ఉ/ఊ/ఋ/లృ వచ్చినప్పుడు గుణ స్వరం వస్తుంది.",
} as const;

const VRDDHI_NIMITTA = {
  en: "Nimittam: a or ā stands before e, ai, o, or au and expands into the stronger vṛddhi sound.",
  sa: "निमित्तम्: अ/आ परे ए/ऐ/ओ/औ सति वृद्ध्यादेशः भवति।",
  te: "నిమిత్తం: అ లేదా ఆ తరువాత ఏ/ఐ/ఓ/ఔ వచ్చినప్పుడు వృద్ధి స్వరం వస్తుంది.",
} as const;

const YAN_NIMITTA = {
  en: "Nimittam: i, u, ṛ, or ḷ stands before another vowel and glides into y, v, r, or l.",
  sa: "निमित्तम्: इक्-वर्णस्य परे स्वरे सति यणादेशः भवति।",
  te: "నిమిత్తం: ఇక్ స్వరం తరువాత మరో స్వరం వస్తే అది య్/వ్/ర్/ల్ రూపంలో జారుతుంది.",
} as const;

const JASHTVA_NIMITTA = {
  en: "Nimittam: a word-final consonant stands before a vowel or a soft consonant and shifts to the third sound of its class.",
  sa: "निमित्तम्: पदान्तव्यञ्जनात् परतः स्वरः अथवा मृदुव्यञ्जनं भवति, तदा तत्तद्वर्गतृतीयादेशः भवति।",
  te: "నిమిత్తం: పదాంత వ్యంజనం తరువాత స్వరం లేదా మృదు వ్యంజనం వచ్చినప్పుడు అది తన వర్గంలోని మూడవ అక్షరంగా మారుతుంది.",
} as const;

const CHARTVA_NIMITTA = {
  en: "Nimittam: a word-final voiced stop stands before a hard consonant and becomes the first sound of its class.",
  sa: "निमित्तम्: पदान्ते स्थितः जश् खरि परतः तत्तद्वर्गप्रथमादेशं प्राप्नोति।",
  te: "నిమిత్తం: పదాంతంలోని మృదు ఘోషవ్యంజనం తరువాత కఠిన వ్యంజనం వచ్చినప్పుడు అది తన వర్గంలోని మొదటి అక్షరంగా మారుతుంది.",
} as const;

const ANUNASIKA_NIMITTA = {
  en: "Nimittam: a word-final consonant stands before a nasal and takes a matching nasal form.",
  sa: "निमित्तम्: पदान्तव्यञ्जनात् परतः अनुनासिके सति तदनुरूपनासिकादेशः भवति।",
  te: "నిమిత్తం: పదాంత వ్యంజనం తరువాత అనునాసికం వచ్చినప్పుడు దానికి సరిపోయే నాసిక్యరూపం వస్తుంది.",
} as const;

const ANUSVARA_NIMITTA = {
  en: "Nimittam: a final m before another consonant contracts to anusvāra.",
  sa: "निमित्तम्: पदान्तमकारस्य हलि परतः अनुस्वारादेशः भवति।",
  te: "నిమిత్తం: పదాంతంలోని మకారం తరువాత వ్యంజనం వస్తే అది అనుస్వారంగా మారుతుంది.",
} as const;

const PURVASAVARNA_NIMITTA = {
  en: "Nimittam: h follows a class consonant and takes that earlier consonant's class-colored fourth sound.",
  sa: "निमित्तम्: वर्गीयव्यञ्जनात् परे हकारे सति हस्य पूर्ववर्णसवर्णचतुर्थादेशः भवति।",
  te: "నిమిత్తం: వర్గీయ వ్యంజనం తరువాత హకారం వచ్చినప్పుడు హకారం ముందున్న వర్ణానికి అనుగుణమైన నాలుగవ ధ్వనిని తీసుకుంటుంది.",
} as const;

const PARASAVARNA_NIMITTA = {
  en: "Nimittam: anusvāra stands before a following consonant and settles into that consonant-class nasal sound.",
  sa: "निमित्तम्: परव्यञ्जनात् पूर्वं स्थितः अनुस्वारः तस्य वर्गस्य नासिक्यसवर्णरूपं गृह्णाति।",
  te: "నిమిత్తం: తరువాతి వ్యంజనం ముందు ఉన్న అనుస్వారం ఆ వ్యంజన వర్గానికి చెందిన నాసిక్యరూపంగా స్థిరపడుతుంది.",
} as const;

const VISARGA_SATVA_NIMITTA = {
  en: "Nimittam: visarga stands before a hard consonant or sibilant and reshapes into s, ś, or ṣ according to the following sound.",
  sa: "निमित्तम्: विसर्गात् परतः खर् अथवा शर् वर्तते; तदा स/श/ष-आदेशः परवर्णानुसारं भवति।",
  te: "నిమిత్తం: విసర్గం తరువాత కఠిన వ్యంజనం లేదా శ/ష/స వస్తే అది తరువాతి ధ్వనికి తగిన స్/శ్/ష్ రూపం దాల్చుతుంది.",
} as const;

const VISARGA_REPHA_NIMITTA = {
  en: "Nimittam: visarga after a non-a/ā vowel, or in avyaya usage, meets a vowel or soft consonant and turns into r.",
  sa: "निमित्तम्: अ/आ-वर्जितस्वरात् परो वा अव्ययसम्बद्धो विसर्गः स्वरं मृदुव्यञ्जनं वा प्राप्य रेफादेशं लभते।",
  te: "నిమిత్తం: అ/ఆ కాని స్వరం తరువాత వచ్చిన విసర్గం, లేదా అవ్యయ విసర్గం, తరువాత స్వరం లేదా మృదు వ్యంజనం వస్తే ర్‌గా మారుతుంది.",
} as const;

const VISARGA_LOPA_NIMITTA = {
  en: "Nimittam: in these taught visarga patterns the visarga drops, and the earlier vowel may remain, lengthen, or show a helper y-sound.",
  sa: "निमित्तम्: अस्मिन् शिक्षितप्रयोगे विसर्गलोपः भवति; पूर्वस्वरः स्थितिं, दीर्घत्वं, यकारसाहाय्यं वा दर्शयति।",
  te: "నిమిత్తం: ఈ బోధనా రూపాల్లో విసర్గం లోపించి, ముందు స్వరం అలాగే ఉండవచ్చు, దీర్ఘమవవచ్చు, లేదా యకారసహాయం కనిపించవచ్చు.",
} as const;

const VISARGA_OTVA_NIMITTA = {
  en: "Nimittam: final aḥ meets a following vowel or soft consonant and moves through ru/utva into an o-sound.",
  sa: "निमित्तम्: पदान्ते अः परतः स्वरं मृदुव्यञ्जनं वा प्राप्य रु-उत्वक्रमेण ओ-रूपं भवति।",
  te: "నిమిత్తం: పదాంత అః తరువాత స్వరం లేదా మృదు వ్యంజనం వస్తే రు/ఉత్వ క్రమంలో ఓ ధ్వని వస్తుంది.",
} as const;

const RUNNING_TEXT_NOTE: LocalizedText = {
  en: "Shown as one running-text string in the game so you can practice the sandhi cut directly.",
  sa: "क्रीडायां सन्धिच्छेदाभ्यासाय अयं प्रयोगः एकरूपेण प्रदर्शितः।",
  te: "గేమ్‌లో సంధిచ్ఛేదాన్ని నేరుగా సాధన చేయడానికి ఈ రూపాన్ని ఒక్క పరిగెత్తే పాఠంలా చూపిస్తున్నాం.",
};

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
    note: "Sandhi Splitting accepts either correct split order for this word.",
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

const vidyalayaEntry = createSimpleEntry({
  id: "vidyalayah",
  devanagari: "विद्यालयः",
  telugu: "విద్యాలయః",
  ruleId: "savarna-dirgha",
  left: {
    id: "vidya",
    devanagari: "विद्या",
    telugu: "విద్యా",
  },
  right: {
    id: "alaya-vidya",
    devanagari: "आलयः",
    telugu: "ఆలయః",
  },
});

const girishaEntry = createSimpleEntry({
  id: "girishah",
  devanagari: "गिरीशः",
  telugu: "గిరీశః",
  ruleId: "savarna-dirgha",
  left: {
    id: "giri",
    devanagari: "गिरि",
    telugu: "గిరి",
  },
  right: {
    id: "isha-giri",
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

const narendraEntry = createSimpleEntry({
  id: "narendrah",
  devanagari: "नरेन्द्रः",
  telugu: "నరేంద్రః",
  ruleId: "guna",
  left: {
    id: "nara",
    devanagari: "नर",
    telugu: "నర",
  },
  right: {
    id: "indra-nara",
    devanagari: "इन्द्रः",
    telugu: "ఇంద్రః",
  },
});

const rajopacaraEntry = createSimpleEntry({
  id: "rajopacarah",
  devanagari: "राजोपचारः",
  telugu: "రాజోపచారః",
  ruleId: "guna",
  left: {
    id: "raja",
    devanagari: "राजा",
    telugu: "రాజా",
  },
  right: {
    id: "upacara",
    devanagari: "उपचारः",
    telugu: "ఉపచారః",
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

const sadaivaEntry = createSimpleEntry({
  id: "sadaiva",
  devanagari: "सदैव",
  telugu: "సదైవ",
  ruleId: "vrddhi",
  left: {
    id: "sada",
    devanagari: "सदा",
    telugu: "సదా",
  },
  right: {
    id: "eva-sada",
    devanagari: "एव",
    telugu: "ఏవ",
  },
});

const mataikyaEntry = createSimpleEntry({
  id: "mataikyam",
  devanagari: "मतैक्यम्",
  telugu: "మతైక్యం",
  ruleId: "vrddhi",
  left: {
    id: "mata",
    devanagari: "मत",
    telugu: "మత",
  },
  right: {
    id: "aikya",
    devanagari: "ऐक्यम्",
    telugu: "ఐక్యం",
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

const atyantaEntry = createSimpleEntry({
  id: "atyantam",
  devanagari: "अत्यन्तम्",
  telugu: "అత్యంతమ్",
  ruleId: "yan",
  left: {
    id: "ati-anta-left",
    devanagari: "अति",
    telugu: "అతి",
  },
  right: {
    id: "anta-yan",
    devanagari: "अन्तम्",
    telugu: "అంతమ్",
  },
});

const pratyekaEntry = createSimpleEntry({
  id: "pratyekam",
  devanagari: "प्रत्येकम्",
  telugu: "ప్రత్యేకమ్",
  ruleId: "yan",
  left: {
    id: "prati-ekam-left",
    devanagari: "प्रति",
    telugu: "ప్రతి",
  },
  right: {
    id: "ekam-pratyeka",
    devanagari: "एकम्",
    telugu: "ఏకం",
  },
});

const nyunaEntry = createSimpleEntry({
  id: "nyunam",
  devanagari: "न्यूनम्",
  telugu: "న్యూనమ్",
  ruleId: "yan",
  left: {
    id: "ni-nyuna-left",
    devanagari: "नि",
    telugu: "ని",
  },
  right: {
    id: "una",
    devanagari: "ऊनम्",
    telugu: "ఊనం",
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

const teApiEntry = createSimpleEntry({
  id: "teapi",
  devanagari: "तेऽपि",
  telugu: "తేఽపి",
  ruleId: "purvarupa",
  left: {
    id: "te-purvarupa",
    devanagari: "ते",
    telugu: "తే",
  },
  right: {
    id: "api-te",
    devanagari: "अपि",
    telugu: "అపి",
  },
  nimitta: PURVARUPA_NIMITTA,
  note: "The avagraha marks the dropped initial a of the second word.",
});

const hareApiEntry = createSimpleEntry({
  id: "hareapi",
  devanagari: "हरेऽपि",
  telugu: "హరేఽపి",
  ruleId: "purvarupa",
  left: {
    id: "hare-purvarupa",
    devanagari: "हरे",
    telugu: "హరే",
  },
  right: {
    id: "api-hare",
    devanagari: "अपि",
    telugu: "అపి",
  },
  nimitta: PURVARUPA_NIMITTA,
  note: "The avagraha marks the dropped initial a of the second word.",
});

const lokoAyamEntry = createSimpleEntry({
  id: "lokoayam",
  devanagari: "लोकोऽयम्",
  telugu: "లోకోఽయం",
  ruleId: "purvarupa",
  left: {
    id: "loko-purvarupa",
    devanagari: "लोको",
    telugu: "లోకో",
  },
  right: {
    id: "ayam-loko",
    devanagari: "अयम्",
    telugu: "అయం",
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

const uposhatiEntry = createSimpleEntry({
  id: "uposhati",
  devanagari: "उपोषति",
  telugu: "ఉపోషతి",
  ruleId: "pararupa",
  left: {
    id: "upa",
    devanagari: "उप",
    telugu: "ఉప",
  },
  right: {
    id: "oshati",
    devanagari: "ओषति",
    telugu: "ఓషతి",
  },
  nimitta: PARARUPA_NIMITTA,
});

const digambaraEntry = createSimpleEntry({
  id: "digambara",
  devanagari: "दिगम्बरः",
  ruleId: "jashtva",
  left: {
    id: "dik",
    devanagari: "दिक्",
  },
  right: {
    id: "ambara",
    devanagari: "अम्बरः",
  },
  nimitta: JASHTVA_NIMITTA,
});

const vagishaEntry = createSimpleEntry({
  id: "vagisha",
  devanagari: "वागीशः",
  ruleId: "jashtva",
  left: {
    id: "vak",
    devanagari: "वाक्",
  },
  right: {
    id: "isha-vyanjana",
    devanagari: "ईशः",
  },
  nimitta: JASHTVA_NIMITTA,
});

const diggajaEntry = createSimpleEntry({
  id: "diggajah",
  devanagari: "दिग्गजः",
  ruleId: "jashtva",
  left: {
    id: "dik-diggaja-left",
    devanagari: "दिक्",
  },
  right: {
    id: "gaja",
    devanagari: "गजः",
  },
  nimitta: JASHTVA_NIMITTA,
});

const jagadishaEntry = createSimpleEntry({
  id: "jagadishah",
  devanagari: "जगदीशः",
  ruleId: "jashtva",
  left: {
    id: "jagat-jagadisha-left",
    devanagari: "जगत्",
  },
  right: {
    id: "isha-jagat",
    devanagari: "ईशः",
  },
  nimitta: JASHTVA_NIMITTA,
});

const sadgunaEntry = createSimpleEntry({
  id: "sadgunah",
  devanagari: "सद्गुणः",
  ruleId: "jashtva",
  left: {
    id: "sat-sadguna-left",
    devanagari: "सत्",
  },
  right: {
    id: "guna",
    devanagari: "गुणः",
  },
  nimitta: JASHTVA_NIMITTA,
});

const satkaraEntry = createSimpleEntry({
  id: "satkara",
  devanagari: "सत्कारः",
  ruleId: "chartva",
  left: {
    id: "sad",
    devanagari: "सद्",
  },
  right: {
    id: "kara",
    devanagari: "कारः",
  },
  nimitta: CHARTVA_NIMITTA,
});

const tatparaEntry = createSimpleEntry({
  id: "tatpara",
  devanagari: "तत्परः",
  ruleId: "chartva",
  left: {
    id: "tad",
    devanagari: "तद्",
  },
  right: {
    id: "para-chartva",
    devanagari: "परः",
  },
  nimitta: CHARTVA_NIMITTA,
});

const tatkalaEntry = createSimpleEntry({
  id: "tatkalah",
  devanagari: "तत्कालः",
  ruleId: "chartva",
  left: {
    id: "tad-tatkala-left",
    devanagari: "तद्",
  },
  right: {
    id: "kala",
    devanagari: "कालः",
  },
  nimitta: CHARTVA_NIMITTA,
});

const utpattiEntry = createSimpleEntry({
  id: "utpattih",
  devanagari: "उत्पत्तिः",
  ruleId: "chartva",
  left: {
    id: "ud-utpatti-left",
    devanagari: "उद्",
  },
  right: {
    id: "pattih",
    devanagari: "पत्तिः",
  },
  nimitta: CHARTVA_NIMITTA,
});

const jagatpatiEntry = createSimpleEntry({
  id: "jagatpatih",
  devanagari: "जगत्पतिः",
  ruleId: "chartva",
  left: {
    id: "jagad-jagatpati-left",
    devanagari: "जगद्",
  },
  right: {
    id: "patih",
    devanagari: "पतिः",
  },
  nimitta: CHARTVA_NIMITTA,
});

const chinmayamEntry = createSimpleEntry({
  id: "chinmayam",
  devanagari: "चिन्मयम्",
  ruleId: "anunasika",
  left: {
    id: "cit",
    devanagari: "चित्",
  },
  right: {
    id: "mayam",
    devanagari: "मयम्",
  },
  nimitta: ANUNASIKA_NIMITTA,
});

const sanmargahEntry = createSimpleEntry({
  id: "sanmargah",
  devanagari: "सन्मार्गः",
  ruleId: "anunasika",
  left: {
    id: "sat-anunasika",
    devanagari: "सत्",
  },
  right: {
    id: "marga",
    devanagari: "मार्गः",
  },
  nimitta: ANUNASIKA_NIMITTA,
});

const tanmayaEntry = createSimpleEntry({
  id: "tanmayah",
  devanagari: "तन्मयः",
  ruleId: "anunasika",
  left: {
    id: "tat-tanmaya-left",
    devanagari: "तत्",
  },
  right: {
    id: "maya-tanmaya",
    devanagari: "मयः",
  },
  nimitta: ANUNASIKA_NIMITTA,
});

const sanmatiEntry = createSimpleEntry({
  id: "sanmatih",
  devanagari: "सन्मतिः",
  ruleId: "anunasika",
  left: {
    id: "sat-sanmati-left",
    devanagari: "सत्",
  },
  right: {
    id: "matih",
    devanagari: "मतिः",
  },
  nimitta: ANUNASIKA_NIMITTA,
});

const chinmatraEntry = createSimpleEntry({
  id: "chinmatram",
  devanagari: "चिन्मात्रम्",
  ruleId: "anunasika",
  left: {
    id: "cit-chinmatra-left",
    devanagari: "चित्",
  },
  right: {
    id: "matram",
    devanagari: "मात्रम्",
  },
  nimitta: ANUNASIKA_NIMITTA,
});

const samvadaEntry = createSimpleEntry({
  id: "samvada",
  devanagari: "संवादः",
  ruleId: "anusvara",
  left: {
    id: "sam-vada-left",
    devanagari: "सम्",
  },
  right: {
    id: "vada",
    devanagari: "वादः",
  },
  nimitta: ANUSVARA_NIMITTA,
});

const samyogahEntry = createSimpleEntry({
  id: "samyogah",
  devanagari: "संयोगः",
  ruleId: "anusvara",
  left: {
    id: "sam-yoga-left",
    devanagari: "सम्",
  },
  right: {
    id: "yoga",
    devanagari: "योगः",
  },
  nimitta: ANUSVARA_NIMITTA,
});

const samrakshanaEntry = createSimpleEntry({
  id: "samrakshanam",
  devanagari: "संरक्षणम्",
  ruleId: "anusvara",
  left: {
    id: "sam-rakshana-left",
    devanagari: "सम्",
  },
  right: {
    id: "rakshanam",
    devanagari: "रक्षणम्",
  },
  nimitta: ANUSVARA_NIMITTA,
});

const samlapaEntry = createSimpleEntry({
  id: "samlapah",
  devanagari: "संलापः",
  ruleId: "anusvara",
  left: {
    id: "sam-lapa-left",
    devanagari: "सम्",
  },
  right: {
    id: "lapah",
    devanagari: "लापः",
  },
  nimitta: ANUSVARA_NIMITTA,
});

const samlekhaEntry = createSimpleEntry({
  id: "samlekhah",
  devanagari: "संलेखः",
  ruleId: "anusvara",
  left: {
    id: "sam-lekha-left",
    devanagari: "सम्",
  },
  right: {
    id: "lekhah",
    devanagari: "लेखः",
  },
  nimitta: ANUSVARA_NIMITTA,
});

const taddhitamEntry = createSimpleEntry({
  id: "taddhitam",
  devanagari: "तद्धितम्",
  ruleId: "purvasavarna",
  left: {
    id: "tad-purvasavarna-left",
    devanagari: "तद्",
  },
  right: {
    id: "hitam",
    devanagari: "हितम्",
  },
  nimitta: PURVASAVARNA_NIMITTA,
});

const uddharahEntry = createSimpleEntry({
  id: "uddharah",
  devanagari: "उद्धारः",
  ruleId: "purvasavarna",
  left: {
    id: "ud",
    devanagari: "उद्",
  },
  right: {
    id: "harah",
    devanagari: "हारः",
  },
  nimitta: PURVASAVARNA_NIMITTA,
});

const taddhetuEntry = createSimpleEntry({
  id: "taddhetuh",
  devanagari: "तद्धेतुः",
  ruleId: "purvasavarna",
  left: {
    id: "tad-taddhetu-left",
    devanagari: "तद्",
  },
  right: {
    id: "hetuh",
    devanagari: "हेतुः",
  },
  nimitta: PURVASAVARNA_NIMITTA,
});

const uddhrtaEntry = createSimpleEntry({
  id: "uddhrtam",
  devanagari: "उद्धृतम्",
  ruleId: "purvasavarna",
  left: {
    id: "ud-uddhrta-left",
    devanagari: "उद्",
  },
  right: {
    id: "hrtam",
    devanagari: "हृतम्",
  },
  nimitta: PURVASAVARNA_NIMITTA,
});

const sankalpahEntry = createSimpleEntry({
  id: "sankalpah",
  devanagari: "सङ्कल्पः",
  ruleId: "parasavarna",
  left: {
    id: "sam-kalpa-left",
    devanagari: "सम्",
  },
  right: {
    id: "kalpah",
    devanagari: "कल्पः",
  },
  nimitta: PARASAVARNA_NIMITTA,
  note: "The final m first contracts and then settles into the nasal sound demanded by the following consonant class.",
});

const sanjayaEntry = createSimpleEntry({
  id: "sanjayah",
  devanagari: "सञ्जयः",
  ruleId: "parasavarna",
  left: {
    id: "sam-jaya-left",
    devanagari: "सं",
  },
  right: {
    id: "jayah",
    devanagari: "जयः",
  },
  nimitta: PARASAVARNA_NIMITTA,
});

const sampataEntry = createSimpleEntry({
  id: "sampatah",
  devanagari: "सम्पातः",
  ruleId: "parasavarna",
  left: {
    id: "sam-pata-left",
    devanagari: "सं",
  },
  right: {
    id: "patah",
    devanagari: "पातः",
  },
  nimitta: PARASAVARNA_NIMITTA,
});

const sandeshaEntry = createSimpleEntry({
  id: "sandeshah",
  devanagari: "सन्देशः",
  ruleId: "parasavarna",
  left: {
    id: "sam-desha-left",
    devanagari: "सं",
  },
  right: {
    id: "deshah",
    devanagari: "देशः",
  },
  nimitta: PARASAVARNA_NIMITTA,
});

const sambandhaSemanticVariant = createCut({
  id: "sambandhah-semantic-variant",
  ruleId: "parasavarna",
  cutAfterAksharaIndex: 1,
  left: autoLeaf("sam-bandha-left", "सम्"),
  right: autoLeaf("bandhah", "बन्धः"),
  explanation: {
    en: "One accepted split is sam + bandhaḥ, preserving the semantic base words.",
    sa: "एकः ग्राह्यः पदच्छेदः सम् + बन्धः इति, यत्र मूलपदद्वयं स्पष्टं भवति।",
    te: "ఒక సరైన విభాగం సమ్ + బంధః. ఇందులో మూల పదాలు స్పష్టంగా కనిపిస్తాయి.",
    nimitta: PARASAVARNA_NIMITTA,
    note: "Semantic padaccheda accepted alongside the anusvara-based teaching split.",
  },
  sutra: RULE_LOOKUP.get("parasavarna")!.sutra,
});

const sambandhaTeachingVariant = createCut({
  id: "sambandhah-teaching-variant",
  ruleId: "parasavarna",
  cutAfterAksharaIndex: 1,
  left: autoLeaf("sam-anusvara-left", "सं"),
  right: autoLeaf("bandhah-anusvara", "बन्धः"),
  explanation: {
    en: "The PDF also teaches this as saṃ + bandhaḥ, where the anusvāra settles into the b-class nasal sound.",
    sa: "ग्रन्थे अयं सन्धिः सं + बन्धः इत्यपि निर्दिश्यते, यत्र अनुस्वारः बवर्गसवर्णरूपे स्थितिं गच्छति।",
    te: "పిడిఎఫ్‌లో ఇది సంం + బంధః రూపంలో కూడా బోధించబడింది; అక్కడ అనుస్వారం బవర్గానుసారంగా స్థిరపడుతుంది.",
    nimitta: PARASAVARNA_NIMITTA,
    note: "Teaching-oriented split taken from the parasavarna exercise trail in the PDF.",
  },
  sutra: RULE_LOOKUP.get("parasavarna")!.sutra,
});

const sambandhahEntry: WordNode = {
  id: "sambandhah",
  devanagari: "सम्बन्धः",
  iast: "sambandhaḥ",
  telugu: autoTeluguFromDevanagari("सम्बन्धः"),
  status: "splittable",
  aksharas: splitDevanagariAksharas("सम्बन्धः"),
  cuts: [sambandhaSemanticVariant, sambandhaTeachingVariant],
};

const SVARA_EXPANSION_ENTRIES: WordNode[] = [
  createSimpleEntry({
    id: "mahodayah",
    devanagari: "महोदयः",
    ruleId: "guna",
    left: {
      id: "maha-mahodaya-left",
      devanagari: "महा",
    },
    right: {
      id: "udayah",
      devanagari: "उदयः",
    },
    nimitta: GUNA_NIMITTA,
  }),
  createSimpleEntry({
    id: "rajarshih",
    devanagari: "राजर्षिः",
    ruleId: "guna",
    left: {
      id: "raja-left",
      devanagari: "राज",
    },
    right: {
      id: "rshih",
      devanagari: "ऋषिः",
    },
    nimitta: GUNA_NIMITTA,
  }),
  createSimpleEntry({
    id: "hitopadeshah",
    devanagari: "हितोपदेशः",
    ruleId: "guna",
    left: {
      id: "hita-left",
      devanagari: "हित",
    },
    right: {
      id: "upadesha-right",
      devanagari: "उपदेशः",
    },
    nimitta: GUNA_NIMITTA,
  }),
  createSimpleEntry({
    id: "tadaiva",
    devanagari: "तदैव",
    ruleId: "vrddhi",
    left: {
      id: "tada-left",
      devanagari: "तदा",
    },
    right: {
      id: "eva-right",
      devanagari: "एव",
    },
    nimitta: VRDDHI_NIMITTA,
  }),
  createSimpleEntry({
    id: "gurvajna",
    devanagari: "गुर्वाज्ञा",
    ruleId: "yan",
    left: {
      id: "guru-left-yan",
      devanagari: "गुरु",
    },
    right: {
      id: "ajna-right",
      devanagari: "आज्ञा",
    },
    nimitta: YAN_NIMITTA,
  }),
  createSimpleEntry({
    id: "gatyagamanam",
    devanagari: "गत्यागमनम्",
    ruleId: "yan",
    left: {
      id: "gati-left",
      devanagari: "गति",
    },
    right: {
      id: "agamanam-right",
      devanagari: "आगमनम्",
    },
    nimitta: YAN_NIMITTA,
  }),
];

const VYANJANA_EXPANSION_ENTRIES: WordNode[] = [
  createSimpleEntry({
    id: "baladiva",
    devanagari: "बलादिव",
    ruleId: "jashtva",
    left: {
      id: "balat-left",
      devanagari: "बलात्",
    },
    right: {
      id: "iva-right",
      devanagari: "इव",
    },
    nimitta: JASHTVA_NIMITTA,
  }),
  createSimpleEntry({
    id: "samyagvyavasitah",
    devanagari: "सम्यग्व्यवसितः",
    ruleId: "jashtva",
    left: {
      id: "samyak-left-vya",
      devanagari: "सम्यक्",
    },
    right: {
      id: "vyavasitah-right",
      devanagari: "व्यवसितः",
    },
    nimitta: JASHTVA_NIMITTA,
  }),
  createSimpleEntry({
    id: "prithagbalah",
    devanagari: "पृथग्बालाः",
    ruleId: "jashtva",
    left: {
      id: "prithak-left",
      devanagari: "पृथक्",
    },
    right: {
      id: "balah-right",
      devanagari: "बालाः",
    },
    nimitta: JASHTVA_NIMITTA,
  }),
  createSimpleEntry({
    id: "yadgatva",
    devanagari: "यद्गत्वा",
    ruleId: "jashtva",
    left: {
      id: "yat-left",
      devanagari: "यत्",
    },
    right: {
      id: "gatva-right",
      devanagari: "गत्वा",
    },
    nimitta: JASHTVA_NIMITTA,
  }),
  createSimpleEntry({
    id: "etadrtam",
    devanagari: "एतदृतम्",
    ruleId: "jashtva",
    left: {
      id: "etat-left",
      devanagari: "एतत्",
    },
    right: {
      id: "rtam-right",
      devanagari: "ऋतम्",
    },
    nimitta: JASHTVA_NIMITTA,
  }),
  createSimpleEntry({
    id: "shatkonah",
    devanagari: "षट्कोणः",
    ruleId: "chartva",
    left: {
      id: "shad-left",
      devanagari: "षड्",
    },
    right: {
      id: "konah-right",
      devanagari: "कोणः",
    },
    nimitta: CHARTVA_NIMITTA,
  }),
  createSimpleEntry({
    id: "dikpalah",
    devanagari: "दिक्पालः",
    ruleId: "chartva",
    left: {
      id: "dig-left-pala",
      devanagari: "दिग्",
    },
    right: {
      id: "palah-right",
      devanagari: "पालः",
    },
    nimitta: CHARTVA_NIMITTA,
  }),
  createSimpleEntry({
    id: "sampatputrah",
    devanagari: "सम्पत्पुत्रः",
    ruleId: "chartva",
    left: {
      id: "sampad-left-putra",
      devanagari: "सम्पद्",
    },
    right: {
      id: "putrah-right",
      devanagari: "पुत्रः",
    },
    nimitta: CHARTVA_NIMITTA,
  }),
  createSimpleEntry({
    id: "vakkelih",
    devanagari: "वाक्केलिः",
    ruleId: "chartva",
    left: {
      id: "vag-left-keli",
      devanagari: "वाग्",
    },
    right: {
      id: "kelih-right",
      devanagari: "केलिः",
    },
    nimitta: CHARTVA_NIMITTA,
  }),
  createSimpleEntry({
    id: "tanme",
    devanagari: "तन्मे",
    ruleId: "anunasika",
    left: {
      id: "tat-left-me",
      devanagari: "तत्",
    },
    right: {
      id: "me-right",
      devanagari: "मे",
    },
    nimitta: ANUNASIKA_NIMITTA,
  }),
  createSimpleEntry({
    id: "vangmulam",
    devanagari: "वाङ्मूलम्",
    ruleId: "anunasika",
    left: {
      id: "vag-left-mula",
      devanagari: "वाग्",
    },
    right: {
      id: "mulam-right",
      devanagari: "मूलम्",
    },
    nimitta: ANUNASIKA_NIMITTA,
    note: {
      en: "The PDF teaches both वाङ्मूलम् and वाग्मूलम्. This challenge uses the nasalized teaching form.",
      sa: "ग्रन्थे वाङ्मूलम् तथा वाग्मूलम् उभे रूपे स्वीकृते। अत्र नासिकीभूतः शिक्षणरूपः गृह्यते।",
      te: "పిడిఎఫ్‌లో వाङ్మూలమ్, వాగ్మూలమ్ రెండూ చూపించబడ్డాయి. ఈ అభ్యాసంలో నాసిక్య రూపాన్ని తీసుకున్నాం.",
    },
  }),
];

const VISARGA_EXPANSION_ENTRIES: WordNode[] = [
  createSimpleEntry({
    id: "pandavashca",
    devanagari: "पाण्डवाश्च",
    ruleId: "visarga-sa",
    left: {
      id: "pandavah-left",
      devanagari: "पाण्डवाः",
    },
    right: {
      id: "ca-right-pandava",
      devanagari: "च",
    },
    nimitta: VISARGA_SATVA_NIMITTA,
  }),
  createSimpleEntry({
    id: "ramashchatrah",
    devanagari: "रामश्छात्रः",
    ruleId: "visarga-sa",
    left: {
      id: "ramah-left-chatra",
      devanagari: "रामः",
    },
    right: {
      id: "chatrah-right-rama",
      devanagari: "छात्रः",
    },
    nimitta: VISARGA_SATVA_NIMITTA,
  }),
  createSimpleEntry({
    id: "duryodhanastada",
    devanagari: "दुर्योधनस्तदा",
    ruleId: "visarga-sa",
    left: {
      id: "duryodhanah-left",
      devanagari: "दुर्योधनः",
    },
    right: {
      id: "tada-right-duryodhana",
      devanagari: "तदा",
    },
    nimitta: VISARGA_SATVA_NIMITTA,
  }),
  createSimpleEntry({
    id: "payashshitalam",
    devanagari: "पयश्शीतलम्",
    ruleId: "visarga-sa",
    left: {
      id: "payah-left",
      devanagari: "पयः",
    },
    right: {
      id: "shitalam-right",
      devanagari: "शीतलम्",
    },
    nimitta: VISARGA_SATVA_NIMITTA,
    note: {
      en: "The textbook also shows the optional payaḥśītalam form; here the transformed form is chosen for practice.",
      sa: "ग्रन्थे पयःशीतलम् इति विकल्परूपमपि दर्शितम्; अत्र अभ्यासाय परिवर्तितरूपं गृह्यते।",
      te: "పిడిఎఫ్‌లో పయఃశీతలం అనే ఐచ్ఛిక రూపం కూడా ఉంది; ఇక్కడ అభ్యాసం కోసం మారిన రూపాన్ని తీసుకున్నాం.",
    },
  }),
  createSimpleEntry({
    id: "vishnustrata",
    devanagari: "विष्णुस्त्राता",
    ruleId: "visarga-sa",
    left: {
      id: "vishnuh-left",
      devanagari: "विष्णुः",
    },
    right: {
      id: "trata-right",
      devanagari: "त्राता",
    },
    nimitta: VISARGA_SATVA_NIMITTA,
  }),
  createSimpleEntry({
    id: "harishshete",
    devanagari: "हरिश्शेते",
    ruleId: "visarga-sa",
    left: {
      id: "harih-left-shete",
      devanagari: "हरिः",
    },
    right: {
      id: "shete-right",
      devanagari: "शेते",
    },
    nimitta: VISARGA_SATVA_NIMITTA,
  }),
  createSimpleEntry({
    id: "munirucyate",
    devanagari: "मुनिरुच्यते",
    ruleId: "visarga-repha",
    left: {
      id: "munih-left",
      devanagari: "मुनिः",
    },
    right: {
      id: "ucyate-right",
      devanagari: "उच्यते",
    },
    nimitta: VISARGA_REPHA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  }),
  createSimpleEntry({
    id: "abhimanyurikshate",
    devanagari: "अभिमन्युरीक्षते",
    ruleId: "visarga-repha",
    left: {
      id: "abhimanyuh-left",
      devanagari: "अभिमन्युः",
    },
    right: {
      id: "ikshate-right",
      devanagari: "ईक्षते",
    },
    nimitta: VISARGA_REPHA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  }),
  createSimpleEntry({
    id: "dosairetaih",
    devanagari: "दोषैरेतैः",
    ruleId: "visarga-repha",
    left: {
      id: "doshaih-left",
      devanagari: "दोषैः",
    },
    right: {
      id: "etaih-right",
      devanagari: "एतैः",
    },
    nimitta: VISARGA_REPHA_NIMITTA,
  }),
  createSimpleEntry({
    id: "bahirantah",
    devanagari: "बहिरन्तः",
    ruleId: "visarga-repha",
    left: {
      id: "bahih-left",
      devanagari: "बहिः",
    },
    right: {
      id: "antah-right",
      devanagari: "अन्तः",
    },
    nimitta: VISARGA_REPHA_NIMITTA,
  }),
  createSimpleEntry({
    id: "punaratra",
    devanagari: "पुनरत्र",
    ruleId: "visarga-repha",
    left: {
      id: "punah-left",
      devanagari: "पुनः",
    },
    right: {
      id: "atra-right",
      devanagari: "अत्र",
    },
    nimitta: VISARGA_REPHA_NIMITTA,
  }),
  createSimpleEntry({
    id: "pratargacchati",
    devanagari: "प्रातर्गच्छति",
    ruleId: "visarga-repha",
    left: {
      id: "pratah-left",
      devanagari: "प्रातः",
    },
    right: {
      id: "gacchati-right",
      devanagari: "गच्छति",
    },
    nimitta: VISARGA_REPHA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  }),
  createSimpleEntry({
    id: "devayapi",
    devanagari: "देवायपि",
    ruleId: "visarga-lopa",
    left: {
      id: "devah-left-api",
      devanagari: "देवाः",
    },
    right: {
      id: "api-right",
      devanagari: "अपि",
    },
    nimitta: VISARGA_LOPA_NIMITTA,
    note: {
      en: "The PDF also teaches देवा अपि as a prakṛtibhāva-style option. This entry uses the joined y-form for gameplay.",
      sa: "ग्रन्थे देवा अपि इति प्रकृतिभावरूपमपि दर्शितम्। अत्र क्रीडायै यकारयुक्तं संयुक्तरूपं स्वीकृतम्।",
      te: "పిడిఎఫ్‌లో దేవా అపి అనే ప్రకృతిభావ రూపం కూడా ఉంది. గేమ్‌లో అభ్యాసం కోసం ఇక్కడ యకారంతో కూడిన సంయుక్తరూపాన్ని తీసుకున్నాం.",
    },
  }),
  createSimpleEntry({
    id: "eshayagacchati",
    devanagari: "एषयागच्छति",
    ruleId: "visarga-lopa",
    left: {
      id: "eshah-left-agacchati",
      devanagari: "एषः",
    },
    right: {
      id: "agacchati-right",
      devanagari: "आगच्छति",
    },
    nimitta: VISARGA_LOPA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  }),
  createSimpleEntry({
    id: "sayucyate",
    devanagari: "सयुच्यते",
    ruleId: "visarga-lopa",
    left: {
      id: "sah-left-ucyate",
      devanagari: "सः",
    },
    right: {
      id: "ucyate-right-lopa",
      devanagari: "उच्यते",
    },
    nimitta: VISARGA_LOPA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  }),
  createSimpleEntry({
    id: "sayeva",
    devanagari: "सयेव",
    ruleId: "visarga-lopa",
    left: {
      id: "sah-left-eva",
      devanagari: "सः",
    },
    right: {
      id: "eva-right-lopa",
      devanagari: "एव",
    },
    nimitta: VISARGA_LOPA_NIMITTA,
  }),
  createSimpleEntry({
    id: "kaviracayati",
    devanagari: "कवीरचयति",
    ruleId: "visarga-lopa",
    left: {
      id: "kavih-left",
      devanagari: "कविः",
    },
    right: {
      id: "racayati-right",
      devanagari: "रचयति",
    },
    nimitta: VISARGA_LOPA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  }),
  createSimpleEntry({
    id: "bhanurajate",
    devanagari: "भानूराजते",
    ruleId: "visarga-lopa",
    left: {
      id: "bhanuh-left",
      devanagari: "भानुः",
    },
    right: {
      id: "rajate-right",
      devanagari: "राजते",
    },
    nimitta: VISARGA_LOPA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  }),
  createSimpleEntry({
    id: "punaramate",
    devanagari: "पुनारमते",
    ruleId: "visarga-lopa",
    left: {
      id: "punah-left-ramate",
      devanagari: "पुनः",
    },
    right: {
      id: "ramate-right",
      devanagari: "रमते",
    },
    nimitta: VISARGA_LOPA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  }),
  createSimpleEntry({
    id: "hrishikeshogudakeshena",
    devanagari: "हृषीकेशोगुडाकेशेन",
    ruleId: "visarga-o",
    left: {
      id: "hrishikeshah-left",
      devanagari: "हृषीकेशः",
    },
    right: {
      id: "gudakeshena-right",
      devanagari: "गुडाकेशेन",
    },
    nimitta: VISARGA_OTVA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  }),
  createSimpleEntry({
    id: "nojayeyuh",
    devanagari: "नोजयेयुः",
    ruleId: "visarga-o",
    left: {
      id: "nah-left",
      devanagari: "नः",
    },
    right: {
      id: "jayeyuh-right",
      devanagari: "जयेयुः",
    },
    nimitta: VISARGA_OTVA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  }),
  createSimpleEntry({
    id: "ghoshodhritarashtranam",
    devanagari: "घोषोधृतराष्ट्राणाम्",
    ruleId: "visarga-o",
    left: {
      id: "ghoshah-left",
      devanagari: "घोषः",
    },
    right: {
      id: "dhritarashtranam-right",
      devanagari: "धृतराष्ट्राणाम्",
    },
    nimitta: VISARGA_OTVA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  }),
  createSimpleEntry({
    id: "vasobhavati",
    devanagari: "वासोभवति",
    ruleId: "visarga-o",
    left: {
      id: "vasah-left",
      devanagari: "वासः",
    },
    right: {
      id: "bhavati-right",
      devanagari: "भवति",
    },
    nimitta: VISARGA_OTVA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  }),
  createSimpleEntry({
    id: "kuntiputroyudhishthirah",
    devanagari: "कुन्तीपुत्रोयुधिष्ठिरः",
    ruleId: "visarga-o",
    left: {
      id: "kuntiputrah-left",
      devanagari: "कुन्तीपुत्रः",
    },
    right: {
      id: "yudhishthirah-right",
      devanagari: "युधिष्ठिरः",
    },
    nimitta: VISARGA_OTVA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  }),
  createSimpleEntry({
    id: "shivovandyah",
    devanagari: "शिवोवन्द्यः",
    ruleId: "visarga-o",
    left: {
      id: "shivah-left",
      devanagari: "शिवः",
    },
    right: {
      id: "vandyah-right",
      devanagari: "वन्द्यः",
    },
    nimitta: VISARGA_OTVA_NIMITTA,
  }),
];

const SVARA_BULK_PDF_CONFIGS: SimpleEntryConfig[] = [
  {
    id: "kvapi",
    devanagari: "क्वापि",
    ruleId: "savarna-dirgha",
    left: { id: "kva-left", devanagari: "क्व" },
    right: { id: "api-right-kvapi", devanagari: "अपि" },
  },
  {
    id: "bhavabdhih",
    devanagari: "भवाब्धिः",
    ruleId: "savarna-dirgha",
    left: { id: "bhava-left", devanagari: "भव" },
    right: { id: "abdhih-right", devanagari: "अब्धिः" },
  },
  {
    id: "tavapi",
    devanagari: "तवापि",
    ruleId: "savarna-dirgha",
    left: { id: "tava-left", devanagari: "तव" },
    right: { id: "api-right-tavapi", devanagari: "अपि" },
  },
  {
    id: "murarih",
    devanagari: "मुरारिः",
    ruleId: "savarna-dirgha",
    left: { id: "mura-left", devanagari: "मुर" },
    right: { id: "arih-right-mura", devanagari: "अरिः" },
  },
  {
    id: "daityarih",
    devanagari: "दैत्यारिः",
    ruleId: "savarna-dirgha",
    left: { id: "daitya-left", devanagari: "दैत्य" },
    right: { id: "arih-right-daitya", devanagari: "अरिः" },
  },
  {
    id: "sukhantah",
    devanagari: "सुखान्तः",
    ruleId: "savarna-dirgha",
    left: { id: "sukha-left", devanagari: "सुख" },
    right: { id: "antah-right-sukha", devanagari: "अन्तः" },
  },
  {
    id: "jayajayau",
    devanagari: "जयाजयौ",
    ruleId: "savarna-dirgha",
    left: { id: "jaya-left", devanagari: "जय" },
    right: { id: "ajayau-right", devanagari: "अजयौ" },
  },
  {
    id: "ekanvayah",
    devanagari: "एकान्वयः",
    ruleId: "savarna-dirgha",
    left: { id: "eka-left", devanagari: "एक" },
    right: { id: "anvayah-right", devanagari: "अन्वयः" },
  },
  {
    id: "dinankah",
    devanagari: "दिनाङ्कः",
    ruleId: "savarna-dirgha",
    left: { id: "dina-left", devanagari: "दिन" },
    right: { id: "ankah-right", devanagari: "अङ्कः" },
  },
  {
    id: "krishnarpitah",
    devanagari: "कृष्णार्पितः",
    ruleId: "savarna-dirgha",
    left: { id: "krishna-left", devanagari: "कृष्ण" },
    right: { id: "arpitah-right", devanagari: "अर्पितः" },
  },
  {
    id: "labhalabhau",
    devanagari: "लाभालाभौ",
    ruleId: "savarna-dirgha",
    left: { id: "labha-left", devanagari: "लाभ" },
    right: { id: "alabhau-right", devanagari: "अलाभौ" },
  },
  {
    id: "paramanandah",
    devanagari: "परमानन्दः",
    ruleId: "savarna-dirgha",
    left: { id: "parama-left", devanagari: "परम" },
    right: { id: "anandah-right", devanagari: "आनन्दः" },
  },
  {
    id: "ratnakarah",
    devanagari: "रत्नाकरः",
    ruleId: "savarna-dirgha",
    left: { id: "ratna-left", devanagari: "रत्न" },
    right: { id: "akarah-right", devanagari: "आकरः" },
  },
  {
    id: "mamajna",
    devanagari: "ममाज्ञा",
    ruleId: "savarna-dirgha",
    left: { id: "mama-left", devanagari: "मम" },
    right: { id: "ajna-right-mama", devanagari: "आज्ञा" },
  },
  {
    id: "vidyanandah",
    devanagari: "विद्यानन्दः",
    ruleId: "savarna-dirgha",
    left: { id: "vidya-left", devanagari: "विद्या" },
    right: { id: "anandah-right-vidya", devanagari: "आनन्दः" },
  },
  {
    id: "vindhyacalah",
    devanagari: "विन्ध्याचलः",
    ruleId: "savarna-dirgha",
    left: { id: "vindhya-left", devanagari: "विन्ध्य" },
    right: { id: "acalah-right", devanagari: "अचलः" },
  },
  {
    id: "bhojanalayah",
    devanagari: "भोजनालयः",
    ruleId: "savarna-dirgha",
    left: { id: "bhojana-left", devanagari: "भोजन" },
    right: { id: "alaya-right-bhojana", devanagari: "आलयः" },
  },
  {
    id: "ravindrah",
    devanagari: "रवीन्द्रः",
    ruleId: "savarna-dirgha",
    left: { id: "ravi-left", devanagari: "रवि" },
    right: { id: "indra-right-ravi", devanagari: "इन्द्रः" },
  },
  {
    id: "muniindrah",
    devanagari: "मुनीन्द्रः",
    ruleId: "savarna-dirgha",
    left: { id: "muni-left", devanagari: "मुनि" },
    right: { id: "indra-right-muni", devanagari: "इन्द्रः" },
  },
  {
    id: "mahiishah",
    devanagari: "महीशः",
    ruleId: "savarna-dirgha",
    left: { id: "mahi-left", devanagari: "मही" },
    right: { id: "isha-right-mahi", devanagari: "ईशः" },
  },
  {
    id: "nadiishah",
    devanagari: "नदीशः",
    ruleId: "savarna-dirgha",
    left: { id: "nadi-left", devanagari: "नदी" },
    right: { id: "isha-right-nadi", devanagari: "ईशः" },
  },
  {
    id: "bhanudayah",
    devanagari: "भानूदयः",
    ruleId: "savarna-dirgha",
    left: { id: "bhanu-left", devanagari: "भानु" },
    right: { id: "udayah-right-bhanu", devanagari: "उदयः" },
  },
  {
    id: "vadhutsavah",
    devanagari: "वधूत्सवः",
    ruleId: "savarna-dirgha",
    left: { id: "vadhu-left", devanagari: "वधू" },
    right: { id: "utsavah-right-vadhu", devanagari: "उत्सवः" },
  },
  {
    id: "hotrkarah",
    devanagari: "होतॄकारः",
    ruleId: "savarna-dirgha",
    left: { id: "hotr-left", devanagari: "होतृ" },
    right: { id: "rkarah-right", devanagari: "ऋकारः" },
  },
  {
    id: "surendrah",
    devanagari: "सुरेन्द्रः",
    ruleId: "guna",
    left: { id: "sura-left", devanagari: "सुर" },
    right: { id: "indra-right-sura", devanagari: "इन्द्रः" },
    nimitta: GUNA_NIMITTA,
  },
  {
    id: "mahendrah",
    devanagari: "महेन्द्रः",
    ruleId: "guna",
    left: { id: "maha-left-indra", devanagari: "महा" },
    right: { id: "indra-right-maha", devanagari: "इन्द्रः" },
    nimitta: GUNA_NIMITTA,
  },
  {
    id: "varshikotsavah",
    devanagari: "वार्षिकोत्सवः",
    ruleId: "guna",
    left: { id: "varshika-left", devanagari: "वार्षिक" },
    right: { id: "utsavah-right-varshika", devanagari: "उत्सवः" },
    nimitta: GUNA_NIMITTA,
  },
  {
    id: "suryodayah",
    devanagari: "सूर्योदयः",
    ruleId: "guna",
    left: { id: "surya-left", devanagari: "सूर्य" },
    right: { id: "udayah-right-surya", devanagari: "उदयः" },
    nimitta: GUNA_NIMITTA,
  },
  {
    id: "candrodayah",
    devanagari: "चन्द्रोदयः",
    ruleId: "guna",
    left: { id: "candra-left", devanagari: "चन्द्र" },
    right: { id: "udayah-right-candra", devanagari: "उदयः" },
    nimitta: GUNA_NIMITTA,
  },
  {
    id: "gangodakam",
    devanagari: "गङ्गोदकम्",
    ruleId: "guna",
    left: { id: "ganga-left", devanagari: "गङ्गा" },
    right: { id: "udakam-right", devanagari: "उदकम्" },
    nimitta: GUNA_NIMITTA,
  },
  {
    id: "sahodarah",
    devanagari: "सहोदरः",
    ruleId: "guna",
    left: { id: "saha-left", devanagari: "सह" },
    right: { id: "udarah-right", devanagari: "उदरः" },
    nimitta: GUNA_NIMITTA,
  },
  {
    id: "saptarshih",
    devanagari: "सप्तर्षिः",
    ruleId: "guna",
    left: { id: "sapta-left", devanagari: "सप्त" },
    right: { id: "rshih-right-sapta", devanagari: "ऋषिः" },
    nimitta: GUNA_NIMITTA,
  },
  {
    id: "upendrah",
    devanagari: "उपेन्द्रः",
    ruleId: "guna",
    left: { id: "upa-left-indra", devanagari: "उप" },
    right: { id: "indra-right-upa", devanagari: "इन्द्रः" },
    nimitta: GUNA_NIMITTA,
  },
  {
    id: "dharmeshah",
    devanagari: "धर्मेशः",
    ruleId: "guna",
    left: { id: "dharma-left", devanagari: "धर्म" },
    right: { id: "isha-right-dharma", devanagari: "ईशः" },
    nimitta: GUNA_NIMITTA,
  },
  {
    id: "atraiva",
    devanagari: "अत्रैव",
    ruleId: "vrddhi",
    left: { id: "atra-left", devanagari: "अत्र" },
    right: { id: "eva-right-atra", devanagari: "एव" },
    nimitta: VRDDHI_NIMITTA,
  },
  {
    id: "adyaiva",
    devanagari: "अद्यैव",
    ruleId: "vrddhi",
    left: { id: "adya-left", devanagari: "अद्य" },
    right: { id: "eva-right-adya", devanagari: "एव" },
    nimitta: VRDDHI_NIMITTA,
  },
  {
    id: "mahaishvaryam",
    devanagari: "महैश्वर्यम्",
    ruleId: "vrddhi",
    left: { id: "maha-left-aishvarya", devanagari: "महा" },
    right: { id: "aishvaryam-right-maha", devanagari: "ऐश्वर्यम्" },
    nimitta: VRDDHI_NIMITTA,
  },
  {
    id: "devaishvaryam",
    devanagari: "देवैश्वर्यम्",
    ruleId: "vrddhi",
    left: { id: "deva-left-aishvarya", devanagari: "देव" },
    right: { id: "aishvaryam-right-deva", devanagari: "ऐश्वर्यम्" },
    nimitta: VRDDHI_NIMITTA,
  },
  {
    id: "gudaudanam",
    devanagari: "गुडौदनम्",
    ruleId: "vrddhi",
    left: { id: "guda-left", devanagari: "गुड" },
    right: { id: "odanam-right", devanagari: "ओदनम्" },
    nimitta: VRDDHI_NIMITTA,
  },
  {
    id: "saisha",
    devanagari: "सैषा",
    ruleId: "vrddhi",
    left: { id: "sa-left", devanagari: "सा" },
    right: { id: "esha-right-sa", devanagari: "एषा" },
    nimitta: VRDDHI_NIMITTA,
  },
  {
    id: "prarthanaisha",
    devanagari: "प्रार्थनैषा",
    ruleId: "vrddhi",
    left: { id: "prarthana-left", devanagari: "प्रार्थना" },
    right: { id: "esha-right-prarthana", devanagari: "एषा" },
    nimitta: VRDDHI_NIMITTA,
  },
  {
    id: "devaudaryam",
    devanagari: "देवौदार्यम्",
    ruleId: "vrddhi",
    left: { id: "deva-left-audarya", devanagari: "देव" },
    right: { id: "audaryam-right-deva", devanagari: "औदार्यम्" },
    nimitta: VRDDHI_NIMITTA,
  },
  {
    id: "mahaushadhih",
    devanagari: "महौषधिः",
    ruleId: "vrddhi",
    left: { id: "maha-left-oshadhi", devanagari: "महा" },
    right: { id: "oshadhih-right", devanagari: "ओषधिः" },
    nimitta: VRDDHI_NIMITTA,
  },
  {
    id: "upaiti",
    devanagari: "उपैति",
    ruleId: "vrddhi",
    left: { id: "upa-left-eti", devanagari: "उप" },
    right: { id: "eti-right", devanagari: "एति" },
    nimitta: VRDDHI_NIMITTA,
    note: {
      en: "The textbook lists this as the vṛddhi exception to pararūpa.",
      sa: "ग्रन्थे एषः पररूपस्य अपवादरूपेण वृद्धिसन्धिः इति दर्शितः।",
      te: "పుస్తకంలో ఇది పరరూపానికి అపవాదంగా వచ్చిన వృద్ధి సంధి ఉదాహరణగా చూపబడింది.",
    },
  },
  {
    id: "praidhate",
    devanagari: "प्रैधते",
    ruleId: "vrddhi",
    left: { id: "pra-left-edhate", devanagari: "प्र" },
    right: { id: "edhate-right", devanagari: "एधते" },
    nimitta: VRDDHI_NIMITTA,
    note: {
      en: "The textbook lists this as the vṛddhi exception to pararūpa.",
      sa: "ग्रन्थे एषः पररूपस्य अपवादरूपेण वृद्धिसन्धिः इति दर्शितः।",
      te: "పుస్తకంలో ఇది పరరూపానికి అపవాదంగా వచ్చిన వృద్ధి సంధి ఉదాహరణగా చూపబడింది.",
    },
  },
  {
    id: "bharatiyaikyam",
    devanagari: "भारतीयैक्यम्",
    ruleId: "vrddhi",
    left: { id: "bharatiya-left", devanagari: "भारतीय" },
    right: { id: "aikyam-right-bharatiya", devanagari: "ऐक्यम्" },
    nimitta: VRDDHI_NIMITTA,
  },
  {
    id: "mataikatvam",
    devanagari: "मतैकत्वम्",
    ruleId: "vrddhi",
    left: { id: "mata-left", devanagari: "मत" },
    right: { id: "ekatvam-right", devanagari: "एकत्वम्" },
    nimitta: VRDDHI_NIMITTA,
  },
  {
    id: "krishnaikyam",
    devanagari: "कृष्णैक्यम्",
    ruleId: "vrddhi",
    left: { id: "krishna-left-aikya", devanagari: "कृष्ण" },
    right: { id: "aikyam-right-krishna", devanagari: "ऐक्यम्" },
    nimitta: VRDDHI_NIMITTA,
  },
  {
    id: "yadyapi",
    devanagari: "यद्यपि",
    ruleId: "yan",
    left: { id: "yadi-left", devanagari: "यदि" },
    right: { id: "api-right-yadi", devanagari: "अपि" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "nadyakritih",
    devanagari: "नद्याकृतिः",
    ruleId: "yan",
    left: { id: "nadi-left-akriti", devanagari: "नदी" },
    right: { id: "akritih-right", devanagari: "आकृतिः" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "ityucuh",
    devanagari: "इत्यूचुः",
    ruleId: "yan",
    left: { id: "iti-left-ucuh", devanagari: "इति" },
    right: { id: "ucuh-right", devanagari: "ऊचुः" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "sudhyupasyah",
    devanagari: "सुध्युपास्यः",
    ruleId: "yan",
    left: { id: "sudhi-left", devanagari: "सुधी" },
    right: { id: "upasyah-right", devanagari: "उपास्यः" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "munyaiakyam",
    devanagari: "मुन्यैक्यम्",
    ruleId: "yan",
    left: { id: "muni-left-aikya", devanagari: "मुनि" },
    right: { id: "aikyam-right-muni", devanagari: "ऐक्यम्" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "pratyupakarah",
    devanagari: "प्रत्युपकारः",
    ruleId: "yan",
    left: { id: "prati-left-upakara", devanagari: "प्रति" },
    right: { id: "upakarah-right", devanagari: "उपकारः" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "ityrshih",
    devanagari: "इत्यृषिः",
    ruleId: "yan",
    left: { id: "iti-left-rshi", devanagari: "इति" },
    right: { id: "rshih-right-iti", devanagari: "ऋषिः" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "nadyatra",
    devanagari: "नद्यत्र",
    ruleId: "yan",
    left: { id: "nadi-left-atra", devanagari: "नदी" },
    right: { id: "atra-right-nadi", devanagari: "अत्र" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "ityadi",
    devanagari: "इत्यादि",
    ruleId: "yan",
    left: { id: "iti-left-adi", devanagari: "इति" },
    right: { id: "adi-right", devanagari: "आदि" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "devyrddhih",
    devanagari: "देव्यृद्धिः",
    ruleId: "yan",
    left: { id: "devi-left-rddhi", devanagari: "देवी" },
    right: { id: "rddhih-right", devanagari: "ऋद्धिः" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "mahatyeshana",
    devanagari: "महत्येषणा",
    ruleId: "yan",
    left: { id: "mahati-left", devanagari: "महती" },
    right: { id: "eshana-right", devanagari: "एषणा" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "ityuvaca",
    devanagari: "इत्युवाच",
    ruleId: "yan",
    left: { id: "iti-left-uvaca", devanagari: "इति" },
    right: { id: "uvaca-right", devanagari: "उवाच" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "nadyudakam",
    devanagari: "नद्युदकम्",
    ruleId: "yan",
    left: { id: "nadi-left-udakam", devanagari: "नदी" },
    right: { id: "udakam-right-nadi", devanagari: "उदकम्" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "nastyudyamah",
    devanagari: "नास्त्युद्यमः",
    ruleId: "yan",
    left: { id: "nasti-left", devanagari: "नास्ति" },
    right: { id: "udyamah-right", devanagari: "उद्यमः" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "gurvadeshah",
    devanagari: "गुर्वादेशः",
    ruleId: "yan",
    left: { id: "guru-left-adesha", devanagari: "गुरु" },
    right: { id: "adeshah-right-guru", devanagari: "आदेशः" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "gurvrddhih",
    devanagari: "गुर्वृद्धिः",
    ruleId: "yan",
    left: { id: "guru-left-rddhi", devanagari: "गुरु" },
    right: { id: "rddhih-right-guru", devanagari: "ऋद्धिः" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "dhenvaikyam",
    devanagari: "धेन्वैक्यम्",
    ruleId: "yan",
    left: { id: "dhenu-left-aikya", devanagari: "धेनु" },
    right: { id: "aikyam-right-dhenu", devanagari: "ऐक्यम्" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "sindhvoghah",
    devanagari: "सिन्ध्वोघः",
    ruleId: "yan",
    left: { id: "sindhu-left", devanagari: "सिन्धु" },
    right: { id: "oghah-right-sindhu", devanagari: "ओघः" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "vadhvajna",
    devanagari: "वध्वाज्ञा",
    ruleId: "yan",
    left: { id: "vadhu-left-ajna", devanagari: "वधू" },
    right: { id: "ajna-right-vadhu", devanagari: "आज्ञा" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "madhvasti",
    devanagari: "मध्वस्ति",
    ruleId: "yan",
    left: { id: "madhu-left-asti", devanagari: "मधु" },
    right: { id: "asti-right-madhu", devanagari: "अस्ति" },
    nimitta: YAN_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  },
  {
    id: "svaha",
    devanagari: "स्वाहा",
    ruleId: "yan",
    left: { id: "su-left", devanagari: "सु" },
    right: { id: "aha-right", devanagari: "आह" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "madhvarih",
    devanagari: "मध्वरिः",
    ruleId: "yan",
    left: { id: "madhu-left-ari", devanagari: "मधु" },
    right: { id: "arih-right-madhu", devanagari: "अरिः" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "matraishvaryam",
    devanagari: "मात्रैश्वर्यम्",
    ruleId: "yan",
    left: { id: "matr-left-ai", devanagari: "मातृ" },
    right: { id: "aishvaryam-right-matr", devanagari: "ऐश्वर्यम्" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "pitrojah",
    devanagari: "पित्रोजः",
    ruleId: "yan",
    left: { id: "pitr-left-ojas", devanagari: "पितृ" },
    right: { id: "ojas-right", devanagari: "ओजः" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "datraudaryam",
    devanagari: "दात्रौदार्यम्",
    ruleId: "yan",
    left: { id: "datr-left-au", devanagari: "दातृ" },
    right: { id: "audaryam-right-datr", devanagari: "औदार्यम्" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "matradhikarah",
    devanagari: "मात्राधिकारः",
    ruleId: "yan",
    left: { id: "matr-left-adhikara", devanagari: "मातृ" },
    right: { id: "adhikarah-right", devanagari: "अधिकारः" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "pitradeshah",
    devanagari: "पित्रादेशः",
    ruleId: "yan",
    left: { id: "pitr-left-adesha", devanagari: "पितृ" },
    right: { id: "adeshah-right-pitr", devanagari: "आदेशः" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "pitrajna",
    devanagari: "पित्राज्ञा",
    ruleId: "yan",
    left: { id: "pitr-left-ajna", devanagari: "पितृ" },
    right: { id: "ajna-right-pitr", devanagari: "आज्ञा" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "bhratrekata",
    devanagari: "भ्रात्रेकता",
    ruleId: "yan",
    left: { id: "bhratr-left", devanagari: "भ्रातृ" },
    right: { id: "ekata-right", devanagari: "एकता" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "datrishah",
    devanagari: "दात्रीशः",
    ruleId: "yan",
    left: { id: "datr-left-isha", devanagari: "दातृ" },
    right: { id: "isha-right-datr", devanagari: "ईशः" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "pitrupadeshah",
    devanagari: "पित्रुपदेशः",
    ruleId: "yan",
    left: { id: "pitr-left-upadesha", devanagari: "पितृ" },
    right: { id: "upadesha-right-pitr", devanagari: "उपदेशः" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "pitreshanam",
    devanagari: "पित्रेषणम्",
    ruleId: "yan",
    left: { id: "pitr-left-eshana", devanagari: "पितृ" },
    right: { id: "eshanam-right-pitr", devanagari: "एषणम्" },
    nimitta: YAN_NIMITTA,
  },
  {
    id: "nayati-bulk",
    devanagari: "नयति",
    ruleId: "ayavayava",
    left: { id: "ne-left-ati", devanagari: "ने" },
    right: { id: "ati-right-ne", devanagari: "अति" },
  },
  {
    id: "cayanam",
    devanagari: "चयनम्",
    ruleId: "ayavayava",
    left: { id: "ce-left", devanagari: "चे" },
    right: { id: "anam-right-ce", devanagari: "अनम्" },
  },
  {
    id: "shayanam",
    devanagari: "शयनम्",
    ruleId: "ayavayava",
    left: { id: "she-left", devanagari: "शे" },
    right: { id: "anam-right-she", devanagari: "अनम्" },
  },
  {
    id: "vishnave-bulk",
    devanagari: "विष्णवे",
    ruleId: "ayavayava",
    left: { id: "vishno-left", devanagari: "विष्णो" },
    right: { id: "e-right-vishno", devanagari: "ए" },
  },
  {
    id: "bhavanam",
    devanagari: "भवनम्",
    ruleId: "ayavayava",
    left: { id: "bho-left", devanagari: "भो" },
    right: { id: "anam-right-bho", devanagari: "अनम्" },
  },
  {
    id: "bhavati-ayava",
    devanagari: "भवति",
    ruleId: "ayavayava",
    left: { id: "bho-left-ati", devanagari: "भो" },
    right: { id: "ati-right-bho", devanagari: "अति" },
  },
  {
    id: "raye",
    devanagari: "राये",
    ruleId: "ayavayava",
    left: { id: "rai-left", devanagari: "रै" },
    right: { id: "e-right-rai", devanagari: "ए" },
  },
  {
    id: "glayati",
    devanagari: "ग्लायति",
    ruleId: "ayavayava",
    left: { id: "glai-left", devanagari: "ग्लै" },
    right: { id: "ati-right-glai", devanagari: "अति" },
  },
  {
    id: "jnayate",
    devanagari: "ज्ञायते",
    ruleId: "ayavayava",
    left: { id: "jnai-left", devanagari: "ज्ञै" },
    right: { id: "ate-right-jnai", devanagari: "अते" },
  },
  {
    id: "rayoh",
    devanagari: "रायोः",
    ruleId: "ayavayava",
    left: { id: "rai-left-oh", devanagari: "रै" },
    right: { id: "oh-right", devanagari: "ओः" },
  },
  {
    id: "navikah",
    devanagari: "नाविकः",
    ruleId: "ayavayava",
    left: { id: "nau-left", devanagari: "नौ" },
    right: { id: "ikah-right", devanagari: "इकः" },
  },
  {
    id: "nave",
    devanagari: "नावे",
    ruleId: "ayavayava",
    left: { id: "nau-left-e", devanagari: "नौ" },
    right: { id: "e-right-nau", devanagari: "ए" },
  },
  {
    id: "dvavimau",
    devanagari: "द्वाविमौ",
    ruleId: "ayavayava",
    left: { id: "dvau-left", devanagari: "द्वौ" },
    right: { id: "imau-right", devanagari: "इमौ" },
  },
  {
    id: "gurortra",
    devanagari: "गुरोऽत्र",
    ruleId: "purvarupa",
    left: { id: "guro-left", devanagari: "गुरो" },
    right: { id: "atra-right-guro", devanagari: "अत्र" },
    nimitta: PURVARUPA_NIMITTA,
    note: {
      en: "The avagraha marks the dropped initial a of the second word.",
      sa: "अवग्रहचिह्नं परपदस्य लुप्तं प्रारम्भिकम् अकारं सूचयति।",
      te: "అవగ్రహం రెండో పదం ప్రారంభ అ లోపాన్ని చూపిస్తుంది.",
    },
  },
  {
    id: "vishnortra",
    devanagari: "विष्णोऽत्र",
    ruleId: "purvarupa",
    left: { id: "vishno-left", devanagari: "विष्णो" },
    right: { id: "atra-right-vishno", devanagari: "अत्र" },
    nimitta: PURVARUPA_NIMITTA,
    note: {
      en: "The avagraha marks the dropped initial a of the second word.",
      sa: "अवग्रहचिह्नं परपदस्य लुप्तं प्रारम्भिकम् अकारं सूचयति।",
      te: "అవగ్రహం రెండో పదం ప్రారంభ అ లోపాన్ని చూపిస్తుంది.",
    },
  },
  {
    id: "bhoyam",
    devanagari: "भोऽयम्",
    ruleId: "purvarupa",
    left: { id: "bho-left-ayam", devanagari: "भो" },
    right: { id: "ayam-right-bho", devanagari: "अयम्" },
    nimitta: PURVARUPA_NIMITTA,
    note: {
      en: "The avagraha marks the dropped initial a of the second word.",
      sa: "अवग्रहचिह्नं परपदस्य लुप्तं प्रारम्भिकम् अकारं सूचयति।",
      te: "అవగ్రహం రెండో పదం ప్రారంభ అ లోపాన్ని చూపిస్తుంది.",
    },
  },
  {
    id: "bhotra",
    devanagari: "भोऽत्र",
    ruleId: "purvarupa",
    left: { id: "bho-left-atra", devanagari: "भो" },
    right: { id: "atra-right-bho", devanagari: "अत्र" },
    nimitta: PURVARUPA_NIMITTA,
    note: {
      en: "The avagraha marks the dropped initial a of the second word.",
      sa: "अवग्रहचिह्नं परपदस्य लुप्तं प्रारम्भिकम् अकारं सूचयति।",
      te: "అవగ్రహం రెండో పదం ప్రారంభ అ లోపాన్ని చూపిస్తుంది.",
    },
  },
  {
    id: "metra",
    devanagari: "मेऽत्र",
    ruleId: "purvarupa",
    left: { id: "me-left-atra", devanagari: "मे" },
    right: { id: "atra-right-me", devanagari: "अत्र" },
    nimitta: PURVARUPA_NIMITTA,
    note: {
      en: "The avagraha marks the dropped initial a of the second word.",
      sa: "अवग्रहचिह्नं परपदस्य लुप्तं प्रारम्भिकम् अकारं सूचयति।",
      te: "అవగ్రహం రెండో పదం ప్రారంభ అ లోపాన్ని చూపిస్తుంది.",
    },
  },
  {
    id: "teatra",
    devanagari: "तेऽत्र",
    ruleId: "purvarupa",
    left: { id: "te-left-atra", devanagari: "ते" },
    right: { id: "atra-right-te", devanagari: "अत्र" },
    nimitta: PURVARUPA_NIMITTA,
    note: {
      en: "The avagraha marks the dropped initial a of the second word.",
      sa: "अवग्रहचिह्नं परपदस्य लुप्तं प्रारम्भिकम् अकारं सूचयति।",
      te: "అవగ్రహం రెండో పదం ప్రారంభ అ లోపాన్ని చూపిస్తుంది.",
    },
  },
  {
    id: "uposhati-bulk",
    devanagari: "उपोषति",
    ruleId: "pararupa",
    left: { id: "upa-left-oshati", devanagari: "उप" },
    right: { id: "oshati-right-bulk", devanagari: "ओषति" },
    nimitta: PARARUPA_NIMITTA,
  },
];

const SVARA_BULK_PDF_ENTRIES = SVARA_BULK_PDF_CONFIGS.map((config) =>
  createSimpleEntry(config),
);

const VYANJANA_BULK_PDF_CONFIGS: SimpleEntryConfig[] = [
  {
    id: "tadatmakam",
    devanagari: "तदात्मकम्",
    ruleId: "jashtva",
    left: { id: "tat-left-atmakam", devanagari: "तत्" },
    right: { id: "atmakam-right", devanagari: "आत्मकम्" },
    nimitta: JASHTVA_NIMITTA,
  },
  {
    id: "syadatmatrptah",
    devanagari: "स्यादात्मतृप्तः",
    ruleId: "jashtva",
    left: { id: "syat-left", devanagari: "स्यात्" },
    right: { id: "atmatrptah-right", devanagari: "आत्मतृप्तः" },
    nimitta: JASHTVA_NIMITTA,
  },
  {
    id: "vagbhushanam",
    devanagari: "वाग्भूषणम्",
    ruleId: "jashtva",
    left: { id: "vak-left-bhushana", devanagari: "वाक्" },
    right: { id: "bhushanam-right", devanagari: "भूषणम्" },
    nimitta: JASHTVA_NIMITTA,
  },
  {
    id: "samyagubhayoh",
    devanagari: "सम्यगुभयोः",
    ruleId: "jashtva",
    left: { id: "samyak-left-ubhaya", devanagari: "सम्यक्" },
    right: { id: "ubhayoh-right", devanagari: "उभयोः" },
    nimitta: JASHTVA_NIMITTA,
  },
  {
    id: "balavaddrdham",
    devanagari: "बलवद्दृढम्",
    ruleId: "jashtva",
    left: { id: "balavat-left", devanagari: "बलवत्" },
    right: { id: "drdham-right", devanagari: "दृढम्" },
    nimitta: JASHTVA_NIMITTA,
  },
  {
    id: "kecidbhitah",
    devanagari: "केचिद्भीताः",
    ruleId: "jashtva",
    left: { id: "kecit-left", devanagari: "केचित्" },
    right: { id: "bhitah-right", devanagari: "भीताः" },
    nimitta: JASHTVA_NIMITTA,
  },
  {
    id: "abdhih",
    devanagari: "अब्धिः",
    ruleId: "jashtva",
    left: { id: "ap-left", devanagari: "अप्" },
    right: { id: "dhih-right", devanagari: "धिः" },
    nimitta: JASHTVA_NIMITTA,
  },
  {
    id: "jagadguruh",
    devanagari: "जगद्गुरुः",
    ruleId: "jashtva",
    left: { id: "jagat-left-guru", devanagari: "जगत्" },
    right: { id: "guruh-right", devanagari: "गुरुः" },
    nimitta: JASHTVA_NIMITTA,
  },
  {
    id: "tadapi",
    devanagari: "तदपि",
    ruleId: "jashtva",
    left: { id: "tat-left-api", devanagari: "तत्" },
    right: { id: "api-right-tat", devanagari: "अपि" },
    nimitta: JASHTVA_NIMITTA,
  },
  {
    id: "mahadidam",
    devanagari: "महदिदम्",
    ruleId: "jashtva",
    left: { id: "mahat-left", devanagari: "महत्" },
    right: { id: "idam-right-mahat", devanagari: "इदम्" },
    nimitta: JASHTVA_NIMITTA,
  },
  {
    id: "prageva",
    devanagari: "प्रागेव",
    ruleId: "jashtva",
    left: { id: "prak-left", devanagari: "प्राक्" },
    right: { id: "eva-right-prak", devanagari: "एव" },
    nimitta: JASHTVA_NIMITTA,
  },
  {
    id: "tavadenam",
    devanagari: "तावदेनम्",
    ruleId: "jashtva",
    left: { id: "tavat-left", devanagari: "तावत्" },
    right: { id: "enam-right", devanagari: "एनम्" },
    nimitta: JASHTVA_NIMITTA,
  },
  {
    id: "samyagabhihitam",
    devanagari: "सम्यगभिहितम्",
    ruleId: "jashtva",
    left: { id: "samyak-left-abhihita", devanagari: "सम्यक्" },
    right: { id: "abhihitam-right", devanagari: "अभिहितम्" },
    nimitta: JASHTVA_NIMITTA,
  },
  {
    id: "vagdevata",
    devanagari: "वाग्देवता",
    ruleId: "jashtva",
    left: { id: "vak-left-devata", devanagari: "वाक्" },
    right: { id: "devata-right", devanagari: "देवता" },
    nimitta: JASHTVA_NIMITTA,
  },
  {
    id: "udgamah",
    devanagari: "उद्गमः",
    ruleId: "jashtva",
    left: { id: "ut-left-gama", devanagari: "उत्" },
    right: { id: "gamah-right", devanagari: "गमः" },
    nimitta: JASHTVA_NIMITTA,
  },
  {
    id: "yavadetan",
    devanagari: "यावदेतान्",
    ruleId: "jashtva",
    left: { id: "yavat-left", devanagari: "यावत्" },
    right: { id: "etan-right", devanagari: "एतान्" },
    nimitta: JASHTVA_NIMITTA,
  },
  {
    id: "krodhadbhavati",
    devanagari: "क्रोधाद्भवति",
    ruleId: "jashtva",
    left: { id: "krodhat-left", devanagari: "क्रोधात्" },
    right: { id: "bhavati-right-krodha", devanagari: "भवति" },
    nimitta: JASHTVA_NIMITTA,
  },
  {
    id: "shatkhaadyani",
    devanagari: "षट्खाद्यानि",
    ruleId: "chartva",
    left: { id: "shad-left-khaadya", devanagari: "षड्" },
    right: { id: "khaadyani-right", devanagari: "खाद्यानि" },
    nimitta: CHARTVA_NIMITTA,
  },
  {
    id: "tadrkkarma",
    devanagari: "तादृक्कर्म",
    ruleId: "chartva",
    left: { id: "tadrig-left", devanagari: "तादृग्" },
    right: { id: "karma-right-tadrig", devanagari: "कर्म" },
    nimitta: CHARTVA_NIMITTA,
  },
  {
    id: "sampatkumarah",
    devanagari: "सम्पत्कुमारः",
    ruleId: "chartva",
    left: { id: "sampad-left-kumara", devanagari: "सम्पद्" },
    right: { id: "kumarah-right", devanagari: "कुमारः" },
    nimitta: CHARTVA_NIMITTA,
  },
  {
    id: "etatparshvam",
    devanagari: "एतत्पार्श्वम्",
    ruleId: "chartva",
    left: { id: "etad-left-parshva", devanagari: "एतद्" },
    right: { id: "parshvam-right", devanagari: "पार्श्वम्" },
    nimitta: CHARTVA_NIMITTA,
  },
  {
    id: "kamadhukkhadati",
    devanagari: "कामधुक्खादति",
    ruleId: "chartva",
    left: { id: "kamadhug-left", devanagari: "कामधुग्" },
    right: { id: "khadati-right", devanagari: "खादति" },
    nimitta: CHARTVA_NIMITTA,
  },
  {
    id: "kakutsthah",
    devanagari: "ककुत्स्थः",
    ruleId: "chartva",
    left: { id: "kakud-left", devanagari: "ककुद्" },
    right: { id: "sthah-right", devanagari: "स्थः" },
    nimitta: CHARTVA_NIMITTA,
  },
  {
    id: "utpatati",
    devanagari: "उत्पतति",
    ruleId: "chartva",
    left: { id: "ud-left-patati", devanagari: "उद्" },
    right: { id: "patati-right", devanagari: "पतति" },
    nimitta: CHARTVA_NIMITTA,
  },
  {
    id: "suhrnmitram",
    devanagari: "सुहृन्मित्रम्",
    ruleId: "anunasika",
    left: { id: "suhrd-left", devanagari: "सुहृद्" },
    right: { id: "mitram-right", devanagari: "मित्रम्" },
    nimitta: ANUNASIKA_NIMITTA,
  },
  {
    id: "tanmatram",
    devanagari: "तन्मात्रम्",
    ruleId: "anunasika",
    left: { id: "tad-left-matra", devanagari: "तद्" },
    right: { id: "matram-right-tad", devanagari: "मात्रम्" },
    nimitta: ANUNASIKA_NIMITTA,
  },
  {
    id: "jagannathah",
    devanagari: "जगन्नाथः",
    ruleId: "anunasika",
    left: { id: "jagat-left-natha", devanagari: "जगत्" },
    right: { id: "nathah-right", devanagari: "नाथः" },
    nimitta: ANUNASIKA_NIMITTA,
  },
  {
    id: "tannama",
    devanagari: "तन्नाम",
    ruleId: "anunasika",
    left: { id: "tat-left-nama", devanagari: "तत्" },
    right: { id: "nama-right", devanagari: "नाम" },
    nimitta: ANUNASIKA_NIMITTA,
  },
  {
    id: "etanninda",
    devanagari: "एतन्निन्दा",
    ruleId: "anunasika",
    left: { id: "etat-left-ninda", devanagari: "एतद्" },
    right: { id: "ninda-right", devanagari: "निन्दा" },
    nimitta: ANUNASIKA_NIMITTA,
  },
  {
    id: "unnayanam",
    devanagari: "उन्नयनम्",
    ruleId: "anunasika",
    left: { id: "ut-left", devanagari: "उत्" },
    right: { id: "nayanam-right", devanagari: "नयनम्" },
    nimitta: ANUNASIKA_NIMITTA,
  },
  {
    id: "shanmukhah",
    devanagari: "षण्मुखः",
    ruleId: "anunasika",
    left: { id: "shad-left-mukha", devanagari: "षड्" },
    right: { id: "mukhah-right", devanagari: "मुखः" },
    nimitta: ANUNASIKA_NIMITTA,
    note: {
      en: "The textbook pattern allows both the nasalized teaching form and the non-nasalized base path; this entry uses the nasalized form.",
      sa: "ग्रन्थपद्धत्या नासिकीभूतं रूपं तथा मूलरूपमार्गश्च उभौ सम्भवतः; अत्र नासिकीभूतः अभ्यासरूपः स्वीकृतः।",
      te: "పుస్తకరీతిలో నాసిక్య రూపం కూడా, మూలరూప మార్గం కూడా చూపవచ్చు; ఇక్కడ నాసిక్యాభ్యాస రూపాన్ని తీసుకున్నాం.",
    },
  },
  {
    id: "tanmangalam",
    devanagari: "तन्मङ्गलम्",
    ruleId: "anunasika",
    left: { id: "tad-left-mangala", devanagari: "तद्" },
    right: { id: "mangalam-right", devanagari: "मङ्गलम्" },
    nimitta: ANUNASIKA_NIMITTA,
  },
  {
    id: "jaganniyamakah",
    devanagari: "जगन्नियामकः",
    ruleId: "anunasika",
    left: { id: "jagad-left-niyamaka", devanagari: "जगद्" },
    right: { id: "niyamakah-right", devanagari: "नियामकः" },
    nimitta: ANUNASIKA_NIMITTA,
  },
  {
    id: "shrimannarayanah",
    devanagari: "श्रीमन्नारायणः",
    ruleId: "anunasika",
    left: { id: "shrimat-left", devanagari: "श्रीमद्" },
    right: { id: "narayanah-right", devanagari: "नारायणः" },
    nimitta: ANUNASIKA_NIMITTA,
  },
  {
    id: "ahankarah",
    devanagari: "अहंकारः",
    ruleId: "anusvara",
    left: { id: "aham-left", devanagari: "अहम्" },
    right: { id: "karah-right", devanagari: "कारः" },
    nimitta: ANUSVARA_NIMITTA,
  },
  {
    id: "sangrahah",
    devanagari: "संग्रहः",
    ruleId: "anusvara",
    left: { id: "sam-left-graha", devanagari: "सम्" },
    right: { id: "grahah-right", devanagari: "ग्रहः" },
    nimitta: ANUSVARA_NIMITTA,
  },
  {
    id: "sankirtanam",
    devanagari: "संकीर्तनम्",
    ruleId: "anusvara",
    left: { id: "sam-left-kirtana", devanagari: "सम्" },
    right: { id: "kirtanam-right", devanagari: "कीर्तनम्" },
    nimitta: ANUSVARA_NIMITTA,
  },
  {
    id: "sambodhanam",
    devanagari: "संबोधनम्",
    ruleId: "anusvara",
    left: { id: "sam-left-bodhana", devanagari: "सम्" },
    right: { id: "bodhanam-right", devanagari: "बोधनम्" },
    nimitta: ANUSVARA_NIMITTA,
  },
  {
    id: "samlagnah",
    devanagari: "संलग्नः",
    ruleId: "anusvara",
    left: { id: "sam-left-lagna", devanagari: "सम्" },
    right: { id: "lagnah-right", devanagari: "लग्नः" },
    nimitta: ANUSVARA_NIMITTA,
  },
  {
    id: "samvedanam",
    devanagari: "संवेदनम्",
    ruleId: "anusvara",
    left: { id: "sam-left-vedana", devanagari: "सम्" },
    right: { id: "vedanam-right", devanagari: "वेदनम्" },
    nimitta: ANUSVARA_NIMITTA,
  },
  {
    id: "samjna",
    devanagari: "संज्ञा",
    ruleId: "anusvara",
    left: { id: "sam-left-jna", devanagari: "सम्" },
    right: { id: "jna-right", devanagari: "ज्ञा" },
    nimitta: ANUSVARA_NIMITTA,
  },
  {
    id: "samhita",
    devanagari: "संहिता",
    ruleId: "anusvara",
    left: { id: "sam-left-hita", devanagari: "सम्" },
    right: { id: "hita-right-anusvara", devanagari: "हिता" },
    nimitta: ANUSVARA_NIMITTA,
  },
  {
    id: "samsargah",
    devanagari: "संसर्गः",
    ruleId: "anusvara",
    left: { id: "sam-left-sarga", devanagari: "सम्" },
    right: { id: "sargah-right", devanagari: "सर्गः" },
    nimitta: ANUSVARA_NIMITTA,
  },
  {
    id: "sambhavah",
    devanagari: "संभवः",
    ruleId: "anusvara",
    left: { id: "sam-left-bhava", devanagari: "सम्" },
    right: { id: "bhavah-right", devanagari: "भवः" },
    nimitta: ANUSVARA_NIMITTA,
  },
  {
    id: "taddharmah",
    devanagari: "तद्धर्मः",
    ruleId: "purvasavarna",
    left: { id: "tad-left-dharma", devanagari: "तद्" },
    right: { id: "dharmah-right", devanagari: "धर्मः" },
    nimitta: PURVASAVARNA_NIMITTA,
  },
  {
    id: "uddhavah",
    devanagari: "उद्धवः",
    ruleId: "purvasavarna",
    left: { id: "ud-left-hava", devanagari: "उद्" },
    right: { id: "havah-right", devanagari: "हवः" },
    nimitta: PURVASAVARNA_NIMITTA,
  },
  {
    id: "sanghitam",
    devanagari: "सङ्गीतम्",
    ruleId: "parasavarna",
    left: { id: "sam-left-gita", devanagari: "सं" },
    right: { id: "gitam-right", devanagari: "गीतम्" },
    nimitta: PARASAVARNA_NIMITTA,
  },
  {
    id: "sanghatah",
    devanagari: "सङ्घातः",
    ruleId: "parasavarna",
    left: { id: "sam-left-ghata", devanagari: "सं" },
    right: { id: "ghatah-right", devanagari: "घातः" },
    nimitta: PARASAVARNA_NIMITTA,
  },
  {
    id: "sancharah",
    devanagari: "सञ्चारः",
    ruleId: "parasavarna",
    left: { id: "sam-left-cara", devanagari: "सं" },
    right: { id: "carah-right", devanagari: "चारः" },
    nimitta: PARASAVARNA_NIMITTA,
  },
  {
    id: "santapah",
    devanagari: "सन्तापः",
    ruleId: "parasavarna",
    left: { id: "sam-left-tapa", devanagari: "सं" },
    right: { id: "tapah-right", devanagari: "तापः" },
    nimitta: PARASAVARNA_NIMITTA,
  },
  {
    id: "sandehah",
    devanagari: "सन्देहः",
    ruleId: "parasavarna",
    left: { id: "sam-left-deha", devanagari: "सं" },
    right: { id: "dehah-right", devanagari: "देहः" },
    nimitta: PARASAVARNA_NIMITTA,
  },
  {
    id: "sampurnam",
    devanagari: "सम्पूर्णम्",
    ruleId: "parasavarna",
    left: { id: "sam-left-purna", devanagari: "सं" },
    right: { id: "purnam-right", devanagari: "पूर्णम्" },
    nimitta: PARASAVARNA_NIMITTA,
  },
  {
    id: "sandarshanam",
    devanagari: "सन्दर्शनम्",
    ruleId: "parasavarna",
    left: { id: "sam-left-darshana", devanagari: "सं" },
    right: { id: "darshanam-right", devanagari: "दर्शनम्" },
    nimitta: PARASAVARNA_NIMITTA,
  },
];

const VYANJANA_BULK_PDF_ENTRIES = VYANJANA_BULK_PDF_CONFIGS.map((config) =>
  createSimpleEntry(config),
);

const VISARGA_BULK_PDF_CONFIGS: SimpleEntryConfig[] = [
  {
    id: "ramashcinoti",
    devanagari: "रामश्चिनोति",
    ruleId: "visarga-sa",
    left: { id: "ramah-left-cinoti", devanagari: "रामः" },
    right: { id: "cinoti-right", devanagari: "चिनोति" },
    nimitta: VISARGA_SATVA_NIMITTA,
  },
  {
    id: "ramashchadati",
    devanagari: "रामश्छदति",
    ruleId: "visarga-sa",
    left: { id: "ramah-left-chadati", devanagari: "रामः" },
    right: { id: "chadati-right", devanagari: "छदति" },
    nimitta: VISARGA_SATVA_NIMITTA,
  },
  {
    id: "ramastarati",
    devanagari: "रामस्तरति",
    ruleId: "visarga-sa",
    left: { id: "ramah-left-tarati", devanagari: "रामः" },
    right: { id: "tarati-right", devanagari: "तरति" },
    nimitta: VISARGA_SATVA_NIMITTA,
  },
  {
    id: "bhaktassevate",
    devanagari: "भक्तस्सेवते",
    ruleId: "visarga-sa",
    left: { id: "bhaktah-left", devanagari: "भक्तः" },
    right: { id: "sevate-right", devanagari: "सेवते" },
    nimitta: VISARGA_SATVA_NIMITTA,
  },
  {
    id: "bhishmashshete",
    devanagari: "भीष्मश्शेते",
    ruleId: "visarga-sa",
    left: { id: "bhishmah-left", devanagari: "भीष्मः" },
    right: { id: "shete-right-bhishma", devanagari: "शेते" },
    nimitta: VISARGA_SATVA_NIMITTA,
  },
  {
    id: "uttamashchatrah",
    devanagari: "उत्तमश्छात्रः",
    ruleId: "visarga-sa",
    left: { id: "uttamah-left", devanagari: "उत्तमः" },
    right: { id: "chatrah-right-uttama", devanagari: "छात्रः" },
    nimitta: VISARGA_SATVA_NIMITTA,
  },
  {
    id: "jnaninastattvadarshinah",
    devanagari: "ज्ञानिनस्तत्त्वदर्शिनः",
    ruleId: "visarga-sa",
    left: { id: "jnaninah-left", devanagari: "ज्ञानिनः" },
    right: { id: "tattvadarshinah-right", devanagari: "तत्त्वदर्शिनः" },
    nimitta: VISARGA_SATVA_NIMITTA,
  },
  {
    id: "karmayogashca",
    devanagari: "कर्मयोगश्च",
    ruleId: "visarga-sa",
    left: { id: "karmayogah-left", devanagari: "कर्मयोगः" },
    right: { id: "ca-right-karmayoga", devanagari: "च" },
    nimitta: VISARGA_SATVA_NIMITTA,
  },
  {
    id: "nirashiraparigrahah",
    devanagari: "निराशीरपरिग्रहः",
    ruleId: "visarga-repha",
    left: { id: "nirashih-left", devanagari: "निराशीः" },
    right: { id: "aparigrahah-right", devanagari: "अपरिग्रहः" },
    nimitta: VISARGA_REPHA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  },
  {
    id: "bandhuratma",
    devanagari: "बन्धुरात्मा",
    ruleId: "visarga-repha",
    left: { id: "bandhuh-left", devanagari: "बन्धुः" },
    right: { id: "atma-right", devanagari: "आत्मा" },
    nimitta: VISARGA_REPHA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  },
  {
    id: "aghayurindriyaramah",
    devanagari: "अघायुरिन्द्रियारामः",
    ruleId: "visarga-repha",
    left: { id: "aghayuh-left", devanagari: "अघायुः" },
    right: { id: "indriyaramah-right", devanagari: "इन्द्रियारामः" },
    nimitta: VISARGA_REPHA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  },
  {
    id: "prakritibhirgunaih",
    devanagari: "प्रकृतिभिर्गुणैः",
    ruleId: "visarga-repha",
    left: { id: "prakritibhih-left", devanagari: "प्रकृतिभिः" },
    right: { id: "gunaih-right", devanagari: "गुणैः" },
    nimitta: VISARGA_REPHA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  },
  {
    id: "tairdattan",
    devanagari: "तैर्दत्तान्",
    ruleId: "visarga-repha",
    left: { id: "taih-left", devanagari: "तैः" },
    right: { id: "dattan-right", devanagari: "दत्तान्" },
    nimitta: VISARGA_REPHA_NIMITTA,
  },
  {
    id: "mrityurdhruvam",
    devanagari: "मृत्युध्रुवम्",
    ruleId: "visarga-repha",
    left: { id: "mrityuh-left", devanagari: "मृत्युः" },
    right: { id: "dhruvam-right", devanagari: "ध्रुवम्" },
    nimitta: VISARGA_REPHA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  },
  {
    id: "havirbrahmagnau",
    devanagari: "हविर्ब्रह्माग्नौ",
    ruleId: "visarga-repha",
    left: { id: "havih-left", devanagari: "हविः" },
    right: { id: "brahmagnau-right", devanagari: "ब्रह्माग्नौ" },
    nimitta: VISARGA_REPHA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  },
  {
    id: "hayairyukte",
    devanagari: "हयैर्युक्ते",
    ruleId: "visarga-repha",
    left: { id: "hayaih-left", devanagari: "हयैः" },
    right: { id: "yukte-right", devanagari: "युक्ते" },
    nimitta: VISARGA_REPHA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  },
  {
    id: "etairvimohayati",
    devanagari: "एतैर्विमोहयति",
    ruleId: "visarga-repha",
    left: { id: "etaih-left", devanagari: "एतैः" },
    right: { id: "vimohayati-right", devanagari: "विमोहयति" },
    nimitta: VISARGA_REPHA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  },
  {
    id: "matiruhate",
    devanagari: "मतिरूहते",
    ruleId: "visarga-repha",
    left: { id: "matih-left", devanagari: "मतिः" },
    right: { id: "uhate-right", devanagari: "ऊहते" },
    nimitta: VISARGA_REPHA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  },
  {
    id: "raviranshuman",
    devanagari: "रविरंशुमान्",
    ruleId: "visarga-repha",
    left: { id: "ravih-left", devanagari: "रविः" },
    right: { id: "anshuman-right", devanagari: "अंशुमान्" },
    nimitta: VISARGA_REPHA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  },
  {
    id: "nirashirnirmamah",
    devanagari: "निराशीर्निर्ममः",
    ruleId: "visarga-repha",
    left: { id: "nirashih-left-nirmama", devanagari: "निराशीः" },
    right: { id: "nirmamah-right", devanagari: "निर्ममः" },
    nimitta: VISARGA_REPHA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  },
  {
    id: "karmaphalaheturbhuh",
    devanagari: "कर्मफलहेतुर्भूः",
    ruleId: "visarga-repha",
    left: { id: "karmaphalahetuh-left", devanagari: "कर्मफलहेतुः" },
    right: { id: "bhuh-right", devanagari: "भूः" },
    nimitta: VISARGA_REPHA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  },
  {
    id: "sthitadhirmunih",
    devanagari: "स्थितधीर्मुनिः",
    ruleId: "visarga-repha",
    left: { id: "sthitadhih-left", devanagari: "स्थितधीः" },
    right: { id: "munih-right-sthitadhi", devanagari: "मुनिः" },
    nimitta: VISARGA_REPHA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  },
  {
    id: "shvetairhayaih",
    devanagari: "श्वेतैर्हयैः",
    ruleId: "visarga-repha",
    left: { id: "shvetaih-left", devanagari: "श्वेतैः" },
    right: { id: "hayaih-right-shveta", devanagari: "हयैः" },
    nimitta: VISARGA_REPHA_NIMITTA,
    note: RUNNING_TEXT_NOTE,
  },
  {
    id: "anashinoprameyasya",
    devanagari: "अनाशिनोऽप्रमेयस्य",
    ruleId: "visarga-o",
    left: { id: "anashinah-left", devanagari: "अनाशिनः" },
    right: { id: "aprameyasya-right", devanagari: "अप्रमेयस्य" },
    nimitta: VISARGA_OTVA_NIMITTA,
    note: {
      en: "The avagraha marks the dropped initial a after the o-form of visarga sandhi.",
      sa: "अवग्रहचिह्नं ओत्वे परपदस्य लुप्तम् आद्य-अकारं सूचयति।",
      te: "ఓత్వసంధి తరువాత రెండో పదంలోని లోపించిన ఆరంభ అను అవగ్రహం చూపిస్తుంది.",
    },
  },
];

const VISARGA_BULK_PDF_ENTRIES = VISARGA_BULK_PDF_CONFIGS.map((config) =>
  createSimpleEntry(config),
);

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
  vidyalayaEntry,
  girishaEntry,
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
  narendraEntry,
  rajopacaraEntry,
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
  sadaivaEntry,
  mataikyaEntry,
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
  atyantaEntry,
  pratyekaEntry,
  nyunaEntry,
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
  teApiEntry,
  hareApiEntry,
  lokoAyamEntry,
  tumuloBhavatEntry,
  prejateEntry,
  uposhatiEntry,
  digambaraEntry,
  vagishaEntry,
  diggajaEntry,
  jagadishaEntry,
  sadgunaEntry,
  satkaraEntry,
  tatparaEntry,
  tatkalaEntry,
  utpattiEntry,
  jagatpatiEntry,
  chinmayamEntry,
  sanmargahEntry,
  tanmayaEntry,
  sanmatiEntry,
  chinmatraEntry,
  samvadaEntry,
  samyogahEntry,
  samrakshanaEntry,
  samlapaEntry,
  samlekhaEntry,
  taddhitamEntry,
  uddharahEntry,
  taddhetuEntry,
  uddhrtaEntry,
  sankalpahEntry,
  sanjayaEntry,
  sampataEntry,
  sandeshaEntry,
  sambandhahEntry,
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
  ...SVARA_EXPANSION_ENTRIES,
  ...VYANJANA_EXPANSION_ENTRIES,
  ...VISARGA_EXPANSION_ENTRIES,
  ...SVARA_BULK_PDF_ENTRIES,
  ...VYANJANA_BULK_PDF_ENTRIES,
  ...VISARGA_BULK_PDF_ENTRIES,
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
      note:
        typeof cut.explanation.note === "string"
          ? cut.explanation.note
          : cut.explanation.note
            ? { ...cut.explanation.note }
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
      ruleId !== "pararupa" &&
      ruleId !== "jashtva" &&
      ruleId !== "chartva" &&
      ruleId !== "anunasika" &&
      ruleId !== "anusvara" &&
      ruleId !== "purvasavarna" &&
      ruleId !== "parasavarna" &&
      ruleId !== "visarga-sa" &&
      ruleId !== "visarga-repha" &&
      ruleId !== "visarga-lopa" &&
      ruleId !== "visarga-o") ||
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
      note:
        typeof explanation.note === "string"
          ? explanation.note
          : isRecord(explanation.note) &&
              typeof explanation.note.en === "string" &&
              typeof explanation.note.sa === "string" &&
              typeof explanation.note.te === "string"
            ? {
                en: explanation.note.en,
                sa: explanation.note.sa,
                te: explanation.note.te,
              }
            : undefined,
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
