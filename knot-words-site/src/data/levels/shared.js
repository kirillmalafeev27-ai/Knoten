const BASE_LAYOUTS = Object.freeze({
  3: [
    [
      { r: 0, c: 0 },
      { r: 0, c: 1 },
      { r: 1, c: 1 },
    ],
    [
      { r: 0, c: 2 },
      { r: 1, c: 2 },
      { r: 2, c: 2 },
    ],
    [
      { r: 1, c: 0 },
      { r: 2, c: 0 },
      { r: 2, c: 1 },
    ],
  ],
  4: [
    [
      { r: 0, c: 0 },
      { r: 0, c: 1 },
      { r: 1, c: 1 },
      { r: 1, c: 0 },
    ],
    [
      { r: 0, c: 2 },
      { r: 0, c: 3 },
      { r: 1, c: 3 },
      { r: 1, c: 2 },
    ],
    [
      { r: 2, c: 0 },
      { r: 2, c: 1 },
      { r: 3, c: 1 },
      { r: 3, c: 0 },
    ],
    [
      { r: 2, c: 2 },
      { r: 2, c: 3 },
      { r: 3, c: 3 },
      { r: 3, c: 2 },
    ],
  ],
  5: [
    [
      { r: 0, c: 0 },
      { r: 0, c: 1 },
      { r: 0, c: 2 },
      { r: 1, c: 2 },
      { r: 1, c: 3 },
    ],
    [
      { r: 0, c: 3 },
      { r: 0, c: 4 },
      { r: 1, c: 4 },
      { r: 2, c: 4 },
      { r: 3, c: 4 },
    ],
    [
      { r: 1, c: 0 },
      { r: 1, c: 1 },
      { r: 2, c: 1 },
      { r: 2, c: 2 },
      { r: 2, c: 3 },
    ],
    [
      { r: 2, c: 0 },
      { r: 3, c: 0 },
      { r: 4, c: 0 },
      { r: 4, c: 1 },
      { r: 4, c: 2 },
    ],
    [
      { r: 3, c: 1 },
      { r: 3, c: 2 },
      { r: 3, c: 3 },
      { r: 4, c: 3 },
      { r: 4, c: 4 },
    ],
  ],
  6: [
    [
      { r: 0, c: 0 },
      { r: 0, c: 1 },
      { r: 0, c: 2 },
      { r: 1, c: 2 },
      { r: 1, c: 1 },
      { r: 1, c: 0 },
    ],
    [
      { r: 0, c: 3 },
      { r: 0, c: 4 },
      { r: 0, c: 5 },
      { r: 1, c: 5 },
      { r: 1, c: 4 },
      { r: 1, c: 3 },
    ],
    [
      { r: 2, c: 0 },
      { r: 2, c: 1 },
      { r: 2, c: 2 },
      { r: 3, c: 2 },
      { r: 3, c: 1 },
      { r: 3, c: 0 },
    ],
    [
      { r: 2, c: 3 },
      { r: 2, c: 4 },
      { r: 2, c: 5 },
      { r: 3, c: 5 },
      { r: 3, c: 4 },
      { r: 3, c: 3 },
    ],
    [
      { r: 4, c: 0 },
      { r: 4, c: 1 },
      { r: 4, c: 2 },
      { r: 5, c: 2 },
      { r: 5, c: 1 },
      { r: 5, c: 0 },
    ],
    [
      { r: 4, c: 3 },
      { r: 4, c: 4 },
      { r: 4, c: 5 },
      { r: 5, c: 5 },
      { r: 5, c: 4 },
      { r: 5, c: 3 },
    ],
  ],
  7: [
    [
      { r: 0, c: 0 },
      { r: 0, c: 1 },
      { r: 0, c: 2 },
      { r: 0, c: 3 },
      { r: 0, c: 4 },
      { r: 0, c: 5 },
      { r: 0, c: 6 },
    ],
    [
      { r: 1, c: 6 },
      { r: 1, c: 5 },
      { r: 1, c: 4 },
      { r: 1, c: 3 },
      { r: 1, c: 2 },
      { r: 1, c: 1 },
      { r: 1, c: 0 },
    ],
    [
      { r: 2, c: 0 },
      { r: 2, c: 1 },
      { r: 2, c: 2 },
      { r: 2, c: 3 },
      { r: 2, c: 4 },
      { r: 2, c: 5 },
      { r: 2, c: 6 },
    ],
    [
      { r: 3, c: 6 },
      { r: 3, c: 5 },
      { r: 3, c: 4 },
      { r: 3, c: 3 },
      { r: 3, c: 2 },
      { r: 3, c: 1 },
      { r: 3, c: 0 },
    ],
    [
      { r: 4, c: 0 },
      { r: 4, c: 1 },
      { r: 4, c: 2 },
      { r: 4, c: 3 },
      { r: 4, c: 4 },
      { r: 4, c: 5 },
      { r: 4, c: 6 },
    ],
    [
      { r: 5, c: 6 },
      { r: 5, c: 5 },
      { r: 5, c: 4 },
      { r: 5, c: 3 },
      { r: 5, c: 2 },
      { r: 5, c: 1 },
      { r: 5, c: 0 },
    ],
    [
      { r: 6, c: 0 },
      { r: 6, c: 1 },
      { r: 6, c: 2 },
      { r: 6, c: 3 },
      { r: 6, c: 4 },
      { r: 6, c: 5 },
      { r: 6, c: 6 },
    ],
  ],
});

