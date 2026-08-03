import { motion } from "framer-motion";
import { t } from "../data/uiText";
import { SANDHI_RULES } from "../data/sandhiBank";
import type { Language, LessonPayload, StudyMode } from "../types/sandhi";
import {
  buildLessonSequence,
  type LessonSequenceBranch,
} from "../utils/lessonSequence";

const LANGUAGE_LABEL: Record<Language, string> = {
  en: "EN",
  sa: "SA",
  te: "TE",
};

const STEP_LABEL: Record<Language, string> = {
  en: "Step",
  sa: "क्रमः",
  te: "దశ",
};

const SEQUENCE_TITLE: Record<Language, string> = {
  en: "Sandhi sequence",
  sa: "सन्धिक्रमः",
  te: "సంధి క్రమం",
};

const CHAIN_TITLE: Record<Language, string> = {
  en: "Rule chain at this split",
  sa: "अस्मिन् भेदे नियमश्रेणी",
  te: "ఈ విడిపోటిలో నియమ శ్రేణి",
};

const getSequenceSummary = (language: Language, totalSteps: number) => {
  if (language === "sa") {
    return totalSteps === 2
      ? "अस्मिन् पदे द्वे क्रमिके सन्धी स्तः। प्रथमं एतत् भिन्धि, अनन्तरं अवशिष्टभागं भिन्धि।"
      : `अस्मिन् पदे ${totalSteps} क्रमिकसन्धयः सन्ति। अधोलिखितक्रमेण भिन्धि।`;
  }

  if (language === "te") {
    return totalSteps === 2
      ? "ఈ పదంలో వరుసగా రెండు సంధులు ఉన్నాయి. ముందుగా ఈ విడిపోటిని చేయండి, తర్వాత మిగిలిన భాగాన్ని విడగొట్టండి."
      : `ఈ పదంలో మొత్తం ${totalSteps} వరుస సంధి దశలు ఉన్నాయి. కింద ఇచ్చిన క్రమంలో విడగొట్టండి.`;
  }

  return totalSteps === 2
    ? "This word has two sandhis in sequence. Split this step first, then split the remaining compound part."
    : `This word has ${totalSteps} sandhi steps in sequence. Follow the order shown below.`;
};

const getSequenceBranchLabel = (
  language: Language,
  branch: LessonSequenceBranch,
) => {
  if (language === "sa") {
    if (branch === "current") {
      return "अत्र आरभस्व";
    }

    return branch === "left"
      ? "अनन्तरं वामभागं भिन्धि"
      : "अनन्तरं दक्षिणभागं भिन्धि";
  }

  if (language === "te") {
    if (branch === "current") {
      return "ఇక్కడ మొదలుపెట్టు";
    }

    return branch === "left"
      ? "తర్వాత ఎడమ భాగాన్ని విడగొట్టు"
      : "తర్వాత కుడి భాగాన్ని విడగొట్టు";
  }

  if (branch === "current") {
    return "Start here";
  }

  return branch === "left" ? "Then split the left part" : "Then split the right part";
};

const getRuleChainSummary = (language: Language, totalSteps: number) => {
  if (language === "sa") {
    return totalSteps === 2
      ? "अस्मिन्नेव सन्धिस्थाने द्वौ नियमौ क्रमशः कार्यं कुरुतः। अन्तिमदृश्यरूपं उभयोः संयुक्तफलम् अस्ति।"
      : `अस्मिन्नेव सन्धिस्थाने ${totalSteps} नियमाः क्रमशः प्रवर्तन्ते। अन्तिमरूपं सम्पूर्णक्रमफलम् अस्ति।`;
  }

  if (language === "te") {
    return totalSteps === 2
      ? "ఇదే సంధి స్థానంలో వరుసగా రెండు నియమాలు పనిచేస్తాయి. చివర కనిపించే రూపం ఈ రెండు దశల కలిపిన ఫలితం."
      : `ఇదే సంధి స్థానంలో మొత్తం ${totalSteps} నియమ దశలు వరుసగా పనిచేస్తాయి. చివరి రూపం మొత్తం క్రమఫలితం.`;
  }

  return totalSteps === 2
    ? "At this same boundary, two sandhi operations apply in order. The visible final form comes from both steps together."
    : `At this same boundary, ${totalSteps} sandhi operations apply in order. The visible final form comes from the full chain.`;
};

