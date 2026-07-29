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
import SandhiGame from "./game/SandhiGame";
import type {
  ActiveToken,
  GameMode,
  Language,
  LessonPayload,
  PlayerStats,
  SandhiFamily,
  SandhiRuleId,
  SliceFeedback,
  StoredProgress,
  StudyMode,
  TimerMode,
  WordNode,
} from "./types/sandhi";

type GameplayMode = Exclude<GameMode, "devStudio">;

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
const FONT_LOAD_TIMEOUT_MS = 2200;
const FEEDBACK_CLEAR_DELAY_MS = 3200;
const ROUND_COMPLETE_DELAY_MS = 3000;
const TIME_UP_ADVANCE_DELAY_MS = 2600;
const GUIDED_COACH_THRESHOLD = 2;
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

  const preferredMode =
    value.preferredMode === "join" || value.preferredMode === "devStudio"
      ? value.preferredMode
      : "arcade";
  const studyMode = value.studyMode === "challenge" ? "challenge" : DEFAULT_STUDY_MODE;

  return {
    ...value,
    preferredMode,
    studyMode,
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

const wordMatchesFamily = (node: WordNode, family: SandhiFamily) =>
  family === "mixed" ||
  node.cuts.some(
    (cut) => !cut.reviewNeeded && RULE_LOOKUP.get(cut.ruleId)?.family === family,
  );

const getVisibleRuleIdsFromTokens = (tokens: ActiveToken[]) => {
  const ids = new Set<SandhiRuleId>();

  tokens.forEach((token) => {
    if (!isFurtherSplittable(token.node)) {
      return;
    }

    token.node.cuts.forEach((cut) => {
      if (!cut.reviewNeeded) {
        ids.add(cut.ruleId);
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
    storedProgress?.preferredMode ?? DEFAULT_MODE,
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

  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<SandhiGame | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);
  const nextWordTimerRef = useRef<number | null>(null);
  const wrongAttemptsRef = useRef(0);
  const lastActiveTokensRef = useRef<ActiveToken[]>([]);
  const lastRevealLessonRef = useRef<LessonPayload | null>(null);
  const lastGameplayModeRef = useRef<GameplayMode>(
    storedProgress?.preferredMode === "join" ? "join" : "arcade",
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
    () => getVisibleRuleIdsFromTokens(activeTokensForUi),
    [activeTokensForUi],
  );
  const visibleRules = useMemo(() => {
    const activeRuleMap = new Map(activeRules.map((rule) => [rule.id, rule]));
    const relevantRules = currentVisibleRuleIds
      .map((ruleId) => activeRuleMap.get(ruleId) ?? null)
      .filter((rule): rule is (typeof activeRules)[number] => Boolean(rule));

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
        const preferredFamilyRules = activeRules.filter(
          (rule) => preferredFamilies.includes(rule.family) && !relevantIds.has(rule.id),
        );
        const remainingRules = activeRules.filter(
          (rule) => !preferredFamilies.includes(rule.family) && !relevantIds.has(rule.id),
        );

        candidateRules = [...relevantRules, ...preferredFamilyRules, ...remainingRules].slice(
          0,
          MAX_VISIBLE_RULE_OPTIONS,
        );
      }
    }

    const ruleOrderSeed = [
      currentWord.id,
      selectedFamily,
      ...activeTokensForUi.map((token) => `${token.instanceId}:${token.node.id}`),
      ...currentVisibleRuleIds,
      ...candidateRules.map((rule) => rule.id),
    ].join(":");

    return stableShuffleBySeed(candidateRules, ruleOrderSeed, (rule) => rule.id);
  }, [activeRules, activeTokensForUi, currentVisibleRuleIds, currentWord.id, selectedFamily]);
  const languageRef = useRef(language);
  const modeRef = useRef(mode);
  const familyRef = useRef(selectedFamily);
  const timerModeRef = useRef(timerMode);
  const effectiveModeRef = useRef(effectiveMode);
  const practiceModeRef = useRef(practiceMode);
  const studyModeRef = useRef(studyMode);

  languageRef.current = language;
  modeRef.current = mode;
  familyRef.current = selectedFamily;
  timerModeRef.current = timerMode;
  effectiveModeRef.current = effectiveMode;
  practiceModeRef.current = practiceMode;
  studyModeRef.current = studyMode;

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

  const getRoundAdvanceDelay = () => ROUND_COMPLETE_DELAY_MS;

  const scheduleNextWord = (delay = getRoundAdvanceDelay()) => {
    clearNextWordTimer();

    nextWordTimerRef.current = window.setTimeout(() => {
      nextWordTimerRef.current = null;
      setAwaitingPracticeAdvance(false);
      setInteractionLocked(false);
      setLesson(null);
      setShowAnswerMeta(false);
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

  // Practice-mode on-demand reveal. Does not lock interaction — the player can
  // keep working after peeking at the answer.
  const handleRevealAnswer = () => {
    const revealLesson =
      lastRevealLessonRef.current ?? buildRevealLesson(lastActiveTokensRef.current);
    if (!revealLesson) {
      return;
    }

    setLesson(revealLesson);
    setRevealed(true);
    setShowAnswerMeta(true);
    setFeedback(t("revealTitle", languageRef.current));
    clearFeedbackLater();
  };

  const handleFeedback = (payload: SliceFeedback) => {
    lastActiveTokensRef.current = payload.activeTokens;
    setVisibleTokens(payload.activeTokens);
    lastRevealLessonRef.current =
      payload.revealLesson ?? buildRevealLesson(payload.activeTokens);
    setFeedback(payload.message[languageRef.current]);
    clearFeedbackLater();

    if (payload.lesson) {
      setLesson(payload.lesson);
    }

    if (payload.outcome === "correct") {
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
        if (practiceModeRef.current) {
          clearNextWordTimer();
          clearFeedbackTimer();
          setAwaitingPracticeAdvance(true);
          setFeedback(t("practiceNextHint", languageRef.current));
          return;
        }
        scheduleNextWord();
      }

      return;
    }

    if (payload.outcome === "wrong") {
      setShowAnswerMeta(false);
      const nextAttempts = wrongAttemptsRef.current + 1;
      wrongAttemptsRef.current = nextAttempts;

      setStats((current) => {
        const next = {
          ...current,
          lives: Math.max(DEFAULT_LIVES - nextAttempts, 0),
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

      if (
        studyModeRef.current === "guided" &&
        nextAttempts >= GUIDED_COACH_THRESHOLD &&
        nextAttempts < REVEAL_THRESHOLD
      ) {
        const coachingLesson =
          payload.revealLesson ?? buildRevealLesson(payload.activeTokens);
        if (coachingLesson) {
          setLesson(coachingLesson);
          setRevealed(false);
          setFeedback(t("guidedCoachHint", languageRef.current));
          clearFeedbackLater();
        }
      }

      // Practice mode never auto-reveals — the player chooses when via the
      // "Show answer" button. Non-practice mode reveals after 4 misses.
      if (!practiceModeRef.current && nextAttempts >= REVEAL_THRESHOLD) {
        const revealLesson =
          payload.revealLesson ?? buildRevealLesson(payload.activeTokens);
        if (revealLesson) {
          setLesson(revealLesson);
          setRevealed(true);
          setShowAnswerMeta(true);
        }

        // Keep the reveal message visible instead of auto-clearing it.
        if (feedbackTimerRef.current) {
          clearFeedbackTimer();
        }
        setFeedback(t("revealChip", languageRef.current));
        setInteractionLocked(true);
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
  }, [language, mode, selectedFamily, timerMode, studyMode, stats, practiceMode]);

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

  useEffect(() => {
    if (!containerRef.current || mode !== "arcade" || !fontsReady) {
      if (gameRef.current && mode !== "arcade") {
        gameRef.current.destroy();
        gameRef.current = null;
      }
      return;
    }

    if (!gameRef.current) {
      gameRef.current = new SandhiGame({
        container: containerRef.current,
        state: {
          mode: "arcade",
          language,
          selectedRuleId,
          rootWord: cloneWordNode(currentWord),
          interactionLocked,
        },
        onFeedback: handleFeedback,
      });
      return;
    }

    gameRef.current.update({
      mode: "arcade",
      language,
      selectedRuleId,
      rootWord: cloneWordNode(currentWord),
      interactionLocked,
    });
  }, [
    currentWord,
    effectiveMode,
    interactionLocked,
    language,
    mode,
    selectedRuleId,
    fontsReady,
  ]);

  useEffect(
    () => () => {
      if (feedbackTimerRef.current) {
        window.clearTimeout(feedbackTimerRef.current);
      }
      if (nextWordTimerRef.current) {
        window.clearTimeout(nextWordTimerRef.current);
      }
      gameRef.current?.destroy();
      gameRef.current = null;
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
    setAwaitingPracticeAdvance(false);
    setFeedback(null);
    setVisibleTokens([]);
    setShowAnswerMeta(false);
    lastRevealLessonRef.current = null;
    resetTimer(effectiveMode);
    setInteractionLocked(false);
    setLesson(null);
    resetAttempts();
    setStats((current) => ({ ...current, lives: DEFAULT_LIVES }));
  }, [currentWord.id, effectiveMode, mode]);

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
        resetTimer();
        setInteractionLocked(false);
        setLesson(null);
        setShowAnswerMeta(false);
        setFeedback(null);
        setAwaitingPracticeAdvance(false);
        resetAttempts();
        setStats((current) => ({ ...current, lives: DEFAULT_LIVES }));

        if (modeRef.current === "arcade" && gameRef.current) {
          gameRef.current.resetRound();
          return;
        }

        if (modeRef.current === "join") {
          setRoundResetNonce((current) => current + 1);
        }
      }

      if (event.key.toLowerCase() === "n" && modeRef.current !== "devStudio") {
        scheduleNextWord(0);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visibleRules]);

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
  const dockNotes = [
    t(isJoinMode ? "joinBoundaryHint" : "splitMarkerHint", language),
    t(isJoinMode ? "joinRuleHint" : "splitRuleHint", language),
    practiceMode ? t("practiceHint", language) : null,
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
    setAwaitingPracticeAdvance(false);
    resetTimer();
    setInteractionLocked(false);
    setLesson(null);
    setShowAnswerMeta(false);
    setFeedback(null);
    lastRevealLessonRef.current = null;
    resetAttempts();
    setStats((current) => ({ ...current, lives: DEFAULT_LIVES }));

    if (mode === "arcade") {
      gameRef.current?.resetRound();
      return;
    }

    if (mode === "join") {
      setRoundResetNonce((current) => current + 1);
    }
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
              <button
                className="ghost-button"
                onClick={() =>
                  setMode(isStudioMode ? lastGameplayModeRef.current : "devStudio")
                }
                type="button"
              >
                {isStudioMode ? t("backToGame", language) : t("openExplorer", language)}
              </button>
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
                      interactionLocked={interactionLocked}
                      language={language}
                      onFeedback={handleFeedback}
                      resetNonce={roundResetNonce}
                      rootWord={currentWord}
                      selectedRuleId={selectedRuleId}
                    />
                  ) : (
                    <div
                      className={`game-stage ${fontsReady ? "" : "game-stage--loading"}`}
                      ref={containerRef}
                    >
                      {!fontsReady ? (
                        <div className="game-stage__loading">{t("loadingArena", language)}</div>
                      ) : null}
                    </div>
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
                      {practiceMode ? (
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
                        onClick={() => scheduleNextWord(0)}
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
                remainingSplits={remainingSplits}
                stats={stats}
              />
              <LessonPanel
                feedback={feedback}
                language={language}
                lesson={lesson}
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
