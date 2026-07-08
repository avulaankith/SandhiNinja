const INDEPENDENT_VOWELS: Record<string, string> = {
  "अ": "a",
  "आ": "ā",
  "इ": "i",
  "ई": "ī",
  "उ": "u",
  "ऊ": "ū",
  "ऋ": "ṛ",
  "ॠ": "ṝ",
  "ऌ": "ḷ",
  "ॡ": "ḹ",
  "ए": "e",
  "ऐ": "ai",
  "ओ": "o",
  "औ": "au",
};

const VOWEL_SIGNS: Record<string, string> = {
  "ा": "ā",
  "ि": "i",
  "ी": "ī",
  "ु": "u",
  "ू": "ū",
  "ृ": "ṛ",
  "ॄ": "ṝ",
  "ॢ": "ḷ",
  "ॣ": "ḹ",
  "े": "e",
  "ै": "ai",
  "ो": "o",
  "ौ": "au",
};

const CONSONANTS: Record<string, string> = {
  "क": "k",
  "ख": "kh",
  "ग": "g",
  "घ": "gh",
  "ङ": "ṅ",
  "च": "c",
  "छ": "ch",
  "ज": "j",
  "झ": "jh",
  "ञ": "ñ",
  "ट": "ṭ",
  "ठ": "ṭh",
  "ड": "ḍ",
  "ढ": "ḍh",
  "ण": "ṇ",
  "त": "t",
  "थ": "th",
  "द": "d",
  "ध": "dh",
  "न": "n",
  "प": "p",
  "फ": "ph",
  "ब": "b",
  "भ": "bh",
  "म": "m",
  "य": "y",
  "र": "r",
  "ल": "l",
  "व": "v",
  "श": "ś",
  "ष": "ṣ",
  "स": "s",
  "ह": "h",
  "ळ": "ḷ",
};

const MARKS: Record<string, string> = {
  "ं": "ṃ",
  "ः": "ḥ",
  "ँ": "m̐",
  "ॐ": "oṃ",
  "ऽ": "'",
};

const DEVANAGARI_VIRAMA = "्";
const TELUGU_VIRAMA = "్";

const TELUGU_INDEPENDENT_VOWELS: Record<string, string> = {
  "అ": "a",
  "ఆ": "ā",
  "ఇ": "i",
  "ఈ": "ī",
  "ఉ": "u",
  "ఊ": "ū",
  "ఋ": "ṛ",
  "ౠ": "ṝ",
  "ఌ": "ḷ",
  "ౡ": "ḹ",
  "ఎ": "e",
  "ఏ": "e",
  "ఐ": "ai",
  "ఒ": "o",
  "ఓ": "o",
  "ఔ": "au",
};

const TELUGU_VOWEL_SIGNS: Record<string, string> = {
  "ా": "ā",
  "ి": "i",
  "ీ": "ī",
  "ు": "u",
  "ూ": "ū",
  "ృ": "ṛ",
  "ౄ": "ṝ",
  "ౢ": "ḷ",
  "ౣ": "ḹ",
  "ె": "e",
  "ే": "e",
  "ై": "ai",
  "ొ": "o",
  "ో": "o",
  "ౌ": "au",
};

const TELUGU_CONSONANTS: Record<string, string> = {
  "క": "k",
  "ఖ": "kh",
  "గ": "g",
  "ఘ": "gh",
  "ఙ": "ṅ",
  "చ": "c",
  "ఛ": "ch",
  "జ": "j",
  "ఝ": "jh",
  "ఞ": "ñ",
  "ట": "ṭ",
  "ఠ": "ṭh",
  "డ": "ḍ",
  "ఢ": "ḍh",
  "ణ": "ṇ",
  "త": "t",
  "థ": "th",
  "ద": "d",
  "ధ": "dh",
  "న": "n",
  "ప": "p",
  "ఫ": "ph",
  "బ": "b",
  "భ": "bh",
  "మ": "m",
  "య": "y",
  "ర": "r",
  "ల": "l",
  "వ": "v",
  "శ": "ś",
  "ష": "ṣ",
  "స": "s",
  "హ": "h",
  "ళ": "ḷ",
};

