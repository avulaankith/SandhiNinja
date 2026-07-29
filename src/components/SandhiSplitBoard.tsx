import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cloneWordNode, isFurtherSplittable } from "../data/sandhiBank";
import { UI_TEXT, t } from "../data/uiText";
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

  const targetBoundaryOffset = getCutSurfaceBoundaryOffset(stuck.node.devanagari, cut);
  const variantCount = stuck.node.cuts.filter(
    (entry) =>
      !entry.reviewNeeded &&
      getCutSurfaceBoundaryOffset(stuck.node.devanagari, entry) === targetBoundaryOffset,
  ).length;

  return buildLesson(stuck.node, cut, variantCount || 1);
};

const hasSelectedRuleElsewhere = (node: WordNode, ruleId: SandhiRuleId) =>
  node.cuts.some((cut) => !cut.reviewNeeded && cutMatchesRule(cut, ruleId));

const secondaryLabel = (node: WordNode, language: Language) =>
  language === "te" && node.telugu ? node.telugu : node.iast;

const buildPrefixAlignmentMap = (sourceChars: string[], targetChars: string[]) => {
  const rowCount = sourceChars.length + 1;
  const columnCount = targetChars.length + 1;
  const scores = Array.from({ length: rowCount }, () => Array<number>(columnCount).fill(0));
  const moves = Array.from({ length: rowCount }, () =>
    Array<"diag" | "up" | "left" | null>(columnCount).fill(null),
  );

  for (let row = 1; row < rowCount; row += 1) {
    scores[row][0] = row;
    moves[row][0] = "up";
  }

  for (let column = 1; column < columnCount; column += 1) {
    scores[0][column] = column;
    moves[0][column] = "left";
  }

  for (let row = 1; row < rowCount; row += 1) {
    for (let column = 1; column < columnCount; column += 1) {
      const diagonalScore =
        scores[row - 1][column - 1] +
        (sourceChars[row - 1] === targetChars[column - 1] ? 0 : 1);
      const upScore = scores[row - 1][column] + 1;
      const leftScore = scores[row][column - 1] + 1;

      let bestScore = diagonalScore;
      let bestMove: "diag" | "up" | "left" = "diag";

      if (upScore < bestScore) {
        bestScore = upScore;
        bestMove = "up";
      }

      if (leftScore < bestScore) {
        bestScore = leftScore;
        bestMove = "left";
      }

      scores[row][column] = bestScore;
      moves[row][column] = bestMove;
    }
  }

  const prefixMap = Array<number>(sourceChars.length + 1).fill(0);
  let row = sourceChars.length;
  let column = targetChars.length;
  prefixMap[row] = column;

  while (row > 0 || column > 0) {
    const move = moves[row][column];

    if (move === "diag") {
      row -= 1;
      column -= 1;
      prefixMap[row] = column;
      continue;
    }

    if (move === "up") {
      row -= 1;
      prefixMap[row] = column;
      continue;
    }

    column -= 1;
  }

  prefixMap[0] = 0;
  return prefixMap;
};

const getSurfaceBoundaryCharOffsets = (aksharas: string[], surface: string) => {
  if (aksharas.length < 2 || !surface) {
    return [];
  }

  const sourceChars = Array.from(aksharas.join(""));
  const targetChars = Array.from(surface);

  if (sourceChars.length === 0 || targetChars.length === 0) {
    return [];
  }

  const prefixMap = buildPrefixAlignmentMap(sourceChars, targetChars);
  let consumedSourceChars = 0;

  const offsets = aksharas.slice(0, -1).map((akshara) => {
    consumedSourceChars += Array.from(akshara).length;

    const mappedCount = prefixMap[consumedSourceChars] ?? targetChars.length;
    const clampedCount = Math.min(
      Math.max(mappedCount, 1),
      Math.max(targetChars.length - 1, 1),
    );

    return targetChars.slice(0, clampedCount).join("").length;
  });

  return [...new Set(offsets)].sort((left, right) => left - right);
};

const getCutSurfaceBoundaryOffset = (surface: string, cut: SandhiCut) => {
  if (!surface) {
    return -1;
  }

  const sourceChars = Array.from(`${cut.left.devanagari}${cut.right.devanagari}`);
  const targetChars = Array.from(surface);

  if (sourceChars.length === 0 || targetChars.length === 0) {
    return -1;
  }

  const prefixMap = buildPrefixAlignmentMap(sourceChars, targetChars);
  const leftCharCount = Array.from(cut.left.devanagari).length;
  const mappedCount = prefixMap[leftCharCount] ?? targetChars.length;
  const clampedCount = Math.min(
    Math.max(mappedCount, 1),
    Math.max(targetChars.length - 1, 1),
  );

  return targetChars.slice(0, clampedCount).join("").length;
};

