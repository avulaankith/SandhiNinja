import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BrandMark from "./components/BrandMark";
import LanguageToggle from "./components/LanguageToggle";
import LessonPanel from "./components/LessonPanel";
import ModeSelector from "./components/ModeSelector";
import SandhiFamilySelector from "./components/SandhiFamilySelector";
import ScorePanel from "./components/ScorePanel";
import DevStudio from "./components/DevStudio";
import ArcadeArena from "./components/ArcadeArena";
import SandhiJoinBoard from "./components/SandhiJoinBoard";
import SandhiSplitBoard from "./components/SandhiSplitBoard";
import {
  DEFAULT_SANDHI_BANK,
  SANDHI_RULES,
  STORAGE_KEYS,
  cloneWordNode,
  isFurtherSplittable,
  isGameplayEligible,
  parseWordEntries,
} from "./data/sandhiBank";
import { modeLabel, t } from "./data/uiText";
import type {
  ActiveToken,
  AnswerAdvanceMode,
  CampaignProgress,
  GameMode,
  Language,
  LessonPayload,
  PlayerStats,
  SandhiFamily,
  SandhiRule,
  SandhiRuleId,
  SessionPreset,
  SliceFeedback,
  StoredProgress,
  StudyMode,
  WordNode,
} from "./types/sandhi";

type GameplayMode = Exclude<GameMode, "devStudio">;

const getVisibleMode = (mode?: GameMode): GameplayMode =>
  mode === "join" || mode === "ninja" ? mode : "arcade";

const DEFAULT_LANGUAGE: Language = "en";
const DEFAULT_MODE: GameMode = "arcade";
const DEFAULT_FAMILY: SandhiFamily = "mixed";
const DEFAULT_RULE: SandhiRuleId = "savarna-dirgha";
const TIMER_DURATION_OPTIONS = [45, 60, 75, 90] as const;
const DEFAULT_TIMER_DURATION_SECONDS = 60;
const DEFAULT_LIVES = 4;
const REVEAL_THRESHOLD = 4;
const DEFAULT_SESSION_PRESET: SessionPreset = "learn";
const DEFAULT_STUDY_MODE: StudyMode = "guided";
const DEFAULT_ANSWER_ADVANCE_MODE: AnswerAdvanceMode = "auto";
const FONT_LOAD_TIMEOUT_MS = 2200;
const FEEDBACK_CLEAR_DELAY_MS = 3200;
const ANSWER_REVEAL_DELAY_OPTIONS = [12000, 16000, 20000] as const;
const DEFAULT_ANSWER_REVEAL_DELAY_MS = 16000;
const TIME_UP_ADVANCE_DELAY_MS = 2600;
const RECENT_WORD_MEMORY = 8;
const MAX_VISIBLE_RULE_OPTIONS = 6;
const GAME_FONT_SPECS = [
  '600 42px "Noto Serif Devanagari"',
  '500 20px "Anek Telugu"',
  '500 18px "IBM Plex Sans"',
];
const BUILT_IN_CAMPAIGN_WORDS = DEFAULT_SANDHI_BANK.filter(isGameplayEligible);
const BUILT_IN_CAMPAIGN_WORD_IDS = new Set(
  BUILT_IN_CAMPAIGN_WORDS.map((entry) => entry.id),
);

const PRESET_DEFAULTS: Record<
  SessionPreset,
  {
    answerAdvanceMode: AnswerAdvanceMode;
    answerRevealDelayMs: number;
    clockEnabled: boolean;
    studyMode: StudyMode;
  }
> = {
  learn: {
    answerAdvanceMode: "manual",
    answerRevealDelayMs: 16000,
    clockEnabled: false,
    studyMode: "guided",
  },
  practice: {
    answerAdvanceMode: "manual",
    answerRevealDelayMs: 16000,
    clockEnabled: false,
    studyMode: "guided",
  },
  challenge: {
    answerAdvanceMode: "auto",
    answerRevealDelayMs: 12000,
    clockEnabled: true,
    studyMode: "challenge",
  },
};

const makeDefaultStats = (): PlayerStats => ({
  score: 0,
  streak: 0,
  lives: DEFAULT_LIVES,
  timer: DEFAULT_TIMER_DURATION_SECONDS,
  completedWords: 0,
  highScore: 0,
  successfulCuts: 0,
});

const makeDefaultCampaignProgress = (): CampaignProgress => ({
  splitMasteredWordIds: [],
  joinMasteredWordIds: [],
  graduationTimestamp: null,
  endlessUnlocked: false,
});

const normalizeAnswerRevealDelay = (value?: number) =>
  ANSWER_REVEAL_DELAY_OPTIONS.includes(
    value as (typeof ANSWER_REVEAL_DELAY_OPTIONS)[number],
  )
    ? value
    : DEFAULT_ANSWER_REVEAL_DELAY_MS;

const normalizeTimerDuration = (value?: number) =>
  TIMER_DURATION_OPTIONS.includes(
    value as (typeof TIMER_DURATION_OPTIONS)[number],
  )
    ? value
    : DEFAULT_TIMER_DURATION_SECONDS;

const dedupeIds = (value: string[] | undefined) =>
  [...new Set((value ?? []).filter((entryId) => BUILT_IN_CAMPAIGN_WORD_IDS.has(entryId)))];

const deriveSessionPreset = (value: StoredProgress | null): SessionPreset => {
  if (
    value?.sessionPreset === "learn" ||
    value?.sessionPreset === "practice" ||
    value?.sessionPreset === "challenge"
  ) {
    return value.sessionPreset;
  }

  if (value?.studyMode === "challenge") {
    return "challenge";
  }

  if (value?.practiceMode) {
    return "learn";
  }

  if (value?.timerMode === "untimed" || value?.practiceSlowly) {
    return "practice";
  }

  return DEFAULT_SESSION_PRESET;
};

const normalizeCampaignProgress = (
  value: CampaignProgress | undefined,
): CampaignProgress => {
  const normalized = value ?? makeDefaultCampaignProgress();

  return {
    splitMasteredWordIds: dedupeIds(normalized.splitMasteredWordIds),
    joinMasteredWordIds: dedupeIds(normalized.joinMasteredWordIds),
    graduationTimestamp: normalized.graduationTimestamp ?? null,
    endlessUnlocked:
      normalized.endlessUnlocked === true ||
      Boolean(normalized.graduationTimestamp),
  };
};

const loadStoredProgress = (): StoredProgress | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.progress);
    return raw ? (JSON.parse(raw) as StoredProgress) : null;
  } catch {
    return null;
  }
};

const normalizeStoredProgress = (value: StoredProgress | null): StoredProgress | null => {
  if (!value) {
    return null;
  }

  const preferredLanguage =
    value.preferredLanguage === "sa" || value.preferredLanguage === "te"
      ? value.preferredLanguage
      : DEFAULT_LANGUAGE;
  const preferredMode =
    value.preferredMode === "join" ||
    value.preferredMode === "ninja" ||
    value.preferredMode === "devStudio"
      ? value.preferredMode
      : "arcade";
  const sessionPreset = deriveSessionPreset(value);
  const presetDefaults = PRESET_DEFAULTS[sessionPreset];
  const answerAdvanceMode =
    value.answerAdvanceMode === "manual"
      ? "manual"
      : value.answerAdvanceMode === "auto"
        ? "auto"
        : presetDefaults.answerAdvanceMode;

  return {
    ...value,
    preferredLanguage,
    preferredMode,
    sessionPreset,
    clockEnabled:
      typeof value.clockEnabled === "boolean"
        ? value.clockEnabled
        : value.timerMode
          ? value.timerMode === "timed"
          : presetDefaults.clockEnabled,
    campaign: normalizeCampaignProgress(value.campaign),
    answerAdvanceMode,
    answerRevealDelayMs: normalizeAnswerRevealDelay(value.answerRevealDelayMs),
    timerDurationSeconds: normalizeTimerDuration(value.timerDurationSeconds),
  };
};

const loadCustomEntries = (): WordNode[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.customEntries);
    return raw ? parseWordEntries(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
};

const getTimerSeconds = (_mode: GameplayMode, timerDurationSeconds: number) =>
  timerDurationSeconds;

const getCorrectScoreGain = (streak: number, studyMode: StudyMode) =>
  studyMode === "challenge" ? 165 + streak * 24 : 120 + streak * 18;

const getWrongScorePenalty = (mode: GameplayMode, preset: SessionPreset) =>
  mode === "ninja" && preset === "challenge" ? 36 : 0;

const countRemainingSplitsInNode = (node: WordNode): number => {
  const canonicalCut = node.cuts.find((entry) => !entry.reviewNeeded) ?? null;

  if (!canonicalCut) {
    return 0;
  }

  return (
    1 +
    countRemainingSplitsInNode(canonicalCut.left) +
    countRemainingSplitsInNode(canonicalCut.right)
  );
};

const countRemainingSplitsInTokens = (tokens: ActiveToken[]) =>
  tokens.reduce((total, token) => total + countRemainingSplitsInNode(token.node), 0);

const RULE_LOOKUP = new Map(SANDHI_RULES.map((rule) => [rule.id, rule]));

const shuffleArray = <T,>(items: T[]) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

const buildRoundPool = (entries: WordNode[], recentWordIds: string[]) => {
  const shuffled = shuffleArray(entries);

  if (shuffled.length <= 2 || recentWordIds.length === 0) {
    return shuffled;
  }

  const recentSet = new Set(
    recentWordIds.slice(-Math.min(Math.max(3, Math.ceil(shuffled.length / 4)), RECENT_WORD_MEMORY)),
  );
  const fresh = shuffled.filter((entry) => !recentSet.has(entry.id));
  const recent = shuffled.filter((entry) => recentSet.has(entry.id));

  return fresh.length > 0 ? [...fresh, ...recent] : shuffled;
};

const pushRecentWordId = (history: string[], wordId: string) => {
  const deduped = history.filter((entryId) => entryId !== wordId);
  return [...deduped, wordId].slice(-RECENT_WORD_MEMORY);
};

const getRulesForFamily = (family: SandhiFamily) =>
  family === "mixed"
    ? SANDHI_RULES
    : SANDHI_RULES.filter((rule) => rule.family === family);

const wordMatchesFamily = (node: WordNode, family: SandhiFamily): boolean =>
  family === "mixed" ||
  node.cuts.some((cut): boolean => {
    if (cut.reviewNeeded) {
      return false;
    }

    const cutRuleIds = [cut.ruleId, ...(cut.ruleChain ?? [])];
    return (
      cutRuleIds.some((ruleId) => RULE_LOOKUP.get(ruleId)?.family === family) ||
      wordMatchesFamily(cut.left, family) ||
      wordMatchesFamily(cut.right, family)
    );
  });

