export type Language = "en" | "sa" | "te";

export type SandhiFamily = "mixed" | "svara" | "vyanjana" | "visarga";

export type GameMode = "arcade" | "join" | "ninja" | "devStudio";

export type SessionPreset = "learn" | "practice" | "challenge";

export type TimerMode = "timed" | "untimed";

export type StudyMode = "guided" | "challenge";

export type AnswerAdvanceMode = "auto" | "manual";

export type SandhiRuleId =
  | "savarna-dirgha"
  | "guna"
  | "vrddhi"
  | "yan"
  | "ayavayava"
  | "purvarupa"
  | "pararupa"
  | "jashtva"
  | "chartva"
  | "anunasika"
  | "anusvara"
  | "purvasavarna"
  | "parasavarna"
  | "chhatva"
  | "tugagama"
  | "shcutva"
  | "shtutva"
  | "satva"
  | "yavalopa"
  | "visarga-sa"
  | "visarga-repha"
  | "visarga-lopa"
  | "visarga-o";

export type LocalizedText = Record<Language, string>;

export type WordStatus = "splittable" | "final";

export type SutraReference = {
  text: string;
  number: string;
};

export type SourceReference = {
  title: string;
  detail: LocalizedText;
  href?: string;
};

export type ExplanationBlock = LocalizedText & {
  nimitta?: LocalizedText;
  note?: LocalizedText | string;
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
  ruleChain?: SandhiRuleId[];
  cutAfterAksharaIndex: number;
  left: WordNode;
  right: WordNode;
  explanation: ExplanationBlock;
  sutra: SutraReference;
  reviewNeeded?: boolean;
};

export type SandhiRule = {
  id: SandhiRuleId;
  family: Exclude<SandhiFamily, "mixed">;
  shortcut: string;
  accent: string;
  label: LocalizedText;
  helper: LocalizedText;
  pattern: LocalizedText;
  sutra: SutraReference;
  sources: SourceReference[];
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

export type CampaignProgress = {
  splitMasteredWordIds: string[];
  joinMasteredWordIds: string[];
  graduationTimestamp?: string | null;
  endlessUnlocked?: boolean;
};

export type StoredProgress = {
  highScore: number;
  completedWords: number;
  successfulCuts: number;
  preferredLanguage: Language;
  preferredMode: GameMode;
  preferredFamily?: SandhiFamily;
  sessionPreset?: SessionPreset;
  clockEnabled?: boolean;
  ninjaHelpOpen?: boolean;
  ninjaShowNimitta?: boolean;
  campaign?: CampaignProgress;
  timerMode?: TimerMode;
  studyMode?: StudyMode;
  practiceSlowly?: boolean;
  practiceMode?: boolean;
  answerAdvanceMode?: AnswerAdvanceMode;
  answerRevealDelayMs?: number;
  timerDurationSeconds?: number;
};

export type SliceAssessment =
  | "both-correct"
  | "place-correct-rule-wrong"
  | "place-wrong-rule-correct"
  | "both-wrong"
  | "final-word";

export type SliceFeedback = {
  outcome: "correct" | "wrong" | "blocked";
  message: LocalizedText;
  lesson?: LessonPayload;
  revealLesson?: LessonPayload;
  availableRuleIds?: SandhiRuleId[];
  activeTokens: ActiveToken[];
  roundCompleted: boolean;
  boundaryIndex?: number;
  assessment?: SliceAssessment;
  interactionId?: string;
  bottomOut?: boolean;
};
