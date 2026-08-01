import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cloneWordNode, isFurtherSplittable } from "../data/sandhiBank";
import { UI_TEXT, t } from "../data/uiText";
import {
  getAcceptedCutBoundaryOffsets,
  getDisplayBoundaryCharOffsets,
  getTeachingCutBoundaryOffsets,
  mergeBoundaryMarkers,
} from "../utils/splitGuides";
import type {
  ActiveToken,
  Language,
  LessonPayload,
  SandhiCut,
  SandhiRuleId,
  SliceAssessment,
  SliceFeedback,
  StudyMode,
  WordNode,
} from "../types/sandhi";

type SandhiSplitBoardProps = {
  fontsReady: boolean;
  interactionLocked: boolean;
  language: Language;
  onFeedback: (feedback: SliceFeedback) => void;
  roundKey: string;
  rootWord: WordNode;
  selectedRuleId: SandhiRuleId;
  studyMode: StudyMode;
};

const cutMatchesRule = (cut: SandhiCut, ruleId: SandhiRuleId) =>
  cut.ruleId === ruleId || cut.ruleChain?.includes(ruleId) === true;

const localizedMessage = (key: keyof typeof UI_TEXT): SliceFeedback["message"] => ({
  en: t(key, "en"),
  sa: t(key, "sa"),
  te: t(key, "te"),
});

const collectAvailableRuleIds = (tokens: ActiveToken[]) => {
  const ids = new Set<SandhiRuleId>();

  tokens.forEach((token) => {
    if (!isFurtherSplittable(token.node)) {
      return;
    }

    token.node.cuts.forEach((cut) => {
      if (cut.reviewNeeded) {
        return;
      }

      ids.add(cut.ruleId);
      cut.ruleChain?.forEach((ruleId) => ids.add(ruleId));
    });
  });

  return [...ids];
};

const buildLesson = (
  node: WordNode,
  cut: SandhiCut,
  variantCount: number,
): LessonPayload => ({
  node,
  cut,
  variantCount,
});

const getRevealLesson = (tokens: ActiveToken[]) => {
  const stuck = tokens.find((token) => isFurtherSplittable(token.node));
  if (!stuck) {
    return undefined;
  }

  const eligibleCuts = stuck.node.cuts.filter((cut) => !cut.reviewNeeded);
  const cut = eligibleCuts[0] ?? stuck.node.cuts[0];
  if (!cut) {
    return undefined;
  }

  const targetBoundarySignature = getTeachingCutBoundaryOffsets(
    stuck.node.devanagari,
    cut,
  ).join("\u0001");
  const variantCount = stuck.node.cuts.filter(
    (entry) =>
      !entry.reviewNeeded &&
      getTeachingCutBoundaryOffsets(stuck.node.devanagari, entry).join("\u0001") ===
        targetBoundarySignature,
  ).length;

  return buildLesson(stuck.node, cut, variantCount || 1);
};

const hasSelectedRuleElsewhere = (node: WordNode, ruleId: SandhiRuleId) =>
  node.cuts.some((cut) => !cut.reviewNeeded && cutMatchesRule(cut, ruleId));

const secondaryLabel = (node: WordNode, language: Language) =>
  language === "te" && node.telugu ? node.telugu : node.iast;

type SplitTokenWordProps = {
  interactionLocked: boolean;
  language: Language;
  onBoundaryClick: (candidateBoundaryCharOffsets: number[]) => void;
  splittable: boolean;
  studyMode: StudyMode;
  token: ActiveToken;
};

type SplitMarker = {
  candidateBoundaryCharOffsets: number[];
  offset: number;
};

