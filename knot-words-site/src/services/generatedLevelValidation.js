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
    return { ok: false, reason: "Missing tokens." };
  }

  if (sentence.tokens.length !== expectedLength) {
    return { ok: false, reason: `Expected ${expectedLength} tokens, got ${sentence.tokens.length}.` };
  }

  for (const token of sentence.tokens) {
    if (typeof token !== "string" || !token.trim()) {
      return { ok: false, reason: "Empty token." };
    }

    if (countWords(token) > 3) {
      return { ok: false, reason: `Token "${token}" exceeds 3 words.` };
    }
  }

  if (typeof sentence.translation !== "string" || !sentence.translation.trim()) {
    return { ok: false, reason: "Missing translation." };
  }

  if (typeof sentence.grammar_note !== "string" || !sentence.grammar_note.trim()) {
    return { ok: false, reason: "Missing grammar_note." };
  }

  return { ok: true, text: joinSentenceTokens(sentence.tokens) };
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
      return { ok: false, reason: `Level ${levelIndex + 1} has wrong sentence count.` };
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
