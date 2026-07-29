import { isFurtherSplittable } from "../data/sandhiBank";
import type { SandhiCut, WordNode } from "../types/sandhi";

export type LessonSequenceBranch = "current" | "left" | "right";

export type LessonSequenceStep = {
  node: WordNode;
  cut: SandhiCut;
  branch: LessonSequenceBranch;
};

const getPreferredCut = (node: WordNode) =>
  node.cuts.find((candidate) => !candidate.reviewNeeded) ?? node.cuts[0] ?? null;

const appendFollowUpSteps = (
  node: WordNode,
  branch: Exclude<LessonSequenceBranch, "current">,
  steps: LessonSequenceStep[],
) => {
  if (!isFurtherSplittable(node)) {
    return;
  }

  const nextCut = getPreferredCut(node);
  if (!nextCut) {
    return;
  }

  steps.push({
    node,
    cut: nextCut,
    branch,
  });

  appendFollowUpSteps(nextCut.left, "left", steps);
  appendFollowUpSteps(nextCut.right, "right", steps);
};

export const buildLessonSequence = (
  node: WordNode,
  cut: SandhiCut,
): LessonSequenceStep[] => {
  const steps: LessonSequenceStep[] = [
    {
      node,
      cut,
      branch: "current",
    },
  ];

  appendFollowUpSteps(cut.left, "left", steps);
  appendFollowUpSteps(cut.right, "right", steps);

  return steps;
};
