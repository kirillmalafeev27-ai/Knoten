import { getCellKey, getSentence, isAdjacent } from "./GridLogic.js";

export function canStartAt(cell) {
  if (!cell) {
    return { ok: false, reason: "default" };
  }

  if (!cell.isStart) {
    return { ok: false, reason: "non_start" };
  }

  return { ok: true };
}

function isOccupiedByOtherPath(state, cellKey, activeSentenceId) {
  return Object.values(state.paths).some((pathState) => {
    if (pathState.sentenceId === activeSentenceId) {
      return false;
    }

    return pathState.cells.some((cell) => getCellKey(cell) === cellKey);
  });
}

export function canMoveTo(state, targetCell) {
  const activeSentenceId = state.active.sentenceId;
  if (!activeSentenceId) {
    return { ok: false, reason: "default" };
  }

  const pathState = state.paths[activeSentenceId];
  const currentPath = pathState.cells;
  const lastCell = currentPath.at(-1);

  if (!lastCell) {
    return { ok: false, reason: "default" };
  }

  if (!isAdjacent(lastCell, targetCell)) {
    return { ok: false, reason: "not_adjacent" };
  }

  if (currentPath.length > 1) {
    const previousCell = currentPath.at(-2);
    if (previousCell && previousCell.key === targetCell.key) {
      return {
        ok: true,
        kind: "rewind",
        trimTo: currentPath.length - 1,
      };
    }
  }

  const existingIndex = currentPath.findIndex((cell) => cell.key === targetCell.key);
  if (existingIndex !== -1) {
    return {
      ok: true,
      kind: "trim",
      trimTo: existingIndex + 1,
    };
  }

  if (targetCell.sentenceId !== activeSentenceId) {
    return { ok: false, reason: "wrong_sentence" };
  }

  const nextIndex = currentPath.length;
  if (targetCell.indexInSentence !== nextIndex) {
    return { ok: false, reason: "wrong_order" };
  }

  if (isOccupiedByOtherPath(state, targetCell.key, activeSentenceId)) {
    return { ok: false, reason: "crossing" };
  }

  const sentence = getSentence(state.level, activeSentenceId);
  const finalIndex = sentence.tokens.length - 1;

  return {
    ok: true,
    kind: targetCell.indexInSentence === finalIndex ? "complete" : "advance",
  };
}
