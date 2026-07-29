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
      transparent: true,
      backgroundColor: "#000000",
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: container.clientWidth || 960,
        height: container.clientHeight || 640,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [this.scene],
      render: {
        antialias: true,
        antialiasGL: true,
        roundPixels: false,
      },
    });
  }

  update(state: Partial<SliceSceneBridgeState>) {
    this.scene.applyBridgeState(state);
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
