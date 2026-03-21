import { getFallbackLevelPack } from "../data/fallback_levels.js";
import { validateGeneratedSentence } from "./generatedLevelValidation.js";
import { buildLevelPrompt } from "./promptBuilder.js";

const STORAGE_KEY = "knotWords.apiUrl";
const MAX_GENERATABLE_DIMENSION = 7;

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
      console.info("Knot Words: no API URL configured, using fallback levels.");
      return fallback;
    }

    const generatableIndices = [];
    const blueprint = [];

    for (let i = 0; i < fallback.length; i++) {
      const level = fallback[i];
      const maxDim = Math.max(level.rows ?? level.size, level.cols ?? level.size);
      if (maxDim <= MAX_GENERATABLE_DIMENSION) {
        generatableIndices.push(i);
        blueprint.push(this.#buildLevelBlueprint(level));
      }
    }

    if (blueprint.length === 0) {
      console.info("Knot Words: no generatable levels in pack, using fallback.");
      return fallback;
    }

    const generatedLevels = await this.#generateWithRetry(apiUrl, profile, blueprint);

    if (!generatedLevels.length) {
      console.warn("Knot Words: AI generation failed after retries, using fallback for all levels.");
      return fallback;
    }

    return this.#mergeGeneratedLevels(fallback, generatableIndices, generatedLevels);
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

  #buildLevelBlueprint(level) {
    return {
      id: level.id,
      size: level.size,
      rows: level.rows ?? level.size,
      cols: level.cols ?? level.size,
      sentences: level.sentences.map((sentence) => ({
        id: sentence.id,
        pathLength: sentence.path.length,
      })),
    };
  }

  async #generateWithRetry(apiUrl, profile, blueprint, maxAttempts = 3) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile, blueprint }),
        });

        if (!response.ok) {
          const errorMessage = await this.#readErrorMessage(response);
          throw new Error(errorMessage || `Server returned ${response.status}`);
        }

        const payload = await response.json();
        const levels = payload.levels;

        if (Array.isArray(levels) && levels.length > 0) {
          console.info(`Knot Words: AI generated ${levels.length} levels on attempt ${attempt}.`);
          return levels;
        }

        throw new Error("Server returned empty levels array");
      } catch (error) {
        console.warn(`Knot Words: generation attempt ${attempt}/${maxAttempts} failed:`, error.message);
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    return [];
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

  #mergeGeneratedLevels(fallback, generatableIndices, generatedLevels) {
    const result = [...fallback];
    let totalMerged = 0;
    let totalFallback = 0;

    for (let gi = 0; gi < generatableIndices.length; gi++) {
      const fallbackIndex = generatableIndices[gi];
      const fallbackLevel = result[fallbackIndex];
      const generatedLevel = generatedLevels[gi];

      if (!generatedLevel?.sentences) {
        totalFallback += fallbackLevel.sentences.length;
        continue;
      }

      const sentences = fallbackLevel.sentences.map((sentence, si) => {
        const generated = generatedLevel.sentences[si];

        if (!generated || !Array.isArray(generated.tokens) || generated.tokens.length !== sentence.path.length) {
          console.warn(
            `Level ${fallbackIndex + 1}, sentence ${si + 1}: token count mismatch ` +
            `(expected ${sentence.path.length}, got ${generated?.tokens?.length ?? "none"}), using fallback.`
          );
          totalFallback++;
          return sentence;
        }

        const validation = validateGeneratedSentence(generated, sentence.path.length);
        if (!validation.ok) {
          console.warn(
            `Level ${fallbackIndex + 1}, sentence ${si + 1} rejected: ${validation.reason}`,
            generated
          );
          totalFallback++;
          return sentence;
        }

        totalMerged++;
        return {
          ...sentence,
          tokens: generated.tokens,
          translation: generated.translation || sentence.translation,
          grammarNote: generated.grammar_note || sentence.grammarNote,
        };
      });

      result[fallbackIndex] = {
        ...fallbackLevel,
        id: generatedLevel.id || fallbackLevel.id,
        sentences,
      };
    }

    console.info(`Knot Words: merged ${totalMerged} AI sentences, ${totalFallback} used fallback.`);
    return result;
  }
}
