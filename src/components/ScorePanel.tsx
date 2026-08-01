import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { t } from "../data/uiText";
import type {
  AnswerAdvanceMode,
  GameMode,
  Language,
  PlayerStats,
  SessionPreset,
} from "../types/sandhi";

type CampaignSummary = {
  endlessUnlocked: boolean;
  graduationTimestamp?: string | null;
  joinMastered: number;
  joinTotal: number;
  overallPercent: number;
  splitMastered: number;
  splitTotal: number;
};

type ScorePanelProps = {
  answerAdvanceMode: AnswerAdvanceMode;
  answerRevealDelayMs: number;
  campaign: CampaignSummary;
  clockEnabled: boolean;
  currentWordLabel: string;
  language: Language;
  mode: GameMode;
  onAnswerAdvanceModeChange: (value: AnswerAdvanceMode) => void;
  onAnswerRevealDelayChange: (value: number) => void;
  onClockEnabledChange: (value: boolean) => void;
  onResetCampaign: () => void;
  onSessionPresetChange: (value: SessionPreset) => void;
  onTimerDurationChange: (value: number) => void;
  remainingSplits: number;
  sessionPreset: SessionPreset;
  stats: PlayerStats;
  timerDurationSeconds: number;
};

const formatTimer = (timer: number) => `${Math.max(0, timer)}s`;

const text = (
  language: Language,
  values: { en: string; sa: string; te: string },
) => values[language];

const PRESET_LABELS: Record<SessionPreset, Record<Language, string>> = {
  learn: {
    en: "Learn",
    sa: "अध्ययनम्",
    te: "అభ్యాసం",
  },
  practice: {
    en: "Practice",
    sa: "अभ्यासः",
    te: "సాధన",
  },
  challenge: {
    en: "Challenge",
    sa: "आह्वानम्",
    te: "సవాలు",
  },
};

const PRESET_HINTS: Record<SessionPreset, Record<Language, string>> = {
  learn: {
    en: "Full teaching help, answer reveal, no clock, and manual next. Campaign mastery stays off here.",
    sa: "अत्र पूर्णशिक्षणसाहाय्यम्, उत्तरप्रदर्शनम्, न कालबन्धः, हस्तचालितम् अग्रपदम् च। अस्मिन् प्रकारे प्रावीण्यगणना न भवति।",
    te: "ఇక్కడ పూర్తి బోధన సహాయం, సమాధాన చూపు, గడియారం లేదు, తదుపరి పదం మీ చేతిలోనే ఉంటుంది. ఈ విధానంలో ప్రచార ప్రావీణ్యం లెక్కలోకి రాదు.",
  },
  practice: {
    en: "Teaching help stays visible. Clean solves count toward campaign mastery.",
    sa: "शिक्षणसाहाय्यम् दृश्यते। शुद्धसमाधानानि अभियानप्रावीण्ये गण्यमानानि भवन्ति।",
    te: "బోధన సహాయం కనిపిస్తూనే ఉంటుంది. సమాధానం చూడకుండా సరిగా చేస్తే ప్రచార ప్రావీణ్యంలో లెక్కలోకి వస్తుంది.",
  },
  challenge: {
    en: "Minimal help, 4 lives, and faster review flow. Clean clears count toward mastery.",
    sa: "अल्पसाहाय्यम्, चत्वारि जीवनानि, शीघ्रपुनरवलोकनप्रवाहश्च। शुद्धसमाधानानि प्रावीण्ये गण्यमानानि भवन्ति।",
    te: "తక్కువ సహాయం, 4 జీవాలు, వేగమైన పునర్విమర్శ గతి. సమాధానం చూడకుండా సరిగా చేస్తే ప్రావీణ్యంలో లెక్కలోకి వస్తుంది.",
  },
};

