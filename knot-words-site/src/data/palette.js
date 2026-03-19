export const COL = Object.freeze({
  R: "#FF3A5C",
  G: "#00E5A0",
  B: "#4D9EFF",
  Y: "#FFD040",
  P: "#A855F7",
  O: "#FF6B30",
  W: "#FF3D87",
});

export const ARTICLE_COLORS = Object.freeze({
  der: COL.B,
  die: COL.R,
  das: COL.G,
});

export function toRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
