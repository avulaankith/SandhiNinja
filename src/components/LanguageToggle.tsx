import { motion } from "framer-motion";
import type { Language } from "../types/sandhi";

type LanguageToggleProps = {
  language: Language;
  onChange: (language: Language) => void;
};

const OPTIONS: Array<{ id: Language; label: string }> = [
  { id: "en", label: "English" },
  { id: "sa", label: "संस्कृतम्" },
  { id: "te", label: "తెలుగు" },
];

export const LanguageToggle = ({
  language,
  onChange,
}: LanguageToggleProps) => (
  <div className="toggle-row" aria-label="Language">
    {OPTIONS.map((option) => {
      const active = option.id === language;

      return (
        <motion.button
          key={option.id}
          whileTap={{ scale: 0.97 }}
          className={`pill-button ${active ? "active" : ""}`}
          onClick={() => onChange(option.id)}
          type="button"
        >
          {option.label}
        </motion.button>
      );
    })}
  </div>
);

export default LanguageToggle;
