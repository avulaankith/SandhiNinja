export type Language = "en" | "sa" | "te";

export type SandhiRuleId =
  | "savarna-dirgha"
  | "guna"
  | "vrddhi"
  | "yan"
  | "ayavayava"
  | "purvarupa"
  | "pararupa";

export type SanskritInputScript = "auto" | "iast" | "devanagari" | "telugu";

export type LocalizedText = Record<Language, string>;

export type SutraReference = {
  text: string;
  number: string;
};

export type SandhiRule = {
  id: SandhiRuleId;
  shortcut: string;
  accent: string;
  label: LocalizedText;
  helper: LocalizedText;
  sutra: SutraReference;
};

export type SurfaceForms = {
  iast: string;
  devanagari: string;
  telugu: string;
};

export type NormalizedSanskritInput = {
  script: Exclude<SanskritInputScript, "auto">;
  iast: string;
  devanagari: string;
  telugu: string;
};

export type SandhiAnalysisStep = {
  depth: number;
  ruleId: SandhiRuleId;
  label: LocalizedText;
  sutra: SutraReference;
  surface: SurfaceForms;
  left: SurfaceForms;
  right: SurfaceForms;
  pattern: string;
  why: LocalizedText;
  nimitta: LocalizedText;
};

export type SandhiAnalysisResult = {
  id: string;
  score: number;
  signature: string;
  finalWords: SurfaceForms[];
  steps: SandhiAnalysisStep[];
};

export type SandhiAnalyzeRequest = {
  input: string;
  script?: SanskritInputScript;
  maxResults?: number;
};

export type SandhiAnalyzeSuccessResponse = {
  engineVersion: "rule-v1";
  normalized: NormalizedSanskritInput;
  results: SandhiAnalysisResult[];
  truncated: boolean;
};

export type SandhiAnalyzeErrorResponse = {
  error: "bad_request" | "internal_error";
  message: string;
};
