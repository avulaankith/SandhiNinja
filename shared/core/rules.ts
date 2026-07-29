import type { SandhiRule, SourceReference } from "../contracts/sandhi.ts";

const bookSource = (
  en: string,
  sa: string,
  te: string,
): SourceReference => ({
  title: "Śāstrīya Saṃskṛta Bodhinī",
  detail: { en, sa, te },
});

const sutraSource = (
  sutra: string,
  href: string,
): SourceReference => ({
  title: "Aṣṭādhyāyī",
  detail: {
    en: `Pāṇinian source trail: ${sutra}.`,
    sa: `पाणिनीयस्रोतः: ${sutra}।`,
    te: `పాణినీయ మూలసూచన: ${sutra}.`,
  },
  href,
});

export const SANDHI_RULES: SandhiRule[] = [
  {
    id: "savarna-dirgha",
    family: "svara",
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
    pattern: {
      en: "Like vowels meet and collapse into one long vowel.",
      sa: "सवर्णस्वरयोः संयोगे दीर्घ एकादेशः।",
      te: "సవర్ణ స్వరాలు కలిస్తే ఒక దీర్ఘ స్వరం అవుతుంది.",
    },
    sutra: {
      text: "अकः सवर्णे दीर्घः",
      number: "6.1.101",
    },
    sources: [
      bookSource(
        "Sandhi-2, pp. 42-43: dīrgha-sandhi table and exercises.",
        "सन्धि-२, पृ. ४२-४३: दीर्घसन्धेः सारणी तथा अभ्यासः।",
        "సంధి-2, పుటలు 42-43: దీర్ఘసంధి పట్టిక మరియు అభ్యాసం.",
      ),
      sutraSource(
        "6.1.101 अकः सवर्णे दीर्घः",
        "https://ashtadhyayi.com/sutraani/6/1/101?expand=sutra-commentary-padamanjari-region&scroll=sutra-commentary-padamanjari-region",
      ),
    ],
  },
  {
    id: "guna",
    family: "svara",
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
    pattern: {
      en: "a/ā + i/ī/u/ū/ṛ/ḷ becomes e/o/ar/al.",
      sa: "अ/आ + इ/ई/उ/ऊ/ऋ/लृ → ए/ओ/अर्/अल्।",
      te: "అ/ఆ + ఇ/ఈ/ఉ/ఊ/ఋ/లృ → ఏ/ఓ/అర్/అల్.",
    },
    sutra: {
      text: "आद्गुणः",
      number: "6.1.87",
    },
    sources: [
      bookSource(
        "Sandhi-2, pp. 25, 28, 43: worked guṇa examples and drills.",
        "सन्धि-२, पृ. २५, २८, ४३: गुणसन्धेः उदाहरणानि अभ्यासश्च।",
        "సంధి-2, పుటలు 25, 28, 43: గుణసంధి ఉదాహరణలు మరియు అభ్యాసం.",
      ),
      sutraSource(
        "6.1.87 आद्गुणः",
        "https://ashtadhyayi.com/sutraani/6/1/87?expand=sutra-commentary-bhashya-region&focus=sutra-commentary-bhashya-region",
      ),
    ],
  },
  {
    id: "vrddhi",
    family: "svara",
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
    pattern: {
      en: "a/ā + e/ai/o/au expands to ai or au.",
      sa: "अ/आ + ए/ऐ/ओ/औ → ऐ/औ।",
      te: "అ/ఆ + ఏ/ఐ/ఓ/ఔ → ఐ/ఔ.",
    },
    sutra: {
      text: "वृद्धिरेचि",
      number: "6.1.88",
    },
    sources: [
      bookSource(
        "Sandhi-2, pp. 1-5 and 44: vṛddhi tables, examples, and exercises.",
        "सन्धि-२, पृ. १-५ तथा ४४: वृद्धिसन्धेः सारण्यः उदाहरणानि च।",
        "సంధి-2, పుటలు 1-5 మరియు 44: వృద్ధిసంధి పట్టికలు, ఉదాహరణలు, అభ్యాసం.",
      ),
      sutraSource(
        "6.1.88 वृद्धिरेचि",
        "https://ashtadhyayi.com/sutraani/lsk33",
      ),
    ],
  },
  {
    id: "yan",
    family: "svara",
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
    pattern: {
      en: "i/ī, u/ū, ṛ/ṝ, ḷ + unlike vowel becomes y, v, r, l.",
      sa: "इ/ई उ/ऊ ऋ/ॠ लृ + असवर्णस्वरः → य् व् र् ल्।",
      te: "ఇ/ఈ ఉ/ఊ ఋ/ౠ లృ + అసవర్ణ స్వరం → య్ వ్ ర్ ల్.",
    },
    sutra: {
      text: "इको यणचि",
      number: "6.1.77",
    },
    sources: [
      bookSource(
        "Sandhi-2, pp. 12, 22-24, 30-31, 45: yaṇ explanation and drills.",
        "सन्धि-२, पृ. १२, २२-२४, ३०-३१, ४५: यण्सन्धेः निरूपणम् अभ्यासश्च।",
        "సంధి-2, పుటలు 12, 22-24, 30-31, 45: యణ్‌సంధి వివరణ మరియు అభ్యాసం.",
      ),
      sutraSource(
        "6.1.77 इको यणचि",
        "https://ashtadhyayi.com/sutraani/6/1/77",
      ),
    ],
  },
  {
    id: "ayavayava",
    family: "svara",
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
    pattern: {
      en: "e/o/ai/au + vowel becomes ay/av/āy/āv + vowel.",
      sa: "ए/ओ/ऐ/औ + स्वरः → अय्/अव्/आय्/आव् + स्वरः।",
      te: "ఏ/ఓ/ఐ/ఔ + స్వరం → అయ్/అవ్/ఆయ్/ఆవ్ + స్వరం.",
    },
    sutra: {
      text: "एचोऽयवायावः",
      number: "6.1.78",
    },
    sources: [
      bookSource(
        "Sandhi-2, pp. 35-41 and 46: ayādi/yānta-vānta tables and exercises.",
        "सन्धि-२, पृ. ३५-४१ तथा ४६: अयादिसन्धेः सारणी तथा अभ्यासः।",
        "సంధి-2, పుటలు 35-41 మరియు 46: అయాది / యాంతవాంత ఆదేశ పట్టికలు మరియు అభ్యాసం.",
      ),
      sutraSource(
        "6.1.78 एचोऽयवायावः",
        "https://ashtadhyayi.com/sutraani/6/1/78",
      ),
    ],
  },
  {
    id: "purvarupa",
    family: "svara",
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
    pattern: {
      en: "e/o + a keeps the earlier vowel: e' or o'.",
      sa: "ए/ओ + अ → एऽ/ओऽ।",
      te: "ఏ/ఓ + అ కలిసినప్పుడు ముందటి స్వరమే నిలుస్తుంది: ఏऽ / ఓऽ.",
    },
    sutra: {
      text: "एङः पदान्तादति",
      number: "6.1.109",
    },
    sources: [
      bookSource(
        "Sandhi-2, pp. 47-49 and the worked chain on pp. 205-206.",
        "सन्धि-२, पृ. ४७-४९ तथा पृ. २०५-२०६ स्थित उदाहरण-श्रृङ्खला।",
        "సంధి-2, పుటలు 47-49 మరియు 205-206 లోని క్రమబద్ధ ఉదాహరణ.",
      ),
      sutraSource(
        "6.1.109 एङः पदान्तादति",
        "https://ashtadhyayi.com/sutraani/6/1/109?expand=sutra-commentary-tattvabodhini-region&focus=sutra-commentary-tattvabodhini-region",
      ),
    ],
  },
  {
    id: "pararupa",
    family: "svara",
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
    pattern: {
      en: "a/ā + e/o collapses into the later vowel.",
      sa: "अ/आ + ए/ओ → ए/ओ।",
      te: "అ/ఆ + ఏ/ఓ కలిస్తే తరువాతి స్వరమే కనిపిస్తుంది.",
    },
    sutra: {
      text: "एङि पररूपम्",
      number: "6.1.94",
    },
    sources: [
      bookSource(
        "Sandhi-2, pp. 50-53: pararūpa explanation, examples, and exception note.",
        "सन्धि-२, पृ. ५०-५३: पररूपसन्धेः निरूपणम् उदाहरणानि च।",
        "సంధి-2, పుటలు 50-53: పరరూపసంధి వివరణ, ఉదాహరణలు, అపవాదాలు.",
      ),
      sutraSource(
        "6.1.94 एङि पररूपम्",
        "https://ashtadhyayi.com/sutraani/sk78",
      ),
    ],
  },
  {
    id: "jashtva",
    family: "vyanjana",
    shortcut: "8",
    accent: "#81d4ff",
    label: {
      en: "Jaśtva",
      sa: "जश्त्वम्",
      te: "జశ్త్వం",
    },
    helper: {
      en: "Nimittam: a word-final consonant softens to the third sound of its class before a vowel or soft consonant.",
      sa: "निमित्तम्: पदान्ते स्थितः झल् स्वरात् वा मृदुव्यञ्जनात् परतः तत्तद्वर्गतृतीयत्वं प्राप्नोति।",
      te: "నిమిత్తం: పదాంతంలోని వ్యంజనం తరువాత స్వరం లేదా మృదు వ్యంజనం వస్తే తన వర్గంలోని మూడవ అక్షరంగా మారుతుంది.",
    },
    pattern: {
      en: "Word-final stop + vowel/soft consonant becomes the class-third consonant.",
      sa: "पदान्तव्यञ्जनम् + स्वर/मृदुव्यञ्जन → तृतीयवर्णादेशः।",
      te: "పదాంత వ్యంజనం + స్వరం/మృదు వ్యంజనం → ఆ వర్గంలోని మూడవ అక్షరం.",
    },
    sutra: {
      text: "झलां जशोऽन्ते",
      number: "8.2.39",
    },
    sources: [
      bookSource(
        "Sandhi-2, pp. 90-92 and drill page 101: jaśtva examples and practice set.",
        "सन्धि-२, पृ. ९०-९२ तथा अभ्यासपृष्ठम् १०१: जश्त्वसन्धेः उदाहरणानि।",
        "సంధి-2, పుటలు 90-92 మరియు అభ్యాస పుట 101: జశ్త్వసంధి ఉదాహరణలు.",
      ),
      sutraSource(
        "8.2.39 झलां जशोऽन्ते",
        "https://ashtadhyayi.com/bhashya/80?scroll=bhashya-82017",
      ),
    ],
  },
  {
    id: "chartva",
    family: "vyanjana",
    shortcut: "9",
    accent: "#ffb874",
    label: {
      en: "Charva",
      sa: "चर्वसन्धिः",
      te: "చర్వసంధి",
    },
    helper: {
      en: "Nimittam: a word-final voiced stop turns into the first sound of its class before a hard consonant.",
      sa: "निमित्तम्: पदान्ते स्थितः जश् खरि परतः तत्तद्वर्गप्रथमत्वं गच्छति।",
      te: "నిమిత్తం: పదాంతంలోని మృదు ఘోషవ్యంజనం తరువాత కఠిన వ్యంజనం వస్తే తన వర్గంలోని మొదటి అక్షరంగా మారుతుంది.",
    },
    pattern: {
      en: "Word-final class-third consonant + hard consonant becomes class-first.",
      sa: "पदान्ततृतीयव्यञ्जनम् + खर् → प्रथमवर्णादेशः।",
      te: "పదాంత మూడవ వర్గవ్యంజనం + కఠిన వ్యంజనం → మొదటి వర్ణం.",
    },
    sutra: {
      text: "खरि च",
      number: "8.4.55",
    },
    sources: [
      bookSource(
        "Sandhi-2, pp. 103-104: charva section and example table.",
        "सन्धि-२, पृ. १०३-१०४: चर्वसन्धिविभागः, चर्त्वसन्धेः कोष्ठकं, उदाहरणानि च।",
        "సంధి-2, పుటలు 103-104: చర్వసంధి విభాగం, చర్త్వసంధి పట్టిక, ఉదాహరణలు.",
      ),
      sutraSource(
        "8.4.55 खरि च",
        "https://ashtadhyayi.com/sutraani/rp1523?expand=sutra-commentary-balamanorama-region&scroll=sutra-commentary-balamanorama-region",
      ),
    ],
  },
  {
    id: "anunasika",
    family: "vyanjana",
    shortcut: "Q",
    accent: "#d9a7ff",
    label: {
      en: "Anunāsika",
      sa: "अनुनासिकः",
      te: "అనునాసికం",
    },
    helper: {
      en: "Nimittam: a word-final consonant before a nasal becomes the matching nasal sound.",
      sa: "निमित्तम्: पदान्तव्यञ्जनस्य परे अनुनासिके सति तदनुरूपो नासिकादेशः भवति।",
      te: "నిమిత్తం: పదాంత వ్యంజనం తరువాత అనునాసికం వస్తే దానికి సరిపోయే నాసిక్య ధ్వని వస్తుంది.",
    },
    pattern: {
      en: "Class consonant + nasal shifts to the class-fifth nasal.",
      sa: "वर्गीयव्यञ्जनम् + अनुनासिकः → पञ्चमवर्णादेशः।",
      te: "వర్గీయ వ్యంజనం + అనునాసికం → ఆ వర్గంలోని పంచమ నాసిక్య వర్ణం.",
    },
    sutra: {
      text: "यरोऽनुनासिकेऽनुनासिको वा",
      number: "8.4.44",
    },
    sources: [
      bookSource(
        "Sandhi-2, pp. 108-109: nasal-assimilation examples and summary.",
        "सन्धि-२, पृ. १०८-१०९: अनुनासिकसन्धेः उदाहरणानि सारांशश्च।",
        "సంధి-2, పుటలు 108-109: అనునాసికసంధి ఉదాహరణలు మరియు సారాంశం.",
      ),
      sutraSource(
        "8.4.44 यरोऽनुनासिकेऽनुनासिको वा",
        "https://ashtadhyayi.com/sutraani/8/4/44",
      ),
    ],
  },
  {
    id: "anusvara",
    family: "vyanjana",
    shortcut: "W",
    accent: "#7fe8c9",
    label: {
      en: "Anusvāra",
      sa: "अनुस्वारः",
      te: "అనుస్వారం",
    },
    helper: {
      en: "Nimittam: word-final m before a consonant contracts to anusvāra.",
      sa: "निमित्तम्: पदान्तमकारस्य हलि परतः अनुस्वारादेशः भवति।",
      te: "నిమిత్తం: పదాంతంలోని మకారం తరువాత వ్యంజనం వస్తే అది అనుస్వారంగా మారుతుంది.",
    },
    pattern: {
      en: "Word-final m before a consonant contracts into ṃ.",
      sa: "पदान्त-मकारः + व्यञ्जनम् → अनुस्वारः।",
      te: "పదాంత మకారం + వ్యంజనం → అనుస్వారం.",
    },
    sutra: {
      text: "मोऽनुस्वारः",
      number: "8.3.23",
    },
    sources: [
      bookSource(
        "Sandhi-2, pp. 115-116: anusvāra examples and fill-in drills.",
        "सन्धि-२, पृ. ११५-११६: अनुस्वारसन्धेः उदाहरणानि अभ्यासश्च।",
        "సంధి-2, పుటలు 115-116: అనుస్వారసంధి ఉదాహరణలు మరియు అభ్యాసం.",
      ),
      sutraSource(
        "8.3.23 मोऽनुस्वारः",
        "https://ashtadhyayi.com/sutraani/8/3/23",
      ),
    ],
  },
  {
    id: "purvasavarna",
    family: "vyanjana",
    shortcut: "E",
    accent: "#ffd59a",
    label: {
      en: "Pūrvasavarṇa",
      sa: "पूर्वसवर्णः",
      te: "పూర్వసవర్ణం",
    },
    helper: {
      en: "Nimittam: when h follows a class consonant, h can take the earlier consonant's class-colored fourth sound.",
      sa: "निमित्तम्: वर्गीयव्यञ्जनात् परे हकारे सति हस्य पूर्ववर्णसवर्णचतुर्थादेशः विकल्पेन भवति।",
      te: "నిమిత్తం: వర్గీయ వ్యంజనం తరువాత హకారం వస్తే హకారం ముందున్న వర్ణానికి అనుగుణమైన నాలుగవ ధ్వనిగా మారవచ్చు.",
    },
    pattern: {
      en: "Jaś-class consonant + h may shift h into the class-fourth sound.",
      sa: "जश् + ह → तद्वर्गीयचतुर्थादेशः।",
      te: "జశ్ వర్ణం + హ → ఆ వర్గంలోని నాలుగవ ధ్వని.",
    },
    sutra: {
      text: "झयो होऽन्यतरस्याम्",
      number: "8.4.61",
    },
    sources: [
      bookSource(
        "Sandhi-2, pp. 120-126: pūrvasavarṇa chart, examples, and drills.",
        "सन्धि-२, पृ. १२०-१२६: पूर्वसवर्णसन्धेः सारणी उदाहरणानि च।",
        "సంధి-2, పుటలు 120-126: పూర్వసవర్ణసంధి పట్టిక, ఉదాహరణలు, అభ్యాసం.",
      ),
      sutraSource(
        "8.4.61 झयो होऽन्यतरस्याम्",
        "https://ashtadhyayi.com/sutraani/8/4/61",
      ),
    ],
  },
  {
    id: "parasavarna",
    family: "vyanjana",
    shortcut: "T",
    accent: "#b0f57c",
    label: {
      en: "Parasavarṇa",
      sa: "परसवर्णः",
      te: "పరసవర్ణం",
    },
    helper: {
      en: "Nimittam: anusvāra before a following consonant takes that consonant-class nasal sound.",
      sa: "निमित्तम्: परव्यञ्जने परतः अनुस्वारः तस्य वर्गस्य नासिक्यसवर्णं रूपं गृह्णाति।",
      te: "నిమిత్తం: తరువాతి వ్యంజనం ముందు వచ్చిన అనుస్వారం ఆ వ్యంజన వర్గానికి చెందిన నాసిక్యరూపాన్ని స్వీకరిస్తుంది.",
    },
    pattern: {
      en: "ṃ before a class consonant/y-v-r-l becomes the matching nasal or nasalized glide.",
      sa: "अनुस्वारः + वर्गीयव्यञ्जन/यवर्ल → परसवर्णनासिक्यादेशः।",
      te: "అనుస్వారం + వర్గీయ వ్యంజనం/యవర్ల → సరిపోయే నాసిక్య ఆదేశం.",
    },
    sutra: {
      text: "अनुस्वारस्य ययि परसवर्णः",
      number: "8.4.58",
    },
    sources: [
      bookSource(
        "Sandhi-2, pp. 127-133: parasavarṇa rules, optional forms, and drills.",
        "सन्धि-२, पृ. १२७-१३३: परसवर्णसन्धेः नियमाः विकल्परूपाणि च।",
        "సంధి-2, పుటలు 127-133: పరసవర్ణసంధి నియమాలు, వికల్పరూపాలు, అభ్యాసం.",
      ),
      sutraSource(
        "8.4.58 अनुस्वारस्य ययि परसवर्णः",
        "https://ashtadhyayi.com/sutraani/8/4/58",
      ),
    ],
  },
  {
    id: "chhatva",
    family: "vyanjana",
    shortcut: "A",
    accent: "#ff9fb3",
    label: {
      en: "Chhatva",
      sa: "छत्वम्",
      te: "ఛత్వం",
    },
    helper: {
      en: "Nimittam: a word-final class-first consonant stands before ś, and that ś is followed by a vowel, y, v, r, l, m, or n; ś may become chh.",
      sa: "निमित्तम्: पदान्ते वर्गप्रथमव्यञ्जनात् परः शकारः, तस्मात् परे स्वराः य् व् र् ल् म् न् च सन्ति; तदा शकारस्य विकल्पेन छकारादेशः भवति।",
      te: "నిమిత్తం: పదాంత వర్గప్రథమ వ్యంజనం తరువాత శ్ వచ్చి, దాని తరువాత స్వరం లేదా య్/వ్/ర్/ల్/మ్/న్ ఉంటే, శ్ వికల్పంగా ఛ్ అవుతుంది.",
    },
    pattern: {
      en: "Final class-first consonant + ś + vowel/y-v-r-l-m-n -> optional chh.",
      sa: "पदान्तप्रथमव्यञ्जनम् + श् + स्वर/यवर्लमन् → विकल्पेन छ्।",
      te: "పదాంత ప్రథమ వ్యంజనం + శ్ + స్వరం/యవర్లమన్ -> వికల్పంగా ఛ్.",
    },
    sutra: {
      text: "शश्छोऽटि",
      number: "8.4.63",
    },
    sources: [
      bookSource(
        "Sandhi-2: chhatva section with worked examples such as वाक्छरः, भिषक्छेते, and तच्छ्लोकः.",
        "सन्धि-२: छत्वप्रकरणे वाक्छरः, भिषक्छेते, तच्छ्लोकः इत्यादीनि उदाहरणानि विवृणोति।",
        "సంధి-2: ఛత్వ విభాగంలో వాక్ఛరః, భిషక్ఛేతే, తచ్ఛ్లోకః వంటి ఉదాహరణలు ఇచ్చాయి.",
      ),
      sutraSource(
        "8.4.63 शश्छोऽटि",
        "https://ashtadhyayi.com/sutraani/lsk76",
      ),
    ],
  },
  {
    id: "tugagama",
    family: "vyanjana",
    shortcut: "S",
    accent: "#8fe79c",
    label: {
      en: "Tugāgama",
      sa: "तुगागमः",
      te: "తుగాగమం",
    },
    helper: {
      en: "Nimittam: a short vowel before छ receives a t-augment and is heard as cch; in taught final long-vowel cases the insertion may also appear optionally.",
      sa: "निमित्तम्: ह्रस्वस्वरात् परे छकारे तुगागमः भवति; शिक्षितेषु पदान्तदीर्घप्रयोगेषु स एव विकल्पेन दृश्यते।",
      te: "నిమిత్తం: హ్రస్వ స్వరం తరువాత ఛ వస్తే తుగాగమం వచ్చి చ్ఛ రూపం వినిపిస్తుంది; పాఠ్య దీర్ఘాంత రూపాల్లో అది వికల్పంగా కూడా కనిపించవచ్చు.",
    },
    pattern: {
      en: "Short vowel + छ -> च्छ; taught final long-vowel cases may also show optional च्छ.",
      sa: "ह्रस्वस्वरः + छ् → च्छ; शिक्षितदीर्घान्तप्रयोगेषु विकल्पेन च्छ अपि।",
      te: "హ్రస్వ స్వరం + ఛ్ -> చ్ఛ; పాఠ్య దీర్ఘాంత రూపాల్లో వికల్పంగా చ్ఛ కూడా వస్తుంది.",
    },
    sutra: {
      text: "छे च",
      number: "6.1.73",
    },
    sources: [
      bookSource(
        "Sandhi-2: tugāgama section with examples such as वृक्षच्छाया and शिखरिणीच्छन्दः.",
        "सन्धि-२: तुगागमप्रकरणे वृक्षच्छाया, शिखरिणीच्छन्दः इत्यादीनि दृष्टान्तानि दत्तानि।",
        "సంధి-2: తుగాగమ విభాగంలో వృక్షచ్చాయా, శిఖరిణీచ్చందః వంటి ఉదాహరణలు ఉన్నాయి.",
      ),
      sutraSource(
        "6.1.73 छे च",
        "https://ashtadhyayi.com/sutraani/lsk101",
      ),
    ],
  },
  {
    id: "shcutva",
    family: "vyanjana",
    shortcut: "D",
    accent: "#83d6ff",
    label: {
      en: "Shcutva",
      sa: "श्चुत्वम्",
      te: "శ్చుత్వం",
    },
    helper: {
      en: "Nimittam: s or a dental stands in contact with ś or a palatal, so the sound shifts toward ś / the ca-varga.",
      sa: "निमित्तम्: सकारः तवर्गो वा शकारचवर्गाभ्यां योगे स्थितः; तदा शकारचवर्गादेशः भवति।",
      te: "నిమిత్తం: స్ లేదా తవర్గం, శ్ లేదా చవర్గంతో సంబంధంలో ఉన్నప్పుడు, శ్ లేదా చవర్గాదేశం వస్తుంది.",
    },
    pattern: {
      en: "s/t-series + ś/ca-varga -> ś / ca-varga.",
      sa: "स्/तवर्गः + श्/चवर्गः → श्/चवर्गः।",
      te: "స్/తవర్గం + శ్/చవర్గం -> శ్/చవర్గం.",
    },
    sutra: {
      text: "स्तोः श्चुना श्चुः",
      number: "8.4.40",
    },
    sources: [
      bookSource(
        "Sandhi-2: ścutva section with examples such as सच्चिद्रूपम्, तज्ज्वलति, बृहच्छत्रम्, and तपश्चर्या.",
        "सन्धि-२: श्चुत्वप्रकरणे सच्चिद्रूपम्, तज्ज्वलति, बृहच्छत्रम्, तपश्चर्या इत्यादीनि उदाहरणानि।",
        "సంధి-2: శ్చుత్వ విభాగంలో సచ్చిద్రూపమ్, తజ్జ్వలతి, బృహచ్చత్రమ్, తపశ్చర్యా వంటి ఉదాహరణలు ఉన్నాయి.",
      ),
      sutraSource(
        "8.4.40 स्तोः श्चुना श्चुः",
        "https://ashtadhyayi.com/sutraani/sk111?expand=sutra-commentary-sudha-region&scroll=sutra-commentary-sudha-region",
      ),
    ],
  },
  {
    id: "shtutva",
    family: "vyanjana",
    shortcut: "F",
    accent: "#ffcf8f",
    label: {
      en: "Shtutva",
      sa: "ष्टुत्वम्",
      te: "ష్టుత్వం",
    },
    helper: {
      en: "Nimittam: s or a dental comes into contact with ṣ or a retroflex, so the sound shifts toward ṣ / the ṭa-varga.",
      sa: "निमित्तम्: सकारः तवर्गो वा षकारटवर्गाभ्यां योगे स्थितः; तदा षकारटवर्गादेशः भवति।",
      te: "నిమిత్తం: స్ లేదా తవర్గం, ష్ లేదా టవర్గంతో సంబంధంలో ఉన్నప్పుడు, ష్ లేదా టవర్గాదేశం వస్తుంది.",
    },
    pattern: {
      en: "s/t-series + ṣ/ṭa-varga -> ṣ / ṭa-varga.",
      sa: "स्/तवर्गः + ष्/टवर्गः → ष्/टवर्गः।",
      te: "స్/తవర్గం + ష్/టవర్గం -> ష్/టవర్గం.",
    },
    sutra: {
      text: "ष्टुना ष्टुः",
      number: "8.4.41",
    },
    sources: [
      bookSource(
        "Sandhi-2: ṣṭutva section with examples such as बृहट्टीका, तड्डमरुः, आकृष्टः, and उड्डयनम्.",
        "सन्धि-२: ष्टुत्वप्रकरणे बृहट्टीका, तड्डमरुः, आकृष्टः, उड्डयनम् इत्यादीनि उदाहरणानि।",
        "సంధి-2: ష్టుత్వ విభాగంలో బృహట్టీకా, తడ్డమరుః, ఆకృష్టః, ఉడ్డయనం వంటి ఉదాహరణలు ఉన్నాయి.",
      ),
      sutraSource(
        "8.4.41 ष्टुना ष्टुः",
        "https://ashtadhyayi.com/sutraani/8/4/41",
      ),
    ],
  },
  {
    id: "satva",
    family: "vyanjana",
    shortcut: "G",
    accent: "#ffc47f",
    label: {
      en: "Satva-Sandhi",
      sa: "सत्वसन्धिः",
      te: "సత్వసంధి",
    },
    helper: {
      en: "Nimittam: a final n stands before c/ch/ṭ/ṭh/t/th and, in satva-sandhi, yields a nasalized vowel or anusvāra plus s, ś, or ṣ. Keep this distinct from visarga-satva.",
      sa: "निमित्तम्: पदान्तनकारः च्/छ्/ट्/ठ्/त्/थ्-परः सति सत्वसन्ध्या अनुनासिकपूर्वस्वरम् अथवा अनुस्वारं कृत्वा स/श/षादेशं जनयति। एषा व्यञ्जनसन्धेः सत्वसन्धिः, न तु विसर्गसत्वम्।",
      te: "నిమిత్తం: పదాంత న్ తరువాత చ్/ఛ్/ట్/ఠ్/త్/థ్ వచ్చినప్పుడు సత్వసంధి వల్ల ముందు స్వరం అనునాసికం లేదా అనుస్వారంగా మారి స్/శ్/ష్ రూపం వస్తుంది. ఇది వ్యంజనసంధిలోని సత్వసంధి; విసర్గసత్వం కాదు.",
    },
    pattern: {
      en: "Satva-sandhi: final n + c/ch/ṭ/ṭh/t/th -> nasalized vowel/anusvāra + s; then ścutva or ṣṭutva may shape the visible surface.",
      sa: "सत्वसन्धिः: पदान्तनकारः + च्/छ्/ट्/ठ्/त्/थ् → अनुनासिकपूर्वस्वरः/अनुस्वारः + स; अनन्तरं श्चुत्वं वा ष्टुत्वं वा दृश्यरूपं निर्माति।",
      te: "సత్వసంధి: పదాంత న్ + చ్/ఛ్/ట్/ఠ్/త్/థ్ -> అనునాసిక స్వరం/అనుస్వారం + స్; తరువాత శ్చుత్వం లేదా ష్టుత్వం కనిపించే రూపాన్ని ఖరారు చేయవచ్చు.",
    },
    sutra: {
      text: "नश्छव्यप्रशान्",
      number: "8.3.7",
    },
    sources: [
      bookSource(
        "Sandhi-2: satva section with worked examples such as अर्थकामांस्तु, प्रज्ञावादांश्च, and श्लोकांष्टीकाभिः.",
        "सन्धि-२: सत्वप्रकरणे अर्थकामांस्तु, प्रज्ञावादांश्च, श्लोकांष्टीकाभिः इत्यादीनि उदाहरणानि दत्तानि।",
        "సంధి-2: సత్వ విభాగంలో అర్థకామాంస్తు, ప్రజ్ఞావాదాంశ్చ, శ్లోకాంష్టీకాభిః వంటి ఉదాహరణలు ఉన్నాయి.",
      ),
      sutraSource(
        "8.3.7 नश्छव्यप्रशान्",
        "https://ashtadhyayi.com/sutraani/8/3/7",
      ),
    ],
  },
  {
    id: "yavalopa",
    family: "vyanjana",
    shortcut: "H",
    accent: "#91ecdb",
    label: {
      en: "Yavalopa",
      sa: "यवलोपः",
      te: "యవలోపం",
    },
    helper: {
      en: "Nimittam: a final y or v, preceded by a or ā, stands before a vowel or other soft sound and may drop. After the drop, a fresh vowel sandhi is not forced.",
      sa: "निमित्तम्: पदान्ते अकार-आकारपूर्वौ यकारवकारौ स्वर-मृदुवर्णपरत्वे विकल्पेन लुप्येते। लोपे कृतेऽपि अनन्तरस्वरसन्धिः न अनिवार्या भवति।",
      te: "నిమిత్తం: పదాంతంలో అ/ఆ తరువాత ఉన్న య్ లేదా వ్, స్వరం లేదా మృదు ధ్వని ముందు వికల్పంగా లోపిస్తుంది. లోపం జరిగిన తర్వాత కొత్త స్వరసంధి బలవంతం కాదు.",
    },
    pattern: {
      en: "Final -ay / -āv / -e / -o style y/v support may drop before the next vowel or soft sound, and the hiatus remains visible.",
      sa: "पदान्तस्थितः अ/आपूर्वकः य्/व् स्वर-मृदुवर्णपरत्वे लुप्यते; तदा विरामवत् स्वरसमीप्यं दृश्यते।",
      te: "పదాంత అ/ఆపూర్వక య్/వ్ తరువాత స్వరం లేదా మృదు ధ్వని వచ్చినప్పుడు లోపించి, మధ్య విరామంలా స్వరసమీప్యం కనిపిస్తుంది.",
    },
    sutra: {
      text: "लोपः शाकल्यस्य",
      number: "8.3.19",
    },
    sources: [
      bookSource(
        "Sandhi-2: yavalopa section with examples such as ते इमे, तस्मा एतत्, गुर एहि, and उभा अपि.",
        "सन्धि-२: यवलोपप्रकरणे ते इमे, तस्मा एतत्, गुर एहि, उभा अपि इत्यादयः दृष्टान्ताः दत्ताः।",
        "సంధి-2: యవలోప విభాగంలో త ఇమే, తస్మా ఏతత్, గుర ఏహి, ఉభా అపి వంటి ఉదాహరణలు ఉన్నాయి.",
      ),
      sutraSource(
        "8.3.19 लोपः शाकल्यस्य",
        "https://ashtadhyayi.com/sutraani/ssk30?expand=sutra-commentary-bhashya-region&scroll=sutra-commentary-bhashya-region",
      ),
    ],
  },
  {
    id: "visarga-sa",
    family: "visarga",
    shortcut: "Y",
    accent: "#8ee7ff",
    label: {
      en: "Visarga-Satva",
      sa: "विसर्ग-सत्वम्",
      te: "విసర్గ-సత్వం",
    },
    helper: {
      en: "Nimittam: visarga stands before a hard consonant or sibilant and turns into s, ś, or ṣ. This visarga satva starts from ḥ, not from a final n.",
      sa: "निमित्तम्: विसर्गस्य परे खर् अथवा शर् सति स/श/षादेशः भवति। एतत् विसर्गजन्यं सत्वम्, न तु पदान्तनकारजन्यम्।",
      te: "నిమిత్తం: విసర్గం తరువాత కఠిన వ్యంజనం లేదా శర వర్ణం వస్తే అది స్/శ్/ష్ రూపం దాల్చుతుంది. ఇది విసర్గం నుంచి వచ్చే సత్వం; పదాంత న్ నుంచి వచ్చే సత్వం కాదు.",
    },
    pattern: {
      en: "ḥ + hard consonant/sibilant -> s, ś, or ṣ according to the next sound.",
      sa: "ः + खर्/शर् → परवर्णानुसारं स/श/ष।",
      te: "ః + కఠిన వ్యంజనం/శర వర్ణం → తరువాతి ధ్వనికి తగిన స్/శ్/ష్.",
    },
    sutra: {
      text: "विसर्जनीयस्य सः",
      number: "8.3.34",
    },
    sources: [
      bookSource(
        "Sandhi-2, pp. 171-176: visarga before hard consonants, sibilants, and the school examples for satva.",
        "सन्धि-२, पृ. १७१-१७६: खरि-शरि परे विसर्गस्य सत्वरूपाणि, उदाहरणानि च।",
        "సంధి-2, పుటలు 171-176: కఠిన వ్యంజనాల ముందు విసర్గం సత్వరూపం దాల్చే సందర్భాలు, ఉదాహరణలు.",
      ),
      sutraSource(
        "8.3.34 विसर्जनीयस्य सः",
        "https://ashtadhyayi.com/sutraani/rp1480?expand=sutra-commentary-vasu_english-region&scroll=sutra-commentary-vasu_english-region",
      ),
    ],
  },
  {
    id: "visarga-repha",
    family: "visarga",
    shortcut: "U",
    accent: "#ffcb86",
    label: {
      en: "Visarga-Repha",
      sa: "विसर्ग-रेफादेशः",
      te: "విసర్గ-రేఫాదేశం",
    },
    helper: {
      en: "When visarga follows a non-a/ā vowel, or an avyaya visarga is involved, a following vowel or soft consonant can pull out r.",
      sa: "अ/आ-वर्जितस्वरात् परो वा अव्ययसम्बद्धो विसर्गः स्वरे मृदुव्यञ्जने च परे रेफादेशं ददाति।",
      te: "అ/ఆ కాని స్వరం తరువాత వచ్చిన విసర్గం, లేదా అవ్యయ విసర్గం, తరువాత స్వరం లేదా మృదు వ్యంజనం వస్తే ర్‌గా మారుతుంది.",
    },
    pattern: {
      en: "ḥ + vowel/soft consonant -> r before the next sound.",
      sa: "ः + स्वर/मृदुव्यञ्जन → रेफादेशः।",
      te: "ః + స్వరం/మృదు వ్యంజనం → రేఫాదేశం.",
    },
    sutra: {
      text: "ससजुषो रुः",
      number: "8.2.66",
    },
    sources: [
      bookSource(
        "Sandhi-2, pp. 177-183: repha-type visarga examples such as मुनिरुच्यते, बहिरन्तः, पुनरत्र, and प्रातर्गच्छति.",
        "सन्धि-२, पृ. १७७-१८३: मुनिरुच्यते, बहिरन्तः, पुनरत्र, प्रातर्गच्छति इत्यादयः रेफादेशदृष्टान्ताः।",
        "సంధి-2, పుటలు 177-183: మునిరుచ్యతే, బహిరంతః, పునరత్ర, ప్రాతర్గచ్ఛతి వంటి రేఫాదేశ ఉదాహరణలు.",
      ),
      sutraSource(
        "8.2.66 ससजुषो रुः",
        "https://ashtadhyayi.com/sutraani/8/2/66",
      ),
    ],
  },
  {
    id: "visarga-lopa",
    family: "visarga",
    shortcut: "I",
    accent: "#d5a4ff",
    label: {
      en: "Visarga-Lopa",
      sa: "विसर्ग-लोपः",
      te: "విసర్గ-లోపం",
    },
    helper: {
      en: "Nimittam: in taught visarga-lopa patterns the visarga itself disappears. The result may show plain prakṛtibhāva, vowel lengthening before r, or in some optional school cases a y-form beside the lopa-form.",
      sa: "निमित्तम्: शिक्षितेषु विसर्गलोपप्रयोगेषु स्वयं विसर्गः लुप्यते। फलरूपे प्रकृतिभावः, रेफे परे पूर्वस्वरदीर्घः, केषुचित् शैक्षिकविकल्पेषु यकारयुक्तरूपं च लोपरूपेण सह दृश्यते।",
      te: "నిమిత్తం: బోధనలో చెప్పే విసర్గలోపరూపాల్లో నిజంగా లోపించేది విసర్గమే. ఫలంగా ప్రకృతిభావరూపం, ర్ ముందు పూర్వస్వర దీర్ఘం, కొన్ని పాఠ్య వికల్పాల్లో లోపరూపంతో పాటు యకారరూపం కూడా కనిపించవచ్చు.",
    },
    pattern: {
      en: "ḥ may drop before selected vowels or soft consonants, and before r the earlier vowel may lengthen after the lopa.",
      sa: "विसर्गः केषुचित् स्वर-मृदुव्यञ्जनपरप्रयोगेषु लुप्यते; रेफे परे लोपानन्तरं पूर्वस्वरदीर्घोऽपि भवति।",
      te: "కొన్ని స్వర/మృదు వ్యంజన పర రూపాల్లో విసర్గం లోపిస్తుంది; ర్ ముందు లోపం తర్వాత పూర్వస్వరం దీర్ఘమవవచ్చు.",
    },
    sutra: {
      text: "हलि सर्वेषाम्",
      number: "8.3.22",
    },
    sources: [
      bookSource(
        "Sandhi-2, pp. 187-198: the textbook lopa patterns, including देवायपि, सयुच्यते, भानूराजते, and पुनारमते-type drills.",
        "सन्धि-२, पृ. १८७-१९८: देवायपि, सयुच्यते, भानूराजते, पुनारमते-प्रभृतयः विसर्गलोपप्रकाराः।",
        "సంధి-2, పుటలు 187-198: దేవాయపి, సయుచ్యతే, భానూరాజతే, పునారమతే వంటి విసర్గలోప రూపాలు.",
      ),
      sutraSource(
        "8.3.22 हलि सर्वेषाम्",
        "https://ashtadhyayi.com/sutraani/8/3/22?expand=sutra-commentary-tattvabodhini-region&focus=sutra-commentary-tattvabodhini-region",
      ),
    ],
  },
  {
    id: "visarga-o",
    family: "visarga",
    shortcut: "O",
    accent: "#9ad9ff",
    label: {
      en: "Visarga-Ootvam",
      sa: "विसर्ग-ओत्वम्",
      te: "విసర్గ-ఓత్వం",
    },
    helper: {
      en: "A final aḥ can move through ru/utva into o before a following vowel or soft consonant.",
      sa: "अः पदान्तः परे स्वर-मृदुव्यञ्जने च रु-उत्वक्रमेण ओ-रूपं प्राप्नोति।",
      te: "పదాంత అః తరువాత స్వరం లేదా మృదు వ్యంజనం వస్తే రు/ఉత్వ క్రమంలో ఓ రూపం వస్తుంది.",
    },
    pattern: {
      en: "aḥ + vowel/soft consonant -> o, and before initial a this may continue into o'.",
      sa: "अः + स्वर/मृदुव्यञ्जन → ओ; आद्य-अकारे परे ओऽ अपि दृश्यते।",
      te: "అః + స్వరం/మృదు వ్యంజనం → ఓ; మొదటి అ ముందు ఓऽ రూపం కూడా కనిపిస్తుంది.",
    },
    sutra: {
      text: "अतो रोरप्लुतादप्लुते",
      number: "6.1.113",
    },
    sources: [
      bookSource(
        "Sandhi-2, pp. 203-206: otva examples such as हृषीकेशोगुडाकेशेन, नोजयेयुः, घोषोधृतराष्ट्राणाम्, and वासोभवति.",
        "सन्धि-२, पृ. २०३-२०६: हृषीकेशोगुडाकेशेन, नोजयेयुः, घोषोधृतराष्ट्राणाम्, वासोभवति इत्यादयः ओत्वदृष्टान्ताः।",
        "సంధి-2, పుటలు 203-206: హృషీకేశోగుడాకేశేన, నోజయేయుః, ఘోషోధృతరాష్ట్రాణామ్, వాసోభవతి వంటి ఓత్వ ఉదాహరణలు.",
      ),
      sutraSource(
        "6.1.113 अतो रोरप्लुतादप्लुते",
        "https://ashtadhyayi.com/sutraani/6/1/113",
      ),
    ],
  },
];
