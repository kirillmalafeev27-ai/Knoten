import { getFallbackLevelPack } from "../src/data/fallback_levels.js";

const LEVEL_NAMES = ["A1", "A2", "B1", "B2"];

function countWords(token) {
  return String(token).trim().split(/\s+/).filter(Boolean).length;
}

for (const levelName of LEVEL_NAMES) {
  const pack = getFallbackLevelPack(levelName);
  for (const level of pack) {
    for (const sentence of level.sentences) {
      for (const token of sentence.tokens) {
        const words = countWords(token);
        if (words > 3) {
          throw new Error(`${level.id}: token "${token}" has ${words} words`);
        }
      }
    }
  }
}

console.log("FALLBACK_LEVELS_OK");
