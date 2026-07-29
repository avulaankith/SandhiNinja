import { motion } from "framer-motion";
import { t } from "../data/uiText";
import type {
  AnswerAdvanceMode,
  GameMode,
  Language,
  PlayerStats,
  StudyMode,
  TimerMode,
} from "../types/sandhi";

type ScorePanelProps = {
  language: Language;
  mode: GameMode;
  stats: PlayerStats;
  timerMode: TimerMode;
  onTimerModeChange: (value: TimerMode) => void;
  studyMode: StudyMode;
  onStudyModeChange: (value: StudyMode) => void;
  practiceMode: boolean;
  onPracticeModeChange: (value: boolean) => void;
  answerAdvanceMode: AnswerAdvanceMode;
  onAnswerAdvanceModeChange: (value: AnswerAdvanceMode) => void;
  answerRevealDelayMs: number;
  onAnswerRevealDelayChange: (value: number) => void;
  showAnswerFlowSettings: boolean;
  currentWordLabel: string;
  remainingSplits: number;
};

const formatTimer = (timer: number) => `${Math.max(0, timer)}s`;

export const ScorePanel = ({
  language,
  mode,
  stats,
  timerMode,
  onTimerModeChange,
  studyMode,
  onStudyModeChange,
  practiceMode,
  onPracticeModeChange,
  answerAdvanceMode,
  onAnswerAdvanceModeChange,
  answerRevealDelayMs,
  onAnswerRevealDelayChange,
  showAnswerFlowSettings,
  currentWordLabel,
  remainingSplits,
}: ScorePanelProps) => {
  const modeHint = t(
    practiceMode
      ? "practiceHint"
      : studyMode === "guided"
        ? "guidedModeHint"
        : "challengeModeHint",
    language,
  );
  const livesLabel = t(
    studyMode === "guided" ? "revealLives" : "lives",
    language,
  );

  return (
    <motion.section
      layout
      className="glass-panel score-panel"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="panel-heading">
        <span className="panel-kicker">{currentWordLabel}</span>
        <span className="shortcut-row">
          {t(mode === "join" ? "glueLocked" : "knifeLocked", language)}
        </span>
      </div>

      <div className="score-panel__controls">
        <div className="timer-mode-row" aria-label={t("practiceMode", language)}>
          <span className="timer-mode-row__label">{t("practiceMode", language)}</span>
          <div className="toggle-row">
            <button
              className={`pill-button ${practiceMode ? "active" : ""}`}
              onClick={() => onPracticeModeChange(true)}
              type="button"
            >
              {t("practiceOn", language)}
            </button>
            <button
              className={`pill-button ${practiceMode ? "" : "active"}`}
              onClick={() => onPracticeModeChange(false)}
              type="button"
            >
              {t("practiceOff", language)}
            </button>
          </div>
        </div>

        <div className="timer-mode-row" aria-label={t("studyMode", language)}>
          <span className="timer-mode-row__label">{t("studyMode", language)}</span>
          <div className="toggle-row">
            <button
              className={`pill-button ${studyMode === "guided" ? "active" : ""}`}
              onClick={() => onStudyModeChange("guided")}
              type="button"
            >
              {t("guidedMode", language)}
            </button>
            <button
              className={`pill-button ${studyMode === "challenge" ? "active" : ""}`}
              onClick={() => onStudyModeChange("challenge")}
              type="button"
            >
              {t("challengeMode", language)}
            </button>
          </div>
        </div>

        {!practiceMode ? (
          <div className="timer-mode-row" aria-label={t("timerStyle", language)}>
            <span className="timer-mode-row__label">{t("timerStyle", language)}</span>
            <div className="toggle-row">
              <button
                className={`pill-button ${timerMode === "timed" ? "active" : ""}`}
                onClick={() => onTimerModeChange("timed")}
                type="button"
              >
                {t("timedMode", language)}
              </button>
              <button
                className={`pill-button ${timerMode === "untimed" ? "active" : ""}`}
                onClick={() => onTimerModeChange("untimed")}
                type="button"
              >
                {t("untimedMode", language)}
              </button>
            </div>
          </div>
        ) : null}

        {showAnswerFlowSettings ? (
          <div className="timer-mode-row" aria-label={t("afterAnswer", language)}>
            <span className="timer-mode-row__label">{t("afterAnswer", language)}</span>
            <div className="toggle-row">
              <button
                className={`pill-button ${answerAdvanceMode === "auto" ? "active" : ""}`}
                onClick={() => onAnswerAdvanceModeChange("auto")}
                type="button"
              >
                {t("autoNext", language)}
              </button>
              <button
                className={`pill-button ${answerAdvanceMode === "manual" ? "active" : ""}`}
                onClick={() => onAnswerAdvanceModeChange("manual")}
                type="button"
              >
                {t("waitForNext", language)}
              </button>
            </div>
          </div>
        ) : null}

        {showAnswerFlowSettings && answerAdvanceMode === "auto" ? (
          <div className="timer-mode-row" aria-label={t("answerTime", language)}>
            <span className="timer-mode-row__label">{t("answerTime", language)}</span>
            <div className="toggle-row">
              <button
                className={`pill-button ${answerRevealDelayMs === 12000 ? "active" : ""}`}
                onClick={() => onAnswerRevealDelayChange(12000)}
                type="button"
              >
                {t("answerTimeShort", language)}
              </button>
              <button
                className={`pill-button ${answerRevealDelayMs === 16000 ? "active" : ""}`}
                onClick={() => onAnswerRevealDelayChange(16000)}
                type="button"
              >
                {t("answerTimeMedium", language)}
              </button>
              <button
                className={`pill-button ${answerRevealDelayMs === 20000 ? "active" : ""}`}
                onClick={() => onAnswerRevealDelayChange(20000)}
                type="button"
              >
                {t("answerTimeLong", language)}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <p className="score-panel__mode-copy">{modeHint}</p>

      <div className="stat-grid">
        <div className="stat-card">
          <span>{t("score", language)}</span>
          <strong>{stats.score}</strong>
        </div>
        <div className="stat-card">
          <span>{t("streak", language)}</span>
          <strong>{stats.streak}</strong>
        </div>
        <div className="stat-card">
          <span>{livesLabel}</span>
          <strong>{stats.lives}</strong>
        </div>
        <div className="stat-card">
          <span>{t("timer", language)}</span>
          <strong>{timerMode === "timed" && !practiceMode ? formatTimer(stats.timer) : "∞"}</strong>
        </div>
        <div className="stat-card">
          <span>{t("highScore", language)}</span>
          <strong>{stats.highScore}</strong>
        </div>
        <div className="stat-card">
          <span>{t("completed", language)}</span>
          <strong>{stats.completedWords}</strong>
        </div>
        <div className="stat-card">
          <span>{t("splitsLeft", language)}</span>
          <strong>{remainingSplits}</strong>
        </div>
        <div className="stat-card stat-card--wide">
          <span>{t("successfulCuts", language)}</span>
          <strong>{stats.successfulCuts}</strong>
        </div>
      </div>
    </motion.section>
  );
};

export default ScorePanel;
