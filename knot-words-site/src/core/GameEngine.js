import { GRAMMAR_HINTS } from "../data/grammar_hints.js";
import { canMoveTo, canStartAt } from "./PathValidator.js";
import { createRuntimeLevel, sentenceText } from "./GridLogic.js";
import { getProgress, hasWon } from "./WinChecker.js";

export class GameEngine {
  constructor({ levels, profile, callbacks = {} }) {
    this.levels = levels;
    this.profile = profile;
    this.callbacks = callbacks;
    this.state = null;
    this.lastInvalidSignature = "";
    this.loadLevel(0);
  }

  getState() {
    return this.state;
  }

  getUiSnapshot() {
    if (!this.state) {
      return {
        levelIndex: 0,
        totalLevels: 0,
        progressRatio: 0,
        topicLabel: "Sentence Paths",
        canGoPrev: false,
        canGoNext: false,
        isGameVisible: false,
      };
    }

    const progress = getProgress(this.state);
    return {
      levelIndex: this.state.levelIndex,
      totalLevels: this.levels.length,
      progressRatio: progress.totalSentences ? progress.completedSentences / progress.totalSentences : 0,
      topicLabel: this.profile.topic,
      canGoPrev: this.state.levelIndex > 0,
      canGoNext: this.state.levelIndex < this.levels.length - 1,
      isGameVisible: true,
    };
  }

  loadLevel(index) {
    const runtimeLevel = createRuntimeLevel(this.levels[index]);
    const paths = {};

    runtimeLevel.sentences.forEach((sentence) => {
      paths[sentence.id] = {
        sentenceId: sentence.id,
        color: sentence.color,
        cells: [],
        complete: false,
        completedAt: 0,
      };
    });

    this.state = {
      profile: this.profile,
      levelIndex: index,
      level: runtimeLevel,
      paths,
      active: {
        sentenceId: null,
        dragging: false,
      },
      ui: {
        hintsUsed: 0,
        stars: 3,
        startTime: performance.now(),
      },
      hoverCellKey: null,
      respeakableCellKeys: new Set(),
      invalid: null,
      won: false,
      introStartedAt: performance.now(),
    };

    this.lastInvalidSignature = "";
    this.#emitLevelLoaded();
    this.#emitStateChange();
  }

  resetLevel() {
    this.loadLevel(this.state.levelIndex);
  }

  nextLevel() {
    if (this.state.levelIndex >= this.levels.length - 1) {
      this.loadLevel(0);
      return;
    }

    this.loadLevel(this.state.levelIndex + 1);
  }

  prevLevel() {
    if (this.state.levelIndex <= 0) {
      return;
    }

    this.loadLevel(this.state.levelIndex - 1);
  }

  setHoverCell(cell) {
    const nextKey = cell?.key ?? null;
    if (this.state.hoverCellKey === nextKey) {
      return;
    }

    this.state.hoverCellKey = nextKey;
    if (!this.state.active.dragging && cell && this.state.respeakableCellKeys.has(cell.key)) {
      this.callbacks.onCellReplay?.({ cell });
    }
  }

  clearHover() {
    this.state.hoverCellKey = null;
  }

  handlePointerDown(cell) {
    if (!cell || this.state.won) {
      return;
    }

    this.#clearInvalid();
    const pathState = this.state.paths[cell.sentenceId];
    const existingIndex = pathState.cells.findIndex((item) => item.key === cell.key);

    if (existingIndex !== -1) {
      this.#markCellsRespeakable(pathState.cells.slice(existingIndex + 1));
      pathState.cells = pathState.cells.slice(0, existingIndex + 1);
      pathState.complete = false;
      pathState.completedAt = 0;
      this.state.active.sentenceId = cell.sentenceId;
      this.state.active.dragging = true;
      this.state.respeakableCellKeys.delete(cell.key);
      this.#emitPathEvent("trim", cell, pathState);
      this.#emitStateChange();
      return;
    }

    if (cell.isStart) {
      this.#markCellsRespeakable(pathState.cells.slice(1));
      pathState.cells = [cell];
      pathState.complete = false;
      pathState.completedAt = 0;
      this.state.active.sentenceId = cell.sentenceId;
      this.state.active.dragging = true;
      this.state.respeakableCellKeys.delete(cell.key);
      this.#emitPathEvent("start", cell, pathState);
      this.#emitStateChange();
      return;
    }

    const startCheck = canStartAt(cell);
    if (!startCheck.ok) {
      this.#reject(startCheck.reason, cell);
    }
  }

