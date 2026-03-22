import { SoundEngine } from "./audio/SoundEngine.js?v=20260322a";
import { TTSPlayer } from "./audio/TTSPlayer.js?v=20260322a";
import { GameEngine } from "./core/GameEngine.js?v=20260322a";
import { Renderer } from "./render/Renderer.js?v=20260322a";
import { AnthropicLevelService } from "./services/AnthropicLevelService.js?v=20260322a";
import { HUD } from "./ui/HUD.js?v=20260322a";
import { HintTooltip } from "./ui/HintTooltip.js?v=20260322a";
import { ProfileScreen } from "./ui/ProfileScreen.js?v=20260322a";
import { WinModal } from "./ui/WinModal.js?v=20260322a";

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

    /** Drag speech state for seamless audio continuation. */
    this.drag = this.#freshDragState();

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
      onListen: (text) => this.tts.playImmediate(text),
    });

    document.getElementById("bpv").addEventListener("click", () => this.game?.prevLevel());
    document.getElementById("bnxt").addEventListener("click", () => this.game?.nextLevel());
    document.getElementById("brst").addEventListener("click", () => this.game?.resetLevel());

    this.tts.onIdle(() => this.#onTtsIdle());
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
          this.tts.reset();
          this.drag = this.#freshDragState();
          this.hud.render(ui);
          this.renderer.resize();
          this.#prefetchLevelAudio();
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
            this.renderer.emitAtCell(cell, pathState.color, 5);
            this.#onDragEvent(type, pathState.cells);
            return;
          }

          if (type === "advance") {
            this.sound.play("connect");
            this.renderer.emitAtCell(cell, pathState.color, 4);
            this.#onDragEvent(type, pathState.cells);
            return;
          }

          if (type === "trim" || type === "rewind") {
            this.sound.play("connect");
            this.#onDragEvent(type, pathState.cells);
            return;
          }

          if (type === "complete") {
            this.sound.play("complete");
            this.renderer.addWave(pathState.color, pathState.cells);
            this.renderer.burstSentence(pathState.cells, pathState.color, 6);
            this.#onDragEvent(type, pathState.cells);
          }
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

  // ─── Pre-fetching ──────────────────────────────────────────────────

  #prefetchLevelAudio() {
    const level = this.game?.getState()?.level;
    if (!level) {
      return;
    }

    for (const sentence of level.sentences) {
      // Pre-fetch each individual word with sentence context.
      sentence.path.forEach((cell, index) => {
        const runtimeCell = level.grid[cell.r]?.[cell.c];
        if (!runtimeCell) {
          return;
        }

        this.tts.prefetch(runtimeCell.word, {
          previousText: sentence.tokens.slice(0, index).join(" "),
          nextText: sentence.tokens.slice(index + 1).join(" "),
        });
      });

      // Pre-fetch full sentence text.
      this.tts.prefetch(sentence.tokens.join(" "));

      // Pre-fetch contiguous sub-paths of length 2-3 along each sentence path.
      for (let start = 0; start < sentence.path.length; start++) {
        for (let len = 2; len <= Math.min(3, sentence.path.length - start); len++) {
          const subTokens = sentence.tokens.slice(start, start + len);
          this.tts.prefetch(subTokens.join(" "), {
            previousText: sentence.tokens.slice(0, start).join(" "),
            nextText: sentence.tokens.slice(start + len).join(" "),
          });
        }
      }
    }
  }

  // ─── Canvas binding ────────────────────────────────────────────────

  #bindCanvas() {
    this.canvas.addEventListener("pointerdown", (event) => {
      this.sound.init();
      this.tts.unlock();
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
      this.#onDragRelease();
    };

    this.canvas.addEventListener("pointerup", releasePointer);
    this.canvas.addEventListener("pointercancel", releasePointer);
    this.canvas.addEventListener("contextmenu", (event) => {
      if (!this.game) {
        return;
      }

      const cell = this.renderer.getCellFromClientPoint(event.clientX, event.clientY, this.game.getState().level);
      if (!cell) {
        return;
      }

      event.preventDefault();
      this.sound.init();
      this.tts.unlock();
      this.tts.playImmediate(cell.word, this.#getCellContext(cell));
    });
  }

  // ─── Seamless drag speech ──────────────────────────────────────────

  #freshDragState() {
    return {
      cells: [],
      spokenUpTo: 0,
      active: false,
    };
  }

  #onDragEvent(type, cells) {
    if (type === "start") {
      this.tts.cancelPending();
      this.drag = this.#freshDragState();
      this.drag.cells = [...cells];
      this.drag.active = true;
      return;
    }

    if (type === "advance") {
      this.drag.cells = [...cells];
      this.#trySpeak();
      return;
    }

    if (type === "trim" || type === "rewind") {
      const newLen = cells.length;
      this.drag.cells = [...cells];
      if (newLen < this.drag.spokenUpTo) {
        this.drag.spokenUpTo = newLen;
      }
      this.tts.cancelPending();
      return;
    }

    if (type === "complete") {
      this.drag.cells = [...cells];
      this.#speakRemaining(true);
    }
  }

  #onDragRelease() {
    if (!this.drag.active) {
      return;
    }

    this.drag.active = false;

    if (this.drag.cells.length >= 2 && this.drag.spokenUpTo < this.drag.cells.length) {
      this.#speakRemaining(false);
    }
  }

  /** Called when TTS finishes all queued items. */
  #onTtsIdle() {
    if (!this.drag.active) {
      return;
    }

    if (this.drag.cells.length > this.drag.spokenUpTo) {
      this.#speakRemaining(false);
    }
  }

  /** Try to initiate speech if not already speaking. */
  #trySpeak() {
    if (this.tts.isPlaying()) {
      return;
    }

    if (this.drag.cells.length >= 2 && this.drag.spokenUpTo < this.drag.cells.length) {
      this.#speakRemaining(false);
    }
  }

  /** Speak the cells from spokenUpTo to current end. */
  #speakRemaining(immediate) {
    const from = this.drag.spokenUpTo;
    const to = this.drag.cells.length;
    if (from >= to || to < 2) {
      return;
    }

    const cellsToSpeak = from === 0 ? this.drag.cells.slice(0, to) : this.drag.cells.slice(from, to);
    if (!cellsToSpeak.length) {
      return;
    }

    const text = cellsToSpeak.map((cell) => cell.word).join(" ").trim();
    if (!text) {
      return;
    }

    const context = this.#getSpeechContext(cellsToSpeak, from === 0 ? null : this.drag.cells.slice(0, from));
    this.drag.spokenUpTo = to;

    if (immediate || !this.tts.isPlaying()) {
      this.tts.append(text, context);
    } else {
      this.tts.append(text, context);
    }
  }

  /** Build previousText/nextText context for a cell slice. */
  #getSpeechContext(cells, precedingCells) {
    const baseContext = { previousText: "", nextText: "" };

    if (!cells.length) {
      return baseContext;
    }

    if (precedingCells?.length) {
      baseContext.previousText = precedingCells.map((cell) => cell.word).join(" ");
    }

    const sentenceId = cells[0].sentenceId;
    if (!sentenceId || cells.some((cell) => cell.sentenceId !== sentenceId)) {
      return baseContext;
    }

    const sentence = this.game?.getState()?.level?.sentenceMap?.[sentenceId];
    if (!sentence) {
      return baseContext;
    }

    const indices = cells.map((cell) => cell.indexInSentence);
    const isForward = indices.every((idx, i) => i === 0 || idx === indices[i - 1] + 1);
    const isReverse = indices.every((idx, i) => i === 0 || idx === indices[i - 1] - 1);

    if (!isForward && !isReverse) {
      return baseContext;
    }

    if (isForward) {
      const firstIdx = indices[0];
      const lastIdx = indices.at(-1);
      return {
        previousText: precedingCells?.length
          ? precedingCells.map((cell) => cell.word).join(" ")
          : sentence.tokens.slice(0, firstIdx).join(" "),
        nextText: sentence.tokens.slice(lastIdx + 1).join(" "),
      };
    }

    return baseContext;
  }

  #getCellContext(cell) {
    const sentence = this.game?.getState()?.level?.sentenceMap?.[cell.sentenceId];
    if (!sentence) {
      return {};
    }

    return {
      previousText: sentence.tokens.slice(0, cell.indexInSentence).join(" "),
      nextText: sentence.tokens.slice(cell.indexInSentence + 1).join(" "),
    };
  }
}

const app = new App();
app.init();
