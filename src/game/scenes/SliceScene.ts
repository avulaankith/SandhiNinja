import Phaser from "phaser";
import { t } from "../../data/uiText";
import { cloneWordNode, isFurtherSplittable, SANDHI_RULES } from "../../data/sandhiBank";
import {
  getAcceptedCutBoundaryOffsets,
  getDisplayBoundaryCharOffsets,
  mergeBoundaryMarkers,
  type BoundaryMarker,
} from "../../utils/splitGuides";
import type {
  ActiveToken,
  GameMode,
  Language,
  SandhiCut,
  SandhiRuleId,
  SliceAssessment,
  SliceFeedback,
  StudyMode,
  WordNode,
} from "../../types/sandhi";

type RuntimeMode = Exclude<GameMode, "devStudio" | "join">;

export type SliceSceneBridgeState = {
  mode: RuntimeMode;
  language: Language;
  selectedRuleId: SandhiRuleId;
  rootWord: WordNode;
  clockEnabled: boolean;
  interactionLocked: boolean;
  roundKey: string;
  studyMode: StudyMode;
};

type SliceSceneCallbacks = {
  onFeedback: (feedback: SliceFeedback) => void;
};

type TokenView = {
  token: ActiveToken;
  container: Phaser.GameObjects.Container;
  orb: Phaser.GameObjects.Ellipse;
  outerGlow: Phaser.GameObjects.Ellipse;
  sliceGuides: Phaser.GameObjects.Container | null;
  sliceMarkers: SceneSliceMarker[];
  label: Phaser.GameObjects.Text;
  sublabel: Phaser.GameObjects.Text;
  badge: Phaser.GameObjects.Text;
};

type SceneSliceMarker = BoundaryMarker & {
  localOffset: number;
  ratio: number;
};

type SliceZone = {
  candidateBoundaryCharOffsets: number[];
  rect: Phaser.Geom.Rectangle;
};

type LayoutPosition = {
  x: number;
  y: number;
};