function clonePath(path) {
  return path.map((cell) => ({ ...cell }));
}

function countWords(token) {
  return String(token).trim().split(/\s+/).filter(Boolean).length;
}

function getLevelSize(rows, cols, fallback = null) {
  if (typeof rows === "number" && typeof cols === "number") {
    if (rows !== cols) {
      return Math.max(rows, cols);
    }

    return rows;
  }

  if (typeof fallback === "number") {
    return fallback;
  }

  throw new Error("Could not resolve level size.");
}

function transformCell(cell, size, variant) {
  switch (variant) {
    case "rotate-90":
      return { r: cell.c, c: size - 1 - cell.r };
    case "rotate-180":
      return { r: size - 1 - cell.r, c: size - 1 - cell.c };
    case "rotate-270":
      return { r: size - 1 - cell.c, c: cell.r };
    case "mirror-x":
      return { r: size - 1 - cell.r, c: cell.c };
    case "mirror-y":
      return { r: cell.r, c: size - 1 - cell.c };
    default:
      return { ...cell };
  }
}

export function buildPaths(size, variant = "identity") {
  const base = BASE_LAYOUTS[size];
  if (!base) {
    throw new Error(`Unsupported level size: ${size}`);
  }

  return base.map((path) => clonePath(path).map((cell) => transformCell(cell, size, variant)));
}

function normalizePaths(paths) {
  return paths.map((path) => clonePath(path));
}

function validateResolvedPaths(levelId, rows, cols, paths) {
  const occupied = new Set();

  paths.forEach((path, pathIndex) => {
    if (!Array.isArray(path) || path.length === 0) {
      throw new Error(`Path ${pathIndex + 1} in level "${levelId}" is empty.`);
    }

    path.forEach((cell, cellIndex) => {
      if (
        typeof cell?.r !== "number" ||
        typeof cell?.c !== "number" ||
        cell.r < 0 ||
        cell.r >= rows ||
        cell.c < 0 ||
        cell.c >= cols
      ) {
        throw new Error(`Cell ${cellIndex + 1} of path ${pathIndex + 1} in level "${levelId}" is out of bounds.`);
      }

      if (cellIndex > 0) {
        const prev = path[cellIndex - 1];
        const distance = Math.abs(prev.r - cell.r) + Math.abs(prev.c - cell.c);
        if (distance !== 1) {
          throw new Error(`Path ${pathIndex + 1} in level "${levelId}" is not contiguous.`);
        }
      }

      const key = `${cell.r}:${cell.c}`;
      if (occupied.has(key)) {
        throw new Error(`Cell ${key} is used more than once in level "${levelId}".`);
      }

      occupied.add(key);
    });
  });

  if (occupied.size !== rows * cols) {
    throw new Error(`Level "${levelId}" does not cover the full ${rows}x${cols} grid.`);
  }
}

function applyPathTransforms(paths, pathOrder = null, reversePaths = []) {
  const ordered = Array.isArray(pathOrder)
    ? pathOrder.map((index) => {
      if (!paths[index]) {
        throw new Error(`Invalid path index ${index} in pathOrder.`);
      }

      return clonePath(paths[index]);
    })
    : paths.map((path) => clonePath(path));

  const reversed = new Set(reversePaths);
  return ordered.map((path, index) => (reversed.has(index) ? [...path].reverse() : path));
}

export function createLevel({
  id,
  title,
  level,
  topic,
  size,
  rows = size,
  cols = size,
  transform = "identity",
  pathOrder = null,
  reversePaths = [],
  paths = null,
  sentences,
}) {
  const resolvedRows = typeof rows === "number" ? rows : size;
  const resolvedCols = typeof cols === "number" ? cols : size;
  if (typeof resolvedRows !== "number" || typeof resolvedCols !== "number") {
    throw new Error(`Level "${id}" must define rows and cols.`);
  }

  const resolvedPaths = paths
    ? normalizePaths(paths)
    : applyPathTransforms(buildPaths(size, transform), pathOrder, reversePaths);

  if (!Array.isArray(sentences) || sentences.length !== resolvedPaths.length) {
    throw new Error(`Level "${id}" must provide ${resolvedPaths.length} sentences.`);
  }

  validateResolvedPaths(id, resolvedRows, resolvedCols, resolvedPaths);

  const normalizedSentences = sentences.map((sentence, index) => {
    if (!Array.isArray(sentence.tokens) || sentence.tokens.length !== resolvedPaths[index].length) {
      throw new Error(
        `Sentence ${index + 1} in level "${id}" must contain ${resolvedPaths[index].length} tokens.`
      );
    }

    sentence.tokens.forEach((token, tokenIndex) => {
      if (typeof token !== "string" || !token.trim()) {
        throw new Error(`Token ${tokenIndex + 1} in sentence ${index + 1} of level "${id}" is empty.`);
      }

      if (countWords(token) > 3) {
        throw new Error(`Token "${token}" in level "${id}" exceeds 3 words.`);
      }
    });

    return {
      id: sentence.id ?? `s${index + 1}`,
      color: sentence.color,
      tokens: sentence.tokens,
      translation: sentence.translation,
      grammarNote: sentence.grammarNote,
      path: resolvedPaths[index],
    };
  });

  return {
    id,
    title,
    level,
    topic,
    size: getLevelSize(resolvedRows, resolvedCols, size),
    rows: resolvedRows,
    cols: resolvedCols,
    sentences: normalizedSentences,
  };
}
