import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BrandMark from "./components/BrandMark";
import LanguageToggle from "./components/LanguageToggle";
import LessonPanel from "./components/LessonPanel";
import ModeSelector from "./components/ModeSelector";
import SandhiFamilySelector from "./components/SandhiFamilySelector";
import ScorePanel from "./components/ScorePanel";
import DevStudio from "./components/DevStudio";
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
  GameMode,
  Language,
  LessonPayload,
  PlayerStats,
  SandhiFamily,
  SandhiRule,
  SandhiRuleId,
  SliceFeedback,
  StoredProgress,
  StudyMode,
  TimerMode,
  WordNode,
} from "./types/sandhi";

type GameplayMode = Exclude<GameMode, "devStudio">;

const getVisibleMode = (mode?: GameMode): GameplayMode =>
  mode === "join" ? "join" : "arcade";

const DEFAULT_LANGUAGE: Language = "en";
const DEFAULT_MODE: GameMode = "arcade";
const DEFAULT_FAMILY: SandhiFamily = "mixed";
const DEFAULT_RULE: SandhiRuleId = "savarna-dirgha";
const TIMER_BY_MODE = {
  arcade: 45,
  join: 45,
} as const;
const DEFAULT_LIVES = 4;
const REVEAL_THRESHOLD = 4;
const DEFAULT_TIMER_MODE: TimerMode = "timed";
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

const makeDefaultStats = (): PlayerStats => ({
  score: 0,
  streak: 0,
  lives: DEFAULT_LIVES,
  timer: TIMER_BY_MODE.arcade,
  completedWords: 0,
  highScore: 0,
  successfulCuts: 0,
});