const getVisibleRuleIdsFromTokens = (tokens: ActiveToken[]) => {
  const ids = new Set<SandhiRuleId>();

  tokens.forEach((token) => {
    if (!isFurtherSplittable(token.node)) {
      return;
    }

    token.node.cuts.forEach((cut) => {
      if (!cut.reviewNeeded) {
        ids.add(cut.ruleId);
        cut.ruleChain?.forEach((ruleId) => ids.add(ruleId));
      }
    });
  });

  return [...ids];
};

const hashString = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
};

const stableShuffleBySeed = <T,>(
  items: T[],
  seed: string,
  getKey: (item: T) => string,
) =>
  [...items].sort((left, right) => {
    const leftKey = getKey(left);
    const rightKey = getKey(right);
    const scoreDiff =
      hashString(`${seed}:${leftKey}`) - hashString(`${seed}:${rightKey}`);

    return scoreDiff !== 0 ? scoreDiff : leftKey.localeCompare(rightKey);
  });

const getPoolForMode = (entries: WordNode[], family: SandhiFamily) => {
  const gameplayEntries = entries
    .filter(isGameplayEligible)
    .filter((entry) => wordMatchesFamily(entry, family));

  return gameplayEntries;
};

const buildVisibleRuleContextKey = (
  tokens: ActiveToken[],
  currentWordId: string,
  mode: GameplayMode,
  family: SandhiFamily,
  ruleIds: SandhiRuleId[],
  priorityRuleIds: SandhiRuleId[],
) =>
  `${mode}:${family}:${currentWordId}:${tokens
    .map((token) => `${token.depth}:${token.node.id}:${token.node.devanagari}`)
    .join("|")}:${ruleIds.join(",")}:${priorityRuleIds.join(",")}`;