type LessonPanelProps = {
  language: Language;
  lesson: LessonPayload | null;
  feedback: string | null;
  studyMode: StudyMode;
  revealed?: boolean;
  showAnswerMeta?: boolean;
};

export const LessonPanel = ({
  language,
  lesson,
  feedback,
  studyMode,
  revealed = false,
  showAnswerMeta = false,
}: LessonPanelProps) => {
  const ruleLookup = new Map(SANDHI_RULES.map((rule) => [rule.id, rule]));
  const activeRule = lesson
    ? ruleLookup.get(lesson.cut.ruleId) ?? null
    : null;
  const revealedRule = revealed ? activeRule : null;
  const showAnswerView = Boolean(lesson) && showAnswerMeta;
  const showLessonSummary = Boolean(lesson) && !revealed;
  const showGuidedScaffolding = studyMode === "guided";
  const showQuickMemory = Boolean(activeRule) && (showGuidedScaffolding || showAnswerView || revealed);
  const ruleChain = lesson?.cut.ruleChain?.length
    ? lesson.cut.ruleChain
        .map((ruleId) => ruleLookup.get(ruleId) ?? null)
        .filter((rule): rule is (typeof SANDHI_RULES)[number] => Boolean(rule))
    : [];
  const showRuleChain = ruleChain.length > 1;
  const activeRuleLabel = showRuleChain
    ? ruleChain.map((rule) => rule.label[language]).join(" → ")
    : activeRule?.label[language] ?? lesson?.cut.sutra.text ?? "";
  const lessonSequence = lesson
    ? buildLessonSequence(lesson.node, lesson.cut)
    : [];
  const showLessonSequence = lessonSequence.length > 1;
  const lessonNote =
    lesson?.cut.explanation.note === undefined
      ? null
      : typeof lesson.cut.explanation.note === "string"
        ? lesson.cut.explanation.note
        : lesson.cut.explanation.note[language];

  return (
    <motion.section
      className={`glass-panel lesson-panel ${revealed ? "lesson-panel--reveal" : ""}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="panel-heading">
        <span className="panel-kicker">{t("currentLesson", language)}</span>
        {feedback ? (
          <span className={`feedback-chip ${revealed ? "feedback-chip--reveal" : ""}`}>
            {feedback}
          </span>
        ) : null}
      </div>

      {lesson ? (
        <div className="lesson-body">
          {showAnswerView ? (
            <div>
              <span className="shortcut-row">
                {t("sutraNumber", language)} · {lesson.cut.sutra.number}
              </span>
            </div>
          ) : null}

          {revealed ? (
            <div className="reveal-banner">
              <span className="panel-kicker">{t("revealTitle", language)}</span>
              <div className="reveal-banner__row">
                <span>{t("revealRule", language)}</span>
                <strong>{activeRuleLabel}</strong>
              </div>
              <div className="reveal-banner__row">
                <span>{t("revealPlace", language)}</span>
                <strong className="reveal-banner__split">
                  {lesson.cut.left.devanagari} + {lesson.cut.right.devanagari}
                </strong>
              </div>
            </div>
          ) : null}

          {showLessonSummary ? (
            <div className="lesson-summary-grid">
              <div className="lesson-summary-card">
                <span className="panel-kicker">{t("revealRule", language)}</span>
                <strong>{activeRuleLabel}</strong>
              </div>
              <div className="lesson-summary-card">
                <span className="panel-kicker">{t("revealPlace", language)}</span>
                <strong className="lesson-summary-card__split">
                  {lesson.cut.left.devanagari} + {lesson.cut.right.devanagari}
                </strong>
              </div>
            </div>
          ) : null}

          {!showAnswerView ? (
            <div className="sutra-card">
              <span>{lesson.cut.sutra.text}</span>
              <strong>{lesson.cut.sutra.number}</strong>
            </div>
          ) : null}

          <div className="lesson-title">
            <strong>{lesson.node.devanagari}</strong>
            <span>
              {language === "te" && lesson.node.telugu
                ? lesson.node.telugu
                : lesson.node.iast}
            </span>
          </div>

          {lesson.cut.explanation.nimitta ? (
            <div className="note-box">
              <span className="panel-kicker">{t("nimittam", language)}</span>
              <p>{lesson.cut.explanation.nimitta[language]}</p>
            </div>
          ) : null}

          {showQuickMemory && activeRule ? (
            <div className="note-box lesson-memory">
              <span className="panel-kicker">{t("rememberRule", language)}</span>
              <p>{activeRule.helper[language]}</p>
            </div>
          ) : null}

          <div className="lesson-explanation">
            <span>{LANGUAGE_LABEL[language]}</span>
            <p>{lesson.cut.explanation[language]}</p>
          </div>

          {showGuidedScaffolding && showRuleChain ? (
            <div className="note-box lesson-rule-chain">
              <span className="panel-kicker">{CHAIN_TITLE[language]}</span>
              <p className="lesson-rule-chain__summary">
                {getRuleChainSummary(language, ruleChain.length)}
              </p>
              <div className="lesson-rule-chain__flow">
                {ruleChain.map((rule, index) => (
                  <div className="lesson-rule-chain__step" key={`${rule.id}-${index + 1}`}>
                    <span className="panel-kicker">
                      {STEP_LABEL[language]} {index + 1}
                    </span>
                    <strong>{rule.label[language]}</strong>
                    <span className="lesson-rule-chain__sutra">{rule.sutra.number}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {showGuidedScaffolding && showLessonSequence ? (
            <div className="note-box lesson-sequence">
              <span className="panel-kicker">{SEQUENCE_TITLE[language]}</span>
              <p className="lesson-sequence__summary">
                {getSequenceSummary(language, lessonSequence.length)}
              </p>
              <div className="lesson-sequence__list">
                {lessonSequence.map((step, index) => {
                  const stepRule = ruleLookup.get(step.cut.ruleId) ?? null;

                  return (
                    <div className="lesson-sequence-card" key={`${step.cut.id}-${index + 1}`}>
                      <div className="lesson-sequence-card__header">
                        <span className="panel-kicker">
                          {STEP_LABEL[language]} {index + 1}
                        </span>
                        <span className="lesson-sequence-card__branch">
                          {getSequenceBranchLabel(language, step.branch)}
                        </span>
                      </div>
                      <strong>{stepRule?.label[language] ?? step.cut.sutra.text}</strong>
                      <div className="lesson-sequence-card__split">
                        {step.cut.left.devanagari} + {step.cut.right.devanagari}
                      </div>
                      <span className="lesson-sequence-card__sutra">
                        {step.cut.sutra.number}
                      </span>
                      <p>{step.cut.explanation[language]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {lessonNote ? (
            <div className="note-box">
              <p>
                {lessonNote}
                {lesson.variantCount > 1 ? ` (${lesson.variantCount} variants)` : ""}
              </p>
            </div>
          ) : null}

          {showGuidedScaffolding && activeRule ? (
            <div className="note-box lesson-pattern">
              <span className="panel-kicker">{t("rulePattern", language)}</span>
              <p>{activeRule.pattern[language]}</p>
            </div>
          ) : null}

        </div>
      ) : (
        <p className="muted-copy">{t("noLesson", language)}</p>
      )}
    </motion.section>
  );
};

export default LessonPanel;