const SplitTokenWord = ({
  interactionLocked,
  language,
  onBoundaryClick,
  splittable,
  studyMode,
  token,
}: SplitTokenWordProps) => {
  const wordLayerRef = useRef<HTMLDivElement | null>(null);
  const prefixMeasureRefs = useRef<Record<number, HTMLSpanElement | null>>({});
  const [markers, setMarkers] = useState<SplitMarker[]>([]);
  const boundaryCharOffsets = getDisplayBoundaryCharOffsets(token.node);
  const measurementKey = boundaryCharOffsets.join("\u0001");

  useLayoutEffect(() => {
    const wordLayer = wordLayerRef.current;

    if (!wordLayer) {
      setMarkers([]);
      return;
    }

    const measureMarkers = () => {
      if (wordLayer.offsetWidth <= 0 || boundaryCharOffsets.length === 0) {
        setMarkers([]);
        return;
      }

      const getMarkerOffset = (charOffset: number) => {
        const prefixMeasure = prefixMeasureRefs.current[charOffset];
        if (!prefixMeasure) {
          return 0;
        }

        return prefixMeasure.getBoundingClientRect().width;
      };

      setMarkers(
        mergeBoundaryMarkers(boundaryCharOffsets, (charOffset) => {
          const markerOffset = getMarkerOffset(charOffset);
          return Number.isFinite(markerOffset) ? markerOffset : 0;
        }) as SplitMarker[],
      );
    };

    measureMarkers();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(measureMarkers) : null;
    resizeObserver?.observe(wordLayer);
    window.addEventListener("resize", measureMarkers);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", measureMarkers);
    };
  }, [measurementKey, token.node.devanagari]);

  return (
    <div
      className={`split-token__word-shell ${
        splittable ? "split-token__word-shell--compound" : "split-token__word-shell--final"
      }`}
    >
      <div className="split-token__word-layer" ref={wordLayerRef}>
        <span
          aria-label={token.node.devanagari}
          className="split-token__word"
          role="presentation"
        >
          {token.node.devanagari}
        </span>
        <div aria-hidden="true" className="split-token__measure">
          {boundaryCharOffsets.map((charOffset) => (
            <span
              className="split-token__measure-prefix"
              key={`${token.instanceId}-measure-${charOffset}`}
              ref={(element) => {
                prefixMeasureRefs.current[charOffset] = element;
              }}
            >
              {token.node.devanagari.slice(0, charOffset)}
            </span>
          ))}
        </div>

        {splittable
          ? markers.map((marker, index) => (
              <button
                className={`split-marker split-marker--overlay ${
                  studyMode === "guided" ? "split-marker--guided" : ""
                }`}
                disabled={interactionLocked}
                key={`${token.instanceId}-marker-${marker.candidateBoundaryCharOffsets.join("-")}`}
                onClick={() => onBoundaryClick(marker.candidateBoundaryCharOffsets)}
                style={{ left: `${marker.offset}px` }}
                type="button"
              >
                <span className="split-marker__line" />
                <span className="sr-only">
                  {`${t("slicePrompt", language)} ${index + 1}`}
                </span>
              </button>
            ))
          : null}
      </div>
    </div>
  );
};