const downloadJson = (filename: string, value: unknown) => {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

function App() {
  const storedProgress = useMemo(
    () => normalizeStoredProgress(loadStoredProgress()),
    [],
  );
  const storedCustomEntries = useMemo(loadCustomEntries, []);
  const storedCampaign = useMemo(
    () => normalizeCampaignProgress(storedProgress?.campaign),
    [storedProgress],
  );
  const storedPreset = storedProgress?.sessionPreset ?? DEFAULT_SESSION_PRESET;
  const storedPresetDefaults = PRESET_DEFAULTS[storedPreset];

  const [language, setLanguage] = useState<Language>(
    storedProgress?.preferredLanguage ?? DEFAULT_LANGUAGE,
  );
  const [mode, setMode] = useState<GameMode>(
    getVisibleMode(storedProgress?.preferredMode) ?? DEFAULT_MODE,
  );
  const [selectedFamily, setSelectedFamily] = useState<SandhiFamily>(
    storedProgress?.preferredFamily ?? DEFAULT_FAMILY,
  );
  const [sessionPreset, setSessionPreset] = useState<SessionPreset>(
    storedPreset,
  );
  const [clockEnabled, setClockEnabled] = useState<boolean>(
    storedProgress?.clockEnabled ?? storedPresetDefaults.clockEnabled,
  );
  const [answerAdvanceMode, setAnswerAdvanceMode] = useState<AnswerAdvanceMode>(
    storedProgress?.answerAdvanceMode ?? storedPresetDefaults.answerAdvanceMode,
  );
  const [answerRevealDelayMs, setAnswerRevealDelayMs] = useState<number>(
    storedProgress?.answerRevealDelayMs ?? storedPresetDefaults.answerRevealDelayMs,
  );
  const [timerDurationSeconds, setTimerDurationSeconds] = useState<number>(
    storedProgress?.timerDurationSeconds ?? DEFAULT_TIMER_DURATION_SECONDS,
  );
  const [ninjaHelpOpen, setNinjaHelpOpen] = useState<boolean>(
    storedProgress?.ninjaHelpOpen ?? true,
  );
  const [ninjaShowNimitta, setNinjaShowNimitta] = useState<boolean>(
    storedProgress?.ninjaShowNimitta ?? false,
  );
  const [selectedRuleId, setSelectedRuleId] =
    useState<SandhiRuleId>(DEFAULT_RULE);
  const [customEntries, setCustomEntries] = useState<WordNode[]>(storedCustomEntries);
  const [campaignProgress, setCampaignProgress] =
    useState<CampaignProgress>(storedCampaign);
  const [stats, setStats] = useState<PlayerStats>(() => ({
    ...makeDefaultStats(),
    highScore: storedProgress?.highScore ?? 0,
    completedWords: storedProgress?.completedWords ?? 0,
    successfulCuts: storedProgress?.successfulCuts ?? 0,
  }));
  const [lesson, setLesson] = useState<LessonPayload | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showAnswerMeta, setShowAnswerMeta] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [visibleTokens, setVisibleTokens] = useState<ActiveToken[]>([]);
  const [availableRuleIds, setAvailableRuleIds] = useState<SandhiRuleId[]>([]);
  const [priorityRuleIds, setPriorityRuleIds] = useState<SandhiRuleId[]>([]);
  const [wordProgress, setWordProgress] = useState({
    arcade: { index: 0, cycle: 0 },
    join: { index: 0, cycle: 0 },
    ninja: { index: 0, cycle: 0 },
  });
  const [interactionLocked, setInteractionLocked] = useState(false);
  const [awaitingPracticeAdvance, setAwaitingPracticeAdvance] = useState(false);
  const [roundResetNonce, setRoundResetNonce] = useState(0);
  const [fontsReady, setFontsReady] = useState(
    () => typeof document === "undefined" || !("fonts" in document),
  );
  const [showGraduation, setShowGraduation] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState<
    "lesson" | "progress" | "mode" | "language" | "family" | null
  >(null);
  const [isTouchLayout, setIsTouchLayout] = useState(false);
  const [isNarrowTouchLayout, setIsNarrowTouchLayout] = useState(false);

  const feedbackTimerRef = useRef<number | null>(null);
  const nextWordTimerRef = useRef<number | null>(null);
  const wrongAttemptsRef = useRef(0);
  const lastHandledInteractionIdRef = useRef<string | null>(null);
  const lastActiveTokensRef = useRef<ActiveToken[]>([]);
  const lastRevealLessonRef = useRef<LessonPayload | null>(null);
  const lastGameplayModeRef = useRef<GameplayMode>(
    getVisibleMode(storedProgress?.preferredMode),
  );
  const roundRevealUsedRef = useRef(false);
  const roundFailedRef = useRef(false);
  const recentWordIdsRef = useRef({
    arcade: [] as string[],
    join: [] as string[],
    ninja: [] as string[],
  });

  const allEntries = useMemo(
    () => {
      const merged = new Map(DEFAULT_SANDHI_BANK.map((entry) => [entry.id, entry]));
      customEntries.forEach((entry) => merged.set(entry.id, entry));
      return [...merged.values()];
    },
    [customEntries],
  );
  const activeRules = useMemo(
    () => getRulesForFamily(selectedFamily),
    [selectedFamily],
  );
  const studyMode: StudyMode = PRESET_DEFAULTS[sessionPreset].studyMode;
  const isStudioMode = mode === "devStudio";
  const isJoinMode = mode === "join";
  const isNinjaMode = mode === "ninja";
  const isTouchGameLayout = isTouchLayout && !isStudioMode;
  const effectiveMode: GameplayMode = isStudioMode ? lastGameplayModeRef.current : mode;
  const arcadePool = useMemo(
    () => buildRoundPool(getPoolForMode(allEntries, selectedFamily), recentWordIdsRef.current.arcade),
    [allEntries, selectedFamily, wordProgress.arcade.cycle],
  );
  const joinPool = useMemo(
    () => buildRoundPool(getPoolForMode(allEntries, selectedFamily), recentWordIdsRef.current.join),
    [allEntries, selectedFamily, wordProgress.join.cycle],
  );
  const ninjaPool = useMemo(
    () => buildRoundPool(getPoolForMode(allEntries, selectedFamily), recentWordIdsRef.current.ninja),
    [allEntries, selectedFamily, wordProgress.ninja.cycle],
  );
  const activePool =
    effectiveMode === "join"
      ? joinPool
      : effectiveMode === "ninja"
        ? ninjaPool
        : arcadePool;
  const poolLengthsRef = useRef({
    arcade: arcadePool.length,
    join: joinPool.length,
    ninja: ninjaPool.length,
  });
  poolLengthsRef.current = {
    arcade: arcadePool.length,
    join: joinPool.length,
    ninja: ninjaPool.length,
  };
  const poolIndex =
    effectiveMode === "join"
      ? wordProgress.join.index
      : effectiveMode === "ninja"
        ? wordProgress.ninja.index
        : wordProgress.arcade.index;
  const safePoolIndex =
    activePool.length > 0 ? Math.min(poolIndex, activePool.length - 1) : 0;
  const currentWord = activePool[safePoolIndex] ?? activePool[0] ?? DEFAULT_SANDHI_BANK[0];
  const currentRoundKey = useMemo(() => {
    const progress =
      effectiveMode === "join"
        ? wordProgress.join
        : effectiveMode === "ninja"
          ? wordProgress.ninja
          : wordProgress.arcade;

    return `${effectiveMode}:${progress.cycle}:${progress.index}:${currentWord.id}:${roundResetNonce}`;
  }, [
    currentWord.id,
    effectiveMode,
    roundResetNonce,
    wordProgress.arcade.cycle,
    wordProgress.arcade.index,
    wordProgress.join.cycle,
    wordProgress.join.index,
    wordProgress.ninja.cycle,
    wordProgress.ninja.index,
  ]);
  const activeTokensForUi =
    visibleTokens.length > 0
      ? visibleTokens
      : [
          {
            instanceId: "preview-root",
            node: cloneWordNode(currentWord),
            depth: 0,
          },
        ];
  const currentVisibleRuleIds = useMemo(
    () =>
      availableRuleIds.length > 0
        ? availableRuleIds
        : getVisibleRuleIdsFromTokens(activeTokensForUi),
    [activeTokensForUi, availableRuleIds],
  );
  const visibleRuleContextKey = useMemo(
    () =>
      buildVisibleRuleContextKey(
        activeTokensForUi,
        currentWord.id,
        effectiveMode,
        selectedFamily,
        currentVisibleRuleIds,
        priorityRuleIds,
      ),
    [
      activeTokensForUi,
      currentVisibleRuleIds,
      currentWord.id,
      effectiveMode,
      priorityRuleIds,
      selectedFamily,
    ],
  );
  const wordRuleOrder = useMemo(
    () =>
      stableShuffleBySeed(
        activeRules,
        `${effectiveMode}:${selectedFamily}:${currentWord.id}`,
        (rule) => rule.id,
      ).map((rule) => rule.id),
    [activeRules, currentWord.id, effectiveMode, selectedFamily],
  );
  const computedVisibleRules = useMemo(() => {
    const activeRuleMap = new Map(activeRules.map((rule) => [rule.id, rule]));
    const orderIndex = new Map(wordRuleOrder.map((ruleId, index) => [ruleId, index]));
    const priorityIndex = new Map(
      priorityRuleIds.map((ruleId, index) => [ruleId, index]),
    );
    const sortByWordOrder = (rules: SandhiRule[]) =>
      [...rules].sort((left, right) => {
        const leftPriority = priorityIndex.get(left.id);
        const rightPriority = priorityIndex.get(right.id);

        if (leftPriority !== undefined || rightPriority !== undefined) {
          if (leftPriority === undefined) {
            return 1;
          }

          if (rightPriority === undefined) {
            return -1;
          }

          if (leftPriority !== rightPriority) {
            return leftPriority - rightPriority;
          }
        }

        const leftIndex = orderIndex.get(left.id) ?? Number.MAX_SAFE_INTEGER;
        const rightIndex = orderIndex.get(right.id) ?? Number.MAX_SAFE_INTEGER;

        return leftIndex - rightIndex || left.id.localeCompare(right.id);
      });
    const relevantRules = sortByWordOrder(
      currentVisibleRuleIds
      .map((ruleId) => activeRuleMap.get(ruleId) ?? null)
      .filter((rule): rule is (typeof activeRules)[number] => Boolean(rule)),
    );

    let candidateRules = activeRules;

    if (activeRules.length > MAX_VISIBLE_RULE_OPTIONS) {
      if (relevantRules.length > MAX_VISIBLE_RULE_OPTIONS) {
        candidateRules = relevantRules;
      } else {
        const preferredFamilies =
          relevantRules.length > 0
            ? [...new Set(relevantRules.map((rule) => rule.family))]
            : selectedFamily === "mixed"
              ? []
              : [selectedFamily];
        const relevantIds = new Set(relevantRules.map((rule) => rule.id));
        const preferredFamilyRules = sortByWordOrder(
          activeRules.filter(
            (rule) => preferredFamilies.includes(rule.family) && !relevantIds.has(rule.id),
          ),
        );
        const remainingRules = sortByWordOrder(
          activeRules.filter(
            (rule) => !preferredFamilies.includes(rule.family) && !relevantIds.has(rule.id),
          ),
        );

        candidateRules = [
          ...relevantRules,
          ...preferredFamilyRules,
          ...remainingRules,
        ].slice(0, MAX_VISIBLE_RULE_OPTIONS);
      }
    }

    return sortByWordOrder(candidateRules);
  }, [
    activeRules,
    currentVisibleRuleIds,
    priorityRuleIds,
    selectedFamily,
    wordRuleOrder,
  ]);
  const visibleRulesCacheRef = useRef<{ key: string; rules: SandhiRule[] } | null>(null);
  const visibleRules = useMemo(() => {
    if (
      !visibleRulesCacheRef.current ||
      visibleRulesCacheRef.current.key !== visibleRuleContextKey
    ) {
      visibleRulesCacheRef.current = {
        key: visibleRuleContextKey,
        rules: computedVisibleRules,
      };
    }

    return visibleRulesCacheRef.current.rules;
  }, [computedVisibleRules, visibleRuleContextKey]);
  const languageRef = useRef(language);
  const modeRef = useRef(mode);
  const familyRef = useRef(selectedFamily);
  const sessionPresetRef = useRef(sessionPreset);
  const clockEnabledRef = useRef(clockEnabled);
  const effectiveModeRef = useRef(effectiveMode);
  const studyModeRef = useRef(studyMode);
  const answerAdvanceModeRef = useRef(answerAdvanceMode);
  const answerRevealDelayMsRef = useRef(answerRevealDelayMs);
  const timerDurationSecondsRef = useRef(timerDurationSeconds);

  languageRef.current = language;
  modeRef.current = mode;
  familyRef.current = selectedFamily;
  sessionPresetRef.current = sessionPreset;
  clockEnabledRef.current = clockEnabled;
  effectiveModeRef.current = effectiveMode;
  studyModeRef.current = studyMode;
  answerAdvanceModeRef.current = answerAdvanceMode;
  answerRevealDelayMsRef.current = answerRevealDelayMs;
  timerDurationSecondsRef.current = timerDurationSeconds;

  const persistProgress = (
    nextLanguage: Language,
    nextMode: GameMode,
    nextFamily: SandhiFamily,
    nextSessionPreset: SessionPreset,
    nextClockEnabled: boolean,
    nextNinjaHelpOpen: boolean,
    nextNinjaShowNimitta: boolean,
    nextStats: PlayerStats,
    nextCampaign: CampaignProgress = campaignProgress,
  ) => {
    const payload: StoredProgress = {
      highScore: nextStats.highScore,
      completedWords: nextStats.completedWords,
      successfulCuts: nextStats.successfulCuts,
      preferredLanguage: nextLanguage,
      preferredMode: nextMode,
      preferredFamily: nextFamily,
      sessionPreset: nextSessionPreset,
      clockEnabled: nextClockEnabled,
      ninjaHelpOpen: nextNinjaHelpOpen,
      ninjaShowNimitta: nextNinjaShowNimitta,
      campaign: nextCampaign,
      answerAdvanceMode: answerAdvanceModeRef.current,
      answerRevealDelayMs: answerRevealDelayMsRef.current,
      timerDurationSeconds: timerDurationSecondsRef.current,
    };

    window.localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(payload));
  };

  const persistCustomEntries = (entries: WordNode[]) => {
    window.localStorage.setItem(STORAGE_KEYS.customEntries, JSON.stringify(entries));
  };

  const resetTimer = (nextMode: GameplayMode = effectiveModeRef.current) =>
    setStats((current) => ({
      ...current,
      timer: getTimerSeconds(nextMode, timerDurationSecondsRef.current),
    }));

  const clearFeedbackTimer = () => {
    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  };

  const clearNextWordTimer = () => {
    if (nextWordTimerRef.current) {
      window.clearTimeout(nextWordTimerRef.current);
      nextWordTimerRef.current = null;
    }
  };

  const shouldWaitForNextWord = () => answerAdvanceModeRef.current === "manual";

  const shouldAutoAdvanceToNextWord = () =>
    answerAdvanceModeRef.current === "auto";

  const getAnswerAdvanceDelay = () => answerRevealDelayMsRef.current;

  const persistCampaignProgress = (
    updater:
      | CampaignProgress
      | ((current: CampaignProgress) => CampaignProgress),
  ) => {
    setCampaignProgress((current) => {
      const next =
        typeof updater === "function"
          ? (updater as (current: CampaignProgress) => CampaignProgress)(current)
          : updater;

      persistProgress(
        languageRef.current,
        modeRef.current,
        familyRef.current,
        sessionPresetRef.current,
        clockEnabledRef.current,
        ninjaHelpOpen,
        ninjaShowNimitta,
        stats,
        next,
      );

      return next;
    });
  };

  const markRoundRevealUsed = () => {
    roundRevealUsedRef.current = true;
  };

  const markRoundFailed = () => {
    roundFailedRef.current = true;
  };

  const resetRoundFlags = () => {
    roundRevealUsedRef.current = false;
    roundFailedRef.current = false;
  };

  const advanceToNextWord = () => {
    clearNextWordTimer();
    lastHandledInteractionIdRef.current = null;
    setAwaitingPracticeAdvance(false);
    setInteractionLocked(false);
    setLesson(null);
    setShowAnswerMeta(false);
    setPriorityRuleIds([]);
    resetAttempts();
    resetRoundFlags();
    setStats((current) => ({ ...current, lives: DEFAULT_LIVES }));

    setWordProgress((current) => {
      const key = effectiveModeRef.current;
      const currentProgress = current[key];
      const poolLength = poolLengthsRef.current[key];

      if (poolLength <= 1) {
        return {
          ...current,
          [key]: {
            index: 0,
            cycle: currentProgress.cycle + 1,
          },
        };
      }

      const nextIndex = currentProgress.index + 1;
      if (nextIndex < poolLength) {
        return {
          ...current,
          [key]: {
            ...currentProgress,
            index: nextIndex,
          },
        };
      }

      return {
        ...current,
        [key]: {
          index: 0,
          cycle: currentProgress.cycle + 1,
        },
      };
    });

    resetTimer();
  };

  const scheduleNextWord = (delay = getAnswerAdvanceDelay()) => {
    clearNextWordTimer();

    nextWordTimerRef.current = window.setTimeout(() => {
      nextWordTimerRef.current = null;
      if (!shouldAutoAdvanceToNextWord()) {
        return;
      }
      advanceToNextWord();
    }, delay);
  };

  const scheduleRoundReset = (delay = getAnswerAdvanceDelay()) => {
    clearNextWordTimer();

    nextWordTimerRef.current = window.setTimeout(() => {
      nextWordTimerRef.current = null;
      clearNextWordTimer();
      clearFeedbackTimer();
      lastHandledInteractionIdRef.current = null;
      setAwaitingPracticeAdvance(false);
      resetTimer();
      setInteractionLocked(false);
      setLesson(null);
      setShowAnswerMeta(false);
      setFeedback(null);
      setAvailableRuleIds([]);
      setPriorityRuleIds([]);
      const previewTokens = [
        {
          instanceId: "preview-root",
          node: cloneWordNode(currentWord),
          depth: 0,
        },
      ];
      lastActiveTokensRef.current = previewTokens;
      lastRevealLessonRef.current = buildRevealLesson(previewTokens);
      resetAttempts();
      resetRoundFlags();
      setStats((current) => ({ ...current, lives: DEFAULT_LIVES }));
      setRoundResetNonce((currentNonce) => currentNonce + 1);
    }, delay);
  };

  const updateStats = (updater: (current: PlayerStats) => PlayerStats) => {
    setStats((current) => {
      const next = updater(current);
      const normalized = {
        ...next,
        highScore: Math.max(next.highScore, next.score),
      };
      persistProgress(
        languageRef.current,
        modeRef.current,
        familyRef.current,
        sessionPresetRef.current,
        clockEnabledRef.current,
        ninjaHelpOpen,
        ninjaShowNimitta,
        normalized,
        campaignProgress,
      );
      return normalized;
    });
  };

  const clearFeedbackLater = () => {
    clearFeedbackTimer();
    feedbackTimerRef.current = window.setTimeout(() => {
      feedbackTimerRef.current = null;
      setFeedback(null);
    }, FEEDBACK_CLEAR_DELAY_MS);
  };

  const resetAttempts = () => {
    wrongAttemptsRef.current = 0;
    setRevealed(false);
  };

  // Given the tokens currently on screen, find the sub-word the player is stuck
  // on and build the lesson that reveals its correct cut (rule + place + why).
  const buildRevealLesson = (tokens: ActiveToken[]): LessonPayload | null => {
    const stuck = tokens.find((token) => isFurtherSplittable(token.node));
    if (!stuck) {
      return null;
    }

    const cut = stuck.node.cuts.find((entry) => !entry.reviewNeeded);
    if (!cut) {
      return null;
    }

    const variantCount = stuck.node.cuts.filter(
      (entry) => !entry.reviewNeeded && entry.cutAfterAksharaIndex === cut.cutAfterAksharaIndex,
    ).length;

    return { node: stuck.node, cut, variantCount };
  };

  const getRevealTokens = () =>
    lastActiveTokensRef.current.length > 0
      ? lastActiveTokensRef.current
      : visibleTokens.length > 0
        ? visibleTokens
        : [
            {
              instanceId: "preview-root",
              node: cloneWordNode(currentWord),
              depth: 0,
            },
          ];

  const formatNinjaFeedback = (
    baseMessage: string,
    revealLesson: LessonPayload | null | undefined,
  ) => {
    if (!revealLesson) {
      return baseMessage;
    }

    const nextRule = RULE_LOOKUP.get(revealLesson.cut.ruleId);
    if (!nextRule) {
      return baseMessage;
    }

    if (languageRef.current === "sa") {
      return `${baseMessage} · अनन्तरं ${nextRule.label.sa}`;
    }

    if (languageRef.current === "te") {
      return `${baseMessage} · తరువాత ${nextRule.label.te}`;
    }

    return `${baseMessage} · Next: ${nextRule.label.en}`;
  };

  const registerCampaignMastery = (solvedMode: GameplayMode, wordId: string) => {
    if (
      solvedMode === "ninja" ||
      sessionPresetRef.current === "learn" ||
      roundRevealUsedRef.current ||
      roundFailedRef.current ||
      !BUILT_IN_CAMPAIGN_WORD_IDS.has(wordId)
    ) {
      return;
    }

    persistCampaignProgress((current) => {
      const splitSet = new Set(current.splitMasteredWordIds);
      const joinSet = new Set(current.joinMasteredWordIds);

      if (solvedMode === "arcade") {
        splitSet.add(wordId);
      }

      if (solvedMode === "join") {
        joinSet.add(wordId);
      }

      const alreadyGraduated = Boolean(current.graduationTimestamp);
      const nextGraduated =
        splitSet.size >= BUILT_IN_CAMPAIGN_WORDS.length &&
        joinSet.size >= BUILT_IN_CAMPAIGN_WORDS.length;
      const graduationTimestamp =
        alreadyGraduated || !nextGraduated
          ? current.graduationTimestamp ?? null
          : new Date().toISOString();

      const next = {
        splitMasteredWordIds: [...splitSet],
        joinMasteredWordIds: [...joinSet],
        graduationTimestamp,
        endlessUnlocked:
          current.endlessUnlocked === true || Boolean(graduationTimestamp),
      };

      if (!alreadyGraduated && nextGraduated) {
        setShowGraduation(true);
      }

      return next;
    });
  };

  // Practice-mode on-demand reveal. Does not lock interaction — the player can
  // keep working after peeking at the answer.
  const handleRevealAnswer = () => {
    const revealLesson =
      lastRevealLessonRef.current ?? buildRevealLesson(getRevealTokens());
    if (!revealLesson) {
      return;
    }

    const revealRuleIds = [
      revealLesson.cut.ruleId,
      ...(revealLesson.cut.ruleChain ?? []),
    ];
    markRoundRevealUsed();
    setLesson(revealLesson);
    setRevealed(true);
    setShowAnswerMeta(true);
    setInteractionLocked(false);
    setPriorityRuleIds(revealRuleIds);
    setSelectedRuleId(revealLesson.cut.ruleId);
    setFeedback(t("revealTitle", languageRef.current));
    clearFeedbackLater();
  };

  const handleFeedback = (payload: SliceFeedback) => {
    if (
      payload.interactionId &&
      lastHandledInteractionIdRef.current === payload.interactionId
    ) {
      return;
    }

    if (payload.interactionId) {
      lastHandledInteractionIdRef.current = payload.interactionId;
    }

    lastActiveTokensRef.current = payload.activeTokens;
    setVisibleTokens(payload.activeTokens);
    setAvailableRuleIds(
      payload.availableRuleIds ?? getVisibleRuleIdsFromTokens(payload.activeTokens),
    );
    lastRevealLessonRef.current =
      payload.revealLesson ?? buildRevealLesson(payload.activeTokens);
    setFeedback(payload.message[languageRef.current]);
    clearFeedbackLater();

    if (payload.lesson) {
      setLesson(payload.lesson);
      setPriorityRuleIds([
        payload.lesson.cut.ruleId,
        ...(payload.lesson.cut.ruleChain ?? []),
      ]);
    }

    if (payload.outcome === "correct") {
      const currentMode = effectiveModeRef.current;
      setInteractionLocked(false);
      setAwaitingPracticeAdvance(false);
      setShowAnswerMeta(Boolean(payload.lesson));
      resetAttempts();
      updateStats((current) => ({
        ...current,
        score:
          current.score +
          getCorrectScoreGain(current.streak, studyModeRef.current),
        streak: current.streak + 1,
        successfulCuts: current.successfulCuts + 1,
        completedWords: payload.roundCompleted
          ? current.completedWords + 1
          : current.completedWords,
      }));

      if (currentMode === "ninja" && !payload.roundCompleted) {
        const nextLesson =
          payload.revealLesson ?? buildRevealLesson(payload.activeTokens);
        setFeedback(formatNinjaFeedback(payload.message[languageRef.current], nextLesson));
        clearFeedbackLater();
      }

      if (payload.roundCompleted) {
        registerCampaignMastery(effectiveModeRef.current, currentWord.id);
        setInteractionLocked(true);
        const shouldWaitForManualAdvance = shouldWaitForNextWord();

        if (shouldWaitForManualAdvance) {
          clearNextWordTimer();
          setAwaitingPracticeAdvance(true);

          if (answerAdvanceModeRef.current === "manual") {
            clearFeedbackTimer();
            setFeedback(t("answerWaitHint", languageRef.current));
          }
          return;
        }
        scheduleNextWord(getAnswerAdvanceDelay());
      }

      return;
    }

    if (payload.outcome === "blocked") {
      setInteractionLocked(false);
      setAwaitingPracticeAdvance(false);
      setShowAnswerMeta(false);
      setRevealed(false);
      setLesson(null);
      return;
    }

    if (payload.outcome === "wrong") {
      const currentMode = effectiveModeRef.current;
      const currentPreset = sessionPresetRef.current;

      if (currentMode === "ninja") {
        setInteractionLocked(false);
        setAwaitingPracticeAdvance(false);
        setShowAnswerMeta(false);
        setRevealed(false);
        setLesson(null);

        if (!payload.bottomOut) {
          resetAttempts();
          if (currentPreset === "challenge") {
            updateStats((current) => ({
              ...current,
              score: Math.max(0, current.score - getWrongScorePenalty(currentMode, currentPreset)),
              streak: 0,
            }));
          }
          return;
        }

        markRoundFailed();
        markRoundRevealUsed();
        const revealLesson =
          payload.revealLesson ?? buildRevealLesson(payload.activeTokens);
        if (revealLesson) {
          setLesson(revealLesson);
          setRevealed(true);
          setShowAnswerMeta(true);
          setPriorityRuleIds([
            revealLesson.cut.ruleId,
            ...(revealLesson.cut.ruleChain ?? []),
          ]);
          setSelectedRuleId(revealLesson.cut.ruleId);
        }

        if (currentPreset === "learn") {
          setInteractionLocked(true);
          scheduleRoundReset(getAnswerAdvanceDelay());
          return;
        }

        updateStats((current) => ({
          ...current,
          lives:
            currentPreset === "challenge"
              ? Math.max(current.lives - 1, 0)
              : current.lives,
          streak: 0,
        }));

        setInteractionLocked(true);
        if (shouldWaitForNextWord()) {
          clearNextWordTimer();
          setAwaitingPracticeAdvance(true);
          return;
        }

        scheduleNextWord(getAnswerAdvanceDelay());
        return;
      }

      setInteractionLocked(false);
      setAwaitingPracticeAdvance(false);
      setShowAnswerMeta(false);
      setRevealed(false);
      setLesson(null);
      const nextAttempts = wrongAttemptsRef.current + 1;
      wrongAttemptsRef.current = nextAttempts;
      const guidedMode = studyModeRef.current === "guided";
      const challengeMode = studyModeRef.current === "challenge";
      const revealDue = nextAttempts >= REVEAL_THRESHOLD;
      const livesAfterWrong =
        guidedMode && revealDue
          ? DEFAULT_LIVES
          : Math.max(DEFAULT_LIVES - nextAttempts, 0);

      setStats((current) => {
        const next = {
          ...current,
          lives: livesAfterWrong,
          streak: 0,
          highScore: Math.max(current.highScore, current.score),
        };

        persistProgress(
          languageRef.current,
          modeRef.current,
          familyRef.current,
          sessionPresetRef.current,
          clockEnabledRef.current,
          ninjaHelpOpen,
          ninjaShowNimitta,
          next,
          campaignProgress,
        );

        return next;
      });

      if (guidedMode && revealDue) {
        markRoundRevealUsed();
        const revealLesson =
          payload.revealLesson ?? buildRevealLesson(payload.activeTokens);
        if (revealLesson) {
          setLesson(revealLesson);
          setRevealed(true);
          setShowAnswerMeta(true);
          setInteractionLocked(false);
          setPriorityRuleIds([
            revealLesson.cut.ruleId,
            ...(revealLesson.cut.ruleChain ?? []),
          ]);
          setSelectedRuleId(revealLesson.cut.ruleId);
        }
        wrongAttemptsRef.current = 0;

        if (feedbackTimerRef.current) {
          clearFeedbackTimer();
        }
        setFeedback(t("revealChip", languageRef.current));
        return;
      }

      if (challengeMode && revealDue) {
        markRoundRevealUsed();
        markRoundFailed();
        const revealLesson =
          payload.revealLesson ?? buildRevealLesson(payload.activeTokens);
        if (revealLesson) {
          setLesson(revealLesson);
          setRevealed(true);
          setShowAnswerMeta(true);
          setInteractionLocked(true);
          setPriorityRuleIds([
            revealLesson.cut.ruleId,
            ...(revealLesson.cut.ruleChain ?? []),
          ]);
          setSelectedRuleId(revealLesson.cut.ruleId);
        }

        if (feedbackTimerRef.current) {
          clearFeedbackTimer();
        }
        wrongAttemptsRef.current = 0;
        setFeedback(t("challengeOutOfLives", languageRef.current));

        if (shouldWaitForNextWord()) {
          clearNextWordTimer();
          setAwaitingPracticeAdvance(true);
          return;
        }

        setAwaitingPracticeAdvance(false);
        scheduleNextWord(getAnswerAdvanceDelay());
        return;
      }
      return;
    }
  };

  useEffect(() => {
    if (typeof document === "undefined" || !("fonts" in document)) {
      setFontsReady(true);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setFontsReady(true);
      }
    }, FONT_LOAD_TIMEOUT_MS);

    void Promise.allSettled(
      GAME_FONT_SPECS.map((fontSpec) => document.fonts.load(fontSpec)),
    ).finally(() => {
      window.clearTimeout(timeoutId);
      if (!cancelled) {
        setFontsReady(true);
      }
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 860px)");
    const narrowMediaQuery = window.matchMedia("(max-width: 760px)");
    const syncLayout = () => {
      setIsTouchLayout(mediaQuery.matches);
      setIsNarrowTouchLayout(narrowMediaQuery.matches);
    };
    syncLayout();

    if ("addEventListener" in mediaQuery && "addEventListener" in narrowMediaQuery) {
      mediaQuery.addEventListener("change", syncLayout);
      narrowMediaQuery.addEventListener("change", syncLayout);
      return () => {
        mediaQuery.removeEventListener("change", syncLayout);
        narrowMediaQuery.removeEventListener("change", syncLayout);
      };
    }

    const legacyMediaQuery = mediaQuery as MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
      removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    };
    const legacyNarrowMediaQuery = narrowMediaQuery as MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
      removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    };

    legacyMediaQuery.addListener?.(syncLayout);
    legacyNarrowMediaQuery.addListener?.(syncLayout);
    return () => {
      legacyMediaQuery.removeListener?.(syncLayout);
      legacyNarrowMediaQuery.removeListener?.(syncLayout);
    };
  }, []);

  useEffect(() => {
    if (isStudioMode) {
      return;
    }

    const key = effectiveMode;
    recentWordIdsRef.current = {
      ...recentWordIdsRef.current,
      [key]: pushRecentWordId(recentWordIdsRef.current[key], currentWord.id),
    };
  }, [currentWord.id, effectiveMode, isStudioMode]);

  useEffect(() => {
    persistCustomEntries(customEntries);
  }, [customEntries]);

  useEffect(() => {
    persistProgress(
      language,
      mode,
      selectedFamily,
      sessionPreset,
      clockEnabled,
      ninjaHelpOpen,
      ninjaShowNimitta,
      stats,
      campaignProgress,
    );
  }, [
    answerAdvanceMode,
    answerRevealDelayMs,
    campaignProgress,
    clockEnabled,
    language,
    mode,
    ninjaHelpOpen,
    ninjaShowNimitta,
    selectedFamily,
    sessionPreset,
    stats,
    timerDurationSeconds,
  ]);

  useEffect(() => {
    if (answerAdvanceMode === "manual") {
      clearNextWordTimer();
    }
  }, [answerAdvanceMode]);

  useEffect(() => {
    if (selectedFamily !== "mixed" && activeRules.length === 0) {
      setSelectedFamily("mixed");
      return;
    }

    if (isNinjaMode) {
      return;
    }

    if (visibleRules.length > 0 && !visibleRules.some((rule) => rule.id === selectedRuleId)) {
      setSelectedRuleId(visibleRules[0].id);
    }
  }, [activeRules, isNinjaMode, selectedFamily, selectedRuleId, visibleRules]);

  useEffect(() => {
    setWordProgress((current) => ({
      arcade: { index: 0, cycle: current.arcade.cycle + 1 },
      join: { index: 0, cycle: current.join.cycle + 1 },
      ninja: { index: 0, cycle: current.ninja.cycle + 1 },
    }));
  }, [selectedFamily]);

  useEffect(
    () => () => {
      if (feedbackTimerRef.current) {
        window.clearTimeout(feedbackTimerRef.current);
      }
      if (nextWordTimerRef.current) {
        window.clearTimeout(nextWordTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (mode === "devStudio" || !clockEnabled || interactionLocked) {
      return;
    }

    const interval = window.setInterval(() => {
      setStats((current) => {
        const nextTimer = current.timer - 1;
        if (nextTimer <= 0) {
          markRoundFailed();
          markRoundRevealUsed();
          setInteractionLocked(true);
          setFeedback(t("timeUp", language));
          clearFeedbackLater();
          if (shouldWaitForNextWord()) {
            setAwaitingPracticeAdvance(true);
          } else {
            scheduleNextWord(TIME_UP_ADVANCE_DELAY_MS);
          }
          return {
            ...current,
            timer: 0,
            streak: 0,
          };
        }

        return {
          ...current,
          timer: nextTimer,
        };
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [clockEnabled, interactionLocked, language, mode]);

  useEffect(() => {
    clearNextWordTimer();
    clearFeedbackTimer();
    lastHandledInteractionIdRef.current = null;
    setAwaitingPracticeAdvance(false);
    setFeedback(null);
    setAvailableRuleIds([]);
    setPriorityRuleIds([]);
    setVisibleTokens([]);
    setShowAnswerMeta(false);
    const previewTokens = [
      {
        instanceId: "preview-root",
        node: cloneWordNode(currentWord),
        depth: 0,
      },
    ];
    lastActiveTokensRef.current = previewTokens;
    lastRevealLessonRef.current = buildRevealLesson(previewTokens);
    resetTimer(effectiveMode);
    setInteractionLocked(false);
    setLesson(null);
    resetAttempts();
    resetRoundFlags();
    setStats((current) => ({ ...current, lives: DEFAULT_LIVES }));
  }, [currentRoundKey, currentWord, effectiveMode, mode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const pressedKey = event.key.toLowerCase();
      const matchedRule = visibleRules.find(
        (rule) => rule.shortcut.toLowerCase() === pressedKey,
      );

      if (matchedRule) {
        setSelectedRuleId(matchedRule.id);
      }

      if (event.key.toLowerCase() === "r") {
        clearNextWordTimer();
        clearFeedbackTimer();
        lastHandledInteractionIdRef.current = null;
        resetTimer();
        setInteractionLocked(false);
        setLesson(null);
        setShowAnswerMeta(false);
        setFeedback(null);
        setAvailableRuleIds([]);
        setPriorityRuleIds([]);
        setAwaitingPracticeAdvance(false);
        const previewTokens = [
          {
            instanceId: "preview-root",
            node: cloneWordNode(currentWord),
            depth: 0,
          },
        ];
        lastActiveTokensRef.current = previewTokens;
        lastRevealLessonRef.current = buildRevealLesson(previewTokens);
        resetAttempts();
        setStats((current) => ({ ...current, lives: DEFAULT_LIVES }));
        setRoundResetNonce((current) => current + 1);
      }

      if (event.key.toLowerCase() === "n" && modeRef.current !== "devStudio") {
        advanceToNextWord();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentRoundKey, visibleRules]);

  const handleSaveEntry = (entry: WordNode) => {
    setCustomEntries((current) => {
      const filtered = current.filter((item) => item.id !== entry.id);
      return [...filtered, entry];
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    setCustomEntries((current) => current.filter((entry) => entry.id !== entryId));
  };

  const handleImportEntries = (payload: unknown) => {
    const parsed = parseWordEntries(payload);
    if (parsed.length === 0) {
      setFeedback(t("importNoValidEntries", languageRef.current));
      clearFeedbackLater();
      return;
    }

    setCustomEntries((current) => {
      const preserved = current.filter(
        (item) => !parsed.some((entry) => entry.id === item.id),
      );
      return [...preserved, ...parsed];
    });
  };

  const handleExportEntries = () => {
    downloadJson("sandhi-ninja-custom-entries.json", customEntries);
  };

  const familyOptions = useMemo(() => {
    const gameplayEntries = allEntries.filter(isGameplayEligible);
    const buildExamples = (family: SandhiFamily) => {
      if (family === "mixed") {
        return (["savarna-dirgha", "jashtva", "anusvara"] as SandhiRuleId[])
          .map((ruleId) => RULE_LOOKUP.get(ruleId)?.label[language] ?? null)
          .filter((value): value is string => Boolean(value))
          .join(" · ");
      }

      return getRulesForFamily(family)
        .slice(0, 3)
        .map((rule) => rule.label[language])
        .join(" · ");
    };

    return (["mixed", "svara", "vyanjana", "visarga"] as SandhiFamily[]).map((family) => {
      const familyRules = getRulesForFamily(family);
      const wordCount =
        family === "mixed"
          ? gameplayEntries.length
          : gameplayEntries.filter((entry) => wordMatchesFamily(entry, family)).length;

      return {
        id: family,
        examples: buildExamples(family),
        ruleCount: familyRules.length,
        wordCount,
        disabled: family !== "mixed" && (familyRules.length === 0 || wordCount === 0),
      };
    });
  }, [allEntries, language]);
  const currentTargetLesson = useMemo(
    () => buildRevealLesson(activeTokensForUi),
    [activeTokensForUi],
  );
  const currentTargetToken = useMemo(
    () =>
      activeTokensForUi.find((token) => isFurtherSplittable(token.node)) ??
      activeTokensForUi[0] ??
      null,
    [activeTokensForUi],
  );
  const currentTargetNode = currentTargetToken?.node ?? currentTargetLesson?.node ?? currentWord;
  const currentTargetCut =
    currentTargetLesson?.cut ??
    currentWord.cuts.find((entry) => !entry.reviewNeeded) ??
    currentWord.cuts[0] ??
    null;
  const selectedRule =
    visibleRules.find((rule) => rule.id === selectedRuleId) ??
    visibleRules[0] ??
    activeRules[0] ??
    SANDHI_RULES[0];
  const currentTargetRule =
    (currentTargetCut ? RULE_LOOKUP.get(currentTargetCut.ruleId) : null) ?? selectedRule;
  const lessonRule = lesson ? RULE_LOOKUP.get(lesson.cut.ruleId) ?? null : null;
  const lessonRuleLabel = lessonRule?.label[language] ?? "";
  const currentTargetExplanation =
    currentTargetCut?.explanation[language] ?? currentTargetRule.helper[language];
  const currentTargetNimitta = currentTargetCut?.explanation.nimitta?.[language] ?? null;
  const remainingSplits = countRemainingSplitsInTokens(activeTokensForUi);
  const selectedRuleSummary =
    studyMode === "guided"
      ? selectedRule.helper[language]
      : t("challengeDockHint", language);
  const showAnswerButton = sessionPreset !== "challenge";
  const campaignSummary = {
    splitMastered: campaignProgress.splitMasteredWordIds.length,
    joinMastered: campaignProgress.joinMasteredWordIds.length,
    splitTotal: BUILT_IN_CAMPAIGN_WORDS.length,
    joinTotal: BUILT_IN_CAMPAIGN_WORDS.length,
    overallPercent: Math.round(
      ((campaignProgress.splitMasteredWordIds.length +
        campaignProgress.joinMasteredWordIds.length) /
        Math.max(BUILT_IN_CAMPAIGN_WORDS.length * 2, 1)) *
        100,
    ),
    graduationTimestamp: campaignProgress.graduationTimestamp,
    endlessUnlocked:
      campaignProgress.endlessUnlocked === true ||
      Boolean(campaignProgress.graduationTimestamp),
  };
  const sessionPresetLabel =
    sessionPreset === "learn"
      ? language === "sa"
        ? "अध्ययनम्"
        : language === "te"
          ? "అభ్యాసం"
          : "Learn"
      : sessionPreset === "practice"
        ? language === "sa"
          ? "अभ्यासः"
          : language === "te"
            ? "సాధన"
            : "Practice"
        : language === "sa"
          ? "आह्वानम्"
        : language === "te"
          ? "సవాలు"
          : "Challenge";
  const mobileSessionButtonLabel = `${sessionPresetLabel} · ${campaignSummary.overallPercent}%`;
  const currentLanguageLabel =
    language === "sa" ? "संस्कृतम्" : language === "te" ? "తెలుగు" : "English";
  const currentFamilyLabel =
    selectedFamily === "mixed"
      ? t("familyMixed", language)
      : selectedFamily === "svara"
        ? t("familySvara", language)
        : selectedFamily === "vyanjana"
          ? t("familyVyanjana", language)
          : t("familyVisarga", language);
  const quickModeLabel =
    language === "sa" ? "प्रकारः" : language === "te" ? "విధానం" : "Mode";
  const quickLanguageLabel =
    language === "sa" ? "भाषा" : language === "te" ? "భాష" : "Language";
  const quickFamilyLabel =
    language === "sa" ? "समूहः" : language === "te" ? "సమూహం" : "Set";
  const dockNotes = [
    t(isJoinMode ? "joinBoundaryHint" : "splitMarkerHint", language),
    t(isJoinMode ? "joinRuleHint" : "splitRuleHint", language),
  ].filter((value): value is string => Boolean(value));
  const remainingSplitsLabel =
    language === "sa"
      ? `अवशिष्टभेदाः ${remainingSplits}`
      : language === "te"
        ? `మిగిలిన విడిపోట్లు ${remainingSplits}`
        : `${remainingSplits} splits left`;
  const ninjaTimingLabel =
    language === "sa"
      ? clockEnabled
        ? "कालबद्धम्"
        : "अकालबद्धम्"
      : language === "te"
        ? clockEnabled
          ? "కాల పరిమితి"
          : "సమయ పరిమితి లేదు"
        : clockEnabled
          ? "Timed"
          : "Untimed";
  const ninjaHelpToggleLabel =
    language === "sa"
      ? ninjaHelpOpen
        ? "साहाय्यं गोपय"
        : "साहाय्यं दर्शय"
      : language === "te"
        ? ninjaHelpOpen
          ? "సహాయం దాచు"
          : "సహాయం చూపు"
        : ninjaHelpOpen
          ? "Hide help"
          : "Show help";
  const ninjaNimittaToggleLabel =
    language === "sa"
      ? ninjaShowNimitta
        ? "निमित्तं गोपय"
        : "निमित्तं दर्शय"
      : language === "te"
        ? ninjaShowNimitta
          ? "నిమిత్తం దాచు"
          : "నిమిత్తం చూపు"
        : ninjaShowNimitta
          ? "Hide nimitta"
          : "Show nimitta";
  const dockShortcutLegend = isNinjaMode
    ? ""
    : `${t(isJoinMode ? "glueShortcutLegend" : "shortcutLegend", language)} · R · N`;
  const ninjaTrailTokens = isNinjaMode
    ? activeTokensForUi.map((token) => ({
        id: token.instanceId,
        label: token.node.devanagari,
        secondary:
          language === "te" && token.node.telugu ? token.node.telugu : token.node.iast,
        splittable: isFurtherSplittable(token.node),
        active: currentTargetToken?.instanceId === token.instanceId,
      }))
    : [];
  const showMobileLessonCard =
    isTouchLayout &&
    !isStudioMode &&
    (Boolean(lesson) || Boolean(feedback));
  const mobileDrawerTitle =
    mobileDrawer === "progress"
      ? language === "sa"
        ? "अभ्यासः, प्रगति, स्नातकमार्गः"
        : language === "te"
          ? "అభ్యాసం, ప్రగతి, పట్టాభిషేక మార్గం"
          : "Session, progress, and graduation"
      : mobileDrawer === "mode"
        ? quickModeLabel
        : mobileDrawer === "language"
          ? quickLanguageLabel
          : mobileDrawer === "family"
            ? quickFamilyLabel
            : t("currentLesson", language);

  useEffect(() => {
    if (isStudioMode) {
      return;
    }

    setStats((current) => ({
      ...current,
      timer: timerDurationSeconds,
    }));
  }, [isStudioMode, timerDurationSeconds]);

  useEffect(() => {
    if (!isNinjaMode || !currentTargetCut) {
      return;
    }

    setSelectedRuleId(currentTargetCut.ruleId);
  }, [currentTargetCut, isNinjaMode]);

  const onboardingSteps = isNinjaMode
    ? [
        {
          title:
            language === "sa"
              ? "लक्ष्यसन्धिं पश्य"
              : language === "te"
                ? "లక్ష్య సంధిని చూడండి"
                : "See the target sandhi",
          body:
            language === "sa"
              ? "निन्जा-छेदे सन्धिचयनं नास्ति। उपरि सूचितं लक्ष्यसन्धिम् एव छिन्धि।"
              : language === "te"
                ? "నింజా విభజనంలో సంధిని మీరు ఎంచుకోరు. పైకి చూపిన లక్ష్య సంధినే కోయాలి."
                : "Ninja Slice shows the target sandhi directly, so you only focus on the split location and timing.",
        },
        {
          title:
            language === "sa"
              ? "स्वाइपेन् छिन्धि"
              : language === "te"
                ? "స్వైప్ చేసి కోయండి"
                : "Swipe through the guide",
          body:
            language === "sa"
              ? "स्वर्णरेखायां सम्यक् स्वाइप् कुरु। रिक्ते स्थाने स्वाइप् दण्डं न ददाति।"
              : language === "te"
                ? "బంగారు మార్గదర్శక రేఖ మీదుగా సరిగ్గా స్వైప్ చేయండి. ఖాళీ గాలిలో స్వైప్ చేస్తే శిక్ష లేదు."
                : "Swipe through the correct gold guide on the falling word. Empty-air swipes do not hurt you.",
        },
        {
          title:
            language === "sa"
              ? "पतनात् पूर्वम्"
              : language === "te"
                ? "కింద పడక ముందే"
                : "Solve before it drops",
          body:
            language === "sa"
              ? "अधः पतने दोषफलम् प्रकारानुसारम् भवति। शिक्षणे पुनः तदेव पदं लभ्यते।"
              : language === "te"
                ? "పదం కిందకు చేరితే విధానాన్ని బట్టి ఫలితం మారుతుంది. అభ్యాసంలో అదే పదాన్ని మళ్లీ ప్రయత్నిస్తారు."
                : "If the word reaches the bottom, the result depends on the session preset. Learn retries the same word; Challenge moves on faster.",
        },
      ]
    : isJoinMode
      ? [
          {
            title: t("onboardingJoinStepOneTitle", language),
            body: t("onboardingJoinStepOneBody", language),
          },
          {
            title: t("onboardingJoinStepTwoTitle", language),
            body: t("onboardingJoinStepTwoBody", language),
          },
          {
            title: t("onboardingJoinStepThreeTitle", language),
            body: t("onboardingJoinStepThreeBody", language),
          },
        ]
      : [
          {
            title: t("onboardingStepOneTitle", language),
            body: t("onboardingStepOneBody", language),
          },
          {
            title: t("onboardingStepTwoTitle", language),
            body: t("onboardingStepTwoBody", language),
          },
          {
            title: t("onboardingStepThreeTitle", language),
            body: t("onboardingStepThreeBody", language),
          },
        ];
  if (!isStudioMode) {
    lastGameplayModeRef.current = mode;
  }
  const resetCurrentRound = () => {
    clearNextWordTimer();
    clearFeedbackTimer();
    lastHandledInteractionIdRef.current = null;
    setAwaitingPracticeAdvance(false);
    resetTimer();
    setInteractionLocked(false);
    setLesson(null);
    setShowAnswerMeta(false);
    setFeedback(null);
    setAvailableRuleIds([]);
    setPriorityRuleIds([]);
    const previewTokens = [
      {
        instanceId: "preview-root",
        node: cloneWordNode(currentWord),
        depth: 0,
      },
    ];
    lastActiveTokensRef.current = previewTokens;
    lastRevealLessonRef.current = buildRevealLesson(previewTokens);
    resetAttempts();
    resetRoundFlags();
    setStats((current) => ({ ...current, lives: DEFAULT_LIVES }));
    setRoundResetNonce((current) => current + 1);
  };

  const handleSessionPresetChange = (nextPreset: SessionPreset) => {
    setSessionPreset(nextPreset);
    const defaults = PRESET_DEFAULTS[nextPreset];
    setClockEnabled(defaults.clockEnabled);
    setAnswerAdvanceMode(defaults.answerAdvanceMode);
    setAnswerRevealDelayMs(defaults.answerRevealDelayMs);
    resetCurrentRound();
  };

  const handleResetCampaign = () => {
    setShowGraduation(false);
    persistCampaignProgress(makeDefaultCampaignProgress());
  };

  return (
    <div
      className={`app-shell ${isStudioMode ? "" : "app-shell--game"} ${
        isTouchLayout && !isStudioMode
          ? `app-shell--touch ${
              isNarrowTouchLayout ? "app-shell--touch-narrow" : "app-shell--touch-tablet"
            }`
          : ""
      }`}
    >
      <div className="ambient ambient--left" />
      <div className="ambient ambient--right" />

      <header className={`hero ${isTouchGameLayout ? "hero--touch" : ""}`}>
        <div className="hero-copy">
          <div className="hero-brand">
            <BrandMark />
            <div className="hero-brand__text">
              <span className="hero-kicker">{modeLabel(mode, language)}</span>
              <h1>{t("title", language)}</h1>
            </div>
          </div>
          {!isTouchGameLayout ? <p>{t("subtitle", language)}</p> : null}
          {!isStudioMode && !isTouchGameLayout ? (
            <div className="hero-progress-chip">
              <span className="panel-kicker">
                {language === "sa"
                  ? "अभियानप्रगति:"
                  : language === "te"
                    ? "ప్రచార ప్రగతి"
                    : "Campaign progress"}
              </span>
              <strong>{campaignSummary.overallPercent}%</strong>
            </div>
          ) : null}
        </div>

        <div className="hero-controls">
          {isTouchGameLayout ? (
            <div className="mobile-quick-controls">
              <button
                className={`mobile-quick-button ${mobileDrawer === "mode" ? "active" : ""}`}
                onClick={() => setMobileDrawer("mode")}
                type="button"
              >
                <span>{quickModeLabel}</span>
                <strong>{modeLabel(mode, language)}</strong>
              </button>
              <button
                className={`mobile-quick-button ${
                  mobileDrawer === "language" ? "active" : ""
                }`}
                onClick={() => setMobileDrawer("language")}
                type="button"
              >
                <span>{quickLanguageLabel}</span>
                <strong>{currentLanguageLabel}</strong>
              </button>
              <button
                className={`mobile-quick-button ${mobileDrawer === "family" ? "active" : ""}`}
                onClick={() => setMobileDrawer("family")}
                type="button"
              >
                <span>{quickFamilyLabel}</span>
                <strong>{currentFamilyLabel}</strong>
              </button>
            </div>
          ) : (
            <>
              <div className="hero-controls__top">
                <ModeSelector language={language} mode={mode} onChange={setMode} />
                <div className="hero-utility-row">
                  <LanguageToggle language={language} onChange={setLanguage} />
                  <div className="hero-word-chip">
                    <strong>{currentWord.devanagari}</strong>
                  </div>
                </div>
              </div>

              {!isStudioMode ? (
                <SandhiFamilySelector
                  compact={isTouchGameLayout}
                  language={language}
                  onChange={setSelectedFamily}
                  options={familyOptions}
                  selectedFamily={selectedFamily}
                />
              ) : null}
            </>
          )}
        </div>
      </header>

      <main className={`main-grid ${isStudioMode ? "main-grid--studio" : ""}`}>
        {isStudioMode ? (
          <section className="arena-column arena-column--studio">
            <DevStudio
              entries={allEntries}
              customEntries={customEntries}
              defaultEntryIds={DEFAULT_SANDHI_BANK.map((entry) => entry.id)}
              language={language}
              onDeleteEntry={handleDeleteEntry}
              onExportEntries={handleExportEntries}
              onImportEntries={handleImportEntries}
              onSaveEntry={handleSaveEntry}
              rules={SANDHI_RULES}
            />
          </section>
        ) : (
          <>
            <section className="arena-column">
              <div className="arena-frame glass-panel">
                <div className="arena-banner">
                  <div>
                    <span className="panel-kicker">
                      {isNinjaMode
                        ? language === "sa"
                          ? "लक्ष्यसन्धिं छिन्धि"
                          : language === "te"
                            ? "లక్ష్య సంధిని కోయండి"
                            : "Slice the target sandhi"
                        : t(isJoinMode ? "joinTarget" : "slicePrompt", language)}
                    </span>
                    {!isTouchGameLayout ? (
                      <strong>
                        {isNinjaMode ? currentTargetNode.devanagari : currentWord.devanagari}
                      </strong>
                    ) : null}
                    {isNinjaMode && !isTouchGameLayout ? (
                      <div
                        className={`arena-banner__subline ${
                          isTouchLayout ? "arena-banner__subline--compact" : ""
                        }`}
                      >
                        <span>{currentTargetRule.label[language]}</span>
                        <span>{currentTargetRule.sutra.number}</span>
                        {!isTouchLayout && ninjaHelpOpen ? (
                          <span>{currentTargetRule.pattern[language]}</span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="arena-banner__status">
                    {feedback ? (
                      <span
                        className={`feedback-chip ${
                          revealed || showAnswerMeta ? "feedback-chip--reveal" : ""
                        }`}
                      >
                        {feedback}
                      </span>
                    ) : null}
                    <span className="shortcut-row">
                      {isNinjaMode
                        ? remainingSplitsLabel
                        : `${t("splitsLeft", language)} · ${remainingSplits}`}
                    </span>
                  </div>
                </div>

                <div className="game-stage-shell">
                  {isJoinMode ? (
                    <SandhiJoinBoard
                      key={currentRoundKey}
                      interactionLocked={interactionLocked}
                      language={language}
                      onFeedback={handleFeedback}
                      roundKey={currentRoundKey}
                      resetNonce={roundResetNonce}
                      rootWord={currentWord}
                      selectedRuleId={selectedRuleId}
                      studyMode={studyMode}
                    />
                  ) : isNinjaMode ? (
                    <ArcadeArena
                      clockEnabled={clockEnabled}
                      fontsReady={fontsReady}
                      interactionLocked={interactionLocked}
                      language={language}
                      mode="ninja"
                      onFeedback={handleFeedback}
                      rootWord={currentWord}
                      roundKey={currentRoundKey}
                      selectedRuleId={currentTargetRule.id}
                      studyMode={studyMode}
                    />
                  ) : (
                    <SandhiSplitBoard
                      key={currentRoundKey}
                      fontsReady={fontsReady}
                      interactionLocked={interactionLocked}
                      language={language}
                      onFeedback={handleFeedback}
                      rootWord={currentWord}
                      roundKey={currentRoundKey}
                      selectedRuleId={selectedRuleId}
                      studyMode={studyMode}
                    />
                  )}

                  {isNinjaMode && ninjaTrailTokens.length > 0 && !isTouchLayout ? (
                    <div className="ninja-trail glass-panel">
                      <div className="ninja-trail__header">
                        <span className="panel-kicker">
                          {language === "sa"
                            ? "वर्तमानभेदक्रमः"
                            : language === "te"
                              ? "ప్రస్తుత విభజన క్రమం"
                              : "Current split trail"}
                        </span>
                        <span className="shortcut-row">{remainingSplitsLabel}</span>
                      </div>
                      <div className="ninja-trail__tokens">
                        {ninjaTrailTokens.map((token) => (
                          <div
                            className={`ninja-trail__token ${
                              token.active
                                ? "ninja-trail__token--active"
                                : token.splittable
                                  ? "ninja-trail__token--pending"
                                  : "ninja-trail__token--final"
                            }`}
                            key={token.id}
                          >
                            <strong>{token.label}</strong>
                            <span>{token.secondary}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {showMobileLessonCard ? (
                    <div className="mobile-lesson-card glass-panel">
                      <div className="mobile-lesson-card__header">
                        <span className="panel-kicker">{t("currentLesson", language)}</span>
                        {feedback ? (
                          <span
                            className={`feedback-chip ${
                              revealed || showAnswerMeta ? "feedback-chip--reveal" : ""
                            }`}
                          >
                            {feedback}
                          </span>
                        ) : null}
                      </div>

                      {lesson ? (
                        <div className="mobile-lesson-card__body">
                          <div className="mobile-lesson-card__topline">
                            <strong>{lessonRuleLabel}</strong>
                            <span>{lesson.cut.sutra.number}</span>
                          </div>
                          <div className="mobile-lesson-card__split">
                            {lesson.cut.left.devanagari} + {lesson.cut.right.devanagari}
                          </div>
                          {studyMode === "guided" ? (
                            <p>{lesson.cut.explanation[language]}</p>
                          ) : null}
                        </div>
                      ) : feedback ? (
                        <div className="mobile-lesson-card__body">
                          <p>{feedback}</p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {!isTouchLayout ? (
                    <div
                      className={`floating-dock glass-panel ${
                        isNinjaMode ? "floating-dock--ninja" : ""
                      }`}
                    >
                      <div className="floating-dock__topline">
                        <span className="panel-kicker">
                          {isNinjaMode
                            ? language === "sa"
                              ? "लक्ष्यसन्धिः"
                              : language === "te"
                                ? "లక్ష్య సంధి"
                                : "Target sandhi"
                            : t(isJoinMode ? "selectGlue" : "selectKnife", language)}
                        </span>
                        {dockShortcutLegend ? (
                          <span className="shortcut-row">{dockShortcutLegend}</span>
                        ) : null}
                      </div>

                      <div className="knife-detail">
                        <div className="knife-detail__topline">
                          <strong>
                            {isNinjaMode
                              ? currentTargetRule.label[language]
                              : selectedRule.label[language]}
                          </strong>
                          {!isNinjaMode ? (
                            <span className="knife-detail__shortcut">
                              {selectedRule.shortcut}
                            </span>
                          ) : null}
                        </div>
                        <div className="knife-detail__sutra">
                          {(isNinjaMode ? currentTargetRule : selectedRule).sutra.text} ·{" "}
                          {(isNinjaMode ? currentTargetRule : selectedRule).sutra.number}
                        </div>
                        {isNinjaMode ? (
                          <div className="knife-detail__toggle-row">
                            <button
                              className={`pill-button ${clockEnabled ? "active" : ""}`}
                              onClick={() => setClockEnabled((current) => !current)}
                              type="button"
                            >
                              {ninjaTimingLabel}
                            </button>
                            <button
                              className={`pill-button ${ninjaHelpOpen ? "active" : ""}`}
                              onClick={() => setNinjaHelpOpen((current) => !current)}
                              type="button"
                            >
                              {ninjaHelpToggleLabel}
                            </button>
                            {currentTargetNimitta ? (
                              <button
                                className={`pill-button ${ninjaShowNimitta ? "active" : ""}`}
                                onClick={() => setNinjaShowNimitta((current) => !current)}
                                type="button"
                              >
                                {ninjaNimittaToggleLabel}
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                        {studyMode === "guided" && (!isNinjaMode || ninjaHelpOpen) ? (
                          <div className="knife-detail__pattern">
                            <span className="panel-kicker">{t("rulePattern", language)}</span>
                            <strong>
                              {(isNinjaMode ? currentTargetRule : selectedRule).pattern[language]}
                            </strong>
                          </div>
                        ) : null}
                        <p>
                          {isNinjaMode
                            ? ninjaHelpOpen
                              ? currentTargetExplanation
                              : currentTargetRule.helper[language]
                            : selectedRuleSummary}
                        </p>
                        {isNinjaMode && ninjaHelpOpen && currentTargetNimitta && ninjaShowNimitta ? (
                          <div className="knife-detail__notes">
                            <span className="knife-detail__note">{currentTargetNimitta}</span>
                          </div>
                        ) : null}
                        {!isNinjaMode && dockNotes.length > 0 ? (
                          <div className="knife-detail__notes">
                            {dockNotes.map((note) => (
                              <span className="knife-detail__note" key={note}>
                                {note}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      {!isNinjaMode ? (
                        <div className="knife-grid knife-grid--floating">
                          {visibleRules.map((rule) => {
                            const active = selectedRuleId === rule.id;

                            return (
                              <button
                                className={`knife-card knife-card--floating ${
                                  active ? "active" : ""
                                }`}
                                key={rule.id}
                                onClick={() => setSelectedRuleId(rule.id)}
                                type="button"
                              >
                                <strong>{rule.label[language]}</strong>
                                <span className="knife-card__footer">{rule.shortcut}</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}

                      <div className="action-row floating-dock__actions">
                        {showAnswerButton ? (
                          <button
                            className="ghost-button ghost-button--reveal"
                            onClick={handleRevealAnswer}
                            type="button"
                          >
                            {t("showAnswer", language)}
                          </button>
                        ) : null}
                        <button
                          className="ghost-button"
                          onClick={resetCurrentRound}
                          type="button"
                        >
                          {t("resetWord", language)} · R
                        </button>
                        <button
                          className={`ghost-button ${
                            awaitingPracticeAdvance ? "ghost-button--next-hint" : ""
                          }`}
                          onClick={advanceToNextWord}
                          type="button"
                        >
                          {awaitingPracticeAdvance
                            ? `${t("nextWord", language)} →`
                            : t("nextWord", language)}{" "}
                          · N
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mobile-action-rail glass-panel">
                      <div
                        className={`mobile-action-rail__topline ${
                          isNinjaMode ? "" : "mobile-action-rail__topline--compact"
                        }`}
                      >
                        <div className="mobile-action-rail__label">
                          <span className="panel-kicker">
                            {isNinjaMode
                              ? language === "sa"
                                ? "लक्ष्यसन्धिः"
                                : language === "te"
                                  ? "లక్ష్య సంధి"
                                  : "Target sandhi"
                              : isJoinMode
                                ? t("selectGlue", language)
                                : t("selectKnife", language)}
                          </span>
                          <strong>
                            {isNinjaMode
                              ? currentTargetRule.label[language]
                              : selectedRule.label[language]}
                          </strong>
                        </div>
                        <div className="mobile-action-rail__chips">
                          <button
                            className="pill-button mobile-action-rail__session-button"
                            onClick={() => setMobileDrawer("progress")}
                            type="button"
                          >
                            {mobileSessionButtonLabel}
                          </button>
                          {isNinjaMode ? (
                            <button
                              className={`pill-button ${ninjaHelpOpen ? "active" : ""}`}
                              onClick={() => setNinjaHelpOpen((current) => !current)}
                              type="button"
                            >
                              {ninjaHelpToggleLabel}
                            </button>
                          ) : null}
                        </div>
                      </div>
                      {!isNinjaMode ? (
                        <div className="mobile-rule-strip" role="list">
                          {visibleRules.map((rule) => {
                            const active = selectedRuleId === rule.id;

                            return (
                              <button
                                aria-pressed={active}
                                className={`mobile-rule-chip ${active ? "active" : ""}`}
                                key={rule.id}
                                onClick={() => setSelectedRuleId(rule.id)}
                                type="button"
                              >
                                <strong>{rule.label[language]}</strong>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                      {!showMobileLessonCard && (lesson || feedback) ? (
                        <button
                          className="pill-button mobile-action-rail__lesson-button"
                          onClick={() => setMobileDrawer("lesson")}
                          type="button"
                        >
                          {t("currentLesson", language)}
                        </button>
                      ) : null}
                      <div className="action-row mobile-action-rail__actions">
                        {showAnswerButton ? (
                          <button
                            className="ghost-button ghost-button--reveal"
                            onClick={handleRevealAnswer}
                            type="button"
                          >
                            {t("showAnswer", language)}
                          </button>
                        ) : null}
                        <button
                          className="ghost-button"
                          onClick={resetCurrentRound}
                          type="button"
                        >
                          {t("resetWord", language)}
                        </button>
                        <button
                          className={`ghost-button ${
                            awaitingPracticeAdvance ? "ghost-button--next-hint" : ""
                          }`}
                          onClick={advanceToNextWord}
                          type="button"
                        >
                          {t("nextWord", language)}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {!isTouchLayout ? (
              <aside className="sidebar sidebar--game">
                <ScorePanel
                  answerAdvanceMode={answerAdvanceMode}
                  answerRevealDelayMs={answerRevealDelayMs}
                  campaign={campaignSummary}
                  clockEnabled={clockEnabled}
                  currentWordLabel={
                    isNinjaMode ? currentTargetNode.devanagari : currentWord.devanagari
                  }
                  language={language}
                  mode={mode}
                  onAnswerAdvanceModeChange={setAnswerAdvanceMode}
                  onAnswerRevealDelayChange={setAnswerRevealDelayMs}
                  onClockEnabledChange={setClockEnabled}
                  onResetCampaign={handleResetCampaign}
                  onSessionPresetChange={handleSessionPresetChange}
                  onTimerDurationChange={setTimerDurationSeconds}
                  remainingSplits={remainingSplits}
                  sessionPreset={sessionPreset}
                  stats={stats}
                  timerDurationSeconds={timerDurationSeconds}
                />
                <LessonPanel
                  feedback={feedback}
                  language={language}
                  lesson={lesson}
                  studyMode={studyMode}
                  revealed={revealed}
                  showAnswerMeta={showAnswerMeta}
                />
              </aside>
            ) : null}
          </>
        )}
      </main>

      <AnimatePresence>
        {mobileDrawer && !isStudioMode ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="overlay"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="overlay-card overlay-card--sheet"
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
            >
              <div className="panel-heading">
                <span className="panel-kicker">{mobileDrawerTitle}</span>
                <button
                  className="ghost-button"
                  onClick={() => setMobileDrawer(null)}
                  type="button"
                >
                  {t("close", language)}
                </button>
              </div>

              {mobileDrawer === "progress" ? (
                <ScorePanel
                  answerAdvanceMode={answerAdvanceMode}
                  answerRevealDelayMs={answerRevealDelayMs}
                  campaign={campaignSummary}
                  clockEnabled={clockEnabled}
                  currentWordLabel={
                    isNinjaMode ? currentTargetNode.devanagari : currentWord.devanagari
                  }
                  language={language}
                  mode={mode}
                  onAnswerAdvanceModeChange={setAnswerAdvanceMode}
                  onAnswerRevealDelayChange={setAnswerRevealDelayMs}
                  onClockEnabledChange={setClockEnabled}
                  onResetCampaign={handleResetCampaign}
                  onSessionPresetChange={handleSessionPresetChange}
                  onTimerDurationChange={setTimerDurationSeconds}
                  remainingSplits={remainingSplits}
                  sessionPreset={sessionPreset}
                  stats={stats}
                  timerDurationSeconds={timerDurationSeconds}
                />
              ) : mobileDrawer === "mode" ? (
                <div className="sheet-selector">
                  <ModeSelector
                    language={language}
                    mode={mode}
                    onChange={(nextMode) => {
                      setMode(nextMode);
                      setMobileDrawer(null);
                    }}
                  />
                </div>
              ) : mobileDrawer === "language" ? (
                <div className="sheet-selector">
                  <LanguageToggle
                    language={language}
                    onChange={(nextLanguage) => {
                      setLanguage(nextLanguage);
                      setMobileDrawer(null);
                    }}
                  />
                </div>
              ) : mobileDrawer === "family" ? (
                <div className="sheet-selector">
                  <SandhiFamilySelector
                    compact
                    language={language}
                    onChange={(nextFamily) => {
                      setSelectedFamily(nextFamily);
                      setMobileDrawer(null);
                    }}
                    options={familyOptions}
                    selectedFamily={selectedFamily}
                  />
                </div>
              ) : (
                <LessonPanel
                  feedback={feedback}
                  language={language}
                  lesson={lesson}
                  studyMode={studyMode}
                  revealed={revealed}
                  showAnswerMeta={showAnswerMeta}
                />
              )}
            </motion.div>
          </motion.div>
        ) : null}

        {showOnboarding && mode !== "devStudio" ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="overlay"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="overlay-card"
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
            >
              <span className="panel-kicker">{t("onboardingTitle", language)}</span>
              <h2>
                {isNinjaMode
                  ? language === "sa"
                    ? "पतमानपदे लक्ष्यसन्धिम् अनुसृत्य स्वाइप् कुरु।"
                    : language === "te"
                      ? "పడుతూ ఉన్న పదంలో లక్ష్య సంధిని చూసి స్వైప్ చేయండి."
                      : "Swipe through the shown target sandhi on the falling word."
                  : t(isJoinMode ? "onboardingJoinBody" : "onboardingBody", language)}
              </h2>
              <div className="onboarding-steps">
                {onboardingSteps.map((step) => (
                  <div className="onboarding-step" key={step.title}>
                    <strong>{step.title}</strong>
                    <p>{step.body}</p>
                  </div>
                ))}
              </div>
              <button
                className="primary-button"
                onClick={() => setShowOnboarding(false)}
                type="button"
              >
                {t("close", language)}
              </button>
            </motion.div>
          </motion.div>
        ) : null}

        {showGraduation ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="overlay"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="overlay-card"
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
            >
              <span className="panel-kicker">
                {language === "sa"
                  ? "स्नातकत्वम्"
                  : language === "te"
                    ? "పట్టాభిషేకం"
                    : "Graduation"}
              </span>
              <h2>
                {language === "sa"
                  ? "उभयेषु प्रकारेषु अभियानप्रावीण्यं सिद्धम्।"
                  : language === "te"
                    ? "విడిపోటిలోను, కలయికలోను ప్రచార ప్రావీణ్యం పూర్తైంది."
                    : "Campaign mastery is complete in both splitting and joining."}
              </h2>
              <div className="onboarding-steps">
                <div className="onboarding-step">
                  <strong>
                    {language === "sa"
                      ? "भेदप्रावीण्यम्"
                      : language === "te"
                        ? "విడిపోటి ప్రావీణ్యం"
                        : "Split mastery"}
                  </strong>
                  <p>
                    {campaignSummary.splitMastered}/{campaignSummary.splitTotal}
                  </p>
                </div>
                <div className="onboarding-step">
                  <strong>
                    {language === "sa"
                      ? "संयोजनप्रावीण्यम्"
                      : language === "te"
                        ? "కలయిక ప్రావీణ్యం"
                        : "Join mastery"}
                  </strong>
                  <p>
                    {campaignSummary.joinMastered}/{campaignSummary.joinTotal}
                  </p>
                </div>
                <div className="onboarding-step">
                  <strong>
                    {language === "sa"
                      ? "अनन्तपुनरवलोकनम्"
                      : language === "te"
                        ? "అంతులేని పునర్విమర్శ"
                        : "Endless Review"}
                  </strong>
                  <p>
                    {language === "sa"
                      ? "इदानीं मुक्तम्। इच्छया पुनः अभ्यासं कुरु।"
                      : language === "te"
                        ? "ఇప్పుడు తెరుచుకుంది. కావాలంటే నిరంతర సాధన కొనసాగించండి."
                        : "is now unlocked. Keep reviewing as long as you want."}
                  </p>
                </div>
              </div>
              <button
                className="primary-button"
                onClick={() => setShowGraduation(false)}
                type="button"
              >
                {t("close", language)}
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default App;
