export function getCellKey(cell) {
  return `${cell.r}:${cell.c}`;
}

export function isAdjacent(a, b) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
}

export function createRuntimeLevel(level) {
  const grid = Array.from({ length: level.size }, () => Array.from({ length: level.size }, () => null));
  const sentenceMap = {};
  const orderedCells = [];

  for (const sentence of level.sentences) {
    sentenceMap[sentence.id] = sentence;

    sentence.path.forEach((cell, index) => {
      const runtimeCell = {
        ...cell,
        key: getCellKey(cell),
        word: sentence.tokens[index],
        sentenceId: sentence.id,
        sentenceIndex: level.sentences.findIndex((item) => item.id === sentence.id),
        indexInSentence: index,
        isStart: index === 0,
        isEnd: index === sentence.tokens.length - 1,
        color: sentence.color,
        translation: sentence.translation,
        grammarNote: sentence.grammarNote,
      };

      grid[cell.r][cell.c] = runtimeCell;
      orderedCells.push(runtimeCell);
    });
  }

  return {
    ...level,
    grid,
    sentenceMap,
    orderedCells,
  };
}

export function getCell(level, r, c) {
  return level?.grid?.[r]?.[c] ?? null;
}

export function getSentence(level, sentenceId) {
  return level?.sentenceMap?.[sentenceId] ?? null;
}

export function sentenceText(sentence) {
  if (!sentence) {
    return "";
  }

  const text = sentence.tokens.join(" ").trim();
  return /[.!?]$/.test(text) ? text : `${text}.`;
}