const PANEL_LABELS = {
  afterAnswer: {
    en: "After answer",
    sa: "उत्तरोत्तरम्",
    te: "సమాధానం తరువాత",
  },
  answerDuration: {
    en: "Answer reveal",
    sa: "उत्तरदर्शनम्",
    te: "సమాధాన చూపు",
  },
  answerShort: {
    en: "Short",
    sa: "लघु",
    te: "చిన్నది",
  },
  answerMedium: {
    en: "Medium",
    sa: "मध्यमम्",
    te: "మధ్యస్థం",
  },
  answerLong: {
    en: "Long",
    sa: "दीर्घम्",
    te: "కొంచెం ఎక్కువ",
  },
  autoNext: {
    en: "Auto next",
    sa: "स्वयमग्रे",
    te: "తానే తదుపరి",
  },
  campaign: {
    en: "Campaign",
    sa: "अभियानम्",
    te: "ప్రచారం",
  },
  campaignBody: {
    en: "Graduate by mastering built-in words in both splitting and joining without using Show answer.",
    sa: "भेदे च संयोजने च अन्तर्निहितानि पदानि उत्तरप्रदर्शनं विना साधयित्वा स्नातकत्वं प्राप्नुहि।",
    te: "సమాధానం చూపకుండా అంతర్నిర్మిత పదాలను విడగొట్టడంలోను, కలపడంలోను సాధిస్తే పట్టాభిషేకం పొందుతారు.",
  },
  campaignReset: {
    en: "Reset campaign",
    sa: "अभियानं पुनरारभ",
    te: "ప్రచారాన్ని మళ్లీ ప్రారంభించు",
  },
  campaignUnlocked: {
    en: "Endless Review unlocked",
    sa: "अनन्तपुनरवलोकनं मुक्तम्",
    te: "అంతులేని పునర్విమర్శ తెరుచుకుంది",
  },
  clock: {
    en: "Clock",
    sa: "कालः",
    te: "గడియారం",
  },
  clockOff: {
    en: "Off",
    sa: "नास्ति",
    te: "ఆఫ్",
  },
  clockOn: {
    en: "On",
    sa: "अस्ति",
    te: "ఆన్",
  },
  completed: {
    en: "Overall",
    sa: "समग्रं",
    te: "మొత్తం",
  },
  graduationAt: {
    en: "Graduated",
    sa: "स्नातकत्वम्",
    te: "పట్టాభిషేకం",
  },
  learnGoal: {
    en: "Graduation does not use Ninja Slice in v1.",
    sa: "प्रथमसंस्करणे निन्जा-छेदः स्नातकगणनायां न गण्यते।",
    te: "మొదటి సంచికలో నింజా విభజనం పట్టాభిషేక లెక్కలోకి రాదు.",
  },
  masterJoin: {
    en: "Join mastery",
    sa: "संयोजनप्रावीण्यम्",
    te: "కలయిక ప్రావీణ్యం",
  },
  masterSplit: {
    en: "Split mastery",
    sa: "भेदप्रावीण्यम्",
    te: "విడిపోటి ప్రావీణ్యం",
  },
  modeHint: {
    en: "Session style",
    sa: "अभ्यासप्रकारः",
    te: "అధ్యయన విధానం",
  },
  timerLength: {
    en: "Time limit",
    sa: "कालसीमा",
    te: "సమయ పరిమితి",
  },
  moreSettings: {
    en: "Advanced settings",
    sa: "अधिकविन्यासाः",
    te: "అధిక అమరికలు",
  },
  stayHere: {
    en: "Stay here",
    sa: "अत्र तिष्ठ",
    te: "ఇక్కడే ఉండు",
  },
};