type SplitTokenWordProps = {
  interactionLocked: boolean;
  language: Language;
  onBoundaryClick: (boundaryCharOffset: number) => void;
  splittable: boolean;
  studyMode: StudyMode;
  token: ActiveToken;
};

const SplitTokenWord = ({
  interactionLocked,
  language,
  onBoundaryClick,
  splittable,
  studyMode,
  token,
}: SplitTokenWordProps) => {
  const wordRef = useRef<HTMLSpanElement | null>(null);
  const [markerOffsets, setMarkerOffsets] = useState<number[]>([]);
  const boundaryCharOffsets = getSurfaceBoundaryCharOffsets(
    token.node.aksharas,
    token.node.devanagari,
  );
  const measurementKey = boundaryCharOffsets.join("\u0001");

  useLayoutEffect(() => {
    const word = wordRef.current;
    const textNode = word?.firstChild;

    if (!word || textNode?.nodeType !== Node.TEXT_NODE) {
      setMarkerOffsets([]);
      return;
    }

    const measureMarkers = () => {
      const wordRect = word.getBoundingClientRect();
      const wordStart = word.offsetLeft;
      const textLength = textNode.textContent?.length ?? 0;

      if (word.offsetWidth <= 0 || textLength <= 0) {
        setMarkerOffsets([]);
        return;
      }

      const getMarkerOffset = (charOffset: number) => {
        const range = document.createRange();
        const clampedOffset = Math.max(0, Math.min(charOffset, textLength));

        range.setStart(textNode, clampedOffset);
        range.setEnd(textNode, clampedOffset);
        const caretRects = range.getClientRects();

        if (caretRects.length > 0) {
          return wordStart + caretRects[0].left - wordRect.left;
        }

        if (clampedOffset < textLength) {
          range.setEnd(textNode, clampedOffset + 1);
          const nextRect = range.getBoundingClientRect();
          if (nextRect.width > 0 || nextRect.height > 0) {
            return wordStart + nextRect.left - wordRect.left;
          }
        }

        if (clampedOffset > 0) {
          range.setStart(textNode, clampedOffset - 1);
          range.setEnd(textNode, clampedOffset);
          const previousRect = range.getBoundingClientRect();
          if (previousRect.width > 0 || previousRect.height > 0) {
            return wordStart + previousRect.right - wordRect.left;
          }
        }

        return wordStart;
      };

      const offsets = boundaryCharOffsets.map((charOffset) => {
        const markerOffset = getMarkerOffset(charOffset);
        return Number.isFinite(markerOffset) ? markerOffset : wordStart;
      });

      setMarkerOffsets(offsets);
    };

    measureMarkers();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(measureMarkers) : null;
    resizeObserver?.observe(word);
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
      <span
        aria-label={token.node.devanagari}
        className="split-token__word"
        ref={wordRef}
        role="presentation"
      >
        {token.node.devanagari}
      </span>

      {splittable
        ? markerOffsets.map((offset, index) => (
            <button
              className={`split-marker split-marker--overlay ${
                studyMode === "guided" ? "split-marker--guided" : ""
              }`}
              disabled={interactionLocked}
                key={`${token.instanceId}-marker-${boundaryCharOffsets[index]}`}
                onClick={() => onBoundaryClick(boundaryCharOffsets[index])}
                style={{ left: `${offset}px` }}
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

  const handleBoundaryClick = (tokenId: string, boundaryCharOffset: number) => {
    if (interactionLocked) {
      return;
    }

    const tokenIndex = visibleTokens.findIndex((token) => token.instanceId === tokenId);
    if (tokenIndex < 0) {
      return;
    }

    const token = visibleTokens[tokenIndex];
    const interactionId = `${roundKey}:split:${++interactionSerialRef.current}`;

    if (!isFurtherSplittable(token.node)) {
      onFeedbackRef.current({
        outcome: "blocked",
        message: localizedMessage("feedbackFinal"),
        availableRuleIds: collectAvailableRuleIds(visibleTokens),
        activeTokens: visibleTokens,
        roundCompleted: false,
        boundaryIndex: boundaryCharOffset,
        assessment: "final-word",
        interactionId,
      });
      return;
    }

    const exactBoundaryCuts = token.node.cuts.filter((cut) => {
      if (cut.reviewNeeded) {
        return false;
      }

      return (
        getCutSurfaceBoundaryOffset(token.node.devanagari, cut) === boundaryCharOffset
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
        boundaryIndex: boundaryCharOffset,
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
        boundaryIndex: boundaryCharOffset,
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
      boundaryIndex: boundaryCharOffset,
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
                onBoundaryClick={(boundaryIndex) =>
                  handleBoundaryClick(token.instanceId, boundaryIndex)
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