const normalizeAnswerRevealDelay = (value?: number) =>
  ANSWER_REVEAL_DELAY_OPTIONS.includes(
    value as (typeof ANSWER_REVEAL_DELAY_OPTIONS)[number],
  )
    ? value
    : DEFAULT_ANSWER_REVEAL_DELAY_MS;

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
    value.preferredMode === "join" || value.preferredMode === "devStudio"
      ? value.preferredMode
      : "arcade";
  const studyMode = value.studyMode === "challenge" ? "challenge" : DEFAULT_STUDY_MODE;
  const answerAdvanceMode =
    value.answerAdvanceMode === "manual"
      ? "manual"
      : DEFAULT_ANSWER_ADVANCE_MODE;

  return {
    ...value,
    preferredLanguage,
    preferredMode,
    studyMode,
    answerAdvanceMode,
    answerRevealDelayMs: normalizeAnswerRevealDelay(value.answerRevealDelayMs),
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

const getTimerSeconds = (mode: GameplayMode) => TIMER_BY_MODE[mode];

const getCorrectScoreGain = (streak: number, studyMode: StudyMode) =>
  studyMode === "challenge" ? 165 + streak * 24 : 120 + streak * 18;

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

  const [language, setLanguage] = useState<Language>(
    storedProgress?.preferredLanguage ?? DEFAULT_LANGUAGE,
  );
  const [mode, setMode] = useState<GameMode>(
    getVisibleMode(storedProgress?.preferredMode) ?? DEFAULT_MODE,
  );
  const [selectedFamily, setSelectedFamily] = useState<SandhiFamily>(
    storedProgress?.preferredFamily ?? DEFAULT_FAMILY,
  );
  const [timerMode, setTimerMode] = useState<TimerMode>(
    storedProgress?.timerMode ??
      (storedProgress?.practiceSlowly ? "untimed" : DEFAULT_TIMER_MODE),
  );
  const [studyMode, setStudyMode] = useState<StudyMode>(
    storedProgress?.studyMode ?? DEFAULT_STUDY_MODE,
  );
  const [practiceMode, setPracticeMode] = useState<boolean>(
    storedProgress?.practiceMode ?? false,
  );
  const [answerAdvanceMode, setAnswerAdvanceMode] = useState<AnswerAdvanceMode>(
    storedProgress?.answerAdvanceMode ?? DEFAULT_ANSWER_ADVANCE_MODE,
  );
  const [answerRevealDelayMs, setAnswerRevealDelayMs] = useState<number>(
    storedProgress?.answerRevealDelayMs ?? DEFAULT_ANSWER_REVEAL_DELAY_MS,
  );
  const [selectedRuleId, setSelectedRuleId] =
    useState<SandhiRuleId>(DEFAULT_RULE);
  const [customEntries, setCustomEntries] = useState<WordNode[]>(storedCustomEntries);
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
  });
  const [interactionLocked, setInteractionLocked] = useState(false);
  const [awaitingPracticeAdvance, setAwaitingPracticeAdvance] = useState(false);
  const [roundResetNonce, setRoundResetNonce] = useState(0);
  const [fontsReady, setFontsReady] = useState(
    () => typeof document === "undefined" || !("fonts" in document),
  );

  const feedbackTimerRef = useRef<number | null>(null);
  const nextWordTimerRef = useRef<number | null>(null);
  const wrongAttemptsRef = useRef(0);
  const lastHandledInteractionIdRef = useRef<string | null>(null);
  const lastActiveTokensRef = useRef<ActiveToken[]>([]);
  const lastRevealLessonRef = useRef<LessonPayload | null>(null);
  const lastGameplayModeRef = useRef<GameplayMode>(
    getVisibleMode(storedProgress?.preferredMode),
  );
  const recentWordIdsRef = useRef({
    arcade: [] as string[],
    join: [] as string[],
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
  const isStudioMode = mode === "devStudio";
  const isJoinMode = mode === "join";
  const effectiveMode: GameplayMode = isStudioMode ? lastGameplayModeRef.current : mode;
  const arcadePool = useMemo(
    () => buildRoundPool(getPoolForMode(allEntries, selectedFamily), recentWordIdsRef.current.arcade),
    [allEntries, selectedFamily, wordProgress.arcade.cycle],
  );
  const joinPool = useMemo(
    () => buildRoundPool(getPoolForMode(allEntries, selectedFamily), recentWordIdsRef.current.join),
    [allEntries, selectedFamily, wordProgress.join.cycle],
  );
  const activePool = effectiveMode === "join" ? joinPool : arcadePool;
  const poolLengthsRef = useRef({
    arcade: arcadePool.length,
    join: joinPool.length,
  });
  poolLengthsRef.current = {
    arcade: arcadePool.length,
    join: joinPool.length,
  };
  const poolIndex =
    effectiveMode === "join" ? wordProgress.join.index : wordProgress.arcade.index;
  const safePoolIndex =
    activePool.length > 0 ? Math.min(poolIndex, activePool.length - 1) : 0;
  const currentWord = activePool[safePoolIndex] ?? activePool[0] ?? DEFAULT_SANDHI_BANK[0];
  const currentRoundKey = useMemo(() => {
    const progress =
      effectiveMode === "join" ? wordProgress.join : wordProgress.arcade;

    return `${effectiveMode}:${progress.cycle}:${progress.index}:${currentWord.id}:${roundResetNonce}`;
  }, [
    currentWord.id,
    effectiveMode,
    roundResetNonce,
    wordProgress.arcade.cycle,
    wordProgress.arcade.index,
    wordProgress.join.cycle,
    wordProgress.join.index,
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
  const timerModeRef = useRef(timerMode);
  const effectiveModeRef = useRef(effectiveMode);
  const practiceModeRef = useRef(practiceMode);
  const studyModeRef = useRef(studyMode);
  const answerAdvanceModeRef = useRef(answerAdvanceMode);
  const answerRevealDelayMsRef = useRef(answerRevealDelayMs);

  languageRef.current = language;
  modeRef.current = mode;
  familyRef.current = selectedFamily;
  timerModeRef.current = timerMode;
  effectiveModeRef.current = effectiveMode;
  practiceModeRef.current = practiceMode;
  studyModeRef.current = studyMode;
  answerAdvanceModeRef.current = answerAdvanceMode;
  answerRevealDelayMsRef.current = answerRevealDelayMs;

  const persistProgress = (
    nextLanguage: Language,
    nextMode: GameMode,
    nextFamily: SandhiFamily,
    nextTimerMode: TimerMode,
    nextStudyMode: StudyMode,
    nextStats: PlayerStats,
  ) => {
    const payload: StoredProgress = {
      highScore: nextStats.highScore,
      completedWords: nextStats.completedWords,
      successfulCuts: nextStats.successfulCuts,
      preferredLanguage: nextLanguage,
      preferredMode: nextMode,
      preferredFamily: nextFamily,
      timerMode: nextTimerMode,
      studyMode: nextStudyMode,
      practiceSlowly: nextTimerMode === "untimed",
      practiceMode: practiceModeRef.current,
      answerAdvanceMode: answerAdvanceModeRef.current,
      answerRevealDelayMs: answerRevealDelayMsRef.current,
    };

    window.localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(payload));
  };

  const persistCustomEntries = (entries: WordNode[]) => {
    window.localStorage.setItem(STORAGE_KEYS.customEntries, JSON.stringify(entries));
  };

  const resetTimer = (nextMode: GameplayMode = effectiveModeRef.current) =>
    setStats((current) => ({
      ...current,
      timer: getTimerSeconds(nextMode),
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

  const shouldWaitForNextWord = () =>
    practiceModeRef.current ||
    timerModeRef.current === "untimed" ||
    answerAdvanceModeRef.current === "manual";

  const getAnswerAdvanceDelay = () => answerRevealDelayMsRef.current;

  const advanceToNextWord = () => {
    clearNextWordTimer();
    lastHandledInteractionIdRef.current = null;
    setAwaitingPracticeAdvance(false);
    setInteractionLocked(false);
    setLesson(null);
    setShowAnswerMeta(false);
    setPriorityRuleIds([]);
    resetAttempts();
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
      advanceToNextWord();
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
        timerModeRef.current,
        studyModeRef.current,
        normalized,
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

      if (payload.roundCompleted) {
        setInteractionLocked(true);
        const shouldWaitForManualAdvance = shouldWaitForNextWord();

        if (shouldWaitForManualAdvance) {
          clearNextWordTimer();
          setAwaitingPracticeAdvance(true);

          if (practiceModeRef.current) {
            clearFeedbackTimer();
            setFeedback(t("practiceNextHint", languageRef.current));
          } else if (answerAdvanceModeRef.current === "manual") {
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
          timerModeRef.current,
          studyModeRef.current,
          next,
        );

        return next;
      });

      if (guidedMode && revealDue) {
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
    persistProgress(language, mode, selectedFamily, timerMode, studyMode, stats);
  }, [
    answerAdvanceMode,
    answerRevealDelayMs,
    language,
    mode,
    selectedFamily,
    timerMode,
    studyMode,
    stats,
    practiceMode,
  ]);

  useEffect(() => {
    if (selectedFamily !== "mixed" && activeRules.length === 0) {
      setSelectedFamily("mixed");
      return;
    }

    if (visibleRules.length > 0 && !visibleRules.some((rule) => rule.id === selectedRuleId)) {
      setSelectedRuleId(visibleRules[0].id);
    }
  }, [activeRules, selectedFamily, selectedRuleId, visibleRules]);

  useEffect(() => {
    setWordProgress((current) => ({
      arcade: { index: 0, cycle: current.arcade.cycle + 1 },
      join: { index: 0, cycle: current.join.cycle + 1 },
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
    if (mode === "devStudio" || timerMode === "untimed" || practiceMode || interactionLocked) {
      return;
    }

    const interval = window.setInterval(() => {
      setStats((current) => {
        const nextTimer = current.timer - 1;
        if (nextTimer <= 0) {
          setInteractionLocked(true);
          setFeedback(t("timeUp", language));
          clearFeedbackLater();
          scheduleNextWord(TIME_UP_ADVANCE_DELAY_MS);
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
  }, [interactionLocked, language, mode, timerMode, practiceMode]);

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
  const selectedRule =
    visibleRules.find((rule) => rule.id === selectedRuleId) ??
    visibleRules[0] ??
    activeRules[0] ??
    SANDHI_RULES[0];
  const remainingSplits = countRemainingSplitsInTokens(activeTokensForUi);
  const selectedRuleSummary =
    studyMode === "guided"
      ? selectedRule.helper[language]
      : t("challengeDockHint", language);
  const showAnswerFlowSettings = !practiceMode && timerMode !== "untimed";
  const dockNotes = [
    t(isJoinMode ? "joinBoundaryHint" : "splitMarkerHint", language),
    t(isJoinMode ? "joinRuleHint" : "splitRuleHint", language),
  ].filter((value): value is string => Boolean(value));
  const dockShortcutLegend = `${t(
    isJoinMode ? "glueShortcutLegend" : "shortcutLegend",
    language,
  )} · R · N`;
  const onboardingSteps = isJoinMode
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
    setStats((current) => ({ ...current, lives: DEFAULT_LIVES }));
    setRoundResetNonce((current) => current + 1);
  };

  return (
    <div className={`app-shell ${isStudioMode ? "" : "app-shell--game"}`}>
      <div className="ambient ambient--left" />
      <div className="ambient ambient--right" />

      <header className="hero">
        <div className="hero-copy">
          <div className="hero-brand">
            <BrandMark />
            <div className="hero-brand__text">
              <span className="hero-kicker">{modeLabel(mode, language)}</span>
              <h1>{t("title", language)}</h1>
            </div>
          </div>
          <p>{t("subtitle", language)}</p>
        </div>

        <div className="hero-controls">
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
              language={language}
              onChange={setSelectedFamily}
              options={familyOptions}
              selectedFamily={selectedFamily}
            />
          ) : null}
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
                      {t(isJoinMode ? "joinTarget" : "slicePrompt", language)}
                    </span>
                    <strong>{currentWord.devanagari}</strong>
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

                  <div className="floating-dock glass-panel">
                    <div className="floating-dock__topline">
                      <span className="panel-kicker">
                        {t(isJoinMode ? "selectGlue" : "selectKnife", language)}
                      </span>
                      <span className="shortcut-row">{dockShortcutLegend}</span>
                    </div>

                    <div className="knife-detail">
                      <div className="knife-detail__topline">
                        <strong>{selectedRule.label[language]}</strong>
                        <span className="knife-detail__shortcut">{selectedRule.shortcut}</span>
                      </div>
                      <div className="knife-detail__sutra">
                        {selectedRule.sutra.text} · {selectedRule.sutra.number}
                      </div>
                      {studyMode === "guided" ? (
                        <div className="knife-detail__pattern">
                          <span className="panel-kicker">{t("rulePattern", language)}</span>
                          <strong>{selectedRule.pattern[language]}</strong>
                        </div>
                      ) : null}
                      <p>{selectedRuleSummary}</p>
                      {dockNotes.length > 0 ? (
                        <div className="knife-detail__notes">
                          {dockNotes.map((note) => (
                            <span className="knife-detail__note" key={note}>
                              {note}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

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

                    <div className="action-row floating-dock__actions">
                      {practiceMode && studyMode === "guided" ? (
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
                </div>
              </div>
            </section>

            <aside className="sidebar sidebar--game">
              <ScorePanel
                currentWordLabel={currentWord.devanagari}
                language={language}
                mode={mode}
                onTimerModeChange={setTimerMode}
                timerMode={timerMode}
                studyMode={studyMode}
                onStudyModeChange={setStudyMode}
                practiceMode={practiceMode}
                onPracticeModeChange={setPracticeMode}
                answerAdvanceMode={answerAdvanceMode}
                onAnswerAdvanceModeChange={setAnswerAdvanceMode}
                answerRevealDelayMs={answerRevealDelayMs}
                onAnswerRevealDelayChange={setAnswerRevealDelayMs}
                showAnswerFlowSettings={showAnswerFlowSettings}
                remainingSplits={remainingSplits}
                stats={stats}
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
          </>
        )}
      </main>

      <AnimatePresence>
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
              <h2>{t(isJoinMode ? "onboardingJoinBody" : "onboardingBody", language)}</h2>
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
      </AnimatePresence>
    </div>
  );
}

export default App;
