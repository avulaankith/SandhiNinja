export type Language = "en" | "sa" | "te";

export type GameMode = "arcade" | "fullSplit" | "devStudio";

export type TimerMode = "timed" | "untimed";

export type SandhiRuleId =
  | "savarna-dirgha"
  | "guna"
  | "vrddhi"
  | "yan"
  | "ayavayava"
  | "purvarupa"
  | "pararupa";

export type LocalizedText = Record<Language, string>;

export type WordStatus = "splittable" | "final";

export type SutraReference = {
  text: string;
  number: string;
};

export type ExplanationBlock = LocalizedText & {
  nimitta?: LocalizedText;
  note?: string;
};

export type WordNode = {
  id: string;
  devanagari: string;
  iast: string;
  telugu?: string;
  status: WordStatus;
  aksharas: string[];
  cuts: SandhiCut[];
  reviewNeeded?: boolean;
};

export type SandhiCut = {
  id: string;
  ruleId: SandhiRuleId;
  cutAfterAksharaIndex: number;
  left: WordNode;
  right: WordNode;
  explanation: ExplanationBlock;
  sutra: SutraReference;
  reviewNeeded?: boolean;
};

export type SandhiRule = {
  id: SandhiRuleId;
  shortcut: string;
  accent: string;
  label: LocalizedText;
  helper: LocalizedText;
  sutra: SutraReference;
};

export type ActiveToken = {
  instanceId: string;
  node: WordNode;
  depth: number;
};

export type LessonPayload = {
  node: WordNode;
  cut: SandhiCut;
  variantCount: number;
};

export type PlayerStats = {
  score: number;
  streak: number;
  lives: number;
  timer: number;
  completedWords: number;
  highScore: number;
  successfulCuts: number;
};

export type StoredProgress = {
  highScore: number;
  completedWords: number;
  successfulCuts: number;
  preferredLanguage: Language;
  preferredMode: GameMode;
  timerMode?: TimerMode;
  practiceSlowly?: boolean;
  practiceMode?: boolean;
};

export type SliceFeedback = {
  outcome: "correct" | "wrong" | "blocked";
  message: LocalizedText;
  lesson?: LessonPayload;
  activeTokens: ActiveToken[];
  roundCompleted: boolean;
  boundaryIndex?: number;
};