const GUIDE_LABELS = {
  graduationTitle: {
    en: "How graduation works",
    sa: "स्नातकत्वं कथं लभ्यते",
    te: "పట్టాభిషేకం ఎలా పొందాలి",
  },
  graduationBody: {
    en: "Master the built-in word bank in both Sandhi Splitting and Sandhi Joining. Learn mode is for study only, so it never grants mastery.",
    sa: "अन्तर्निहितपदसङ्ग्रहः सन्धिभेदे च सन्धिसंयोगे च साधनीयः। अध्ययनप्रकारः केवलम् अभ्यासाय, तेन प्रावीण्यं न लभ्यते।",
    te: "అంతర్నిర్మిత పదసంపుటిని సంధి విభజనలోను సంధి కలయికలోను సాధించాలి. అభ్యాసం రీతి చదువుకోడానికి మాత్రమే; దానితో ప్రావీణ్యం రావదు.",
  },
  graduationClean: {
    en: "A word counts only when you solve it cleanly in Practice or Challenge without Show answer and without a forced reveal after failure.",
    sa: "पदमेकं केवलं तदा गण्यमानं भवति यदा तत् अभ्यासे वा आह्वाने वा स्वयमेव सिद्ध्यति, न तु उत्तरदर्शनेन वा बाध्यप्रकटीकरणेन।",
    te: "ఒక పదం లెక్కలోకి రావాలంటే సాధన లేదా సవాలు రీతిలో మీరు స్వయంగా పూర్తి చేయాలి; జవాబు చూపించకూడదు, బలవంతంగా జవాబు బయటికొచ్చినా లెక్కలోకి రాదు.",
  },
  graduationNinja: {
    en: "Ninja Slice is optional in v1. It sharpens speed and placement, but graduation still depends on the splitting and joining campaigns.",
    sa: "प्रथमसंस्करणे निन्जा-छेदः वैकल्पिकः। सः वेगस्थानयोः अभ्यासं ददाति, किन्तु स्नातकत्वं भेदसंयोगाभियानयोरेव आश्रितम्।",
    te: "మొదటి సంచికలో నింజా స్లైస్ ఐచ్ఛికం. అది వేగం, సరైన స్థానం సాధనకు ఉపయోగపడుతుంది; కానీ పట్టాభిషేకం మాత్రం విభజన, కలయిక ప్రచారాలపైనే ఆధారపడి ఉంటుంది.",
  },
  sessionTitle: {
    en: "How the session styles work",
    sa: "अभ्यासप्रकाराः कथं कार्यं कुर्वन्ति",
    te: "అభ్యాస విధానాలు ఎలా పనిచేస్తాయి",
  },
  sessionLearn: {
    en: "Learn: full help, no clock, answer reveal allowed, manual next.",
    sa: "अध्ययनम्: पूर्णसाहाय्यम्, न कालबन्धः, उत्तरदर्शनम् अनुमतम्, हस्तचालितमग्रपदम्।",
    te: "అభ్యాసం: పూర్తి సహాయం, గడియారం లేదు, జవాబు చూపించవచ్చు, తదుపరి పదం మీ చేతిలోనే ఉంటుంది.",
  },
  sessionPractice: {
    en: "Practice: teaching help stays visible, no clock by default, and clean solves count for mastery.",
    sa: "अभ्यासः: शिक्षणसाहाय्यम् दृश्यते, सामान्यतः न कालबन्धः, शुद्धसमाधानानि प्रावीण्याय गण्यमानानि।",
    te: "సాధన: బోధన సహాయం కనిపిస్తూనే ఉంటుంది, సాధారణంగా గడియారం ఉండదు, సరిగా చేసిన పదాలు ప్రావీణ్యానికి లెక్కలోకి వస్తాయి.",
  },
  sessionChallenge: {
    en: "Challenge: lighter help, 4 lives, auto-next by default, and clean solves count for mastery.",
    sa: "आह्वानम्: अल्पसाहाय्यम्, चत्वारि जीवनानि, सामान्यतः स्वयमग्रगमनम्, शुद्धसमाधानानि प्रावीण्याय गण्यमानानि।",
    te: "సవాలు: తక్కువ సహాయం, 4 అవకాశాలు, సాధారణంగా తానే తదుపరి పదానికి వెళ్తుంది, సరిగా చేసిన పదాలు ప్రావీణ్యానికి లెక్కలోకి వస్తాయి.",
  },
};

const formatGraduation = (language: Language, timestamp?: string | null) => {
  if (!timestamp) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat(
      language === "sa" ? "sa-IN" : language === "te" ? "te-IN" : "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
    ).format(new Date(timestamp));
  } catch {
    return timestamp;
  }
};

