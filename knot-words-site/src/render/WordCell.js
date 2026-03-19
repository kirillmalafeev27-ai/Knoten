import { ARTICLE_COLORS, toRgba } from "../data/palette.js";

const CONNECTOR_WORDS = new Set([
  "aber",
  "als",
  "am",
  "an",
  "auch",
  "bei",
  "bevor",
  "damit",
  "dass",
  "für",
  "im",
  "in",
  "mit",
  "nach",
  "obwohl",
  "über",
  "und",
  "von",
  "vor",
  "weil",
  "wenn",
  "zu",
  "zur",
]);

function splitToken(token) {
  const parts = token.split(" ");
  if (parts.length <= 1) {
    return [token];
  }

  if (parts.length === 2) {
    return parts;
  }

  return [parts[0], parts.slice(1).join(" ")];
}

function calcFont(token, cellSize) {
  const chars = token.replace(/\s/g, "").length;
  const lines = splitToken(token).length;
  const base = cellSize * 0.28;
  const scale = Math.min(1, 7 / Math.max(chars, 7));
  const size = Math.max(10, (base * scale) / lines);

  return {
    size,
    weight: chars > 8 ? 500 : 600,
    lineHeight: lines > 1 ? 1.18 : 1,
  };
}

function articleColorForToken(token) {
  return ARTICLE_COLORS[token.toLowerCase()] ?? null;
}

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
  invalid,
  completionAge,
}) {
  const token = cell.word;
  const lines = splitToken(token);
  const { size, weight, lineHeight } = calcFont(token, cellSize);
  const markerColor = articleColorForToken(token);
  const isConnector = lines.length === 1 && CONNECTOR_WORDS.has(token.toLowerCase());
  const neutralColor = "rgba(220, 232, 248, 0.38)";
  const pathColor = cell.color;
  const activeScale = activeCell ? 1.04 : hover ? 1.02 : 1;
  const completionPulse = complete
    ? 1 + Math.max(0, 1 - completionAge / 340) * 0.06
    : 1;
  const breathe = 0.972 + Math.sin(time * 1.8 + cell.r * 0.7 + cell.c * 1.1) * 0.028;
  const scale = intro * activeScale * completionPulse * breathe;
  const half = cellSize * 0.43;
  const backgroundAlpha = invalid
    ? 0.16
    : complete
      ? 0.12
      : activeSentence
        ? 0.08
        : occupied
          ? 0.05
          : 0;
  const textAlpha = activeSentence || activeCell
    ? 0.95
    : complete
      ? 1
      : occupied
        ? 0.62
        : hover
          ? 0.48
          : 0.38;
  const bloomRadius = Math.min(cellSize * 0.44, cellSize * (complete ? 0.42 : 0.36));

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

  if (cell.isStart) {
    ctx.beginPath();
    ctx.arc(half - cellSize * 0.095, -half + cellSize * 0.095, cellSize * 0.055, 0, Math.PI * 2);
    ctx.fillStyle = toRgba(pathColor, 0.82);
    ctx.shadowBlur = cellSize * 0.18;
    ctx.shadowColor = pathColor;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  if (markerColor) {
    ctx.beginPath();
    ctx.arc(-half + cellSize * 0.095, -half + cellSize * 0.095, cellSize * 0.035, 0, Math.PI * 2);
    ctx.fillStyle = toRgba(markerColor, 0.6);
    ctx.fill();
  }

  ctx.font = `${isConnector ? "italic" : "normal"} ${weight} ${size}px "SF Pro Display", "Inter var", "Inter", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = complete ? "#FFFFFF" : activeSentence ? toRgba(pathColor, textAlpha) : neutralColor;
  ctx.shadowBlur = activeSentence || complete ? cellSize * 0.12 : 0;
  ctx.shadowColor = activeSentence || complete ? pathColor : "transparent";

  if (!activeSentence && !complete && (occupied || hover)) {
    ctx.fillStyle = `rgba(220, 232, 248, ${textAlpha})`;
  }

  const blockHeight = (lines.length - 1) * size * lineHeight;
  lines.forEach((line, index) => {
    const lineY = (index * size * lineHeight) - blockHeight / 2;
    ctx.fillText(line, 0, lineY);
  });

  ctx.restore();
}
