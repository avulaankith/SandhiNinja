import { motion } from "framer-motion";
import { modeLabel } from "../data/uiText";
import type { GameMode, Language } from "../types/sandhi";

type ModeSelectorProps = {
  language: Language;
  mode: GameMode;
  onChange: (mode: GameMode) => void;
};

const MODES: Array<Exclude<GameMode, "devStudio">> = ["arcade", "join"];

export const ModeSelector = ({ language, mode, onChange }: ModeSelectorProps) => (
  <div className="mode-grid">
    {MODES.map((value) => {
      const active = value === mode;

      return (
        <motion.button
          key={value}
          type="button"
          whileTap={{ scale: 0.985 }}
          className={`mode-card ${active ? "active" : ""}`}
          onClick={() => onChange(value)}
        >
          <span className="mode-card__eyebrow">
            {value === "arcade" ? "01" : value === "join" ? "02" : "03"}
          </span>
          <span className="mode-card__title">{modeLabel(value, language)}</span>
        </motion.button>
      );
    })}
  </div>
);

export default ModeSelector;