const TELUGU_MARKS: Record<string, string> = {
  "ం": "ṃ",
  "ః": "ḥ",
  "ఁ": "m̐",
  "ఽ": "'",
};

const IAST_VOWELS = [
  "ai",
  "au",
  "ā",
  "ī",
  "ū",
  "ṝ",
  "ḹ",
  "ṛ",
  "ḷ",
  "a",
  "i",
  "u",
  "e",
  "o",
] as const;

const IAST_CONSONANTS = [
  "kh",
  "gh",
  "ch",
  "jh",
  "ṭh",
  "ḍh",
  "th",
  "dh",
  "ph",
  "bh",
  "k",
  "g",
  "ṅ",
  "c",
  "j",
  "ñ",
  "ṭ",
  "ḍ",
  "ṇ",
  "t",
  "d",
  "n",
  "p",
  "b",
  "m",
  "y",
  "r",
  "l",
  "v",
  "ś",
  "ṣ",
  "s",
  "h",
  "ḷ",
] as const;

type IndicScriptMaps = {
  independentVowels: Record<string, string>;
  vowelSigns: Record<string, string>;
  consonants: Record<string, string>;
  marks: Record<string, string>;
  virama: string;
};

const IAST_TO_DEVANAGARI: IndicScriptMaps = {
  independentVowels: {
    a: "अ",
    ā: "आ",
    i: "इ",
    ī: "ई",
    u: "उ",
    ū: "ऊ",
    ṛ: "ऋ",
    ṝ: "ॠ",
    ḷ: "ऌ",
    ḹ: "ॡ",
    e: "ए",
    ai: "ऐ",
    o: "ओ",
    au: "औ",
  },
  vowelSigns: {
    ā: "ा",
    i: "ि",
    ī: "ी",
    u: "ु",
    ū: "ू",
    ṛ: "ृ",
    ṝ: "ॄ",
    ḷ: "ॢ",
    ḹ: "ॣ",
    e: "े",
    ai: "ै",
    o: "ो",
    au: "ौ",
  },
  consonants: {
    k: "क",
    kh: "ख",
    g: "ग",
    gh: "घ",
    ṅ: "ङ",
    c: "च",
    ch: "छ",
    j: "ज",
    jh: "झ",
    ñ: "ञ",
    ṭ: "ट",
    ṭh: "ठ",
    ḍ: "ड",
    ḍh: "ढ",
    ṇ: "ण",
    t: "त",
    th: "थ",
    d: "द",
    dh: "ध",
    n: "न",
    p: "प",
    ph: "फ",
    b: "ब",
    bh: "भ",
    m: "म",
    y: "य",
    r: "र",
    l: "ल",
    v: "व",
    ś: "श",
    ṣ: "ष",
    s: "स",
    h: "ह",
    ḷ: "ळ",
  },
  marks: {
    "ṃ": "ं",
    "ḥ": "ः",
    "m̐": "ँ",
    "'": "ऽ",
  },
  virama: DEVANAGARI_VIRAMA,
};

