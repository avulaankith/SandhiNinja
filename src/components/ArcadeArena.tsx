import { useEffect, useRef } from "react";
import SandhiGame from "../game/SandhiGame";
import { cloneWordNode } from "../data/sandhiBank";
import { t } from "../data/uiText";
import type {
  Language,
  SandhiRuleId,
  SliceFeedback,
  StudyMode,
  WordNode,
} from "../types/sandhi";

type ArcadeArenaProps = {
  fontsReady: boolean;
  interactionLocked: boolean;
  language: Language;
  onFeedback: (feedback: SliceFeedback) => void;
  roundKey: string;
  rootWord: WordNode;
  selectedRuleId: SandhiRuleId;
  studyMode: StudyMode;
};

export const ArcadeArena = ({
  fontsReady,
  interactionLocked,
  language,
  onFeedback,
  roundKey,
  rootWord,
  selectedRuleId,
  studyMode,
}: ArcadeArenaProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<SandhiGame | null>(null);
  const onFeedbackRef = useRef(onFeedback);

  useEffect(() => {
    onFeedbackRef.current = onFeedback;
  }, [onFeedback]);

  useEffect(() => {
    if (!fontsReady || !containerRef.current) {
      return;
    }

    const game = new SandhiGame({
      container: containerRef.current,
      state: {
        mode: "arcade",
        language,
        selectedRuleId,
        rootWord: cloneWordNode(rootWord),
        interactionLocked,
        roundKey,
        studyMode,
      },
      onFeedback: (feedback) => onFeedbackRef.current(feedback),
    });

    gameRef.current = game;

    return () => {
      game.destroy();
      gameRef.current = null;
      containerRef.current?.replaceChildren();
    };
  }, [fontsReady, roundKey]);

  useEffect(() => {
    if (!fontsReady || !gameRef.current) {
      return;
    }

    gameRef.current.update({
      language,
      selectedRuleId,
      interactionLocked,
      studyMode,
    });
  }, [fontsReady, interactionLocked, language, selectedRuleId, studyMode]);

  return (
    <div
      className={`game-stage ${fontsReady ? "" : "game-stage--loading"}`}
      ref={containerRef}
    >
      {!fontsReady ? (
        <div className="game-stage__loading">{t("loadingArena", language)}</div>
      ) : null}
    </div>
  );
};

export default ArcadeArena;
