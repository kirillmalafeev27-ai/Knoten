import { getFallbackLevelPack } from "../data/fallback_levels.js";

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
    return cloneLevels(getFallbackLevelPack(profile.level));
  }
}
