import type { SandhiCut, SandhiRuleId, WordNode } from "../types/sandhi";
import { splitDevanagariAksharas } from "./sanskrit";

const DEVANAGARI_VIRAMA = "्";
const R_VOWEL_INITIAL_PATTERN = /^[ऋॠऌॡ]/;
const SVARA_RULE_IDS = new Set<SandhiRuleId>([
  "savarna-dirgha",
  "guna",
  "vrddhi",
  "yan",
  "ayavayava",
  "purvarupa",
  "pararupa",
]);

export type BoundaryMarker = {
  candidateBoundaryCharOffsets: number[];
  offset: number;
};

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

export const getVisibleAksharaBoundaryCharOffsets = (surface: string) => {
  if (!surface) {
    return [];
  }

  const aksharas = splitDevanagariAksharas(surface);
  if (aksharas.length < 2) {
    return [];
  }

  let consumedChars = 0;
  return aksharas.slice(0, -1).map((akshara) => {
    consumedChars += Array.from(akshara).length;
    return consumedChars;
  });
};

const getRawCutSurfaceBoundaryOffset = (surface: string, cut: SandhiCut) => {
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

export const getTeachingCutBoundaryOffsets = (surface: string, cut: SandhiCut) => {
  const rawBoundaryOffset = getRawCutSurfaceBoundaryOffset(surface, cut);
  if (rawBoundaryOffset < 0) {
    return [];
  }

  const visibleBoundaryOffsets = getVisibleAksharaBoundaryCharOffsets(surface);
  const targetChars = Array.from(surface);

  if (
    cut.ruleId === "guna" &&
    R_VOWEL_INITIAL_PATTERN.test(cut.right.devanagari) &&
    targetChars[rawBoundaryOffset] === DEVANAGARI_VIRAMA
  ) {
    const previousVisibleBoundary = [...visibleBoundaryOffsets]
      .reverse()
      .find((boundaryOffset) => boundaryOffset < rawBoundaryOffset);

    if (previousVisibleBoundary !== undefined) {
      return [previousVisibleBoundary];
    }
  }

  if (SVARA_RULE_IDS.has(cut.ruleId) && !visibleBoundaryOffsets.includes(rawBoundaryOffset)) {
    const nextVisibleBoundary = visibleBoundaryOffsets.find(
      (boundaryOffset) => boundaryOffset > rawBoundaryOffset,
    );

    if (nextVisibleBoundary !== undefined) {
      return [nextVisibleBoundary];
    }
  }

  return [rawBoundaryOffset];
};

export const getAcceptedCutBoundaryOffsets = (surface: string, cut: SandhiCut) => {
  const visibleBoundaryOffsets = getVisibleAksharaBoundaryCharOffsets(surface);
  const rawBoundaryOffset = getRawCutSurfaceBoundaryOffset(surface, cut);
  const teachingBoundaryOffsets = getTeachingCutBoundaryOffsets(surface, cut);

  if (rawBoundaryOffset < 0) {
    return teachingBoundaryOffsets;
  }

  const acceptableOffsets = new Set(teachingBoundaryOffsets);

  if (!visibleBoundaryOffsets.includes(rawBoundaryOffset)) {
    const previousVisibleBoundary = [...visibleBoundaryOffsets]
      .reverse()
      .find((boundaryOffset) => boundaryOffset < rawBoundaryOffset);
    const nextVisibleBoundary = visibleBoundaryOffsets.find(
      (boundaryOffset) => boundaryOffset > rawBoundaryOffset,
    );

    if (previousVisibleBoundary !== undefined) {
      acceptableOffsets.add(previousVisibleBoundary);
    }

    if (nextVisibleBoundary !== undefined) {
      acceptableOffsets.add(nextVisibleBoundary);
    }
  }

  return [...acceptableOffsets].sort((left, right) => left - right);
};

export const getDisplayBoundaryCharOffsets = (node: WordNode) => {
  const visibleBoundaryOffsets = getVisibleAksharaBoundaryCharOffsets(node.devanagari);
  const cutBoundaryOffsets = node.cuts
    .filter((cut) => !cut.reviewNeeded)
    .flatMap((cut) => getTeachingCutBoundaryOffsets(node.devanagari, cut))
    .filter((boundaryOffset) => boundaryOffset > 0);

  return [...new Set([...visibleBoundaryOffsets, ...cutBoundaryOffsets])].sort(
    (left, right) => left - right,
  );
};

export const mergeBoundaryMarkers = (
  boundaryCharOffsets: number[],
  getOffset: (charOffset: number) => number,
  tolerance = 1.5,
) => {
  const measuredMarkers = boundaryCharOffsets.map((charOffset) => ({
    candidateBoundaryCharOffsets: [charOffset],
    offset: getOffset(charOffset),
  }));

  measuredMarkers.sort((left, right) => left.offset - right.offset);

  return measuredMarkers.reduce<BoundaryMarker[]>((groups, marker) => {
    const previousGroup = groups[groups.length - 1];

    if (previousGroup && Math.abs(previousGroup.offset - marker.offset) <= tolerance) {
      previousGroup.candidateBoundaryCharOffsets = [
        ...new Set([
          ...previousGroup.candidateBoundaryCharOffsets,
          ...marker.candidateBoundaryCharOffsets,
        ]),
      ].sort((left, right) => left - right);
      previousGroup.offset = Math.max(previousGroup.offset, marker.offset);
      return groups;
    }

    groups.push({
      candidateBoundaryCharOffsets: [...marker.candidateBoundaryCharOffsets],
      offset: marker.offset,
    });
    return groups;
  }, []);
};
