import { toRgba } from "../data/palette.js";

export function drawWordCell(ctx, {
  cell,
  x,
  y,
  cellSize,
  time,
  intro,
  occupied,
  activeSentence,
  activeCell,
  complete,
  hover,
  replayable,
  invalid,
  completionAge,
}) {
  const pathColor = cell.color;
  const activeScale = activeCell ? 1.032 : hover ? 1.012 : 1;
  const completionPulse = complete
    ? 1 + Math.max(0, 1 - completionAge / 340) * 0.06
    : 1;
  const breathe = 0.972 + Math.sin(time * 1.8 + cell.r * 0.7 + cell.c * 1.1) * 0.028;
  const scale = intro * activeScale * completionPulse * breathe;
  const half = cellSize * 0.43;
  const frameAlpha = hover ? 0.04 : replayable ? 0.028 : 0.012;
  const backgroundAlpha = invalid
    ? 0.16
    : complete
      ? 0.12
      : activeSentence
        ? 0.08
        : occupied
          ? 0.05
          : 0.012;
  const bloomRadius = Math.min(cellSize * 0.44, cellSize * (complete ? 0.42 : 0.36));
  const frameColor = invalid
    ? "#FF3A5C"
    : occupied || activeSentence || complete
      ? pathColor
      : "#DCE8F8";
  const orbAlpha = activeCell
    ? 0.95
    : complete
      ? 0.72
      : occupied
        ? 0.52
        : replayable
          ? 0.22
          : 0.14;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  if (backgroundAlpha > 0) {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, bloomRadius);
    gradient.addColorStop(0, toRgba(invalid ? "#FF3A5C" : pathColor, backgroundAlpha * 1.25));
    gradient.addColorStop(0.68, toRgba(invalid ? "#FF3A5C" : pathColor, backgroundAlpha * 0.4));
    gradient.addColorStop(1, toRgba(invalid ? "#FF3A5C" : pathColor, 0));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, bloomRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = toRgba(invalid ? "#FF3A5C" : pathColor, backgroundAlpha);
    ctx.fillRect(-half, -half, half * 2, half * 2);
  }

  ctx.strokeStyle = toRgba(frameColor, frameAlpha);
  ctx.lineWidth = 1;
  ctx.strokeRect(-half, -half, half * 2, half * 2);

  ctx.beginPath();
  ctx.arc(0, 0, cellSize * 0.055, 0, Math.PI * 2);
  ctx.fillStyle = toRgba(frameColor, orbAlpha);
  ctx.shadowBlur = occupied || activeSentence || complete ? cellSize * 0.22 : 0;
  ctx.shadowColor = occupied || activeSentence || complete ? frameColor : "transparent";
  ctx.fill();
  ctx.shadowBlur = 0;

  if (activeCell || complete) {
    const barWidth = cellSize * 0.038;
    const barHeight = cellSize * 0.18;
    const gap = cellSize * 0.048;
    for (let index = -1; index <= 1; index += 1) {
      const barX = index * gap;
      const barScale = 0.78 + Math.sin(time * 8 + index * 0.7 + cell.r) * 0.22;
      const height = barHeight * barScale;
      ctx.fillStyle = toRgba(pathColor, activeCell ? 0.88 : 0.64);
      ctx.fillRect(barX - barWidth / 2, -height / 2, barWidth, height);
    }
  }

  ctx.restore();
}
