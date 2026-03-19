import { createRuntimeLevel, isAdjacent, sentenceText } from "./GridLogic.js";
import { getProgress, hasWon } from "./WinChecker.js";

const DRAFT_COLOR = "#818CF8";

export class GameEngine {
  constructor({ levels, profile, callbacks = {} }) {
    this.levels = levels;
    this.profile = profile;
    this.callbacks = callbacks;
    this.state = null;
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
      draftPath: {
        color: DRAFT_COLOR,
        cells: [],
      },
      active: {
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

    if (this.#isCellInCompletedPath(cell.key)) {
      return;
    }

    const draft = this.state.draftPath;
    const existingIndex = draft.cells.findIndex((entry) => entry.key === cell.key);

    if (existingIndex !== -1) {
      this.#markCellsRespeakable(draft.cells.slice(existingIndex + 1));
      draft.cells = draft.cells.slice(0, existingIndex + 1);
      this.state.active.dragging = true;
      this.state.respeakableCellKeys.delete(cell.key);
      this.#emitPathEvent("trim", cell, draft, null);
      this.#emitStateChange();
      return;
    }

    if (draft.cells.length > 0) {
      this.#markCellsRespeakable(draft.cells);
    }

    draft.cells = [cell];
    this.state.active.dragging = true;
    this.state.respeakableCellKeys.delete(cell.key);
    this.#emitPathEvent("start", cell, draft, null);
    this.#emitStateChange();
  }

  handlePointerMove(cell) {
    if (!cell) {
      return;
    }

    if (!this.state.active.dragging || this.state.won) {
      this.setHoverCell(cell);
      return;
    }

    const draft = this.state.draftPath;
    const lastCell = draft.cells.at(-1);

    if (!lastCell || cell.key === lastCell.key) {
      return;
    }

    if (!isAdjacent(lastCell, cell)) {
      return;
    }

    if (this.#isCellInCompletedPath(cell.key)) {
      return;
    }

    if (draft.cells.length > 1) {
      const previousCell = draft.cells.at(-2);
      if (previousCell?.key === cell.key) {
        this.#markCellsRespeakable(draft.cells.slice(-1));
        draft.cells = draft.cells.slice(0, -1);
        this.#emitPathEvent("rewind", cell, draft, null);
        this.#emitStateChange();
        return;
      }
    }

    const existingIndex = draft.cells.findIndex((entry) => entry.key === cell.key);
    if (existingIndex !== -1) {
      this.#markCellsRespeakable(draft.cells.slice(existingIndex + 1));
      draft.cells = draft.cells.slice(0, existingIndex + 1);
      this.#emitPathEvent("trim", cell, draft, null);
      this.#emitStateChange();
      return;
    }

    this.state.respeakableCellKeys.delete(cell.key);
    draft.cells = [...draft.cells, cell];
    this.#emitPathEvent("advance", cell, draft, null);
    this.#emitStateChange();
  }

  handlePointerUp() {
    if (!this.state) {
      return;
    }

    this.state.active.dragging = false;
    const match = this.#findSentenceMatch(this.state.draftPath.cells);

    if (match) {
      const pathState = this.state.paths[match.id];
      pathState.cells = [...this.state.draftPath.cells];
      pathState.complete = true;
      pathState.completedAt = performance.now();
      this.state.draftPath.cells = [];
      this.#emitPathEvent("complete", pathState.cells.at(-1), pathState, match);
      this.#emitStateChange();

      if (hasWon(this.state)) {
        this.state.won = true;
        this.#emitWin();
      }

      return;
    }

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

  #isCellInCompletedPath(cellKey) {
    return Object.values(this.state.paths).some(
      (pathState) => pathState.complete && pathState.cells.some((cell) => cell.key === cellKey)
    );
  }

  #findSentenceMatch(cells) {
    if (!cells.length) {
      return null;
    }

    return this.state.level.sentences.find((sentence) => {
      const pathState = this.state.paths[sentence.id];
      if (pathState.complete || sentence.path.length !== cells.length) {
        return false;
      }

      const forward = sentence.path.every((cell, index) => (
        cell.r === cells[index].r && cell.c === cells[index].c
      ));

      const reverse = sentence.path.every((cell, index) => {
        const reversedCell = cells[cells.length - 1 - index];
        return cell.r === reversedCell.r && cell.c === reversedCell.c;
      });

      return forward || reverse;
    }) ?? null;
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

  #emitPathEvent(type, cell, pathState, sentence) {
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
