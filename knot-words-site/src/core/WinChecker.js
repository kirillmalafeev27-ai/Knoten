export function getProgress(state) {
  const pathStates = Object.values(state.paths);
  const completedSentences = pathStates.filter((pathState) => pathState.complete).length;
  const coveredCells = pathStates.reduce((sum, pathState) => sum + pathState.cells.length, 0);

  return {
    totalSentences: pathStates.length,
    completedSentences,
    coveredCells,
    totalCells: state.level.size * state.level.size,
  };
}

export function hasWon(state) {
  const progress = getProgress(state);
  return (
    progress.completedSentences === progress.totalSentences &&
    progress.coveredCells === progress.totalCells
  );
}
