import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LanguageToggle from "./components/LanguageToggle";
import LessonPanel from "./components/LessonPanel";
import ModeSelector from "./components/ModeSelector";
import ScorePanel from "./components/ScorePanel";
import DevStudio from "./components/DevStudio";
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
  SandhiRuleId,
  SliceFeedback,
  StoredProgress,
  TimerMode,
  WordNode,
} from "./types/sandhi";

const DEFAULT_LANGUAGE: Language = "en";
const DEFAULT_MODE: GameMode = "arcade";
const DEFAULT_RULE: SandhiRuleId = "savarna-dirgha";
const TIMER_BY_MODE = {
  arcade: 20,
  fullSplit: 75,
} as const;
const DEFAULT_LIVES = 4;
const REVEAL_THRESHOLD = 4;
const DEFAULT_TIMER_MODE: TimerMode = "timed";
const FONT_LOAD_TIMEOUT_MS = 2200;
const FEEDBACK_CLEAR_DELAY_MS = 3200;
const ROUND_COMPLETE_DELAY_MS = 3000;
const FULL_SPLIT_ROUND_COMPLETE_DELAY_MS = 3400;
const TIME_UP_ADVANCE_DELAY_MS = 2600;
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

const loadCustomEntries = (): WordNode[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.customEntries);
    return raw ? parseWordEntries(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
};

const runtimeMode = (mode: GameMode): "arcade" | "fullSplit" =>
  mode === "fullSplit" ? "fullSplit" : "arcade";

const getTimerSeconds = (mode: "arcade" | "fullSplit") => TIMER_BY_MODE[mode];

const shuffleArray = <T,>(items: T[]) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