const IAST_TO_TELUGU: IndicScriptMaps = {
  independentVowels: {
    a: "అ",
    ā: "ఆ",
    i: "ఇ",
    ī: "ఈ",
    u: "ఉ",
    ū: "ఊ",
    ṛ: "ఋ",
    ṝ: "ౠ",
    ḷ: "ఌ",
    ḹ: "ౡ",
    e: "ఏ",
    ai: "ఐ",
    o: "ఓ",
    au: "ఔ",
  },
  vowelSigns: {
    ā: "ా",
    i: "ి",
    ī: "ీ",
    u: "ు",
    ū: "ూ",
    ṛ: "ృ",
    ṝ: "ౄ",
    ḷ: "ౢ",
    ḹ: "ౣ",
    e: "ే",
    ai: "ై",
    o: "ో",
    au: "ౌ",
  },
  consonants: {
    k: "క",
    kh: "ఖ",
    g: "గ",
    gh: "ఘ",
    ṅ: "ఙ",
    c: "చ",
    ch: "ఛ",
    j: "జ",
    jh: "ఝ",
    ñ: "ఞ",
    ṭ: "ట",
    ṭh: "ఠ",
    ḍ: "డ",
    ḍh: "ఢ",
    ṇ: "ణ",
    t: "త",
    th: "థ",
    d: "ద",
    dh: "ధ",
    n: "న",
    p: "ప",
    ph: "ఫ",
    b: "బ",
    bh: "భ",
    m: "మ",
    y: "య",
    r: "ర",
    l: "ల",
    v: "వ",
    ś: "శ",
    ṣ: "ష",
    s: "స",
    h: "హ",
    ḷ: "ళ",
  },
  marks: {
    "ṃ": "ం",
    "ḥ": "ః",
    "m̐": "ఁ",
    "'": "ఽ",
  },
  virama: TELUGU_VIRAMA,
};

export type { NormalizedSanskritInput, SanskritInputScript };

const stripWhitespace = (input: string) => input.trim().replace(/\s+/g, "");

const DEVANAGARI_RANGE = /[\u0900-\u097F]/;
const TELUGU_RANGE = /[\u0C00-\u0C7F]/;

const normalizeRomanVariants = (input: string) =>
  input
    .normalize("NFC")
    .replace(/[’‘ʼꞌ]/g, "'")
    .replace(/ṁ/g, "ṃ")
    .replace(/r̥̄/g, "ṝ")
    .replace(/r̥/g, "ṛ")
    .replace(/l̥̄/g, "ḹ")
    .replace(/l̥/g, "ḷ")
    .toLowerCase();

const matchTokenAt = (input: string, index: number, tokens: readonly string[]) =>
  tokens.find((token) => input.startsWith(token, index)) ?? null;

const transliterateIastToIndic = (
  input: string,
  script: IndicScriptMaps,
) => {
  const normalized = normalizeRomanVariants(stripWhitespace(input));
  let output = "";
  let index = 0;
  let pendingConsonant = false;

  while (index < normalized.length) {
    const mark =
      normalized.startsWith("m̐", index)
        ? "m̐"
        : normalized[index] === "ḥ" || normalized[index] === "ṃ" || normalized[index] === "'"
          ? normalized[index]
          : null;
    const vowel = matchTokenAt(normalized, index, IAST_VOWELS);
    const consonant = matchTokenAt(normalized, index, IAST_CONSONANTS);
    const current = normalized[index];

    if (vowel) {
      if (pendingConsonant) {
        if (vowel !== "a") {
          output += script.vowelSigns[vowel];
        }
        pendingConsonant = false;
      } else {
        output += script.independentVowels[vowel];
      }
      index += vowel.length;
      continue;
    }

    if (consonant) {
      if (pendingConsonant) {
        output += script.virama;
      }
      output += script.consonants[consonant];
      pendingConsonant = true;
      index += consonant.length;
      continue;
    }

    if (mark) {
      if (pendingConsonant) {
        pendingConsonant = false;
      }
      output += script.marks[mark];
      index += mark.length;
      continue;
    }

    if (pendingConsonant) {
      output += script.virama;
      pendingConsonant = false;
    }

    output += current;
    index += 1;
  }

  if (pendingConsonant) {
    output += script.virama;
  }

  return output;
};

export const detectSanskritInputScript = (
  input: string,
): Exclude<SanskritInputScript, "auto"> => {
  if (DEVANAGARI_RANGE.test(input)) {
    return "devanagari";
  }

  if (TELUGU_RANGE.test(input)) {
    return "telugu";
  }

  return "iast";
};

export const normalizeIast = (input: string) =>
  normalizeRomanVariants(stripWhitespace(input));

