import { FALLBACK_LEVELS } from "./src/data/fallback_levels.js";

for (const [levelCode, pack] of Object.entries(FALLBACK_LEVELS)) {
  console.log(`${levelCode}:${pack.length}`);
  pack.forEach((level) => {
    const rows = level.rows ?? level.size;
    const cols = level.cols ?? level.size;
    const cells = level.sentences.reduce((sum, sentence) => sum + sentence.path.length, 0);
    console.log(`  ${level.id} ${rows}x${cols} sentences=${level.sentences.length} cells=${cells}`);
  });
}