const getPoolForMode = (mode: GameMode, entries: WordNode[]) => {
  const gameplayEntries = entries.filter(isGameplayEligible);

  if (mode === "fullSplit") {
    return [...gameplayEntries].sort(
      (left, right) => right.cuts.length - left.cuts.length,
    );
  }

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
  const storedProgress = useMemo(loadStoredProgress, []);
  const storedCustomEntries = useMemo(loadCustomEntries, []);

  const [language, setLanguage] = useState<Language>(
    storedProgress?.preferredLanguage ?? DEFAULT_LANGUAGE,
  );
  const [mode, setMode] = useState<GameMode>(
    storedProgress?.preferredMode ?? DEFAULT_MODE,
  );
  const [timerMode, setTimerMode] = useState<TimerMode>(
    storedProgress?.timerMode ??
      (storedProgress?.practiceSlowly ? "untimed" : DEFAULT_TIMER_MODE),
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
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [wordProgress, setWordProgress] = useState({
    arcade: { index: 0, cycle: 0 },
    fullSplit: { index: 0, cycle: 0 },
  });
  const [interactionLocked, setInteractionLocked] = useState(false);
  const [awaitingPracticeAdvance, setAwaitingPracticeAdvance] = useState(false);
  const [fontsReady, setFontsReady] = useState(
    () => typeof document === "undefined" || !("fonts" in document),
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<SandhiGame | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);
  const nextWordTimerRef = useRef<number | null>(null);
  const wrongAttemptsRef = useRef(0);
  const lastActiveTokensRef = useRef<ActiveToken[]>([]);
  const lastGameplayModeRef = useRef<"arcade" | "fullSplit">(
    storedProgress?.preferredMode === "fullSplit" ? "fullSplit" : "arcade",
  );

  const allEntries = useMemo(
    () => {
      const merged = new Map(DEFAULT_SANDHI_BANK.map((entry) => [entry.id, entry]));
      customEntries.forEach((entry) => merged.set(entry.id, entry));
      return [...merged.values()];
    },
    [customEntries],
  );
  const effectiveMode = mode === "devStudio" ? "arcade" : runtimeMode(mode);
  const arcadePool = useMemo(
    () => shuffleArray(getPoolForMode("arcade", allEntries)),
    [allEntries, wordProgress.arcade.cycle],
  );
  const fullSplitPool = useMemo(
    () => shuffleArray(getPoolForMode("fullSplit", allEntries)),
    [allEntries, wordProgress.fullSplit.cycle],
  );
  const activePool = effectiveMode === "fullSplit" ? fullSplitPool : arcadePool;
  const poolLengthsRef = useRef({
    arcade: arcadePool.length,
    fullSplit: fullSplitPool.length,
  });
  poolLengthsRef.current = {
    arcade: arcadePool.length,
    fullSplit: fullSplitPool.length,
  };
  const poolIndex =
    effectiveMode === "fullSplit"
      ? wordProgress.fullSplit.index
      : wordProgress.arcade.index;
  const currentWord =
    activePool[poolIndex] ?? DEFAULT_SANDHI_BANK[0];
  const languageRef = useRef(language);
  const modeRef = useRef(mode);
  const timerModeRef = useRef(timerMode);
  const effectiveModeRef = useRef(effectiveMode);
  const practiceModeRef = useRef(practiceMode);

  languageRef.current = language;
  modeRef.current = mode;
  timerModeRef.current = timerMode;
  effectiveModeRef.current = effectiveMode;
  practiceModeRef.current = practiceMode;

  const persistProgress = (
    nextLanguage: Language,
    nextMode: GameMode,
    nextTimerMode: TimerMode,
    nextStats: PlayerStats,
  ) => {
    const payload: StoredProgress = {
      highScore: nextStats.highScore,
      completedWords: nextStats.completedWords,
      successfulCuts: nextStats.successfulCuts,
      preferredLanguage: nextLanguage,
      preferredMode: nextMode,
      timerMode: nextTimerMode,
      practiceSlowly: nextTimerMode === "untimed",
      practiceMode: practiceModeRef.current,
    };

    window.localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(payload));
  };

  const persistCustomEntries = (entries: WordNode[]) => {
    window.localStorage.setItem(STORAGE_KEYS.customEntries, JSON.stringify(entries));
  };

  const resetTimer = (nextMode: "arcade" | "fullSplit" = effectiveModeRef.current) =>
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

  const getRoundAdvanceDelay = () =>
    effectiveModeRef.current === "fullSplit"
      ? FULL_SPLIT_ROUND_COMPLETE_DELAY_MS
      : ROUND_COMPLETE_DELAY_MS;

  const scheduleNextWord = (delay = getRoundAdvanceDelay()) => {
    clearNextWordTimer();

    nextWordTimerRef.current = window.setTimeout(() => {
      nextWordTimerRef.current = null;
      setAwaitingPracticeAdvance(false);
      setInteractionLocked(false);
      setLesson(null);
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
        timerModeRef.current,
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
  // keep slicing after peeking at the answer.
  const handleRevealAnswer = () => {
    const revealLesson = buildRevealLesson(lastActiveTokensRef.current);
    if (!revealLesson) {
      return;
    }

    setLesson(revealLesson);
    setRevealed(true);
    setFeedback(t("revealTitle", languageRef.current));
    clearFeedbackLater();
  };

  const handleFeedback = (payload: SliceFeedback) => {
    lastActiveTokensRef.current = payload.activeTokens;
    setFeedback(payload.message[languageRef.current]);
    clearFeedbackLater();

    if (payload.lesson) {
      setLesson(payload.lesson);
    }

    if (payload.outcome === "correct") {
      resetAttempts();
      updateStats((current) => ({
        ...current,
        score: current.score + 120 + current.streak * 18,
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
          timerModeRef.current,
          next,
        );

        return next;
      });

      // Practice mode never auto-reveals — the player chooses when via the
      // "Show answer" button. Non-practice mode reveals after 4 misses.
      if (!practiceModeRef.current && nextAttempts >= REVEAL_THRESHOLD) {
        const revealLesson = buildRevealLesson(payload.activeTokens);
        if (revealLesson) {
          setLesson(revealLesson);
          setRevealed(true);
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
    persistCustomEntries(customEntries);
  }, [customEntries]);

  useEffect(() => {
    persistProgress(language, mode, timerMode, stats);
  }, [language, mode, timerMode, stats, practiceMode]);

  useEffect(() => {
    if (!containerRef.current || mode === "devStudio" || !fontsReady) {
      if (gameRef.current && mode === "devStudio") {
        gameRef.current.destroy();
        gameRef.current = null;
      }
      return;
    }

    if (!gameRef.current) {
      gameRef.current = new SandhiGame({
        container: containerRef.current,
        state: {
          mode: effectiveMode,
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
      mode: effectiveMode,
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
    if (
      mode === "devStudio" ||
      timerMode === "untimed" ||
      practiceMode ||
      interactionLocked
    ) {
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
    resetTimer(effectiveMode);
    setInteractionLocked(false);
    setLesson(null);
    resetAttempts();
    setStats((current) => ({ ...current, lives: DEFAULT_LIVES }));
  }, [currentWord.id, effectiveMode, mode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const ruleIndex = Number.parseInt(event.key, 10) - 1;
      if (ruleIndex >= 0 && ruleIndex < SANDHI_RULES.length) {
        const rule = SANDHI_RULES[ruleIndex];
        setSelectedRuleId(rule.id);
      }

      if (event.key.toLowerCase() === "r" && gameRef.current) {
        resetTimer();
        setInteractionLocked(false);
        setLesson(null);
        resetAttempts();
        setStats((current) => ({ ...current, lives: DEFAULT_LIVES }));
        gameRef.current.resetRound();
      }

      if (event.key.toLowerCase() === "n") {
        scheduleNextWord(0);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSaveEntry = (entry: WordNode) => {
    setCustomEntries((current) => {
      const filtered = current.filter((item) => item.id !== entry.id);
      return [...filtered, entry];
    });
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

  const selectedRule = SANDHI_RULES.find((rule) => rule.id === selectedRuleId)!;
  const dockNotes = [
    t("splitMarkerHint", language),
    t("splitRuleHint", language),
    mode === "fullSplit" ? t("fullSplitAnyRule", language) : null,
    practiceMode ? t("practiceHint", language) : null,
  ].filter((value): value is string => Boolean(value));
  const onboardingSteps = [
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
  const isStudioMode = mode === "devStudio";
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
    setFeedback(null);
    resetAttempts();
    setStats((current) => ({ ...current, lives: DEFAULT_LIVES }));
    gameRef.current?.resetRound();
  };

  return (
    <div className={`app-shell ${isStudioMode ? "" : "app-shell--game"}`}>
      <div className="ambient ambient--left" />
      <div className="ambient ambient--right" />

      <header className="hero">
        <div className="hero-copy">
          <span className="hero-kicker">{modeLabel(mode, language)}</span>
          <h1>{t("title", language)}</h1>
          <p>{t("subtitle", language)}</p>
        </div>

        <div className="hero-controls">
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
      </header>

      <main className={`main-grid ${isStudioMode ? "main-grid--studio" : ""}`}>
        {isStudioMode ? (
          <section className="arena-column arena-column--studio">
            <DevStudio
              customEntries={customEntries}
              language={language}
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
                  <span className="panel-kicker">{t("slicePrompt", language)}</span>
                  <strong>{currentWord.devanagari}</strong>
                </div>
              </div>
              <div className="game-stage-shell">
                <div
                  className={`game-stage ${fontsReady ? "" : "game-stage--loading"}`}
                  ref={containerRef}
                >
                  {!fontsReady ? (
                    <div className="game-stage__loading">{t("loadingArena", language)}</div>
                  ) : null}
                </div>

                <div className="floating-dock glass-panel">
                  <div className="floating-dock__topline">
                    <span className="panel-kicker">{t("selectKnife", language)}</span>
                    <span className="shortcut-row">
                      {`1-${SANDHI_RULES.length} · R · N`}
                    </span>
                  </div>

                  <div className="knife-detail">
                    <div className="knife-detail__topline">
                      <strong>{selectedRule.label[language]}</strong>
                      <span className="knife-detail__shortcut">{selectedRule.shortcut}</span>
                    </div>
                    <div className="knife-detail__sutra">
                      {selectedRule.sutra.text} · {selectedRule.sutra.number}
                    </div>
                    <p>{selectedRule.helper[language]}</p>
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
                    {SANDHI_RULES.map((rule) => {
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
                practiceMode={practiceMode}
                onPracticeModeChange={setPracticeMode}
                stats={stats}
              />
              <LessonPanel
                feedback={feedback}
                language={language}
                lesson={lesson}
                revealed={revealed}
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
              <h2>{t("onboardingBody", language)}</h2>
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
