import Phaser from "phaser";
import { t } from "../../data/uiText";
import { cloneWordNode, isFurtherSplittable } from "../../data/sandhiBank";
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
  label: Phaser.GameObjects.Text;
  sublabel: Phaser.GameObjects.Text;
  badge: Phaser.GameObjects.Text;
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

const TEXT_RESOLUTION =
  typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 2;

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
    this.bridgeState = {
      ...this.bridgeState,
      ...state,
    };

    const nextWordId = this.bridgeState.rootWord.id;
    const nextMode = this.bridgeState.mode;
    const nextRoundKey = this.bridgeState.roundKey;
    const nextStudyMode = this.bridgeState.studyMode;

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
  }

  create() {
    this.cameras.main.roundPixels = false;
    this.trailGlow = this.add.graphics();
    this.trail = this.add.graphics();
    this.add.existing(this.trailGlow);
    this.add.existing(this.trail);
    this.bridgeState = this.initialState!;

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
    this.cancelPendingSceneEvents();
    this.clearTrail();
    this.rebuildTokenViews();
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (this.bridgeState.interactionLocked) {
      return;
    }

    this.cancelPendingSceneEvents();
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
  }

  private scheduleArenaRecovery(delay = 220) {
    this.arenaRecoveryEvent?.remove(false);
    this.arenaRecoveryEvent = this.time.delayedCall(delay, () => {
      this.arenaRecoveryEvent = null;
      if (!this.sys.isActive()) {
        return;
      }

      this.clearTrail();
      this.rebuildTokenViews();
      this.refreshTokenDecorations();
    });
  }

  private resolveSwipe() {
    if (!this.swipeStart || !this.swipeEnd) {
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
      const hitZone = zones.find((zone) =>
        lineIntersectsRectangle(swipeLine, zone.rect),
      );

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

      this.handleSliceAtBoundary(token, hitZone.index, view, interactionId);
      return;
    }
  }

  private handleSliceAtBoundary(
    token: ActiveToken,
    boundaryIndex: number,
    view: TokenView,
    interactionId: string,
  ) {
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
        boundaryIndex,
        assessment: "final-word",
        interactionId,
      });
      this.scheduleArenaRecovery();
      return;
    }

    const exactBoundaryCuts = token.node.cuts.filter(
      (cut) => !cut.reviewNeeded && cut.cutAfterAksharaIndex === boundaryIndex,
    );

    if (exactBoundaryCuts.length === 0) {
      this.handleWrongSlice(
        token,
        this.hasSelectedRuleElsewhere(token)
          ? "place-wrong-rule-correct"
          : "both-wrong",
        boundaryIndex,
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
        boundaryIndex,
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
      boundaryIndex,
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

    const variantCount = stuck.node.cuts.filter(
      (entry) => !entry.reviewNeeded && entry.cutAfterAksharaIndex === cut.cutAfterAksharaIndex,
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

  private getSliceZones(view: TokenView) {
    const labelBounds = view.label.getBounds();
    const slotWidth =
      labelBounds.width / Math.max(view.token.node.aksharas.length, 1);

    return view.token.node.aksharas.slice(0, -1).map((_, index) => ({
      index,
      rect: new Phaser.Geom.Rectangle(
        labelBounds.x + slotWidth * (index + 1) - 17,
        labelBounds.y - 24,
        34,
        labelBounds.height + 48,
      ),
    }));
  }

  private buildSliceGuides(
    label: Phaser.GameObjects.Text,
    token: ActiveToken,
  ) {
    if (
      this.bridgeState.studyMode !== "guided" ||
      !isFurtherSplittable(token.node) ||
      token.node.aksharas.length <= 1
    ) {
      return null;
    }

    const slotWidth = label.width / Math.max(token.node.aksharas.length, 1);
    const leftEdge = -label.width / 2;
    const guides = this.add.container(0, 0);

    token.node.aksharas.slice(0, -1).forEach((_, index) => {
      const x = leftEdge + slotWidth * (index + 1);
      const glow = this.add.circle(x, 20, 7, 0xffbe70, 0.05);
      const tick = this.add.rectangle(x, 16, 2, 10, 0xffdca8, 0.18);
      const dot = this.add.circle(x, 22, 2, 0xfff0cf, 0.38);

      guides.add([glow, tick, dot]);
    });

    guides.setAlpha(0.52);
    return guides;
  }

  private rebuildTokenViews() {
    for (const [, view] of this.tokenViews) {
      view.container.destroy(true);
    }
    this.tokenViews.clear();
    this.syncTokenViews();
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
      badgeY: compactStage ? 56 : 64,
      glowHeight: compactStage ? 132 : 148,
      labelFontSize: compactStage ? (longWord ? 28 : 32) : longWord ? 38 : 44,
      orbHeight: compactStage ? 104 : 118,
      sheenHeight: compactStage ? 22 : 26,
      sheenWidth: tokenWidth * 0.58,
      sheenY: compactStage ? -24 : -28,
      sublabelFontSize: compactStage ? 15 : 16,
      sublabelY: compactStage ? 22 : 26,
      tokenWidth,
    };
  }

  private syncTokenViews(options?: {
    removedId?: string;
    spawnOrigin?: LayoutPosition;
    newIds?: string[];
  }) {
    const layout = this.getLayoutPositions();
    const nextIds = new Set(this.activeTokens.map((token) => token.instanceId));

    for (const [instanceId, view] of this.tokenViews) {
      if (!nextIds.has(instanceId)) {
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

    this.activeTokens.forEach((token, index) => {
      const position = layout[index];
      const existing = this.tokenViews.get(token.instanceId);

      if (existing) {
        existing.token = token;
        existing.badge.setText(this.getBadgeLabel(token.node));
        existing.sublabel.setText(this.getSubLabel(token.node));
        this.applyTokenTheme(existing, token.node);

        this.tweens.add({
          targets: existing.container,
          x: position.x,
          y: position.y,
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

      newView.container.setPosition(spawn.x, spawn.y);
      newView.container.setAlpha(spawn === position ? 0.88 : 0);
      newView.container.setScale(spawn === position ? 1 : 0.78);
      newView.container.setAngle(spawn === position ? 0 : Phaser.Math.Between(-7, 7));
      this.tokenViews.set(token.instanceId, newView);

      this.tweens.add({
        targets: newView.container,
        x: position.x,
        y: position.y,
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
      fontFamily: '"Noto Serif Devanagari", "Palatino Linotype", serif',
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
    const sliceGuides = this.buildSliceGuides(label, token);

    const sublabel = this.add.text(0, metrics.sublabelY, this.getSubLabel(token.node), {
      fontFamily: this.getSubLabelFont(token.node),
      fontSize: `${metrics.sublabelFontSize}px`,
      color: "#d9d7e6",
      align: "center",
    });
    sublabel.setOrigin(0.5);
    sublabel.setResolution(TEXT_RESOLUTION);

    const badge = this.add.text(0, metrics.badgeY, this.getBadgeLabel(token.node), {
      fontFamily: this.getUiFontFamily(),
      fontSize: "13px",
      color: isSplittable ? "#ffdca8" : "#baf7d1",
      backgroundColor: isSplittable ? "#4d3210" : "#13301d",
      padding: { x: 10, y: 6 },
    });
    badge.setOrigin(0.5);
    badge.setResolution(TEXT_RESOLUTION);

    const containerChildren: Phaser.GameObjects.GameObject[] = [outerGlow, orb, sheen];
    if (sliceGuides) {
      containerChildren.push(sliceGuides);
    }
    containerChildren.push(label, sublabel, badge);
    const container = this.add.container(0, 0, containerChildren);

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

    return {
      token,
      container,
      orb,
      outerGlow,
      sliceGuides,
      label,
      sublabel,
      badge,
    };
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

  private getLayoutPositions() {
    const width = this.scale.width;
    const height = this.scale.height;
    const count = this.activeTokens.length;

    if (count === 1) {
      return [{ x: width / 2, y: height / 2 }];
    }

    if (count === 2) {
      return [
        { x: width * 0.34, y: height / 2 },
        { x: width * 0.66, y: height / 2 },
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
          x: horizontalGap * (column + 1),
          y: height * 0.32 + row * verticalGap,
        });
      }
    }

    return positions;
  }
}

export default SliceScene;
