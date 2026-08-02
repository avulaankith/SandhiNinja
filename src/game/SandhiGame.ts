import Phaser from "phaser";
import type { GameMode, Language, SandhiRuleId, SliceFeedback, WordNode } from "../types/sandhi";
import { SliceScene, type SliceSceneBridgeState } from "./scenes/SliceScene";

type RuntimeMode = Exclude<GameMode, "devStudio" | "join">;

export type SandhiGameOptions = {
  container: HTMLDivElement;
  state: SliceSceneBridgeState;
  onFeedback: (feedback: SliceFeedback) => void;
};

export class SandhiGame {
  private game: Phaser.Game;

  private scene: SliceScene;

  constructor({ container, state, onFeedback }: SandhiGameOptions) {
    this.scene = new SliceScene({ onFeedback });
    this.scene.setInitialState(state);

    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: container,
      banner: false,
      transparent: false,
      backgroundColor: "#07111c",
      scale: {
        mode: Phaser.Scale.NONE,
        width: container.clientWidth || 960,
        height: container.clientHeight || 640,
        autoCenter: Phaser.Scale.NO_CENTER,
      },
      scene: [this.scene],
      render: {
        antialias: true,
        antialiasGL: true,
        roundPixels: true,
      },
    });
  }

  update(state: Partial<SliceSceneBridgeState>) {
    this.scene.applyBridgeState(state);
  }

  resize(width: number, height: number) {
    if (width <= 0 || height <= 0) {
      return;
    }

    this.game.scale.resize(width, height);
  }

  loadWord(rootWord: WordNode, mode: RuntimeMode) {
    this.scene.applyBridgeState({ rootWord, mode });
  }

  setLanguage(language: Language) {
    this.scene.applyBridgeState({ language });
  }

  setSelectedRuleId(ruleId: SandhiRuleId) {
    this.scene.applyBridgeState({ selectedRuleId: ruleId });
  }

  setInteractionLocked(interactionLocked: boolean) {
    this.scene.applyBridgeState({ interactionLocked });
  }

  resetRound() {
    this.scene.resetRound();
  }

  destroy() {
    this.game.destroy(true);
  }
}

export default SandhiGame;
