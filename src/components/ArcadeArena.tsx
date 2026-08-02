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
  const resizeFrameRef = useRef<number | null>(null);
  const NINJA_WIDTH_RESIZE_THRESHOLD_PX = 12;

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
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
      game.destroy();
      gameRef.current = null;
      lastResizeRef.current = null;
      containerRef.current?.replaceChildren();
    };
  }, [fontsReady]);

  useEffect(() => {
    const element = containerRef.current;
    const game = gameRef.current;

    if (!fontsReady || !element || !game) {
      return;
    }

    const syncSize = () => {
      const width = Math.round(element.clientWidth);
      const height = Math.round(element.clientHeight);

      if (width <= 0 || height <= 0) {
        return;
      }

      const previous = lastResizeRef.current;
      const widthDelta = previous ? Math.abs(previous.width - width) : 0;
      const heightDelta = previous ? Math.abs(previous.height - height) : 0;

      if (previous && widthDelta <= 1 && heightDelta <= 1) {
        return;
      }

      if (mode === "ninja" && previous && widthDelta < NINJA_WIDTH_RESIZE_THRESHOLD_PX) {
        return;
      }

      lastResizeRef.current = { width, height };
      game.resize(width, height);
    };

    if (mode === "ninja") {
      const handleViewportResize = () => {
        if (resizeFrameRef.current !== null) {
          window.cancelAnimationFrame(resizeFrameRef.current);
        }

        resizeFrameRef.current = window.requestAnimationFrame(() => {
          resizeFrameRef.current = null;
          syncSize();
        });
      };

      window.addEventListener("resize", handleViewportResize, { passive: true });
      window.addEventListener("orientationchange", handleViewportResize, {
        passive: true,
      });
      syncSize();

      return () => {
        if (resizeFrameRef.current !== null) {
          window.cancelAnimationFrame(resizeFrameRef.current);
          resizeFrameRef.current = null;
        }
        window.removeEventListener("resize", handleViewportResize);
        window.removeEventListener("orientationchange", handleViewportResize);
      };
    }

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      syncSize();
    });

    observer.observe(element);
    syncSize();

    return () => {
      observer.disconnect();
    };
  }, [fontsReady, mode]);

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
