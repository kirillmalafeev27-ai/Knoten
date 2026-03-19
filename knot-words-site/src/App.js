import { SoundEngine } from "./audio/SoundEngine.js";
import { TTSPlayer } from "./audio/TTSPlayer.js";
import { GameEngine } from "./core/GameEngine.js";
import { Renderer } from "./render/Renderer.js";
import { AnthropicLevelService } from "./services/AnthropicLevelService.js";
import { HUD } from "./ui/HUD.js";
import { HintTooltip } from "./ui/HintTooltip.js";
import { ProfileScreen } from "./ui/ProfileScreen.js";
import { WinModal } from "./ui/WinModal.js";

class App {
  constructor() {
    this.canvas = document.getElementById("c");
    this.gameScreen = document.getElementById("game-screen");
    this.renderer = new Renderer({
      canvas: this.canvas,
      container: document.getElementById("gc"),
    });
    this.sound = new SoundEngine();
    this.tts = new TTSPlayer();
    this.levelService = new AnthropicLevelService();
    this.winTimer = null;
    this.game = null;

    this.hud = new HUD({
      levelNode: document.getElementById("lvn"),
      progressFill: document.getElementById("pf"),
      prevButton: document.getElementById("bpv"),
      nextButton: document.getElementById("bnxt"),
      resetButton: document.getElementById("brst"),
      topicTag: document.getElementById("topic-tag"),
    });

    this.tooltip = new HintTooltip(document.getElementById("hint-tooltip"));
    this.profileScreen = new ProfileScreen({
      screen: document.getElementById("profile-screen"),
      form: document.getElementById("profile-form"),
      nameInput: document.getElementById("profile-name"),
      topicInput: document.getElementById("profile-topic"),
      ageOptions: document.getElementById("age-options"),
      levelOptions: document.getElementById("level-options"),
      note: document.getElementById("profile-note"),
      submitButton: document.getElementById("profile-submit"),
    });

    this.winModal = new WinModal({
      root: document.getElementById("wo"),
      titleNode: document.getElementById("wt"),
      subtitleNode: document.getElementById("ws"),
      reviewNode: document.getElementById("sentence-review"),
      actionButton: document.getElementById("wcb"),
    });
  }

  init() {
    this.hud.setIdle();
    this.profileScreen.setSubmitHandler((profile) => this.startPack(profile));
    this.winModal.setHandlers({
      onAdvance: () => {
        if (!this.game) {
          return;
        }

        this.winModal.hide();
        this.game.nextLevel();
      },
      onListen: (text) => this.tts.speak(text),
    });

    document.getElementById("bpv").addEventListener("click", () => this.game?.prevLevel());
    document.getElementById("bnxt").addEventListener("click", () => this.game?.nextLevel());
    document.getElementById("brst").addEventListener("click", () => this.game?.resetLevel());

    this.#bindCanvas();
    this.renderer.start(() => this.game?.getState() ?? null);
  }

  async startPack(profile) {
    this.profileScreen.setLoading(true);
    const levels = await this.levelService.generatePack(profile);
    this.profileScreen.setLoading(false);
    this.profileScreen.hide();
    this.gameScreen.classList.remove("is-hidden");
    this.renderer.resize();
    this.renderer.clearTransient();
    this.winModal.hide();

    this.game = new GameEngine({
      levels,
      profile,
      callbacks: {
        onLevelLoaded: ({ ui }) => {
          window.clearTimeout(this.winTimer);
          this.renderer.clearTransient();
          this.winModal.hide();
          this.hud.render(ui);
          this.renderer.resize();
        },
        onStateChange: ({ ui }) => {
          this.hud.render(ui);
        },
        onInvalidMove: ({ hint }) => {
          this.sound.play("break");
          this.tooltip.show(hint);
        },
        onPathEvent: ({ type, cell, sentence, pathState }) => {
          if (type === "start") {
            this.sound.play("connect");
            this.renderer.emitAtCell(cell, sentence.color, 5);
            this.tts.speak(cell.word);
            return;
          }

          if (type === "advance") {
            this.sound.play("connect");
            this.renderer.emitAtCell(cell, sentence.color, 4);
            this.tts.speak(cell.word);
            return;
          }

          if (type === "trim" || type === "rewind") {
            this.sound.play("connect");
            return;
          }

          if (type === "complete") {
            this.sound.play("complete");
            this.renderer.addWave(sentence.color, pathState.cells);
            this.renderer.burstSentence(pathState.cells, sentence.color, 6);
            this.tts.speak(cell.word);
          }
        },
        onCellReplay: ({ cell }) => {
          this.tts.speak(cell.word);
        },
        onWin: ({ review, isLastLevel }) => {
          this.sound.play("win");
          this.game.getState().level.sentences.forEach((sentence) => {
            this.renderer.burstSentence(sentence.path, sentence.color, 10);
          });
          this.winTimer = window.setTimeout(() => {
            this.winModal.show({ review, isLastLevel });
          }, 680);
        },
      },
    });
  }

  #bindCanvas() {
    this.canvas.addEventListener("pointerdown", (event) => {
      this.sound.init();
      if (!this.game) {
        return;
      }

      this.canvas.setPointerCapture(event.pointerId);
      const cell = this.renderer.getCellFromClientPoint(event.clientX, event.clientY, this.game.getState().level);
      this.game.handlePointerDown(cell);
    });

    this.canvas.addEventListener("pointermove", (event) => {
      if (!this.game) {
        return;
      }

      const cell = this.renderer.getCellFromClientPoint(event.clientX, event.clientY, this.game.getState().level);
      if (!this.game.getState().active.dragging) {
        this.game.setHoverCell(cell);
        return;
      }

      this.game.handlePointerMove(cell);
    });

    this.canvas.addEventListener("pointerleave", () => {
      this.game?.clearHover();
    });

    const releasePointer = (event) => {
      if (this.canvas.hasPointerCapture(event.pointerId)) {
        this.canvas.releasePointerCapture(event.pointerId);
      }

      this.game?.handlePointerUp();
    };

    this.canvas.addEventListener("pointerup", releasePointer);
    this.canvas.addEventListener("pointercancel", releasePointer);
  }
}

const app = new App();
app.init();
