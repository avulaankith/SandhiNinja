import { motion } from "framer-motion";
import { t } from "../data/uiText";
import type { Language, SandhiFamily } from "../types/sandhi";

export type SandhiFamilyOption = {
  id: SandhiFamily;
  examples: string;
  ruleCount: number;
  wordCount: number;
  disabled?: boolean;
};

type SandhiFamilySelectorProps = {
  language: Language;
  options: SandhiFamilyOption[];
  selectedFamily: SandhiFamily;
  onChange: (family: SandhiFamily) => void;
};

const titleKeyByFamily = {
  mixed: "familyMixed",
  svara: "familySvara",
  vyanjana: "familyVyanjana",
  visarga: "familyVisarga",
} as const;

const hintKeyByFamily = {
  mixed: "familyMixedHint",
  svara: "familySvaraHint",
  vyanjana: "familyVyanjanaHint",
  visarga: "familyVisargaHint",
} as const;

export const SandhiFamilySelector = ({
  language,
  options,
  selectedFamily,
  onChange,
}: SandhiFamilySelectorProps) => {
  const activeOption =
    options.find((option) => option.id === selectedFamily) ?? options[0] ?? null;
  const activeTitle = activeOption
    ? t(titleKeyByFamily[activeOption.id], language)
    : null;

  return (
    <div className="family-selector">
      <div className="family-selector__header">
        <span className="panel-kicker">{t("familyTitle", language)}</span>
        {activeOption ? (
          <span className="family-selector__summary">
            {activeTitle} · {activeOption.ruleCount} {t("familyRulesLabel", language)} ·{" "}
            {activeOption.wordCount} {t("familyWordsLabel", language)}
          </span>
        ) : null}
      </div>

      <div className="family-grid family-grid--compact">
        {options.map((option) => {
          const active = option.id === selectedFamily;

          return (
            <motion.button
              key={option.id}
              type="button"
              whileTap={{ scale: option.disabled ? 1 : 0.985 }}
              className={`family-card family-card--compact ${active ? "active" : ""} ${
                option.disabled ? "family-card--disabled" : ""
              }`}
              disabled={option.disabled}
              onClick={() => onChange(option.id)}
              aria-pressed={active}
            >
              <strong>{t(titleKeyByFamily[option.id], language)}</strong>
              <span className="family-card__count">
                {option.wordCount} {t("familyWordsLabel", language)}
              </span>
            </motion.button>
          );
        })}
      </div>

      {activeOption ? (
        <div className="family-spotlight">
          <strong className="family-spotlight__title">{activeTitle}</strong>
          <p>{t(hintKeyByFamily[activeOption.id], language)}</p>
          <div className="family-card__meta">
            <span className="family-card__label">
              {activeOption.disabled
                ? t("familyComingSoon", language)
                : t("familyExamples", language)}
            </span>
            <span className="family-card__examples">
              {activeOption.examples || t("familyComingSoon", language)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SandhiFamilySelector;
