import { getFallbackLevelPack } from "../data/fallback_levels.js";
import { validateGeneratedSentence } from "./generatedLevelValidation.js";
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

    const blueprint = this.#buildBlueprint(fallback);
    const generatedLevels = await this.#generateLevelsIndividually(apiUrl, profile, blueprint);
    const merged = this.#mergeGeneratedLevels(fallback, generatedLevels);

    if (!generatedLevels.some(Boolean)) {
      console.warn("Knot Words fallback pack used: no generated levels passed validation.");
    }

    return merged;
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
      rows: level.rows ?? level.size,
      cols: level.cols ?? level.size,
      sentences: level.sentences.map((sentence) => ({
        id: sentence.id,
        pathLength: sentence.path.length,
      })),
    }));
  }

  async #generateLevelsIndividually(apiUrl, profile, blueprint) {
    return this.#mapWithConcurrency(blueprint, 3, async (levelBlueprint, index) => {
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              profile,
              blueprint: [levelBlueprint],
            }),
          });

          if (!response.ok) {
            const errorMessage = await this.#readErrorMessage(response);
            throw new Error(errorMessage || `Proxy returned ${response.status}`);
          }

          const payload = await response.json();
          return payload.levels?.[0] ?? null;
        } catch (error) {
          if (attempt === 2) {
            console.warn(`Generated fallback used for level ${index + 1}:`, error);
            return null;
          }
        }
      }
    });
  }

  async #mapWithConcurrency(items, concurrency, worker) {
    const results = Array.from({ length: items.length }, () => null);
    let cursor = 0;

    const runWorker = async () => {
      while (cursor < items.length) {
        const currentIndex = cursor;
        cursor += 1;
        results[currentIndex] = await worker(items[currentIndex], currentIndex);
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker())
    );

    return results;
  }

  async #readErrorMessage(response) {
    try {
      const payload = await response.clone().json();
      return payload?.error || payload?.message || "";
    } catch {
      try {
        return await response.text();
      } catch {
        return "";
      }
    }
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

        const validation = validateGeneratedSentence(generatedSentence, sentence.path.length);
        if (!validation.ok) {
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
