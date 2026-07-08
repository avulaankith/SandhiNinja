import { motion } from "framer-motion";
import { t } from "../data/uiText";
import { SANDHI_RULES } from "../data/sandhiBank";
import type { Language, LessonPayload } from "../types/sandhi";

const LANGUAGE_LABEL: Record<Language, string> = {
  en: "EN",
  sa: "SA",
  te: "TE",
};

type LessonPanelProps = {
  language: Language;
  lesson: LessonPayload | null;
  feedback: string | null;
  revealed?: boolean;
};

export const LessonPanel = ({
  language,
  lesson,
  feedback,
  revealed = false,
}: LessonPanelProps) => {
  const revealedRule =
    revealed && lesson
      ? SANDHI_RULES.find((rule) => rule.id === lesson.cut.ruleId) ?? null
      : null;

  return (
  <motion.section
    layout
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
        {revealed ? (
          <div className="reveal-banner">
            <span className="panel-kicker">{t("revealTitle", language)}</span>
            <div className="reveal-banner__row">
              <span>{t("revealRule", language)}</span>
              <strong>{revealedRule?.label[language] ?? lesson.cut.sutra.text}</strong>
            </div>
            <div className="reveal-banner__row">
              <span>{t("revealPlace", language)}</span>
              <strong className="reveal-banner__split">
                {lesson.cut.left.devanagari} + {lesson.cut.right.devanagari}
              </strong>
            </div>
          </div>
        ) : null}
        <div className="sutra-card">
          <span>{lesson.cut.sutra.text}</span>
          <strong>{lesson.cut.sutra.number}</strong>
        </div>
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
        <div className="lesson-explanation">
          <span>{LANGUAGE_LABEL[language]}</span>
          <p>{lesson.cut.explanation[language]}</p>
        </div>
        {lesson.cut.explanation.note ? (
          <div className="note-box">
            {lesson.cut.explanation.note}
            {lesson.variantCount > 1 ? ` (${lesson.variantCount} variants)` : ""}
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
