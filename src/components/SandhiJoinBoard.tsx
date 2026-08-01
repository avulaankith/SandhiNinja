import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
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

type SandhiJoinBoardProps = {
  interactionLocked: boolean;
  language: Language;
  onFeedback: (feedback: SliceFeedback) => void;
  roundKey: string;
  resetNonce: number;
  rootWord: WordNode;
  selectedRuleId: SandhiRuleId;
  studyMode: StudyMode;
};

type JoinBranch = {
  key: string;
  node: WordNode;
  cut?: SandhiCut;
  validCuts: SandhiCut[];
  left?: JoinBranch;
  right?: JoinBranch;
  parent?: JoinBranch;
  depth: number;
};

const cutMatchesRule = (cut: SandhiCut, ruleId: SandhiRuleId) =>
  cut.ruleId === ruleId || cut.ruleChain?.includes(ruleId) === true;

const collectAvailableRuleIds = (branches: JoinBranch[]) => {
  const ids = new Set<SandhiRuleId>();

  branches.forEach((branch, index) => {
    if (index >= branches.length - 1) {
      return;
    }

    const opportunity = getJoinOpportunity(branch, branches[index + 1]);
    opportunity?.cuts.forEach((cut) => {
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

const sameNodeSurface = (left: WordNode, right: WordNode) =>
  left.devanagari === right.devanagari &&
  left.iast === right.iast &&
  (left.telugu ?? "") === (right.telugu ?? "");

const getEligibleCuts = (node: WordNode) => {
  const nonReviewCuts = node.cuts.filter((entry) => !entry.reviewNeeded);
  return nonReviewCuts.length > 0 ? nonReviewCuts : node.cuts;
};

const getCompanionCuts = (node: WordNode, referenceCut: SandhiCut) =>
  getEligibleCuts(node).filter(
    (entry) =>
      sameNodeSurface(entry.left, referenceCut.left) &&
      sameNodeSurface(entry.right, referenceCut.right),
  );

const createBranch = (
  node: WordNode,
  path: string,
  depth: number,
  parent?: JoinBranch,
): JoinBranch => {
  const eligibleCuts = getEligibleCuts(node);
  const canonicalCut =
    eligibleCuts.length > 0
      ? eligibleCuts[Math.floor(Math.random() * eligibleCuts.length)]
      : undefined;
  const branch: JoinBranch = {
    key: `${path}-${node.id}`,
    node,
    cut: canonicalCut,
    validCuts: canonicalCut ? getCompanionCuts(node, canonicalCut) : [],
    parent,
    depth,
  };

  if (canonicalCut) {
    branch.left = createBranch(canonicalCut.left, `${path}-L`, depth + 1, branch);
    branch.right = createBranch(canonicalCut.right, `${path}-R`, depth + 1, branch);
  }

  return branch;
};

const collectLeaves = (branch: JoinBranch, leaves: JoinBranch[] = []): JoinBranch[] => {
  if (!branch.left || !branch.right || !branch.cut) {
    leaves.push(branch);
    return leaves;
  }

  collectLeaves(branch.left, leaves);
  collectLeaves(branch.right, leaves);
  return leaves;
};

const getJoinOpportunity = (left: JoinBranch, right: JoinBranch) => {
  if (
    !left.parent ||
    left.parent !== right.parent ||
    !left.parent.cut ||
    left.parent.validCuts.length === 0
  ) {
    return null;
  }

  if (left.parent.left !== left || left.parent.right !== right) {
    return null;
  }

  return {
    parent: left.parent,
    cut: left.parent.cut,
    cuts: left.parent.validCuts,
  };
};

const toActiveTokens = (branches: JoinBranch[]): ActiveToken[] =>
  branches.map((branch, index) => ({
    instanceId: `${branch.key}-${index}`,
    node: branch.node,
    depth: branch.depth,
  }));

const getRevealLesson = (branches: JoinBranch[]) => {
  for (let index = 0; index < branches.length - 1; index += 1) {
    const opportunity = getJoinOpportunity(branches[index], branches[index + 1]);
    if (opportunity) {
      return buildLesson(
        opportunity.parent.node,
        opportunity.cut,
        opportunity.cuts.length,
      );
    }
  }

  return undefined;
};

const hasRuleAtVisibleBoundary = (branches: JoinBranch[], ruleId: SandhiRuleId) =>
  branches.some((branch, index) => {
    if (index >= branches.length - 1) {
      return false;
    }

    return (
      getJoinOpportunity(branch, branches[index + 1])?.cuts.some((cut) =>
        cutMatchesRule(cut, ruleId),
      ) ?? false
    );
  });

const secondaryLabel = (node: WordNode, language: Language) =>
  language === "te" && node.telugu ? node.telugu : node.iast;

const localizedMessage = (key: keyof typeof UI_TEXT): SliceFeedback["message"] => ({
  en: t(key, "en"),
  sa: t(key, "sa"),
  te: t(key, "te"),
});

export const SandhiJoinBoard = ({
  interactionLocked,
  language,
  onFeedback,
  roundKey,
  resetNonce,
  rootWord,
  selectedRuleId,
  studyMode,
}: SandhiJoinBoardProps) => {
  const tree = useMemo(
    () => createBranch(rootWord, rootWord.id, 0),
    [rootWord, roundKey],
  );
  const onFeedbackRef = useRef(onFeedback);
  const interactionCounterRef = useRef(0);
  const [visibleBranches, setVisibleBranches] = useState<JoinBranch[]>(() =>
    collectLeaves(tree),
  );

  useEffect(() => {
    onFeedbackRef.current = onFeedback;
  }, [onFeedback]);

  useEffect(() => {
    const initialBranches = collectLeaves(tree);
    interactionCounterRef.current = 0;
    setVisibleBranches(initialBranches);
    onFeedbackRef.current({
      outcome: "blocked",
      message: localizedMessage("joinPrompt"),
      revealLesson: getRevealLesson(initialBranches),
      availableRuleIds: collectAvailableRuleIds(initialBranches),
      activeTokens: toActiveTokens(initialBranches),
      roundCompleted: initialBranches.length === 1,
    });
  }, [resetNonce, tree]);

  const handleBoundaryClick = (boundaryIndex: number) => {
    if (interactionLocked) {
      return;
    }

    const interactionId = `${roundKey}:join:${++interactionCounterRef.current}`;
    const left = visibleBranches[boundaryIndex];
    const right = visibleBranches[boundaryIndex + 1];

    if (!left || !right) {
      return;
    }

    const opportunity = getJoinOpportunity(left, right);
    const matchingCuts = opportunity
      ? opportunity.cuts.filter((cut) => cutMatchesRule(cut, selectedRuleId))
      : [];
    const assessment: SliceAssessment = opportunity
      ? matchingCuts.length > 0
        ? "both-correct"
        : "place-correct-rule-wrong"
      : hasRuleAtVisibleBoundary(visibleBranches, selectedRuleId)
        ? "place-wrong-rule-correct"
        : "both-wrong";

    if (opportunity && matchingCuts.length > 0) {
      const nextBranches = [
        ...visibleBranches.slice(0, boundaryIndex),
        opportunity.parent,
        ...visibleBranches.slice(boundaryIndex + 2),
      ];
      const roundCompleted = nextBranches.length === 1;
      const selectedCut =
        matchingCuts[Math.floor(Math.random() * matchingCuts.length)];

      setVisibleBranches(nextBranches);
      onFeedback({
        outcome: "correct",
        message: localizedMessage(roundCompleted ? "joinComplete" : "correctJoin"),
        lesson: buildLesson(
          opportunity.parent.node,
          selectedCut,
          matchingCuts.length,
        ),
        revealLesson: getRevealLesson(nextBranches),
        availableRuleIds: collectAvailableRuleIds(nextBranches),
        activeTokens: toActiveTokens(nextBranches),
        roundCompleted,
        boundaryIndex,
        assessment,
        interactionId,
      });
      return;
    }

    const wrongKey = opportunity
      ? "feedbackWrongJoinRule"
      : assessment === "place-wrong-rule-correct"
        ? "feedbackWrongJoinBoundaryRightRule"
        : assessment === "both-wrong"
          ? "feedbackWrongJoinBoth"
          : "feedbackWrongJoinBoundary";

    onFeedback({
      outcome: "wrong",
      message: localizedMessage(wrongKey),
      revealLesson: getRevealLesson(visibleBranches),
      availableRuleIds: collectAvailableRuleIds(visibleBranches),
      activeTokens: toActiveTokens(visibleBranches),
      roundCompleted: false,
      boundaryIndex,
      assessment,
      interactionId,
    });
  };

  return (
    <div className="join-stage">
      <div className="join-stage__intro">
        <div className="join-stage__target">
          <strong>{rootWord.devanagari}</strong>
        </div>
        <p className="join-stage__copy">{t("joinPrompt", language)}</p>
      </div>

      <div className="join-stage__rail">
        {visibleBranches.map((branch, index) => (
          <div className="join-stage__segment" key={`${branch.key}-${index}`}>
            <motion.article
              layout
              className={`join-token ${branch.cut ? "join-token--compound" : "join-token--final"}`}
            >
              <strong>{branch.node.devanagari}</strong>
              <div className="join-token__meta">
                <span className="join-token__secondary">
                  {secondaryLabel(branch.node, language)}
                </span>
                <div
                  className={`join-token__badge ${
                    branch.cut ? "join-token__badge--compound" : "join-token__badge--final"
                  }`}
                >
                  {branch.cut ? t("joinCanJoin", language) : t("joinBuilt", language)}
                </div>
              </div>
            </motion.article>

            {index < visibleBranches.length - 1 ? (
              <motion.button
                layout
                className="join-boundary"
                disabled={interactionLocked}
                onClick={() => handleBoundaryClick(index)}
                type="button"
                whileTap={{ scale: 0.97 }}
              >
                <span className="join-boundary__plus">+</span>
                <span className="join-boundary__label">{t("joinTap", language)}</span>
              </motion.button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SandhiJoinBoard;