  handlePointerMove(cell) {
    if (!cell) {
      return;
    }

    if (!this.state.active.dragging || this.state.won) {
      this.setHoverCell(cell);
      return;
    }

    const activeSentenceId = this.state.active.sentenceId;
    const pathState = this.state.paths[activeSentenceId];
    const lastCell = pathState.cells.at(-1);

    if (!lastCell || cell.key === lastCell.key) {
      return;
    }

    const result = canMoveTo(this.state, cell);
    if (!result.ok) {
      this.#reject(result.reason, cell);
      return;
    }

    this.#clearInvalid();

    if (result.kind === "rewind" || result.kind === "trim") {
      this.#markCellsRespeakable(pathState.cells.slice(result.trimTo));
      pathState.cells = pathState.cells.slice(0, result.trimTo);
      pathState.complete = false;
      pathState.completedAt = 0;
      this.#emitPathEvent(result.kind, cell, pathState);
      this.#emitStateChange();
      return;
    }

    this.state.respeakableCellKeys.delete(cell.key);
    pathState.cells = [...pathState.cells, cell];

    if (result.kind === "complete") {
      pathState.complete = true;
      pathState.completedAt = performance.now();
      this.#emitPathEvent("complete", cell, pathState);
      this.#emitStateChange();

      if (hasWon(this.state)) {
        this.state.won = true;
        this.#emitWin();
      }

      return;
    }

    this.#emitPathEvent("advance", cell, pathState);
    this.#emitStateChange();
  }

  handlePointerUp() {
    if (!this.state) {
      return;
    }

    this.state.active.dragging = false;
    this.state.active.sentenceId = null;
    this.#emitStateChange();
  }

  getSentenceReview() {
    return this.state.level.sentences.map((sentence) => ({
      id: sentence.id,
      color: sentence.color,
      text: sentenceText(sentence),
      translation: sentence.translation,
    }));
  }

  #reject(reason, cell) {
    const signature = `${reason}:${cell.key}`;
    if (this.lastInvalidSignature === signature) {
      return;
    }

    this.lastInvalidSignature = signature;
    this.state.invalid = {
      key: cell.key,
      reason,
      at: performance.now(),
    };

    if (typeof navigator.vibrate === "function") {
      navigator.vibrate(28);
    }

    this.callbacks.onInvalidMove?.({
      reason,
      hint: GRAMMAR_HINTS[reason] ?? GRAMMAR_HINTS.default,
      cell,
    });

    this.#emitStateChange();
  }

  #clearInvalid() {
    this.lastInvalidSignature = "";
    this.state.invalid = null;
  }

  #markCellsRespeakable(cells) {
    cells.forEach((cell) => {
      this.state.respeakableCellKeys.add(cell.key);
    });
  }

  #emitLevelLoaded() {
    this.callbacks.onLevelLoaded?.({
      state: this.state,
      ui: this.getUiSnapshot(),
      progress: getProgress(this.state),
    });
  }

  #emitStateChange() {
    this.callbacks.onStateChange?.({
      state: this.state,
      ui: this.getUiSnapshot(),
      progress: getProgress(this.state),
    });
  }

  #emitPathEvent(type, cell, pathState) {
    const sentence = this.state.level.sentenceMap[pathState.sentenceId];
    this.callbacks.onPathEvent?.({
      type,
      cell,
      sentence,
      pathState: {
        ...pathState,
        cells: [...pathState.cells],
      },
      progress: getProgress(this.state),
    });
  }

  #emitWin() {
    this.callbacks.onWin?.({
      state: this.state,
      ui: this.getUiSnapshot(),
      progress: getProgress(this.state),
      review: this.getSentenceReview(),
      isLastLevel: this.state.levelIndex === this.levels.length - 1,
    });
  }
}