export const ScorePanel = ({
  answerAdvanceMode,
  answerRevealDelayMs,
  campaign,
  clockEnabled,
  currentWordLabel,
  language,
  mode,
  onAnswerAdvanceModeChange,
  onAnswerRevealDelayChange,
  onClockEnabledChange,
  onResetCampaign,
  onSessionPresetChange,
  onTimerDurationChange,
  remainingSplits,
  sessionPreset,
  stats,
  timerDurationSeconds,
}: ScorePanelProps) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const livesLabel = sessionPreset === "challenge" ? t("lives", language) : t("revealLives", language);
  const graduationLabel = useMemo(
    () => formatGraduation(language, campaign.graduationTimestamp),
    [campaign.graduationTimestamp, language],
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
          {mode === "ninja"
            ? text(language, {
                en: "Swipe-first mode",
                sa: "स्वाइप्-प्रधानः प्रकारः",
                te: "స్వైప్ ప్రధాన విధానం",
              })
            : t(mode === "join" ? "glueLocked" : "knifeLocked", language)}
        </span>
      </div>

      <div className="score-panel__controls">
        <div className="timer-mode-row" aria-label={text(language, PANEL_LABELS.modeHint)}>
          <span className="timer-mode-row__label">{text(language, PANEL_LABELS.modeHint)}</span>
          <div className="toggle-row toggle-row--triple">
            {(["learn", "practice", "challenge"] as SessionPreset[]).map((value) => (
              <button
                key={value}
                className={`pill-button ${sessionPreset === value ? "active" : ""}`}
                onClick={() => onSessionPresetChange(value)}
                type="button"
              >
                {PRESET_LABELS[value][language]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="score-panel__mode-copy">{PRESET_HINTS[sessionPreset][language]}</p>

      <button
        className={`ghost-button ghost-button--panel-toggle ${advancedOpen ? "active" : ""}`}
        onClick={() => setAdvancedOpen((current) => !current)}
        type="button"
      >
        {text(language, PANEL_LABELS.moreSettings)}
      </button>

      {advancedOpen ? (
        <div className="score-panel__advanced">
          <div className="timer-mode-row" aria-label={text(language, PANEL_LABELS.clock)}>
            <span className="timer-mode-row__label">{text(language, PANEL_LABELS.clock)}</span>
            <div className="toggle-row">
              <button
                className={`pill-button ${clockEnabled ? "active" : ""}`}
                onClick={() => onClockEnabledChange(true)}
                type="button"
              >
                {text(language, PANEL_LABELS.clockOn)}
              </button>
              <button
                className={`pill-button ${clockEnabled ? "" : "active"}`}
                onClick={() => onClockEnabledChange(false)}
                type="button"
              >
                {text(language, PANEL_LABELS.clockOff)}
              </button>
            </div>
          </div>

          <div className="timer-mode-row" aria-label={text(language, PANEL_LABELS.timerLength)}>
            <span className="timer-mode-row__label">
              {text(language, PANEL_LABELS.timerLength)}
            </span>
            <div className="toggle-row toggle-row--quad">
              {[45, 60, 75, 90].map((seconds) => (
                <button
                  key={seconds}
                  className={`pill-button ${timerDurationSeconds === seconds ? "active" : ""}`}
                  onClick={() => onTimerDurationChange(seconds)}
                  type="button"
                >
                  {seconds}s
                </button>
              ))}
            </div>
          </div>

          <div className="timer-mode-row" aria-label={text(language, PANEL_LABELS.afterAnswer)}>
            <span className="timer-mode-row__label">{text(language, PANEL_LABELS.afterAnswer)}</span>
            <div className="toggle-row">
              <button
                className={`pill-button ${answerAdvanceMode === "auto" ? "active" : ""}`}
                onClick={() => onAnswerAdvanceModeChange("auto")}
                type="button"
              >
                {text(language, PANEL_LABELS.autoNext)}
              </button>
              <button
                className={`pill-button ${answerAdvanceMode === "manual" ? "active" : ""}`}
                onClick={() => onAnswerAdvanceModeChange("manual")}
                type="button"
              >
                {text(language, PANEL_LABELS.stayHere)}
              </button>
            </div>
          </div>

          <div className="timer-mode-row" aria-label={text(language, PANEL_LABELS.answerDuration)}>
            <span className="timer-mode-row__label">{text(language, PANEL_LABELS.answerDuration)}</span>
            <div className="toggle-row">
              <button
                className={`pill-button ${answerRevealDelayMs === 12000 ? "active" : ""}`}
                onClick={() => onAnswerRevealDelayChange(12000)}
                type="button"
              >
                {text(language, PANEL_LABELS.answerShort)}
              </button>
              <button
                className={`pill-button ${answerRevealDelayMs === 16000 ? "active" : ""}`}
                onClick={() => onAnswerRevealDelayChange(16000)}
                type="button"
              >
                {text(language, PANEL_LABELS.answerMedium)}
              </button>
              <button
                className={`pill-button ${answerRevealDelayMs === 20000 ? "active" : ""}`}
                onClick={() => onAnswerRevealDelayChange(20000)}
                type="button"
              >
                {text(language, PANEL_LABELS.answerLong)}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="score-panel__guide">
        <details className="instruction-card">
          <summary>{text(language, GUIDE_LABELS.graduationTitle)}</summary>
          <div className="instruction-card__body">
            <p>{text(language, GUIDE_LABELS.graduationBody)}</p>
            <p>{text(language, GUIDE_LABELS.graduationClean)}</p>
            <p>{text(language, GUIDE_LABELS.graduationNinja)}</p>
          </div>
        </details>

        <details className="instruction-card">
          <summary>{text(language, GUIDE_LABELS.sessionTitle)}</summary>
          <div className="instruction-card__body">
            <p>{text(language, GUIDE_LABELS.sessionLearn)}</p>
            <p>{text(language, GUIDE_LABELS.sessionPractice)}</p>
            <p>{text(language, GUIDE_LABELS.sessionChallenge)}</p>
          </div>
        </details>
      </div>

      <div className="score-panel__campaign">
        <div className="panel-heading panel-heading--compact">
          <span className="panel-kicker">{text(language, PANEL_LABELS.campaign)}</span>
          <span className="shortcut-row">{campaign.overallPercent}%</span>
        </div>
        <p className="score-panel__campaign-copy">{text(language, PANEL_LABELS.campaignBody)}</p>
        <div className="stat-grid stat-grid--campaign">
          <div className="stat-card">
            <span>{text(language, PANEL_LABELS.masterSplit)}</span>
            <strong>
              {campaign.splitMastered}/{campaign.splitTotal}
            </strong>
          </div>
          <div className="stat-card">
            <span>{text(language, PANEL_LABELS.masterJoin)}</span>
            <strong>
              {campaign.joinMastered}/{campaign.joinTotal}
            </strong>
          </div>
          <div className="stat-card">
            <span>{text(language, PANEL_LABELS.completed)}</span>
            <strong>{campaign.overallPercent}%</strong>
          </div>
          <div className="stat-card">
            <span>{text(language, PANEL_LABELS.graduationAt)}</span>
            <strong>{graduationLabel ?? "—"}</strong>
          </div>
        </div>
        <p className="score-panel__mode-copy score-panel__mode-copy--campaign">
          {campaign.endlessUnlocked
            ? text(language, PANEL_LABELS.campaignUnlocked)
            : text(language, PANEL_LABELS.learnGoal)}
        </p>
        <button className="ghost-button" onClick={onResetCampaign} type="button">
          {text(language, PANEL_LABELS.campaignReset)}
        </button>
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
          <span>{livesLabel}</span>
          <strong>{stats.lives}</strong>
        </div>
        <div className="stat-card">
          <span>{t("timer", language)}</span>
          <strong>{clockEnabled ? formatTimer(stats.timer) : "∞"}</strong>
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
