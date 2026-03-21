import { toRgba } from "../data/palette.js";

export class AnimationSystem {
  constructor() {
    this.particles = [];
    this.waves = [];
  }

  emit(x, y, color, count) {
    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 2.8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 1,
        size: 1.5 + Math.random() * 2.5,
      });
    }
  }

  addWave(color, cells) {
    this.waves.push({
      color,
      cells: [...cells],
      t: 0,
    });
  }

  reset() {
    this.particles = [];
    this.waves = [];
  }

  tick() {
    for (let index = this.particles.length - 1; index >= 0; index -= 1) {
      const particle = this.particles[index];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.93;
      particle.vy *= 0.93;
      particle.vy += 0.055;
      particle.life -= 0.023;

      if (particle.life <= 0) {
        this.particles.splice(index, 1);
      }
    }

    for (let index = this.waves.length - 1; index >= 0; index -= 1) {
      const wave = this.waves[index];
      wave.t += 0.052;

      if (wave.t > 1.4) {
        this.waves.splice(index, 1);
      }
    }
  }

  drawParticles(ctx) {
    ctx.save();

    for (const particle of this.particles) {
      const size = particle.size * particle.life;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
      ctx.fillStyle = toRgba(particle.color, particle.life * 0.88);
      ctx.shadowBlur = size * 5;
      ctx.shadowColor = particle.color;
      ctx.fill();
    }

    ctx.restore();
  }

  drawWaves(ctx, centerForCell, cellSize) {
    if (!this.waves.length) {
      return;
    }

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const wave of this.waves) {
      const count = wave.cells.length;
      const centerIndex = wave.t * count;
      const span = count * 0.28;

      for (let index = 0; index < count - 1; index += 1) {
        const distance = Math.abs(index + 0.5 - centerIndex);
        const fade = wave.t > 0.88 ? Math.max(0, 1 - (wave.t - 0.88) / 0.52) : 1;
        const alpha = Math.max(0, 1 - distance / span) * fade;

        if (alpha < 0.01) {
          continue;
        }

        const start = centerForCell(wave.cells[index]);
        const end = centerForCell(wave.cells[index + 1]);

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.lineWidth = cellSize * 0.065;
        ctx.shadowBlur = cellSize * 0.38;
        ctx.shadowColor = "#fff";
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
