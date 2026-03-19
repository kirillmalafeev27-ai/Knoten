import { getFallbackLevelPack } from "../data/fallback_levels.js";
import { buildLevelPrompt } from "./promptBuilder.js";

const STORAGE_KEY = "knotWords.apiUrl";

function cloneLevels(levels) {
  return levels.map((level) => ({
    ...level,
    sentences: level.sentences.map((sentence) => ({
      ...sentence,
      tokens: [...sentence.tokens],
      path: sentence.path.map((cell) => ({ ...cell })),
    })),
  }));
}

export class AnthropicLevelService {
  async generatePack(profile) {
    const fallback = cloneLevels(getFallbackLevelPack(profile.level));
    const apiUrl = this.#getApiUrl();

    if (!apiUrl) {
      return fallback;
    }

    try {
      const blueprint = this.#buildBlueprint(fallback);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          blueprint,
        }),
      });

      if (!response.ok) {
        throw new Error(`Proxy returned ${response.status}`);
      }

      const payload = await response.json();
      return this.#mergeGeneratedLevels(fallback, payload.levels ?? []);
    } catch (error) {
      console.warn("Knot Words fallback pack used:", error);
      return fallback;
    }
  }

  buildPrompt(profile, blueprint) {
    return buildLevelPrompt(profile, blueprint);
  }

  #getApiUrl() {
    const explicitUrl = window.KNOT_WORDS_API_URL || localStorage.getItem(STORAGE_KEY);
    if (explicitUrl) {
      return explicitUrl;
    }

    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
      return new URL("/api/levels", window.location.origin).toString();
    }

    return "";
  }

  #buildBlueprint(levels) {
    return levels.map((level) => ({
      id: level.id,
      size: level.size,
      sentences: level.sentences.map((sentence) => ({
        id: sentence.id,
        pathLength: sentence.path.length,
      })),
    }));
  }

  #mergeGeneratedLevels(fallback, generatedLevels) {
    return fallback.map((level, levelIndex) => {
      const generatedLevel = generatedLevels[levelIndex];
      if (!generatedLevel?.sentences) {
        return level;
      }

      const sentences = level.sentences.map((sentence, sentenceIndex) => {
        const generatedSentence = generatedLevel.sentences[sentenceIndex];

        if (
          !generatedSentence ||
          !Array.isArray(generatedSentence.tokens) ||
          generatedSentence.tokens.length !== sentence.path.length
        ) {
          return sentence;
        }

        return {
          ...sentence,
          tokens: generatedSentence.tokens,
          translation: generatedSentence.translation || sentence.translation,
          grammarNote: generatedSentence.grammar_note || sentence.grammarNote,
        };
      });

      return {
        ...level,
        id: generatedLevel.id || level.id,
        sentences,
      };
    });
  }
}
