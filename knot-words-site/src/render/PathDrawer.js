import { toRgba } from "../data/palette.js";

export class PathDrawer {
  constructor(centerForCell) {
    this.centerForCell = centerForCell;
  }

  drawPath(ctx, cells, color, cellSize, { active = false } = {}) {
    if (!cells || cells.length < 2) {
      return;
    }

    const points = cells.map((cell) => this.centerForCell(cell));
    const emphasis = active ? 1.15 : 1;
    const path = new Path2D();
    path.moveTo(points[0].x, points[0].y);

    for (let index = 1; index < points.length; index += 1) {
      path.lineTo(points[index].x, points[index].y);
    }

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.shadowBlur = 0;
    ctx.strokeStyle = toRgba(color, 0.058 * emphasis);
    ctx.lineWidth = cellSize * 0.58;
    ctx.stroke(path);

    ctx.shadowBlur = 0;
    ctx.strokeStyle = toRgba(color, 0.13 * emphasis);
    ctx.lineWidth = cellSize * 0.33;
    ctx.stroke(path);

    ctx.shadowBlur = cellSize * 0.42;
    ctx.shadowColor = color;
    ctx.strokeStyle = toRgba(color, 0.5 * emphasis);
    ctx.lineWidth = cellSize * 0.15;
    ctx.stroke(path);

    ctx.shadowBlur = cellSize * 0.2;
    ctx.shadowColor = color;
    ctx.strokeStyle = toRgba(color, 0.82 * emphasis);
    ctx.lineWidth = cellSize * 0.09;
    ctx.stroke(path);

    ctx.shadowBlur = cellSize * 0.1;
    ctx.shadowColor = "#fff";
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.26 * emphasis})`;
    ctx.lineWidth = cellSize * 0.032;
    ctx.stroke(path);

    ctx.restore();
  }

  drawCursor(ctx, cell, color, cellSize, time) {
    if (!cell || !color) {
      return;
    }

    const { x, y } = this.centerForCell(cell);
    const pulse = 0.62 + Math.sin(time * 9) * 0.38;
    const radius = cellSize * 0.3 * pulse;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, toRgba(color, 0.62));
    gradient.addColorStop(1, toRgba(color, 0));

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
