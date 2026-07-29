import type {
  LocalizedText,
  SandhiAnalysisResult,
  SandhiAnalyzeSuccessResponse,
  SandhiRule,
  SandhiRuleId,
  SanskritInputScript,
  SurfaceForms,
} from "../../shared/contracts/sandhi.ts";
import { SANDHI_RULES } from "../../shared/core/rules.ts";
import {
  iastToDevanagari,
  iastToTelugu,
  makeWordId,
  normalizeSanskritInput,
} from "../../shared/core/sanskrit.ts";

type NodeStep = {
  ruleId: SandhiRuleId;
  label: LocalizedText;
  sutra: SandhiRule["sutra"];
  left: SurfaceForms;
  right: SurfaceForms;
  why: LocalizedText;
  nimitta: LocalizedText;
  pattern: string;
};

type DirectCandidate = {
  rule: SandhiRule;
  leftIast: string;
  rightIast: string;
  pattern: string;
  why: LocalizedText;
  specificity: number;
  balance: number;
};

type TreeCandidate = {
  node: SandhiAnalysisNode;
  signature: string;
  score: number;
};

export type SandhiAnalysisNode = {
  surface: SurfaceForms;
  step: NodeStep | null;
  left: SandhiAnalysisNode | null;
  right: SandhiAnalysisNode | null;
};

export type SandhiAnalysisStepLine = NodeStep & {
  depth: number;
  surface: SurfaceForms;
};

const MAX_DEPTH = 4;
const DEFAULT_MAX_RESULTS = 10;
const MAX_RESULTS_CAP = 20;
const MAX_BRANCH_RESULTS = 10;