export const SandhiSplitBoard = ({
  fontsReady,
  interactionLocked,
  language,
  onFeedback,
  roundKey,
  rootWord,
  selectedRuleId,
  studyMode,
}: SandhiSplitBoardProps) => {
  const onFeedbackRef = useRef(onFeedback);
  const tokenSerialRef = useRef(0);
  const interactionSerialRef = useRef(0);
  const [visibleTokens, setVisibleTokens] = useState<ActiveToken[]>([]);

  useEffect(() => {
    onFeedbackRef.current = onFeedback;
  }, [onFeedback]);

  const createToken = (node: WordNode, depth: number): ActiveToken => ({
    instanceId: `${roundKey}:split-token:${++tokenSerialRef.current}`,
    node: cloneWordNode(node),
    depth,
  });

  useEffect(() => {
    if (!fontsReady) {
      return;
    }

    tokenSerialRef.current = 0;
    interactionSerialRef.current = 0;
    const initialTokens = [createToken(rootWord, 0)];
    setVisibleTokens(initialTokens);
    onFeedbackRef.current({
      outcome: "blocked",
      message: localizedMessage("slicePrompt"),
      revealLesson: getRevealLesson(initialTokens),
      availableRuleIds: collectAvailableRuleIds(initialTokens),
      activeTokens: initialTokens,
      roundCompleted: false,
    });
  }, [fontsReady, rootWord, roundKey]);

  const handleBoundaryClick = (
    tokenId: string,
    candidateBoundaryCharOffsets: number[],
  ) => {
    if (interactionLocked) {
      return;
    }

    const tokenIndex = visibleTokens.findIndex((token) => token.instanceId === tokenId);
    if (tokenIndex < 0) {
      return;
    }

    const token = visibleTokens[tokenIndex];
    const interactionId = `${roundKey}:split:${++interactionSerialRef.current}`;
    const feedbackBoundaryIndex = candidateBoundaryCharOffsets[0] ?? -1;

    if (!isFurtherSplittable(token.node)) {
      onFeedbackRef.current({
        outcome: "blocked",
        message: localizedMessage("feedbackFinal"),
        availableRuleIds: collectAvailableRuleIds(visibleTokens),
        activeTokens: visibleTokens,
        roundCompleted: false,
        boundaryIndex: feedbackBoundaryIndex,
        assessment: "final-word",
        interactionId,
      });
      return;
    }

    const exactBoundaryCuts = token.node.cuts.filter((cut) => {
      if (cut.reviewNeeded) {
        return false;
      }

      return getAcceptedCutBoundaryOffsets(token.node.devanagari, cut).some((boundaryOffset) =>
        candidateBoundaryCharOffsets.includes(boundaryOffset),
      );
    });

    if (exactBoundaryCuts.length === 0) {
      const assessment: SliceAssessment = hasSelectedRuleElsewhere(
        token.node,
        selectedRuleId,
      )
        ? "place-wrong-rule-correct"
        : "both-wrong";

      onFeedbackRef.current({
        outcome: "wrong",
        message: localizedMessage(
          assessment === "place-wrong-rule-correct"
            ? "feedbackWrongPlaceRightRule"
            : "feedbackWrongBoth",
        ),
        revealLesson: getRevealLesson(visibleTokens),
        availableRuleIds: collectAvailableRuleIds(visibleTokens),
        activeTokens: visibleTokens,
        roundCompleted: false,
        boundaryIndex: feedbackBoundaryIndex,
        assessment,
        interactionId,
      });
      return;
    }

    const matchingCuts = exactBoundaryCuts.filter((cut) =>
      cutMatchesRule(cut, selectedRuleId),
    );

    if (matchingCuts.length === 0) {
      onFeedbackRef.current({
        outcome: "wrong",
        message: localizedMessage("feedbackWrongRule"),
        revealLesson: getRevealLesson(visibleTokens),
        availableRuleIds: collectAvailableRuleIds(visibleTokens),
        activeTokens: visibleTokens,
        roundCompleted: false,
        boundaryIndex: feedbackBoundaryIndex,
        assessment: "place-correct-rule-wrong",
        interactionId,
      });
      return;
    }

    const selectedCut = matchingCuts[0];
    const nextTokens = [...visibleTokens];
    nextTokens.splice(
      tokenIndex,
      1,
      createToken(selectedCut.left, token.depth + 1),
      createToken(selectedCut.right, token.depth + 1),
    );

    const roundCompleted = nextTokens.every(
      (entry) => !isFurtherSplittable(entry.node),
    );

    setVisibleTokens(nextTokens);
    onFeedbackRef.current({
      outcome: "correct",
      message: localizedMessage("correctSplit"),
      lesson: buildLesson(token.node, selectedCut, matchingCuts.length),
      revealLesson: getRevealLesson(nextTokens),
      availableRuleIds: collectAvailableRuleIds(nextTokens),
      activeTokens: nextTokens,
      roundCompleted,
      boundaryIndex: feedbackBoundaryIndex,
      assessment: "both-correct",
      interactionId,
    });
  };

  if (!fontsReady) {
    return (
      <div className="game-stage game-stage--loading">
        <div className="game-stage__loading">{t("loadingArena", language)}</div>
      </div>
    );
  }

  return (
    <div className="split-stage">
      <div className="split-stage__rail">
        {visibleTokens.map((token) => {
          const splittable = isFurtherSplittable(token.node);

          return (
            <motion.article
              layout
              className={`split-token ${splittable ? "split-token--compound" : "split-token--final"}`}
              key={token.instanceId}
            >
              <SplitTokenWord
                interactionLocked={interactionLocked}
                language={language}
                onBoundaryClick={(boundaryIndexes) =>
                  handleBoundaryClick(token.instanceId, boundaryIndexes)
                }
                splittable={splittable}
                studyMode={studyMode}
                token={token}
              />

              <div className="split-token__meta">
                <span>{secondaryLabel(token.node, language)}</span>
                <div
                  className={`split-token__badge ${
                    splittable ? "split-token__badge--compound" : "split-token__badge--final"
                  }`}
                >
                  {splittable ? t("canSplitAgain", language) : t("finalWord", language)}
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
};

export default SandhiSplitBoard;
