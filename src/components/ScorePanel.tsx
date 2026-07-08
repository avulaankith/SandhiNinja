import { motion } from "framer-motion";
import { t } from "../data/uiText";
import type { GameMode, Language, PlayerStats, TimerMode } from "../types/sandhi";

type ScorePanelProps = {
  language: Language;
  mode: GameMode;
  stats: PlayerStats;
  timerMode: TimerMode;
  onTimerModeChange: (value: TimerMode) => void;
  practiceMode: boolean;
  onPracticeModeChange: (value: boolean) => void;
  currentWordLabel: string;
};

const formatTimer = (timer: number) => `${Math.max(0, timer)}s`;

export const ScorePanel = ({
  language,
  mode,
  stats,
  timerMode,
  onTimerModeChange,
  practiceMode,
  onPracticeModeChange,
  currentWordLabel,
}: ScorePanelProps) => (
  <motion.section
    layout
    className="glass-panel score-panel"
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="panel-heading">
      <span className="panel-kicker">{currentWordLabel}</span>
      <span className="shortcut-row">{t("knifeLocked", language)}</span>
    </div>

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

    <div className="timer-mode-row" aria-label={t("timerStyle", language)}>
      <span className="timer-mode-row__label">{t("timerStyle", language)}</span>
      <div className="toggle-row">
        <button
          className={`pill-button ${timerMode === "timed" && !practiceMode ? "active" : ""}`}
          onClick={() => onTimerModeChange("timed")}
          disabled={practiceMode}
          type="button"
        >
          {t("timedMode", language)}
        </button>
        <button
          className={`pill-button ${timerMode === "untimed" || practiceMode ? "active" : ""}`}
          onClick={() => onTimerModeChange("untimed")}
          disabled={practiceMode}
          type="button"
        >
          {t("untimedMode", language)}
        </button>
      </div>
    </div>

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
        <span>{t("lives", language)}</span>
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
      <div className="stat-card stat-card--wide">
        <span>{t("successfulCuts", language)}</span>
        <strong>{stats.successfulCuts}</strong>
      </div>
    </div>
  </motion.section>
);

export default ScorePanel;