const createInstanceId = () =>
  `token-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;

const lineIntersectsRectangle = (
  line: Phaser.Geom.Line,
  rect: Phaser.Geom.Rectangle,
) => Phaser.Geom.Intersects.LineToRectangle(line, rect);

const pointInsideRectangle = (
  point: Phaser.Math.Vector2,
  rect: Phaser.Geom.Rectangle,
) => Phaser.Geom.Rectangle.Contains(rect, point.x, point.y);

const TEXT_RESOLUTION =
  typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 2;
const DEVANAGARI_FONT_FAMILY = '"Noto Serif Devanagari", "Palatino Linotype", serif';
const NINJA_RESIZE_WIDTH_TOLERANCE_PX = 96;
const NINJA_RESIZE_HEIGHT_TOLERANCE_PX = 180;

const cutMatchesRule = (cut: SandhiCut, ruleId: SandhiRuleId) =>
  cut.ruleId === ruleId || cut.ruleChain?.includes(ruleId) === true;

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

const RULE_LOOKUP = new Map(SANDHI_RULES.map((rule) => [rule.id, rule]));

const findFirstSplittableToken = (tokens: ActiveToken[]) =>
  tokens.find((token) => isFurtherSplittable(token.node)) ?? null;

let textMeasureContext: CanvasRenderingContext2D | null = null;

const getTextMeasureContext = () => {
  if (typeof document === "undefined") {
    return null;
  }

  if (!textMeasureContext) {
    textMeasureContext = document.createElement("canvas").getContext("2d");
  }

  return textMeasureContext;
};

export class SliceScene extends Phaser.Scene {
  private bridgeState!: SliceSceneBridgeState;

  private callbacks: SliceSceneCallbacks;

  private activeTokens: ActiveToken[] = [];

  private tokenViews = new Map<string, TokenView>();

  private trail!: Phaser.GameObjects.Graphics;

  private trailGlow!: Phaser.GameObjects.Graphics;

  private pointerDown = false;

  private swipeStart: Phaser.Math.Vector2 | null = null;

  private swipeEnd: Phaser.Math.Vector2 | null = null;

  private initialState: SliceSceneBridgeState | null = null;

  private gestureSerial = 0;

  private trailClearEvent: Phaser.Time.TimerEvent | null = null;

  private arenaRecoveryEvent: Phaser.Time.TimerEvent | null = null;

  private ninjaFallTween: Phaser.Tweens.Tween | null = null;

  private ninjaHoverTween: Phaser.Tweens.Tween | null = null;

  private lastScaleWidth = 0;

  private lastScaleHeight = 0;

  constructor(callbacks: SliceSceneCallbacks) {
    super("slice-scene");
    this.callbacks = callbacks;
  }

  setInitialState(state: SliceSceneBridgeState) {
    this.initialState = state;
  }

  applyBridgeState(state: Partial<SliceSceneBridgeState>) {
    if (!this.sys.isActive()) {
      this.initialState = {
        ...(this.initialState ?? state),
        ...state,
      } as SliceSceneBridgeState;
      return;
    }

    const previousWordId = this.bridgeState.rootWord.id;
    const previousMode = this.bridgeState.mode;
    const previousRoundKey = this.bridgeState.roundKey;
    const previousStudyMode = this.bridgeState.studyMode;
    const previousClockEnabled = this.bridgeState.clockEnabled;
    this.bridgeState = {
      ...this.bridgeState,
      ...state,
    };

    const nextWordId = this.bridgeState.rootWord.id;
    const nextMode = this.bridgeState.mode;
    const nextRoundKey = this.bridgeState.roundKey;
    const nextStudyMode = this.bridgeState.studyMode;
    const nextClockEnabled = this.bridgeState.clockEnabled;

    if (
      previousWordId !== nextWordId ||
      previousMode !== nextMode ||
      previousRoundKey !== nextRoundKey
    ) {
      this.resetRound();
      return;
    }

    if (previousStudyMode !== nextStudyMode) {
      this.rebuildTokenViews();
      return;
    }

    this.refreshTokenDecorations();

    if (
      nextMode === "ninja" &&
      (previousClockEnabled !== nextClockEnabled || previousMode !== nextMode)
    ) {
      this.startNinjaFall();
    }
  }

  create() {
    this.cameras.main.roundPixels = true;
    this.trailGlow = this.add.graphics();
    this.trail = this.add.graphics();
    this.add.existing(this.trailGlow);
    this.add.existing(this.trail);
    this.bridgeState = this.initialState!;
    this.lastScaleWidth = this.scale.width;
    this.lastScaleHeight = this.scale.height;

    this.input.on("pointerdown", this.handlePointerDown, this);
    this.input.on("pointermove", this.handlePointerMove, this);
    this.input.on("pointerup", this.handlePointerUp, this);
    this.scale.on("resize", this.handleResize, this);

    this.resetRound();
  }

  resetRound() {
    this.cancelPendingSceneEvents();
    this.clearTrail();
    this.gestureSerial = 0;
    this.activeTokens = [
      {
        instanceId: createInstanceId(),
        node: cloneWordNode(this.bridgeState.rootWord),
        depth: 0,
      },
    ];

    this.syncTokenViews();
    if (this.bridgeState.mode === "ninja") {
      this.startNinjaFall();
    }
    this.emitFeedback({
      outcome: "blocked",
      message: {
        en: t("slicePrompt", "en"),
        sa: t("slicePrompt", "sa"),
        te: t("slicePrompt", "te"),
      },
      revealLesson: this.buildRevealLesson(this.activeTokens),
      availableRuleIds: collectAvailableRuleIds(this.activeTokens),
      activeTokens: [...this.activeTokens],
      roundCompleted: false,
    });
  }

  private handleResize() {
    const nextWidth = this.scale.width;
    const nextHeight = this.scale.height;
    const widthDelta = Math.abs(nextWidth - this.lastScaleWidth);
    const heightDelta = Math.abs(nextHeight - this.lastScaleHeight);
    const ignoreTransientNinjaResize =
      this.bridgeState.mode === "ninja" &&
      (widthDelta > 0 || heightDelta > 0) &&
      widthDelta <= NINJA_RESIZE_WIDTH_TOLERANCE_PX &&
      heightDelta <= NINJA_RESIZE_HEIGHT_TOLERANCE_PX;

    this.lastScaleWidth = nextWidth;
    this.lastScaleHeight = nextHeight;

    if (ignoreTransientNinjaResize) {
      this.clearTrail();
      return;
    }

    this.cancelPendingSceneEvents();
    this.clearTrail();
    this.rebuildTokenViews();
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (this.bridgeState.interactionLocked) {
      return;
    }

    this.trailClearEvent?.remove(false);
    this.trailClearEvent = null;
    this.arenaRecoveryEvent?.remove(false);
    this.arenaRecoveryEvent = null;
    this.clearTrail();
    this.pointerDown = true;
    this.swipeStart = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
    this.swipeEnd = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
    this.renderTrail();
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    if (!this.pointerDown || !this.swipeStart) {
      return;
    }

    this.swipeEnd = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
    this.renderTrail();
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer) {
    if (!this.pointerDown || !this.swipeStart) {
      return;
    }

    this.pointerDown = false;
    this.swipeEnd = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
    this.renderTrail();
    this.resolveSwipe();

    this.trailClearEvent?.remove(false);
    this.trailClearEvent = this.time.delayedCall(120, () => {
      this.trailClearEvent = null;
      this.clearTrail();
    });
  }

  private renderTrail() {
    this.trailGlow.clear();
    this.trail.clear();

    if (!this.swipeStart || !this.swipeEnd) {
      return;
    }

    this.trailGlow.lineStyle(22, 0x8cf7ff, 0.16);
    this.trailGlow.beginPath();
    this.trailGlow.moveTo(this.swipeStart.x, this.swipeStart.y);
    this.trailGlow.lineTo(this.swipeEnd.x, this.swipeEnd.y);
    this.trailGlow.strokePath();

    this.trail.lineStyle(6, 0xdffcff, 0.92);
    this.trail.beginPath();
    this.trail.moveTo(this.swipeStart.x, this.swipeStart.y);
    this.trail.lineTo(this.swipeEnd.x, this.swipeEnd.y);
    this.trail.strokePath();
  }

  private clearTrail() {
    this.pointerDown = false;
    this.swipeStart = null;
    this.swipeEnd = null;
    this.trail.clear();
    this.trailGlow.clear();
  }

  private cancelPendingSceneEvents() {
    this.trailClearEvent?.remove(false);
    this.trailClearEvent = null;
    this.arenaRecoveryEvent?.remove(false);
    this.arenaRecoveryEvent = null;
    this.ninjaFallTween?.stop();
    this.ninjaFallTween = null;
    this.ninjaHoverTween?.stop();
    this.ninjaHoverTween = null;
  }

  private scheduleArenaRecovery(delay = 220) {
    this.arenaRecoveryEvent?.remove(false);
    this.arenaRecoveryEvent = this.time.delayedCall(delay, () => {
      this.arenaRecoveryEvent = null;
      if (!this.sys.isActive()) {
        return;
      }

      this.clearTrail();
      this.refreshTokenDecorations();
    });
  }

  private getCurrentNinjaFocusToken() {
    return findFirstSplittableToken(this.activeTokens) ?? this.activeTokens[0] ?? null;
  }

  private getVisibleSceneTokens() {
    return this.activeTokens;
  }

  private isTapGesture() {
    if (!this.swipeStart || !this.swipeEnd) {
      return false;
    }

    return Phaser.Math.Distance.BetweenPoints(this.swipeStart, this.swipeEnd) <= 18;
  }

  private findHitZone(zones: SliceZone[], swipeLine: Phaser.Geom.Line) {
    const tapPoint = this.isTapGesture() ? this.swipeEnd : null;

    return zones.find((zone) => {
      if (lineIntersectsRectangle(swipeLine, zone.rect)) {
        return true;
      }

      return tapPoint ? pointInsideRectangle(tapPoint, zone.rect) : false;
    });
  }

  private resolveSwipe() {
    if (!this.swipeStart || !this.swipeEnd) {
      return;
    }

    if (this.bridgeState.mode === "ninja") {
      this.resolveNinjaSwipe();
      return;
    }

    const interactionId = `${this.bridgeState.roundKey}:swipe:${++this.gestureSerial}`;
    const swipeLine = new Phaser.Geom.Line(
      this.swipeStart.x,
      this.swipeStart.y,
      this.swipeEnd.x,
      this.swipeEnd.y,
    );

    for (const token of [...this.activeTokens].reverse()) {
      const view = this.tokenViews.get(token.instanceId);

      if (!view) {
        continue;
      }

      const bounds = view.container.getBounds();
      const expandedBounds = new Phaser.Geom.Rectangle(
        bounds.x - 20,
        bounds.y - 20,
        bounds.width + 40,
        bounds.height + 40,
      );

      if (!lineIntersectsRectangle(swipeLine, expandedBounds)) {
        continue;
      }

      if (!isFurtherSplittable(token.node)) {
        this.shakeToken(view, 0xff6673);
        this.emitFeedback({
          outcome: "blocked",
          message: this.localized(
            t("feedbackFinal", "en"),
            t("feedbackFinal", "sa"),
            t("feedbackFinal", "te"),
          ),
          availableRuleIds: collectAvailableRuleIds(this.activeTokens),
          activeTokens: [...this.activeTokens],
          roundCompleted: false,
          assessment: "final-word",
          interactionId,
        });
        this.scheduleArenaRecovery();
        return;
      }

      const zones = this.getSliceZones(view);
      const hitZone = this.findHitZone(zones, swipeLine);

      if (!hitZone) {
        this.handleWrongSlice(
          token,
          this.hasSelectedRuleElsewhere(token)
            ? "place-wrong-rule-correct"
            : "both-wrong",
          undefined,
          interactionId,
        );
        return;
      }

      this.handleSliceAtBoundary(
        token,
        hitZone.candidateBoundaryCharOffsets,
        view,
        interactionId,
      );
      return;
    }
  }

  private resolveNinjaSwipe() {
    if (!this.swipeStart || !this.swipeEnd) {
      return;
    }

    const interactionId = `${this.bridgeState.roundKey}:ninja:${++this.gestureSerial}`;
    const swipeLine = new Phaser.Geom.Line(
      this.swipeStart.x,
      this.swipeStart.y,
      this.swipeEnd.x,
      this.swipeEnd.y,
    );
    const token = this.getCurrentNinjaFocusToken();
    const view = token ? this.tokenViews.get(token.instanceId) : null;

    if (!token || !view) {
      return;
    }

    const bounds = view.container.getBounds();
    const expandedBounds = new Phaser.Geom.Rectangle(
      bounds.x - 20,
      bounds.y - 20,
      bounds.width + 40,
      bounds.height + 40,
    );

    if (!lineIntersectsRectangle(swipeLine, expandedBounds)) {
      return;
    }

    if (!isFurtherSplittable(token.node)) {
      return;
    }

    const zones = this.getSliceZones(view);
    const hitZone = this.findHitZone(zones, swipeLine);

    const matchingCuts = token.node.cuts.filter(
      (cut) =>
        !cut.reviewNeeded &&
        getAcceptedCutBoundaryOffsets(token.node.devanagari, cut).some((boundaryOffset) =>
          hitZone?.candidateBoundaryCharOffsets.includes(boundaryOffset),
        ) &&
        cutMatchesRule(cut, this.bridgeState.selectedRuleId),
    );

    if (!hitZone || matchingCuts.length === 0) {
      this.shakeToken(view, 0xff6673);
      this.spawnSparks(view.container.x, view.container.y, 0xff6673);
      this.emitFeedback({
        outcome: "wrong",
        message: this.localized(
          t("feedbackWrongPlaceRightRule", "en"),
          t("feedbackWrongPlaceRightRule", "sa"),
          t("feedbackWrongPlaceRightRule", "te"),
        ),
        revealLesson: this.buildRevealLesson(this.activeTokens),
        availableRuleIds: [this.bridgeState.selectedRuleId],
        activeTokens: [...this.activeTokens],
        roundCompleted: false,
        boundaryIndex: hitZone?.candidateBoundaryCharOffsets[0],
        assessment: "place-wrong-rule-correct",
        interactionId,
      });
      return;
    }

    const selectedCut = matchingCuts[0];
    const tokenIndex = this.activeTokens.findIndex(
      (entry) => entry.instanceId === token.instanceId,
    );
    const children: ActiveToken[] = [
      {
        instanceId: createInstanceId(),
        node: cloneWordNode(selectedCut.left),
        depth: token.depth + 1,
      },
      {
        instanceId: createInstanceId(),
        node: cloneWordNode(selectedCut.right),
        depth: token.depth + 1,
      },
    ];

    if (tokenIndex >= 0) {
      this.activeTokens.splice(tokenIndex, 1, ...children);
    }

    const roundCompleted = this.activeTokens.every(
      (entry) => !isFurtherSplittable(entry.node),
    );
    const nextRevealLesson = this.buildRevealLesson(this.activeTokens);

    this.ninjaFallTween?.stop();
    this.ninjaFallTween = null;
    this.spawnSlashBurst(swipeLine, 0x7df5c7, 0.96);
    this.spawnSparks(view.container.x, view.container.y, 0x7df5c7);
    this.cameras.main.shake(90, 0.003);
    this.tweens.add({
      targets: view.container,
      alpha: 0,
      scaleX: 1.18,
      scaleY: 0.74,
      angle: Phaser.Math.Between(-10, 10),
      y: view.container.y - 28,
      duration: 210,
      ease: "Quad.easeOut",
    });
    this.syncTokenViews({
      removedId: token.instanceId,
      spawnOrigin: { x: view.container.x, y: view.container.y },
      newIds: children.map((child) => child.instanceId),
    });

    if (!roundCompleted) {
      this.arenaRecoveryEvent?.remove(false);
      this.arenaRecoveryEvent = this.time.delayedCall(190, () => {
        this.arenaRecoveryEvent = null;
        if (!this.sys.isActive()) {
          return;
        }

        this.startNinjaFall();
      });
    }

    this.emitFeedback({
      outcome: "correct",
      message: this.localized(
        t("correctSplit", "en"),
        t("correctSplit", "sa"),
        t("correctSplit", "te"),
      ),
      lesson: {
        node: token.node,
        cut: selectedCut,
        variantCount: matchingCuts.length,
      },
      revealLesson: nextRevealLesson,
      availableRuleIds: collectAvailableRuleIds(this.activeTokens),
      activeTokens: [...this.activeTokens],
      roundCompleted,
      boundaryIndex: hitZone.candidateBoundaryCharOffsets[0],
      assessment: "both-correct",
      interactionId,
    });
  }

  private handleSliceAtBoundary(
    token: ActiveToken,
    candidateBoundaryCharOffsets: number[],
    view: TokenView,
    interactionId: string,
  ) {
    const feedbackBoundaryIndex = candidateBoundaryCharOffsets[0];

    if (!isFurtherSplittable(token.node)) {
      this.shakeToken(view, 0xff6673);
      this.emitFeedback({
        outcome: "blocked",
        message: this.localized(
          t("feedbackFinal", "en"),
          t("feedbackFinal", "sa"),
          t("feedbackFinal", "te"),
        ),
        availableRuleIds: collectAvailableRuleIds(this.activeTokens),
        activeTokens: [...this.activeTokens],
        roundCompleted: false,
        boundaryIndex: feedbackBoundaryIndex,
        assessment: "final-word",
        interactionId,
      });
      this.scheduleArenaRecovery();
      return;
    }

    const exactBoundaryCuts = token.node.cuts.filter(
      (cut) =>
        !cut.reviewNeeded &&
        getAcceptedCutBoundaryOffsets(token.node.devanagari, cut).some((boundaryOffset) =>
          candidateBoundaryCharOffsets.includes(boundaryOffset),
        ),
    );

    if (exactBoundaryCuts.length === 0) {
      this.handleWrongSlice(
        token,
        this.hasSelectedRuleElsewhere(token)
          ? "place-wrong-rule-correct"
          : "both-wrong",
        feedbackBoundaryIndex,
        interactionId,
      );
      return;
    }

    const matchingCuts = exactBoundaryCuts.filter(
      (cut) => cutMatchesRule(cut, this.bridgeState.selectedRuleId),
    );

    if (matchingCuts.length === 0) {
      this.handleWrongSlice(
        token,
        "place-correct-rule-wrong",
        feedbackBoundaryIndex,
        interactionId,
      );
      return;
    }

    const selectedCut =
      matchingCuts[Math.floor(Math.random() * matchingCuts.length)];
    this.arenaRecoveryEvent?.remove(false);
    this.arenaRecoveryEvent = null;
    const children: ActiveToken[] = [
      {
        instanceId: createInstanceId(),
        node: cloneWordNode(selectedCut.left),
        depth: token.depth + 1,
      },
      {
        instanceId: createInstanceId(),
        node: cloneWordNode(selectedCut.right),
        depth: token.depth + 1,
      },
    ];

    const tokenIndex = this.activeTokens.findIndex(
      (entry) => entry.instanceId === token.instanceId,
    );

    this.activeTokens.splice(tokenIndex, 1, ...children);
    this.spawnSparks(view.container.x, view.container.y, 0x7df5c7);
    this.syncTokenViews({
      removedId: token.instanceId,
      spawnOrigin: { x: view.container.x, y: view.container.y },
      newIds: children.map((child) => child.instanceId),
    });

    const roundCompleted = this.activeTokens.every(
      (entry) => !isFurtherSplittable(entry.node),
    );

    this.emitFeedback({
      outcome: "correct",
      message: this.localized(
        t("feedbackBothCorrect", "en"),
        t("feedbackBothCorrect", "sa"),
        t("feedbackBothCorrect", "te"),
      ),
      lesson: {
        node: token.node,
        cut: selectedCut,
        variantCount: matchingCuts.length,
      },
      revealLesson: this.buildRevealLesson(this.activeTokens),
      availableRuleIds: collectAvailableRuleIds(this.activeTokens),
      activeTokens: [...this.activeTokens],
      roundCompleted,
      boundaryIndex: feedbackBoundaryIndex,
      assessment: "both-correct",
      interactionId,
    });
  }

  private handleWrongSlice(
    token: ActiveToken,
    type:
      | "place-correct-rule-wrong"
      | "place-wrong-rule-correct"
      | "both-wrong",
    boundaryIndex?: number,
    interactionId?: string,
  ) {
    const view = this.tokenViews.get(token.instanceId);
    if (view) {
      this.shakeToken(view, 0xff6673);
      this.spawnSparks(view.container.x, view.container.y, 0xff6673);
    }

    const messageKey =
      type === "place-correct-rule-wrong"
        ? "feedbackWrongRule"
        : type === "place-wrong-rule-correct"
          ? "feedbackWrongPlaceRightRule"
          : "feedbackWrongBoth";

    this.emitFeedback({
      outcome: "wrong",
      message: this.localized(
        t(messageKey, "en"),
        t(messageKey, "sa"),
        t(messageKey, "te"),
      ),
      revealLesson: this.buildRevealLesson(this.activeTokens),
      availableRuleIds: collectAvailableRuleIds(this.activeTokens),
      activeTokens: [...this.activeTokens],
      roundCompleted: false,
      boundaryIndex,
      assessment: type,
      interactionId,
    });
    this.scheduleArenaRecovery();
  }

  shutdown() {
    this.cancelPendingSceneEvents();
    this.input.off("pointerdown", this.handlePointerDown, this);
    this.input.off("pointermove", this.handlePointerMove, this);
    this.input.off("pointerup", this.handlePointerUp, this);
    this.scale.off("resize", this.handleResize, this);
  }

  private buildRevealLesson(tokens: ActiveToken[]) {
    const stuck = tokens.find((entry) => isFurtherSplittable(entry.node));
    if (!stuck) {
      return undefined;
    }

    const cut = stuck.node.cuts.find((entry) => !entry.reviewNeeded) ?? stuck.node.cuts[0];
    if (!cut) {
      return undefined;
    }

    const targetBoundarySignature = getAcceptedCutBoundaryOffsets(
      stuck.node.devanagari,
      cut,
    ).join("\u0001");
    const variantCount = stuck.node.cuts.filter(
      (entry) =>
        !entry.reviewNeeded &&
        getAcceptedCutBoundaryOffsets(stuck.node.devanagari, entry).join("\u0001") ===
          targetBoundarySignature,
    ).length;

    return {
      node: stuck.node,
      cut,
      variantCount,
    };
  }

  private hasSelectedRuleElsewhere(token: ActiveToken) {
    return token.node.cuts.some(
      (cut) =>
        !cut.reviewNeeded && cutMatchesRule(cut, this.bridgeState.selectedRuleId),
    );
  }

  private shakeToken(view: TokenView, color: number) {
    this.tweens.add({
      targets: view.container,
      x: {
        from: view.container.x - 12,
        to: view.container.x + 12,
      },
      yoyo: true,
      repeat: 5,
      duration: 34,
      ease: "Sine.easeInOut",
      onStart: () => {
        view.orb.setStrokeStyle(4, color, 0.92);
        view.outerGlow.setFillStyle(color, 0.3);
      },
      onComplete: () => {
        this.applyTokenTheme(view, view.token.node);
        view.orb.setStrokeStyle(1, 0xffffff, 0.12);
      },
    });
  }

  private spawnSlashBurst(
    line: Phaser.Geom.Line,
    color: number,
    alpha = 0.88,
  ) {
    const dx = line.x2 - line.x1;
    const dy = line.y2 - line.y1;
    const length = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
    const normalX = -dy / length;
    const normalY = dx / length;

    const slashGlow = this.add.graphics();
    slashGlow.lineStyle(24, color, alpha * 0.2);
    slashGlow.beginPath();
    slashGlow.moveTo(line.x1, line.y1);
    slashGlow.lineTo(line.x2, line.y2);
    slashGlow.strokePath();

    const slashEdge = this.add.graphics();
    slashEdge.lineStyle(9, color, alpha * 0.44);
    slashEdge.beginPath();
    slashEdge.moveTo(line.x1 + normalX * 5, line.y1 + normalY * 5);
    slashEdge.lineTo(line.x2 + normalX * 5, line.y2 + normalY * 5);
    slashEdge.strokePath();

    const slashCore = this.add.graphics();
    slashCore.lineStyle(4, 0xf8ffff, alpha);
    slashCore.beginPath();
    slashCore.moveTo(line.x1 - normalX * 2, line.y1 - normalY * 2);
    slashCore.lineTo(line.x2 - normalX * 2, line.y2 - normalY * 2);
    slashCore.strokePath();

    const midpointX = (line.x1 + line.x2) / 2;
    const midpointY = (line.y1 + line.y2) / 2;

    for (let index = 0; index < 8; index += 1) {
      const shard = this.add.rectangle(
        midpointX + Phaser.Math.Between(-18, 18),
        midpointY + Phaser.Math.Between(-18, 18),
        Phaser.Math.Between(10, 26),
        Phaser.Math.Between(2, 4),
        index % 2 === 0 ? 0xf8ffff : color,
        0.9,
      );
      shard.setRotation(Math.atan2(dy, dx) + Phaser.Math.FloatBetween(-0.35, 0.35));

      this.tweens.add({
        targets: shard,
        x: shard.x + normalX * Phaser.Math.Between(-36, 36) + dx * 0.05,
        y: shard.y + normalY * Phaser.Math.Between(-36, 36) + dy * 0.05,
        alpha: 0,
        scaleX: 0.25,
        scaleY: 0.25,
        duration: 210 + index * 18,
        ease: "Quad.easeOut",
        onComplete: () => shard.destroy(),
      });
    }

    this.tweens.add({
      targets: [slashGlow, slashEdge, slashCore],
      alpha: 0,
      scaleX: 1.06,
      scaleY: 1.04,
      duration: 200,
      ease: "Quad.easeOut",
      onComplete: () => {
        slashGlow.destroy();
        slashEdge.destroy();
        slashCore.destroy();
      },
    });
  }

  private spawnSparks(x: number, y: number, color: number) {
    const shockwave = this.add.circle(x, y, 18, color, 0);
    shockwave.setStrokeStyle(4, color, 0.55);

    this.tweens.add({
      targets: shockwave,
      scale: 1.9,
      alpha: 0,
      duration: 280,
      ease: "Quad.easeOut",
      onComplete: () => shockwave.destroy(),
    });

    for (let index = 0; index < 18; index += 1) {
      const spark = this.add.circle(x, y, Phaser.Math.Between(2, 7), color, 0.95);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(36, 98);
      const targetX = x + Math.cos(angle) * distance;
      const targetY = y + Math.sin(angle) * distance;

      this.tweens.add({
        targets: spark,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0.2,
        duration: 420,
        delay: index * 6,
        ease: "Quart.easeOut",
        onComplete: () => spark.destroy(),
      });
    }
  }

  private emitFeedback(feedback: SliceFeedback) {
    this.callbacks.onFeedback(feedback);
  }

  private localized(en: string, sa: string, te: string) {
    return { en, sa, te };
  }

  private getDevanagariFontSpec(fontSize: number) {
    return `600 ${fontSize}px ${DEVANAGARI_FONT_FAMILY}`;
  }

  private getSceneSliceMarkers(
    label: Phaser.GameObjects.Text,
    token: ActiveToken,
    labelFontSize: number,
  ) {
    const boundaryCharOffsets = getDisplayBoundaryCharOffsets(token.node);

    if (boundaryCharOffsets.length === 0 || label.width <= 0) {
      return [];
    }

    const measureContext = getTextMeasureContext();
    if (!measureContext) {
      const fallbackStep = label.width / Math.max(boundaryCharOffsets.length + 1, 2);

      return boundaryCharOffsets.map((charOffset, index) => {
        const offsetFromLeft = fallbackStep * (index + 1);
        return {
          candidateBoundaryCharOffsets: [charOffset],
          offset: offsetFromLeft,
          localOffset: offsetFromLeft - label.width / 2,
          ratio: offsetFromLeft / label.width,
        };
      });
    }

    measureContext.font = this.getDevanagariFontSpec(labelFontSize);
    const rawTotalWidth = Math.max(
      measureContext.measureText(token.node.devanagari).width,
      1,
    );
    const scale = label.width / rawTotalWidth;

    return mergeBoundaryMarkers(boundaryCharOffsets, (charOffset) => {
      const rawPrefixWidth = measureContext.measureText(
        token.node.devanagari.slice(0, charOffset),
      ).width;

      return rawPrefixWidth * scale;
    }).map((marker) => ({
      ...marker,
      localOffset: marker.offset - label.width / 2,
      ratio: Phaser.Math.Clamp(marker.offset / label.width, 0, 1),
    }));
  }

  private getSliceZones(view: TokenView) {
    const labelBounds = view.label.getBounds();
    const orbBounds = view.orb.getBounds();
    const touchStage = this.scale.width < 520;
    const zoneWidth =
      this.bridgeState.mode === "ninja"
        ? touchStage
          ? 74
          : 62
        : touchStage
          ? 58
          : 48;
    const zonePaddingY = this.bridgeState.mode === "ninja" ? 16 : 12;

    return view.sliceMarkers.map((marker) => {
      const worldX =
        labelBounds.width > 0
          ? labelBounds.x + labelBounds.width * marker.ratio
          : view.container.x + marker.localOffset;

      return {
        candidateBoundaryCharOffsets: marker.candidateBoundaryCharOffsets,
        rect: new Phaser.Geom.Rectangle(
          worldX - zoneWidth / 2,
          orbBounds.y - zonePaddingY,
          zoneWidth,
          orbBounds.height + zonePaddingY * 2,
        ),
      };
    });
  }

  private buildSliceGuides(
    token: ActiveToken,
    sliceMarkers: SceneSliceMarker[],
    orbHeight: number,
  ) {
    if (
      (this.bridgeState.studyMode !== "guided" && this.bridgeState.mode !== "ninja") ||
      !isFurtherSplittable(token.node) ||
      sliceMarkers.length === 0
    ) {
      return null;
    }

    const guides = this.add.container(0, 0);
    const ninjaMode = this.bridgeState.mode === "ninja";
    const touchStage = this.scale.width < 520;
    const guideHeight = ninjaMode
      ? Math.max(orbHeight - 8, 96)
      : Math.max(orbHeight - 30, 72);

    sliceMarkers.forEach((marker, index) => {
      const x = marker.localOffset;
      if (ninjaMode) {
        const totalGuideHeight = guideHeight + (touchStage ? 24 : 18);
        const guideGapHeight = touchStage ? 54 : 62;
        const segmentHeight = Math.max((totalGuideHeight - guideGapHeight) / 2, 24);
        const topY = -(guideGapHeight / 2 + segmentHeight / 2) + 2;
        const bottomY = guideGapHeight / 2 + segmentHeight / 2 - 4;
        const glowWidth = touchStage ? 10 : 8;
        const beamWidth = touchStage ? 2.1 : 1.8;

        const topGlow = this.add.rectangle(
          x,
          topY,
          glowWidth,
          segmentHeight + 6,
          0xffc97d,
          touchStage ? 0.032 : 0.026,
        );
        const topBeam = this.add.rectangle(
          x,
          topY,
          beamWidth,
          segmentHeight,
          0xffe2a5,
          touchStage ? 0.42 : 0.36,
        );
        const topSpine = this.add.rectangle(
          x,
          topY,
          1,
          segmentHeight + 8,
          0xfff4dc,
          0.06,
        );
        const bottomGlow = this.add.rectangle(
          x,
          bottomY,
          glowWidth,
          segmentHeight + 10,
          0xffc97d,
          touchStage ? 0.036 : 0.03,
        );
        const bottomBeam = this.add.rectangle(
          x,
          bottomY,
          beamWidth,
          segmentHeight + 4,
          0xffe2a5,
          touchStage ? 0.46 : 0.38,
        );
        const bottomSpine = this.add.rectangle(
          x,
          bottomY,
          1,
          segmentHeight + 12,
          0xfff4dc,
          0.07,
        );

        guides.add([topGlow, topBeam, topSpine, bottomGlow, bottomBeam, bottomSpine]);
        return;
      }

      const glow = this.add.rectangle(
        x,
        0,
        touchStage ? 8 : 7,
        guideHeight + 10,
        0xffc97d,
        0.025,
      );
      const beam = this.add.rectangle(
        x,
        0,
        touchStage ? 1.8 : 1.4,
        guideHeight,
        0xffe2a5,
        touchStage ? 0.34 : 0.24,
      );
      const shimmer = this.add.rectangle(
        x,
        -guideHeight * 0.18,
        touchStage ? 2 : 1.6,
        guideHeight * 0.28,
        0xffffff,
        0.05,
      );
      const spine = this.add.rectangle(x, 0, 1, guideHeight + 12, 0xfff4dc, 0.03);

      guides.add([glow, beam, shimmer, spine]);
    });

    guides.setAlpha(ninjaMode ? 0.68 : 0.56);
    return guides;
  }

  private rebuildTokenViews() {
    for (const [, view] of this.tokenViews) {
      view.container.destroy(true);
    }
    this.tokenViews.clear();
    this.syncTokenViews();
    if (this.bridgeState.mode === "ninja") {
      this.startNinjaFall();
    }
  }

  private getTokenMetrics(node: WordNode) {
    const stageWidth = this.scale.width;
    const compactStage = stageWidth < 520;
    const baseWidth =
      node.devanagari.length * (compactStage ? 18 : 24) + (compactStage ? 96 : 120);
    const minWidth = compactStage ? 180 : 210;
    const maxWidth = Math.max(minWidth, stageWidth - (compactStage ? 36 : 72));
    const tokenWidth = Math.min(maxWidth, Math.max(minWidth, baseWidth));
    const longWord = node.devanagari.length > 12;

    return {
      badgeY: this.bridgeState.mode === "ninja" ? (compactStage ? 68 : 78) : compactStage ? 62 : 70,
      glowHeight: this.bridgeState.mode === "ninja" ? (compactStage ? 152 : 176) : compactStage ? 132 : 148,
      labelFontSize:
        this.bridgeState.mode === "ninja"
          ? compactStage
            ? longWord
              ? 32
              : 36
            : longWord
              ? 44
              : 50
          : compactStage
            ? longWord
              ? 28
              : 32
            : longWord
              ? 38
              : 44,
      orbHeight: this.bridgeState.mode === "ninja" ? (compactStage ? 120 : 134) : compactStage ? 104 : 118,
      sheenHeight: compactStage ? 22 : 26,
      sheenWidth: tokenWidth * 0.58,
      sheenY: compactStage ? -24 : -28,
      sublabelFontSize: this.bridgeState.mode === "ninja" ? (compactStage ? 16 : 18) : compactStage ? 15 : 16,
      sublabelY: this.bridgeState.mode === "ninja" ? (compactStage ? 30 : 34) : compactStage ? 22 : 26,
      tokenWidth,
    };
  }

  private syncTokenViews(options?: {
    removedId?: string;
    spawnOrigin?: LayoutPosition;
    newIds?: string[];
  }) {
    const sceneTokens = this.getVisibleSceneTokens();
    const layout = this.getLayoutPositions(sceneTokens.length);
    const nextIds = new Set(sceneTokens.map((token) => token.instanceId));

    for (const [instanceId, view] of this.tokenViews) {
      if (!nextIds.has(instanceId)) {
        this.tweens.killTweensOf([
          view.container,
          view.orb,
          view.outerGlow,
          ...(view.sliceGuides ? [view.sliceGuides] : []),
        ]);
        this.tweens.add({
          targets: view.container,
          alpha: 0,
          scale: 0.82,
          y: view.container.y - 18,
          duration: 260,
          ease: "Quad.easeIn",
          onComplete: () => view.container.destroy(true),
        });
        this.tokenViews.delete(instanceId);
      }
    }

    sceneTokens.forEach((token, index) => {
      const position = layout[index];
      const existing = this.tokenViews.get(token.instanceId);

      if (existing) {
        existing.token = token;
        existing.badge.setText(this.getBadgeLabel(token.node));
        existing.sublabel.setText(this.getSubLabel(token.node));
        this.applyTokenTheme(existing, token.node);

        this.tweens.add({
          targets: existing.container,
          x: Math.round(position.x),
          y: Math.round(position.y),
          duration: 340,
          ease: "Cubic.easeOut",
        });
        return;
      }

      const newView = this.buildTokenView(token);
      const spawn =
        options?.newIds?.includes(token.instanceId) && options.spawnOrigin
          ? options.spawnOrigin
          : position;

      newView.container.setPosition(Math.round(spawn.x), Math.round(spawn.y));
      newView.container.setAlpha(spawn === position ? 0.88 : 0);
      newView.container.setScale(spawn === position ? 1 : 0.78);
      newView.container.setAngle(spawn === position ? 0 : Phaser.Math.Between(-7, 7));
      this.tokenViews.set(token.instanceId, newView);

      this.tweens.add({
        targets: newView.container,
        x: Math.round(position.x),
        y: Math.round(position.y),
        alpha: 1,
        scale: 1,
        angle: 0,
        duration: 420,
        ease: "Back.easeOut",
      });
    });
  }

  private buildTokenView(token: ActiveToken) {
    const metrics = this.getTokenMetrics(token.node);
    const tokenWidth = metrics.tokenWidth;

    const isSplittable = isFurtherSplittable(token.node);
    const glowColor = isSplittable ? 0xffbe70 : 0x7df5c7;
    const orbColor = isSplittable ? 0x1d1521 : 0x13261d;

    const outerGlow = this.add.ellipse(
      0,
      10,
      tokenWidth + (tokenWidth < 240 ? 44 : 64),
      metrics.glowHeight,
      glowColor,
      0.2,
    );
    const orb = this.add.ellipse(0, 0, tokenWidth, metrics.orbHeight, orbColor, 0.94);
    const sheen = this.add.ellipse(
      0,
      metrics.sheenY,
      metrics.sheenWidth,
      metrics.sheenHeight,
      0xffffff,
      0.08,
    );
    orb.setStrokeStyle(1, 0xffffff, 0.12);

    const label = this.add.text(0, -12, token.node.devanagari, {
      fontFamily: DEVANAGARI_FONT_FAMILY,
      fontSize: `${metrics.labelFontSize}px`,
      color: "#f8f1ff",
      stroke: "#140c1e",
      strokeThickness: 5,
      align: "center",
      shadow: {
        offsetX: 0,
        offsetY: 4,
        color: "#000000",
        blur: 10,
        fill: true,
        stroke: false,
      },
    });
    label.setOrigin(0.5);
    label.setResolution(TEXT_RESOLUTION);
    const sliceMarkers = this.getSceneSliceMarkers(label, token, metrics.labelFontSize);
    const sliceGuides = this.buildSliceGuides(token, sliceMarkers, metrics.orbHeight);
    const labelBackplate = this.add.rectangle(
      0,
      -10,
      Math.min(tokenWidth * 0.76, label.width + (this.bridgeState.mode === "ninja" ? 34 : 24)),
      Math.max(
        metrics.labelFontSize + (this.bridgeState.mode === "ninja" ? 18 : 14),
        this.bridgeState.mode === "ninja" ? 52 : 44,
      ),
      0x120917,
      this.bridgeState.mode === "ninja" ? 0.18 : 0.1,
    );
    labelBackplate.setStrokeStyle(1, 0xffffff, this.bridgeState.mode === "ninja" ? 0.05 : 0.03);

    const sublabel = this.add.text(0, metrics.sublabelY, this.getSubLabel(token.node), {
      fontFamily: this.getSubLabelFont(token.node),
      fontSize: `${metrics.sublabelFontSize}px`,
      color: this.bridgeState.mode === "ninja" ? "#eef1f9" : "#d9d7e6",
      align: "center",
      shadow:
        this.bridgeState.mode === "ninja"
          ? {
              offsetX: 0,
              offsetY: 2,
              color: "#000000",
              blur: 6,
              fill: true,
              stroke: false,
            }
          : undefined,
    });
    sublabel.setOrigin(0.5);
    sublabel.setResolution(TEXT_RESOLUTION);

    const badge = this.add.text(0, metrics.badgeY, this.getBadgeLabel(token.node), {
      fontFamily: this.getUiFontFamily(),
      fontSize: this.bridgeState.mode === "ninja" ? "12px" : "13px",
      color: isSplittable ? "#ffdca8" : "#baf7d1",
      backgroundColor: isSplittable ? "#4d3210" : "#13301d",
      padding: this.bridgeState.mode === "ninja" ? { x: 9, y: 5 } : { x: 10, y: 6 },
    });
    badge.setOrigin(0.5);
    badge.setResolution(TEXT_RESOLUTION);

    const containerChildren: Phaser.GameObjects.GameObject[] = [outerGlow, orb, sheen];
    if (sliceGuides) {
      containerChildren.push(sliceGuides);
    }
    containerChildren.push(labelBackplate, label, sublabel, badge);
    const container = this.add.container(0, 0, containerChildren);

    if (this.bridgeState.mode === "ninja") {
      this.tweens.add({
        targets: outerGlow,
        alpha: { from: 0.14, to: 0.22 },
        duration: 1800 + token.depth * 120,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    } else {
      this.tweens.add({
        targets: outerGlow,
        alpha: { from: 0.14, to: 0.28 },
        scaleX: { from: 0.96, to: 1.08 },
        scaleY: { from: 0.92, to: 1.06 },
        duration: 1500 + token.depth * 140,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.tweens.add({
        targets: orb,
        scaleX: { from: 1, to: 1.018 },
        scaleY: { from: 1, to: 0.986 },
        duration: 2200 + token.depth * 180,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    return {
      token,
      container,
      orb,
      outerGlow,
      sliceGuides,
      sliceMarkers,
      label,
      sublabel,
      badge,
    };
  }

  private startNinjaFall() {
    const token = this.getCurrentNinjaFocusToken();
    const view = token ? this.tokenViews.get(token.instanceId) : null;

    if (!token || !view) {
      return;
    }

    this.ninjaFallTween?.stop();
    this.ninjaFallTween = null;
    this.ninjaHoverTween?.stop();
    this.ninjaHoverTween = null;
    const topY = Math.round(Math.max(this.scale.height * 0.18, 120));
    const bottomY = Math.round(Math.max(this.scale.height - 124, this.scale.height * 0.72));
    view.container.setY(topY);
    view.container.setAlpha(0.96);
    view.container.setScale(0.94);
    view.container.setAngle(0);
    this.tweens.add({
      targets: view.container,
      scale: 1,
      duration: 260,
      ease: "Quad.easeOut",
    });

    if (!this.bridgeState.clockEnabled) {
      view.container.setY(Math.round(Math.max(this.scale.height * 0.42, topY + 48)));
      return;
    }

    this.ninjaFallTween = this.tweens.add({
      targets: view.container,
      y: bottomY,
      duration: this.bridgeState.studyMode === "challenge" ? 6800 : 8800,
      ease: "Quad.easeIn",
      onComplete: () => {
        this.ninjaFallTween = null;
        this.handleNinjaBottomOut(token);
      },
    });
  }

  private handleNinjaBottomOut(token: ActiveToken) {
    const view = this.tokenViews.get(token.instanceId);
    const cut = token.node.cuts.find(
      (entry) =>
        !entry.reviewNeeded && cutMatchesRule(entry, this.bridgeState.selectedRuleId),
    );

    if (!view || !cut) {
      return;
    }

    this.shakeToken(view, 0xff6673);
    this.emitFeedback({
      outcome: "wrong",
      message: this.localized(
        t("timeUp", "en"),
        t("timeUp", "sa"),
        t("timeUp", "te"),
      ),
      lesson: {
        node: token.node,
        cut,
        variantCount: 1,
      },
      revealLesson: {
        node: token.node,
        cut,
        variantCount: 1,
      },
      availableRuleIds: [this.bridgeState.selectedRuleId],
      activeTokens: [...this.activeTokens],
      roundCompleted: false,
      boundaryIndex: cut.cutAfterAksharaIndex,
      assessment: "place-wrong-rule-correct",
      bottomOut: true,
    });
  }

  private applyTokenTheme(view: TokenView, node: WordNode) {
    const isSplittable = isFurtherSplittable(node);
    const glowColor = isSplittable ? 0xffbe70 : 0x7df5c7;
    const orbColor = isSplittable ? 0x1d1521 : 0x13261d;

    view.outerGlow.setFillStyle(glowColor, 0.2);
    view.orb.setFillStyle(orbColor, 0.92);
    view.badge.setColor(isSplittable ? "#ffdca8" : "#baf7d1");
    view.badge.setBackgroundColor(isSplittable ? "#4d3210" : "#13301d");
    view.sliceGuides?.setVisible(isSplittable);
  }

  private getUiFontFamily() {
    if (this.bridgeState.language === "te") {
      return '"Anek Telugu", "Noto Sans Telugu", "IBM Plex Sans", sans-serif';
    }

    if (this.bridgeState.language === "sa") {
      return '"Noto Serif Devanagari", "IBM Plex Sans", serif';
    }

    return '"IBM Plex Sans", "Trebuchet MS", sans-serif';
  }

  private getSubLabelFont(node: WordNode) {
    if (this.bridgeState.language === "te" && node.telugu) {
      return '"Anek Telugu", "Noto Sans Telugu", "IBM Plex Sans", sans-serif';
    }

    return '"IBM Plex Sans", "Trebuchet MS", sans-serif';
  }

  private refreshTokenDecorations() {
    this.activeTokens.forEach((token) => {
      const view = this.tokenViews.get(token.instanceId);
      if (!view) {
        return;
      }

      view.badge.setText(this.getBadgeLabel(token.node));
      view.badge.setFontFamily(this.getUiFontFamily());
      view.badge.setResolution(TEXT_RESOLUTION);
      view.sublabel.setText(this.getSubLabel(token.node));
      view.sublabel.setFontFamily(this.getSubLabelFont(token.node));
      view.sublabel.setResolution(TEXT_RESOLUTION);
      this.applyTokenTheme(view, token.node);
    });
  }

  private getBadgeLabel(node: WordNode) {
    if (this.bridgeState.mode === "ninja") {
      return (
        RULE_LOOKUP.get(this.bridgeState.selectedRuleId)?.label[
          this.bridgeState.language
        ] ?? t("canSplitAgain", this.bridgeState.language)
      );
    }

    return isFurtherSplittable(node)
      ? t("canSplitAgain", this.bridgeState.language)
      : t("finalWord", this.bridgeState.language);
  }

  private getSubLabel(node: WordNode) {
    if (this.bridgeState.language === "te" && node.telugu) {
      return node.telugu;
    }

    return node.iast;
  }

  private getLayoutPositions(count = this.activeTokens.length) {
    const width = this.scale.width;
    const height = this.scale.height;

    if (count === 1) {
      return [
        {
          x: Math.round(width / 2),
          y: Math.round(
            this.bridgeState.mode === "ninja" ? height * 0.18 : height / 2,
          ),
        },
      ];
    }

    if (count === 2) {
      return [
        { x: Math.round(width * 0.34), y: Math.round(height / 2) },
        { x: Math.round(width * 0.66), y: Math.round(height / 2) },
      ];
    }

    const columns = Math.min(3, count);
    const rows = Math.ceil(count / columns);
    const horizontalGap = width / (columns + 1);
    const verticalGap = Math.min(190, height / (rows + 1));
    const positions: LayoutPosition[] = [];

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const itemIndex = row * columns + column;

        if (itemIndex >= count) {
          continue;
        }

        positions.push({
          x: Math.round(horizontalGap * (column + 1)),
          y: Math.round(height * 0.32 + row * verticalGap),
        });
      }
    }

    return positions;
  }
}

export default SliceScene;
