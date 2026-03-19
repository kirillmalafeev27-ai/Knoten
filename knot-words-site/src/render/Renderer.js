import { COL, toRgba } from "../data/palette.js";
import { AnimationSystem } from "./AnimationSystem.js";
import { PathDrawer } from "./PathDrawer.js";
import { drawWordCell } from "./WordCell.js";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export class Renderer {
  constructor({ canvas, container }) {
    this.canvas = canvas;
    this.container = container;
    this.ctx = canvas.getContext("2d");
    this.animation = new AnimationSystem();
    this.stateGetter = () => null;
    this.width = 0;
    this.height = 0;
    this.cellSize = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.levelId = null;
    this.levelSize = null;
    this.time = 0;
    this.timeZero = null;
    this.pathDrawer = new PathDrawer((cell) => this.centerForCell(cell));

    window.addEventListener("resize", () => this.resize());
  }

  start(stateGetter) {
    this.stateGetter = stateGetter;
    this.resize();
    requestAnimationFrame((timestamp) => this.frame(timestamp));
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    const state = this.stateGetter();
    if (!state?.level) {
      return;
    }

    this.#updateGridMetrics(state.level);
  }

  centerForCell(cell) {
    return {
      x: this.offsetX + cell.c * this.cellSize + this.cellSize * 0.5,
      y: this.offsetY + cell.r * this.cellSize + this.cellSize * 0.5,
    };
  }

  emitAtCell(cell, color, count) {
    const center = this.centerForCell(cell);
    this.animation.emit(center.x, center.y, color, count);
  }

  burstSentence(cells, color, count) {
    cells.forEach((cell) => this.emitAtCell(cell, color, count));
  }

  addWave(color, cells) {
    this.animation.addWave(color, cells);
  }

  clearTransient() {
    this.animation.reset();
  }

  getCellFromClientPoint(clientX, clientY, level) {
    if (!level || !this.cellSize) {
      return null;
    }

    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const col = Math.floor((x - this.offsetX) / this.cellSize);
    const row = Math.floor((y - this.offsetY) / this.cellSize);

    if (row < 0 || row >= level.size || col < 0 || col >= level.size) {
      return null;
    }

    return level.grid[row][col];
  }

  frame(timestamp) {
    requestAnimationFrame((nextTimestamp) => this.frame(nextTimestamp));
    const state = this.stateGetter();

    if (!state?.level) {
      return;
    }

    if (this.timeZero === null) {
      this.timeZero = timestamp;
    }

    this.time = (timestamp - this.timeZero) / 1000;

    if (state.level.id !== this.levelId || state.level.size !== this.levelSize) {
      this.#updateGridMetrics(state.level);
    }

    if (document.hidden) {
      return;
    }

    this.animation.tick();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawBackground();
    this.drawGrid(state.level);
    this.drawFills(state);
    this.drawPaths(state);
    this.animation.drawWaves(this.ctx, (cell) => this.centerForCell(cell), this.cellSize);
    this.drawCursor(state);
    this.drawWords(state, timestamp);
    this.animation.drawParticles(this.ctx);
  }

  drawBackground() {
    this.ctx.fillStyle = "#05080F";

    if (typeof this.ctx.roundRect === "function") {
      this.ctx.beginPath();
      this.ctx.roundRect(0, 0, this.width, this.height, 20);
      this.ctx.fill();
    } else {
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    const shift = Math.sin(this.time * 0.22) * 0.5 + 0.5;
    const gradientX = clamp(this.width * (0.18 + shift * 0.16), this.width * 0.18, this.width * 0.34);
    const gradientY = clamp(this.height * (0.24 + shift * 0.06), this.height * 0.2, this.height * 0.34);
    const ambient = this.ctx.createRadialGradient(gradientX, gradientY, 0, gradientX, gradientY, this.width * 0.7);
    ambient.addColorStop(0, toRgba(COL.P, 0.032 + shift * 0.016));
    ambient.addColorStop(1, "rgba(0, 0, 0, 0)");
    this.ctx.fillStyle = ambient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawGrid(level) {
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
    ctx.lineWidth = 1;

    for (let index = 0; index <= level.size; index += 1) {
      ctx.beginPath();
      ctx.moveTo(this.offsetX + index * this.cellSize, this.offsetY);
      ctx.lineTo(this.offsetX + index * this.cellSize, this.offsetY + level.size * this.cellSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(this.offsetX, this.offsetY + index * this.cellSize);
      ctx.lineTo(this.offsetX + level.size * this.cellSize, this.offsetY + index * this.cellSize);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    for (let row = 0; row <= level.size; row += 1) {
      for (let col = 0; col <= level.size; col += 1) {
        ctx.beginPath();
        ctx.arc(this.offsetX + col * this.cellSize, this.offsetY + row * this.cellSize, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  drawFills(state) {
    this.ctx.save();

    Object.values(state.paths).forEach((pathState) => {
      pathState.cells.forEach((cell) => {
        const center = this.centerForCell(cell);
        const size = this.cellSize * 0.9;
        this.ctx.fillStyle = toRgba(pathState.color, pathState.complete ? 0.07 : 0.055);
        this.ctx.fillRect(center.x - size / 2, center.y - size / 2, size, size);
      });
    });

    state.draftPath.cells.forEach((cell) => {
      const center = this.centerForCell(cell);
      const size = this.cellSize * 0.9;
      this.ctx.fillStyle = toRgba(state.draftPath.color, state.active.dragging ? 0.082 : 0.055);
      this.ctx.fillRect(center.x - size / 2, center.y - size / 2, size, size);
    });

    this.ctx.restore();
  }

  drawPaths(state) {
    Object.values(state.paths).forEach((pathState) => {
      this.pathDrawer.drawPath(this.ctx, pathState.cells, pathState.color, this.cellSize, {
        active: false,
      });
    });

    this.pathDrawer.drawPath(this.ctx, state.draftPath.cells, state.draftPath.color, this.cellSize, {
      active: state.active.dragging,
    });
  }

  drawCursor(state) {
    if (!state.active.dragging) {
      return;
    }

    const lastCell = state.draftPath.cells.at(-1);
    this.pathDrawer.drawCursor(this.ctx, lastCell, state.draftPath.color, this.cellSize, this.time);
  }

  drawWords(state, timestamp) {
    const introElapsed = timestamp - state.introStartedAt;
    const invalidAge = state.invalid ? timestamp - state.invalid.at : Infinity;

    state.level.orderedCells.forEach((cell, index) => {
      const completedPath = Object.values(state.paths).find((pathState) => (
        pathState.cells.some((entry) => entry.key === cell.key)
      ));
      const inDraft = state.draftPath.cells.some((entry) => entry.key === cell.key);
      const activeCell = state.draftPath.cells.at(-1)?.key === cell.key;
      const hover = state.hoverCellKey === cell.key && !state.active.dragging;
      const delay = (index / state.level.orderedCells.length) * 350;
      const intro = clamp((introElapsed - delay) / 420, 0, 1);
      const easedIntro = 1 - Math.pow(1 - intro, 3);
      const completionAge = completedPath?.complete ? timestamp - completedPath.completedAt - cell.indexInSentence * 35 : Infinity;
      const invalid = state.invalid?.key === cell.key && invalidAge < 120;
      const center = this.centerForCell(cell);

      drawWordCell(this.ctx, {
        cell,
        x: center.x,
        y: center.y,
        cellSize: this.cellSize,
        time: this.time,
        intro: easedIntro,
        occupied: inDraft || Boolean(completedPath),
        activeCell,
        complete: Boolean(completedPath?.complete),
        hover,
        highlightColor: inDraft ? state.draftPath.color : completedPath?.color ?? null,
        replayable: state.respeakableCellKeys.has(cell.key),
        invalid,
        completionAge,
      });
    });
  }

  #updateGridMetrics(level) {
    this.levelId = level.id;
    this.levelSize = level.size;
    this.cellSize = Math.min(this.width, this.height) / level.size;
    this.offsetX = (this.width - this.cellSize * level.size) / 2;
    this.offsetY = (this.height - this.cellSize * level.size) / 2;
  }
}