export const splitDevanagariAksharas = (input: string) => {
  const compact = stripWhitespace(input);

  if (!compact) {
    return [];
  }

  const segmenter =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? new Intl.Segmenter("sa", { granularity: "grapheme" })
      : null;

  const rawSegments = segmenter
    ? Array.from(segmenter.segment(compact), ({ segment }) => segment)
    : Array.from(compact);

  return rawSegments.reduce<string[]>((segments, segment) => {
    if (!segment) {
      return segments;
    }

    if (segments.length > 0 && segment.endsWith(DEVANAGARI_VIRAMA)) {
      segments[segments.length - 1] += segment;
      return segments;
    }

    segments.push(segment);
    return segments;
  }, []);
};

export const devanagariToIast = (input: string) => {
  const compact = stripWhitespace(input);
  let output = "";

  for (let index = 0; index < compact.length; index += 1) {
    const current = compact[index];
    const next = compact[index + 1];

    if (INDEPENDENT_VOWELS[current]) {
      output += INDEPENDENT_VOWELS[current];
      continue;
    }

    if (CONSONANTS[current]) {
      output += CONSONANTS[current];

      if (next && VOWEL_SIGNS[next]) {
        output += VOWEL_SIGNS[next];
        index += 1;
        continue;
      }

      if (next === DEVANAGARI_VIRAMA) {
        index += 1;
        continue;
      }

      output += "a";
      continue;
    }

    if (VOWEL_SIGNS[current]) {
      output += VOWEL_SIGNS[current];
      continue;
    }

    if (MARKS[current]) {
      output += MARKS[current];
      continue;
    }

    output += current;
  }

  return output;
};

export const teluguToIast = (input: string) => {
  const compact = stripWhitespace(input);
  let output = "";

  for (let index = 0; index < compact.length; index += 1) {
    const current = compact[index];
    const next = compact[index + 1];

    if (TELUGU_INDEPENDENT_VOWELS[current]) {
      output += TELUGU_INDEPENDENT_VOWELS[current];
      continue;
    }

    if (TELUGU_CONSONANTS[current]) {
      output += TELUGU_CONSONANTS[current];

      if (next && TELUGU_VOWEL_SIGNS[next]) {
        output += TELUGU_VOWEL_SIGNS[next];
        index += 1;
        continue;
      }

      if (next === TELUGU_VIRAMA) {
        index += 1;
        continue;
      }

      output += "a";
      continue;
    }

    if (TELUGU_VOWEL_SIGNS[current]) {
      output += TELUGU_VOWEL_SIGNS[current];
      continue;
    }

    if (TELUGU_MARKS[current]) {
      output += TELUGU_MARKS[current];
      continue;
    }

    output += current;
  }

  return output;
};

export const iastToDevanagari = (input: string) =>
  transliterateIastToIndic(input, IAST_TO_DEVANAGARI);

export const iastToTelugu = (input: string) =>
  transliterateIastToIndic(input, IAST_TO_TELUGU);

export const normalizeSanskritInput = (
  input: string,
  preferredScript: SanskritInputScript = "auto",
): NormalizedSanskritInput | null => {
  const compact = stripWhitespace(input);

  if (!compact) {
    return null;
  }

  const script =
    preferredScript === "auto"
      ? detectSanskritInputScript(compact)
      : preferredScript;

  if (script === "devanagari") {
    const iast = normalizeIast(devanagariToIast(compact));
    return {
      script,
      iast,
      devanagari: compact,
      telugu: iastToTelugu(iast),
    };
  }

  if (script === "telugu") {
    const iast = normalizeIast(teluguToIast(compact));
    return {
      script,
      iast,
      devanagari: iastToDevanagari(iast),
      telugu: compact,
    };
  }

  const iast = normalizeIast(compact);
  return {
    script: "iast",
    iast,
    devanagari: iastToDevanagari(iast),
    telugu: iastToTelugu(iast),
  };
};

export const makeWordId = (input: string) => {
  const transliterated = devanagariToIast(input)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return transliterated || "sandhi-word";
};
import type {
  NormalizedSanskritInput,
  SanskritInputScript,
} from "../contracts/sandhi.ts";
