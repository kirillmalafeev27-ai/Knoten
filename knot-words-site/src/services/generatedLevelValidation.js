const BAD_ENDINGS = new Set([
  "aber",
  "am",
  "an",
  "auf",
  "aus",
  "bei",
  "bis",
  "dass",
  "dem",
  "den",
  "der",
  "des",
  "die",
  "dir",
  "doch",
  "du",
  "ein",
  "eine",
  "einem",
  "einen",
  "einer",
  "eines",
  "er",
  "es",
  "falls",
  "für",
  "gegen",
  "hinter",
  "ich",
  "ihr",
  "im",
  "in",
  "ins",
  "mein",
  "meine",
  "meinem",
  "meinen",
  "mit",
  "nach",
  "neben",
  "obwohl",
  "oder",
  "ohne",
  "sie",
  "und",
  "unter",
  "über",
  "vom",
  "von",
  "vor",
  "wann",
  "weil",
  "wenn",
  "wer",
  "wie",
  "wir",
  "wo",
  "wobei",
  "zu",
  "zum",
  "zur",
]);

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function joinSentenceTokens(tokens) {
  return tokens
    .join(" ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function validateGeneratedSentence(sentence, expectedLength) {
  if (!sentence || !Array.isArray(sentence.tokens)) {
    return { ok: false, reason: "Sentence is missing tokens." };
  }

  if (sentence.tokens.length !== expectedLength) {
    return { ok: false, reason: `Expected ${expectedLength} tokens, got ${sentence.tokens.length}.` };
  }

  for (const token of sentence.tokens) {
    if (typeof token !== "string" || !token.trim()) {
      return { ok: false, reason: "Encountered an empty token." };
    }

    if (countWords(token) > 3) {
      return { ok: false, reason: `Token "${token}" is too long for cell audio.` };
    }

    if (token.trim().length > 32) {
      return { ok: false, reason: `Token "${token}" is too long in characters.` };
    }
  }

  if (typeof sentence.translation !== "string" || sentence.translation.trim().length < 4) {
    return { ok: false, reason: "Translation is missing or too short." };
  }

  if (typeof sentence.grammar_note !== "string" || sentence.grammar_note.trim().length < 6) {
    return { ok: false, reason: "Grammar note is missing or too short." };
  }

  const text = joinSentenceTokens(sentence.tokens);
  if (!/[.!?]$/.test(text)) {
    return { ok: false, reason: `Sentence "${text}" does not end with punctuation.` };
  }

  if (text.includes("...")) {
    return { ok: false, reason: `Sentence "${text}" contains ellipsis.` };
  }

  if (text.length < expectedLength * 4) {
    return { ok: false, reason: `Sentence "${text}" is suspiciously short.` };
  }

  const clauses = text.split(",").map((part) => part.trim()).filter(Boolean);
  if (clauses.some((clause) => countWords(clause) < 2)) {
    return { ok: false, reason: `Sentence "${text}" contains a broken clause.` };
  }

  const finalWord = text
    .replace(/[.!?]+$/g, "")
    .trim()
    .split(/\s+/)
    .at(-1)
    ?.toLowerCase();

  if (!finalWord || BAD_ENDINGS.has(finalWord)) {
    return { ok: false, reason: `Sentence "${text}" ends like a fragment.` };
  }

  return { ok: true, text };
}

export function validateGeneratedLevelPack(levels, blueprint) {
  if (!Array.isArray(levels)) {
    return { ok: false, reason: "Generated payload must include levels." };
  }

  for (const [levelIndex, level] of levels.entries()) {
    const schema = blueprint[levelIndex];
    if (!schema) {
      continue;
    }

    if (!Array.isArray(level.sentences) || level.sentences.length !== schema.sentences.length) {
      return { ok: false, reason: `Generated level ${levelIndex + 1} has an invalid sentence count.` };
    }

    for (const [sentenceIndex, sentence] of level.sentences.entries()) {
      const expectedLength = schema.sentences[sentenceIndex]?.pathLength;
      const result = validateGeneratedSentence(sentence, expectedLength);
      if (!result.ok) {
        return {
          ok: false,
          reason: `Level ${levelIndex + 1}, sentence ${sentenceIndex + 1}: ${result.reason}`,
        };
      }
    }
  }

  return { ok: true };
}
