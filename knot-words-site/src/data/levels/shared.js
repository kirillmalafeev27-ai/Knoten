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
});

function clonePath(path) {
  return path.map((cell) => ({ ...cell }));
}

function countWords(token) {
  return String(token).trim().split(/\s+/).filter(Boolean).length;
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

export function createLevel({ id, title, level, topic, size, transform = "identity", sentences }) {
  if (!Array.isArray(sentences) || sentences.length !== size) {
    throw new Error(`Level "${id}" must provide ${size} sentences.`);
  }

  const paths = buildPaths(size, transform);
  const normalizedSentences = sentences.map((sentence, index) => {
    if (!Array.isArray(sentence.tokens) || sentence.tokens.length !== size) {
      throw new Error(`Sentence ${index + 1} in level "${id}" must contain ${size} tokens.`);
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
      path: paths[index],
    };
  });

  return {
    id,
    title,
    level,
    topic,
    size,
    sentences: normalizedSentences,
  };
}