const VOWEL_TOKENS = [
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

const SPECIFICITY_BY_RULE: Record<SandhiRuleId, number> = {
  purvarupa: 12,
  ayavayava: 10,
  pararupa: 8,
  vrddhi: 7,
  guna: 7,
  yan: 6,
  "savarna-dirgha": 6,
  jashtva: 0,
  chartva: 0,
  anunasika: 0,
  anusvara: 0,
  purvasavarna: 0,
  parasavarna: 0,
  "visarga-sa": 0,
  "visarga-repha": 0,
  "visarga-lopa": 0,
  "visarga-o": 0,
};

const RULE_LOOKUP = new Map(SANDHI_RULES.map((rule) => [rule.id, rule]));

const formsFromIast = (iast: string): SurfaceForms => ({
  iast,
  devanagari: iastToDevanagari(iast),
  telugu: iastToTelugu(iast),
});

const matchVowelAt = (input: string, index: number) =>
  VOWEL_TOKENS.find((token) => input.startsWith(token, index)) ?? null;

const makeWhyText = (
  rule: SandhiRule,
  surface: string,
  left: string,
  right: string,
  pattern: string,
): LocalizedText => ({
  en: `${surface} can be reversed as ${left} + ${right}. Pattern used: ${pattern} under ${rule.label.en}.`,
  sa: `${surface} इति रूपं ${left} + ${right} इति प्रकारेण विव्रियते। अत्र ${pattern} इति क्रमः ${rule.label.sa} नियमेन प्रयुज्यते।`,
  te: `${surface} ను ${left} + ${right}గా విప్పవచ్చు. ఇక్కడ ${pattern} అనే మార్పు ${rule.label.te} నియమంతో తీసుకున్నాం.`,
});

const addCandidate = (
  bucket: DirectCandidate[],
  seen: Set<string>,
  ruleId: SandhiRuleId,
  wordIast: string,
  leftIast: string,
  rightIast: string,
  pattern: string,
) => {
  const rule = RULE_LOOKUP.get(ruleId);

  if (!rule || !leftIast || !rightIast) {
    return;
  }

  const signature = `${ruleId}:${leftIast}+${rightIast}`;
  if (seen.has(signature)) {
    return;
  }

  seen.add(signature);
  bucket.push({
    rule,
    leftIast,
    rightIast,
    pattern,
    why: makeWhyText(rule, wordIast, leftIast, rightIast, pattern),
    specificity: SPECIFICITY_BY_RULE[ruleId],
    balance: Math.min(leftIast.length, rightIast.length),
  });
};

const findDirectCandidates = (wordIast: string): DirectCandidate[] => {
  const candidates: DirectCandidate[] = [];
  const seen = new Set<string>();

  for (let index = 0; index < wordIast.length; index += 1) {
    const prefix = wordIast.slice(0, index);

    if (wordIast.startsWith("ā", index)) {
      const suffix = wordIast.slice(index + 1);
      [
        ["a", "a"],
        ["a", "ā"],
        ["ā", "a"],
        ["ā", "ā"],
      ].forEach(([leftVowel, rightVowel]) =>
        addCandidate(
          candidates,
          seen,
          "savarna-dirgha",
          wordIast,
          `${prefix}${leftVowel}`,
          `${rightVowel}${suffix}`,
          "ā -> a/ā + a/ā",
        ),
      );
    }

    if (wordIast.startsWith("ī", index)) {
      const suffix = wordIast.slice(index + 1);
      [
        ["i", "i"],
        ["i", "ī"],
        ["ī", "i"],
        ["ī", "ī"],
      ].forEach(([leftVowel, rightVowel]) =>
        addCandidate(
          candidates,
          seen,
          "savarna-dirgha",
          wordIast,
          `${prefix}${leftVowel}`,
          `${rightVowel}${suffix}`,
          "ī -> i/ī + i/ī",
        ),
      );
    }

    if (wordIast.startsWith("ū", index)) {
      const suffix = wordIast.slice(index + 1);
      [
        ["u", "u"],
        ["u", "ū"],
        ["ū", "u"],
        ["ū", "ū"],
      ].forEach(([leftVowel, rightVowel]) =>
        addCandidate(
          candidates,
          seen,
          "savarna-dirgha",
          wordIast,
          `${prefix}${leftVowel}`,
          `${rightVowel}${suffix}`,
          "ū -> u/ū + u/ū",
        ),
      );
    }

    if (wordIast.startsWith("ṝ", index)) {
      const suffix = wordIast.slice(index + 1);
      [
        ["ṛ", "ṛ"],
        ["ṛ", "ṝ"],
        ["ṝ", "ṛ"],
        ["ṝ", "ṝ"],
      ].forEach(([leftVowel, rightVowel]) =>
        addCandidate(
          candidates,
          seen,
          "savarna-dirgha",
          wordIast,
          `${prefix}${leftVowel}`,
          `${rightVowel}${suffix}`,
          "ṝ -> ṛ/ṝ + ṛ/ṝ",
        ),
      );
    }

    if (wordIast.startsWith("e", index)) {
      const suffix = wordIast.slice(index + 1);
      [
        ["a", "i"],
        ["a", "ī"],
        ["ā", "i"],
        ["ā", "ī"],
      ].forEach(([leftVowel, rightVowel]) =>
        addCandidate(
          candidates,
          seen,
          "guna",
          wordIast,
          `${prefix}${leftVowel}`,
          `${rightVowel}${suffix}`,
          "e -> a/ā + i/ī",
        ),
      );

      ["a", "ā"].forEach((leftVowel) =>
        addCandidate(
          candidates,
          seen,
          "pararupa",
          wordIast,
          `${prefix}${leftVowel}`,
          `e${suffix}`,
          "e -> a/ā + e",
        ),
      );
    }

    if (wordIast.startsWith("o", index)) {
      const suffix = wordIast.slice(index + 1);
      [
        ["a", "u"],
        ["a", "ū"],
        ["ā", "u"],
        ["ā", "ū"],
      ].forEach(([leftVowel, rightVowel]) =>
        addCandidate(
          candidates,
          seen,
          "guna",
          wordIast,
          `${prefix}${leftVowel}`,
          `${rightVowel}${suffix}`,
          "o -> a/ā + u/ū",
        ),
      );

      ["a", "ā"].forEach((leftVowel) =>
        addCandidate(
          candidates,
          seen,
          "pararupa",
          wordIast,
          `${prefix}${leftVowel}`,
          `o${suffix}`,
          "o -> a/ā + o",
        ),
      );
    }

    if (wordIast.startsWith("ar", index)) {
      const suffix = wordIast.slice(index + 2);
      [
        ["a", "ṛ"],
        ["a", "ṝ"],
        ["ā", "ṛ"],
        ["ā", "ṝ"],
      ].forEach(([leftVowel, rightVowel]) =>
        addCandidate(
          candidates,
          seen,
          "guna",
          wordIast,
          `${prefix}${leftVowel}`,
          `${rightVowel}${suffix}`,
          "ar -> a/ā + ṛ/ṝ",
        ),
      );
    }

    if (wordIast.startsWith("al", index)) {
      const suffix = wordIast.slice(index + 2);
      [
        ["a", "ḷ"],
        ["ā", "ḷ"],
      ].forEach(([leftVowel, rightVowel]) =>
        addCandidate(
          candidates,
          seen,
          "guna",
          wordIast,
          `${prefix}${leftVowel}`,
          `${rightVowel}${suffix}`,
          "al -> a/ā + ḷ",
        ),
      );
    }

    if (wordIast.startsWith("ai", index)) {
      const suffix = wordIast.slice(index + 2);
      [
        ["a", "e"],
        ["a", "ai"],
        ["ā", "e"],
        ["ā", "ai"],
      ].forEach(([leftVowel, rightVowel]) =>
        addCandidate(
          candidates,
          seen,
          "vrddhi",
          wordIast,
          `${prefix}${leftVowel}`,
          `${rightVowel}${suffix}`,
          "ai -> a/ā + e/ai",
        ),
      );
    }

    if (wordIast.startsWith("au", index)) {
      const suffix = wordIast.slice(index + 2);
      [
        ["a", "o"],
        ["a", "au"],
        ["ā", "o"],
        ["ā", "au"],
      ].forEach(([leftVowel, rightVowel]) =>
        addCandidate(
          candidates,
          seen,
          "vrddhi",
          wordIast,
          `${prefix}${leftVowel}`,
          `${rightVowel}${suffix}`,
          "au -> a/ā + o/au",
        ),
      );
    }

    (
      [
        ["y", ["i", "ī"], "yan", "y + vowel -> i/ī + vowel"],
        ["v", ["u", "ū"], "yan", "v + vowel -> u/ū + vowel"],
        ["r", ["ṛ", "ṝ"], "yan", "r + vowel -> ṛ/ṝ + vowel"],
        ["l", ["ḷ"], "yan", "l + vowel -> ḷ + vowel"],
      ] as const
    ).forEach(([glide, sourceVowels, ruleId, pattern]) => {
      if (wordIast[index] !== glide) {
        return;
      }

      const visibleVowel = matchVowelAt(wordIast, index + 1);
      if (!visibleVowel) {
        return;
      }

      const suffix = wordIast.slice(index + 1 + visibleVowel.length);
      [...sourceVowels].forEach((sourceVowel) =>
        addCandidate(
          candidates,
          seen,
          ruleId,
          wordIast,
          `${prefix}${sourceVowel}`,
          `${visibleVowel}${suffix}`,
          pattern,
        ),
      );
    });

    [
      ["āy", "ai", "āy + vowel -> ai + vowel"],
      ["āv", "au", "āv + vowel -> au + vowel"],
      ["ay", "e", "ay + vowel -> e + vowel"],
      ["av", "o", "av + vowel -> o + vowel"],
    ].forEach(([surface, leftVowel, pattern]) => {
      if (!wordIast.startsWith(surface, index)) {
        return;
      }

      const visibleVowel = matchVowelAt(wordIast, index + surface.length);
      if (!visibleVowel) {
        return;
      }

      const suffix = wordIast.slice(index + surface.length + visibleVowel.length);
      addCandidate(
        candidates,
        seen,
        "ayavayava",
        wordIast,
        `${prefix}${leftVowel}`,
        `${visibleVowel}${suffix}`,
        pattern,
      );
    });

    [
      ["e'", "e", "e' -> e + a"],
      ["o'", "o", "o' -> o + a"],
    ].forEach(([surface, leftVowel, pattern]) => {
      if (!wordIast.startsWith(surface, index)) {
        return;
      }

      const suffix = wordIast.slice(index + surface.length);
      addCandidate(
        candidates,
        seen,
        "purvarupa",
        wordIast,
        `${prefix}${leftVowel}`,
        `a${suffix}`,
        pattern,
      );
    });
  }

  return candidates
    .sort((left, right) => {
      if (right.specificity !== left.specificity) {
        return right.specificity - left.specificity;
      }

      return left.leftIast.length + left.rightIast.length -
        (right.leftIast.length + right.rightIast.length);
    })
    .slice(0, MAX_BRANCH_RESULTS);
};

const buildNode = (
  wordIast: string,
  candidate: DirectCandidate | null,
  left: SandhiAnalysisNode | null,
  right: SandhiAnalysisNode | null,
): SandhiAnalysisNode => ({
  surface: formsFromIast(wordIast),
  step: candidate
    ? {
        ruleId: candidate.rule.id,
        label: candidate.rule.label,
        sutra: { ...candidate.rule.sutra },
        left: formsFromIast(candidate.leftIast),
        right: formsFromIast(candidate.rightIast),
        why: candidate.why,
        nimitta: candidate.rule.helper,
        pattern: candidate.pattern,
      }
    : null,
  left,
  right,
});

const buildSignature = (node: SandhiAnalysisNode): string => {
  if (!node.step || !node.left || !node.right) {
    return node.surface.iast;
  }

  return `${node.surface.iast}{${node.step.ruleId}:${buildSignature(node.left)}|${buildSignature(node.right)}}`;
};

const flattenSteps = (
  node: SandhiAnalysisNode,
  depth = 0,
): SandhiAnalysisStepLine[] => {
  if (!node.step || !node.left || !node.right) {
    return [];
  }

  return [
    {
      ...node.step,
      depth,
      surface: node.surface,
    },
    ...flattenSteps(node.left, depth + 1),
    ...flattenSteps(node.right, depth + 1),
  ];
};

const collectLeaves = (node: SandhiAnalysisNode): SurfaceForms[] => {
  if (!node.step || !node.left || !node.right) {
    return [node.surface];
  }

  return [...collectLeaves(node.left), ...collectLeaves(node.right)];
};

const analyzeBranch = (
  wordIast: string,
  depth: number,
  cache: Map<string, TreeCandidate[]>,
): TreeCandidate[] => {
  const cacheKey = `${wordIast}:${depth}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return cached;
  }

  if (depth >= MAX_DEPTH) {
    const terminal = [
      {
        node: buildNode(wordIast, null, null, null),
        signature: wordIast,
        score: 0,
      },
    ];
    cache.set(cacheKey, terminal);
    return terminal;
  }

  const directCandidates = findDirectCandidates(wordIast);
  if (directCandidates.length === 0) {
    const terminal = [
      {
        node: buildNode(wordIast, null, null, null),
        signature: wordIast,
        score: 0,
      },
    ];
    cache.set(cacheKey, terminal);
    return terminal;
  }

  const results: TreeCandidate[] = [];
  const seen = new Set<string>();

  directCandidates.forEach((candidate) => {
    const leftResults = analyzeBranch(candidate.leftIast, depth + 1, cache);
    const rightResults = analyzeBranch(candidate.rightIast, depth + 1, cache);

    leftResults.forEach((leftResult) => {
      rightResults.forEach((rightResult) => {
        const node = buildNode(
          wordIast,
          candidate,
          leftResult.node,
          rightResult.node,
        );
        const signature = buildSignature(node);

        if (seen.has(signature)) {
          return;
        }

        seen.add(signature);
        const stepCount = flattenSteps(node).length;
        results.push({
          node,
          signature,
          score:
            candidate.specificity * 100 +
            candidate.balance * 60 +
            (leftResult.score + rightResult.score) * 0.15 +
            Math.max(1, 8 - stepCount),
        });
      });
    });
  });

  const deduped = results
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return flattenSteps(left.node).length - flattenSteps(right.node).length;
    })
    .slice(0, MAX_BRANCH_RESULTS);

  cache.set(cacheKey, deduped);
  return deduped;
};

const applyLexicalValidation = (results: TreeCandidate[]) => results;

const clampResultLimit = (requested?: number) => {
  if (!Number.isFinite(requested)) {
    return DEFAULT_MAX_RESULTS;
  }

  return Math.min(
    MAX_RESULTS_CAP,
    Math.max(1, Math.floor(requested ?? DEFAULT_MAX_RESULTS)),
  );
};

export const analyzeSandhiWord = (
  input: string,
  preferredScript: SanskritInputScript = "auto",
  maxResults = DEFAULT_MAX_RESULTS,
): SandhiAnalyzeSuccessResponse | null => {
  const normalized = normalizeSanskritInput(input, preferredScript);

  if (!normalized) {
    return null;
  }

  const resultLimit = clampResultLimit(maxResults);
  const cache = new Map<string, TreeCandidate[]>();
  const analyzed = analyzeBranch(normalized.iast, 0, cache);
  const validated = applyLexicalValidation(analyzed);
  const nonTerminal = validated.filter((candidate) => candidate.node.step);
  const limited = nonTerminal.slice(0, resultLimit);

  return {
    engineVersion: "rule-v1",
    normalized,
    results: limited.map((candidate, index) => ({
      id: `${makeWordId(candidate.node.surface.devanagari)}-analysis-${index + 1}`,
      steps: flattenSteps(candidate.node),
      finalWords: collectLeaves(candidate.node),
      signature: candidate.signature,
      score: candidate.score,
    })),
    truncated: nonTerminal.length > resultLimit,
  };
};
