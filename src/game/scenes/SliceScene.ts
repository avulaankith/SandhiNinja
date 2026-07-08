import Phaser from "phaser";
import { t } from "../../data/uiText";
import { cloneWordNode, isFurtherSplittable } from "../../data/sandhiBank";
import type {
  ActiveToken,
  GameMode,
  Language,
  SandhiRuleId,
  SliceFeedback,
  WordNode,
} from "../../types/sandhi";

type RuntimeMode = Exclude<GameMode, "devStudio">;

export type SliceSceneBridgeState = {
  mode: RuntimeMode;
  language: Language;
  selectedRuleId: SandhiRuleId;
  rootWord: WordNode;
  interactionLocked: boolean;
};

type SliceSceneCallbacks = {
  onFeedback: (feedback: SliceFeedback) => void;
};

type TokenView = {
  token: ActiveToken;
  container: Phaser.GameObjects.Container;
  orb: Phaser.GameObjects.Ellipse;
  outerGlow: Phaser.GameObjects.Ellipse;
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
    this.bridgeState = {
      ...this.bridgeState,
      ...state,
    };

    const nextWordId = this.bridgeState.rootWord.id;
    const nextMode = this.bridgeState.mode;

    if (previousWordId !== nextWordId || previousMode !== nextMode) {
      this.resetRound();
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
    this.clearTrail();
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
      activeTokens: [...this.activeTokens],
      roundCompleted: false,
    });
  }

  private handleResize() {
    this.syncTokenViews();
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (this.bridgeState.interactionLocked) {
      return;
    }

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

    this.time.delayedCall(120, () => this.clearTrail());
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
    this.swipeStart = null;
    this.swipeEnd = null;
    this.trail.clear();
    this.trailGlow.clear();
  }

  private resolveSwipe() {
    if (!this.swipeStart || !this.swipeEnd) {
      return;
    }

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

      const zones = this.getSliceZones(view);
      const hitZone = zones.find((zone) =>
        lineIntersectsRectangle(swipeLine, zone.rect),
      );

      if (!hitZone) {
        this.handleWrongSlice(token, "wrong-cut");
        return;
      }

      this.handleSliceAtBoundary(token, hitZone.index, view);
      return;
    }
  }

  private handleSliceAtBoundary(
    token: ActiveToken,
    boundaryIndex: number,
    view: TokenView,
  ) {
    if (!isFurtherSplittable(token.node)) {
      this.shakeToken(view, 0xff6673);
      this.emitFeedback({
        outcome: "blocked",
        message: this.localized(t("feedbackFinal", "en"), t("feedbackFinal", "sa"), t("feedbackFinal", "te")),
        activeTokens: [...this.activeTokens],
        roundCompleted: false,
        boundaryIndex,
      });
      return;
    }

    const exactBoundaryCuts = token.node.cuts.filter(
      (cut) => !cut.reviewNeeded && cut.cutAfterAksharaIndex === boundaryIndex,
    );

    if (exactBoundaryCuts.length === 0) {
      this.handleWrongSlice(token, "wrong-cut", boundaryIndex);
      return;
    }

    const matchingCuts = exactBoundaryCuts.filter(
      (cut) => cut.ruleId === this.bridgeState.selectedRuleId,
    );

    if (matchingCuts.length === 0) {
      this.handleWrongSlice(token, "wrong-rule", boundaryIndex);
      return;
    }

    const selectedCut =
      matchingCuts[Math.floor(Math.random() * matchingCuts.length)];
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
      message: this.localized(t("correctSplit", "en"), t("correctSplit", "sa"), t("correctSplit", "te")),
      lesson: {
        node: token.node,
        cut: selectedCut,
        variantCount: matchingCuts.length,
      },
      activeTokens: [...this.activeTokens],
      roundCompleted,
      boundaryIndex,
    });
  }

  private handleWrongSlice(
    token: ActiveToken,
    type: "wrong-cut" | "wrong-rule",
    boundaryIndex?: number,
  ) {
    const view = this.tokenViews.get(token.instanceId);
    if (view) {
      this.shakeToken(view, 0xff6673);
      this.spawnSparks(view.container.x, view.container.y, 0xff6673);
    }

    const message =
      type === "wrong-rule"
        ? this.localized(
            t("feedbackWrongRule", "en"),
            t("feedbackWrongRule", "sa"),
            t("feedbackWrongRule", "te"),
          )
        : this.localized(
            t("feedbackWrongCut", "en"),
            t("feedbackWrongCut", "sa"),
            t("feedbackWrongCut", "te"),
          );

    this.emitFeedback({
      outcome: "wrong",
      message,
      activeTokens: [...this.activeTokens],
      roundCompleted: false,
      boundaryIndex,
    });
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
        labelBounds.x + slotWidth * (index + 1) - 13,
        labelBounds.y - 18,
        26,
        labelBounds.height + 36,
      ),
    }));
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
    const tokenWidth = Math.min(
      420,
      Math.max(210, token.node.devanagari.length * 24 + 120),
    );

    const isSplittable = isFurtherSplittable(token.node);
    const glowColor = isSplittable ? 0xffbe70 : 0x7df5c7;
    const orbColor = isSplittable ? 0x1d1521 : 0x13261d;

    const outerGlow = this.add.ellipse(0, 10, tokenWidth + 64, 148, glowColor, 0.2);
    const orb = this.add.ellipse(0, 0, tokenWidth, 118, orbColor, 0.94);
    const sheen = this.add.ellipse(0, -28, tokenWidth * 0.58, 26, 0xffffff, 0.08);
    orb.setStrokeStyle(1, 0xffffff, 0.12);

    const label = this.add.text(0, -12, token.node.devanagari, {
      fontFamily: '"Noto Serif Devanagari", "Palatino Linotype", serif',
      fontSize: token.node.devanagari.length > 12 ? "38px" : "44px",
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

    const sublabel = this.add.text(0, 26, this.getSubLabel(token.node), {
      fontFamily: this.getSubLabelFont(token.node),
      fontSize: "16px",
      color: "#d9d7e6",
      align: "center",
    });
    sublabel.setOrigin(0.5);
    sublabel.setResolution(TEXT_RESOLUTION);

    const badge = this.add.text(0, 64, this.getBadgeLabel(token.node), {
      fontFamily: this.getUiFontFamily(),
      fontSize: "13px",
      color: isSplittable ? "#ffdca8" : "#baf7d1",
      backgroundColor: isSplittable ? "#4d3210" : "#13301d",
      padding: { x: 10, y: 6 },
    });
    badge.setOrigin(0.5);
    badge.setResolution(TEXT_RESOLUTION);

    const container = this.add.container(0, 0, [outerGlow, orb, sheen, label, sublabel, badge]);

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
