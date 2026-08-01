import { useEffect, useRef } from "react";
import SandhiGame from "../game/SandhiGame";
import { cloneWordNode } from "../data/sandhiBank";
import { t } from "../data/uiText";
import type {
  GameMode,
  Language,
  SandhiRuleId,
  SliceFeedback,
  StudyMode,
  WordNode,
} from "../types/sandhi";

type ArcadeArenaProps = {
  clockEnabled: boolean;
  fontsReady: boolean;
  interactionLocked: boolean;
  language: Language;
  mode: Exclude<GameMode, "devStudio" | "join">;
  onFeedback: (feedback: SliceFeedback) => void;
  roundKey: string;
  rootWord: WordNode;
  selectedRuleId: SandhiRuleId;
  studyMode: StudyMode;
};

export const ArcadeArena = ({
  clockEnabled,
  fontsReady,
  interactionLocked,
  language,
  mode,
  onFeedback,
  roundKey,
  rootWord,
  selectedRuleId,
  studyMode,
}: ArcadeArenaProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<SandhiGame | null>(null);
  const onFeedbackRef = useRef(onFeedback);
  const lastResizeRef = useRef<{ width: number; height: number } | null>(null);

  useEffect(() => {
    onFeedbackRef.current = onFeedback;
  }, [onFeedback]);

  useEffect(() => {
    if (!fontsReady || !containerRef.current) {
      return;
    }

    const initialWidth = Math.round(containerRef.current.clientWidth || 960);
    const initialHeight = Math.round(containerRef.current.clientHeight || 640);
    const game = new SandhiGame({
      container: containerRef.current,
      state: {
        clockEnabled,
        mode,
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
    lastResizeRef.current = {
      width: initialWidth,
      height: initialHeight,
    };

    return () => {
      game.destroy();
      gameRef.current = null;
      lastResizeRef.current = null;
      containerRef.current?.replaceChildren();
    };
  }, [fontsReady]);

  useEffect(() => {
    const element = containerRef.current;
    const game = gameRef.current;

    if (!fontsReady || !element || !game || typeof ResizeObserver === "undefined") {
      return;
    }

    const syncSize = () => {
      const width = Math.round(element.clientWidth);
      const height = Math.round(element.clientHeight);

      if (width <= 0 || height <= 0) {
        return;
      }

      const previous = lastResizeRef.current;

      if (
        previous &&
        Math.abs(previous.width - width) <= 1 &&
        Math.abs(previous.height - height) <= 1
      ) {
        return;
      }

      lastResizeRef.current = { width, height };
      game.resize(width, height);
    };

    const observer = new ResizeObserver(() => {
      syncSize();
    });

    observer.observe(element);
    syncSize();

    return () => {
      observer.disconnect();
    };
  }, [fontsReady]);

  useEffect(() => {
    if (!fontsReady || !gameRef.current) {
      return;
    }

    gameRef.current.update({
      mode,
      language,
      clockEnabled,
      selectedRuleId,
      rootWord: cloneWordNode(rootWord),
      interactionLocked,
      roundKey,
      studyMode,
    });
  }, [
    clockEnabled,
    fontsReady,
    interactionLocked,
    language,
    mode,
    rootWord,
    roundKey,
    selectedRuleId,
    studyMode,
  ]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || mode !== "ninja") {
      return;
    }

    const preventStageScroll = (event: Event) => {
      if ("cancelable" in event && !event.cancelable) {
        return;
      }

      event.preventDefault();
    };

    element.addEventListener("wheel", preventStageScroll, { passive: false });
    element.addEventListener("touchmove", preventStageScroll, { passive: false });

    return () => {
      element.removeEventListener("wheel", preventStageScroll);
      element.removeEventListener("touchmove", preventStageScroll);
    };
  }, [mode]);

  return (
    <div
      className={`game-stage ${mode === "ninja" ? "game-stage--ninja" : ""} ${
        fontsReady ? "" : "game-stage--loading"
      }`}
      ref={containerRef}
    >
      {!fontsReady ? (
        <div className="game-stage__loading">{t("loadingArena", language)}</div>
      ) : null}
    </div>
  );
};

export default ArcadeArena;
