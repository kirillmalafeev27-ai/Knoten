import { A1_LEVELS } from "./levels/a1_levels.js";
import { A2_LEVELS } from "./levels/a2_levels.js";
import { B1_LEVELS } from "./levels/b1_levels.js";
import { B2_LEVELS } from "./levels/b2_levels.js";
import { extendLevelPack } from "./levels/extra_levels.js";

export const FALLBACK_LEVELS = Object.freeze({
  A1: extendLevelPack("A1", A1_LEVELS),
  A2: extendLevelPack("A2", A2_LEVELS),
  B1: extendLevelPack("B1", B1_LEVELS),
  B2: extendLevelPack("B2", B2_LEVELS),
});

export function getFallbackLevelPack(level) {
  return FALLBACK_LEVELS[level] ?? A1_LEVELS;
}
