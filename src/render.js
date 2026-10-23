// render.js — dibujo: los agentes (trazos orientados) y el panel de depuración (tecla D).
import { CONFIG } from './config.js';

// Los colores de la paleta se leen una vez a [r, g, b] (más barato que pedir p.color() en cada agente).
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const RGB = {
  fiel: hexToRgb(CONFIG.COLORS.fiel),
  desvio: hexToRgb(CONFIG.COLORS.desvio),
  deriva: hexToRgb(CONFIG.COLORS.deriva),
};

// Cada agente es un trazo corto orientado según su rumbo; se desvanece a medida que envejece.
export function drawAgents(p, agents) {
  p.strokeWeight(CONFIG.AGENT_STROKE_WEIGHT);
  for (const a of agents) {
    const speed = Math.hypot(a.vx, a.vy) || 1;
    const alpha = 255 * (1 - a.age / CONFIG.AGENT_LIFETIME);
    const [r, g, b] = RGB[a.behavior];
    p.stroke(r, g, b, alpha);
    p.line(a.x, a.y, a.x - (a.vx / speed) * CONFIG.AGENT_STROKE_LEN, a.y - (a.vy / speed) * CONFIG.AGENT_STROKE_LEN);
  }
}

// Flechas tenues del campo, para ver qué dejó el trazo y hasta dónde llega.
function drawFieldDebug(p, field) {
  const cell = CONFIG.FIELD_CELL;
  p.strokeWeight(1);
  for (let r = 0; r < field.rows; r++) {
    for (let c = 0; c < field.cols; c++) {
      const i = r * field.cols + c;
      const len = Math.hypot(field.vx[i], field.vy[i]);
      if (len < CONFIG.FIELD_MIN_STRENGTH) continue;
      const cx = (c + 0.5) * cell, cy = (r + 0.5) * cell;
      p.stroke(255, 255, 255, 80 * Math.min(1, len));
      p.line(cx, cy, cx + (field.vx[i] / len) * cell * 0.45, cy + (field.vy[i] / len) * cell * 0.45);
    }
  }
}

// Panel: rastro del mouse, claridad, conteo de agentes por comportamiento y campo.
export function drawDebug(p, { samples, intention, agents, field }) {
  drawFieldDebug(p, field);

  p.noFill();
  p.strokeWeight(1);
  const now = p.millis();
  for (let i = 1; i < samples.length; i++) {
    const age = (now - samples[i].t) / CONFIG.WINDOW_MS;
    p.stroke(255, 255 * (1 - age));
    p.line(samples[i - 1].x, samples[i - 1].y, samples[i].x, samples[i].y);
  }

  const counts = { fiel: 0, desvio: 0, deriva: 0 };
  for (const a of agents) counts[a.behavior]++;

  p.noStroke();
  p.fill(255);
  p.textSize(13);
  p.textAlign(p.LEFT, p.TOP);
  const lines = [
    `claridad        ${intention.clarity.toFixed(2)}`,
    `intención       ${intention.active ? 'activa' : 'inactiva'}`,
    `dir. constante  ${intention.dirConstancy.toFixed(2)}`,
    `vel. constante  ${intention.speedConstancy.toFixed(2)}`,
    `rapidez media   ${Math.round(intention.meanSpeed)} px/s`,
    `agentes         ${agents.length} / ${CONFIG.PARTICLE_COUNT}`,
    `  fiel          ${counts.fiel}`,
    `  desvío        ${counts.desvio}`,
    `  deriva        ${counts.deriva}`,
    `fps             ${Math.round(p.frameRate())}`,
  ];
  lines.forEach((l, i) => p.text(l, 16, 16 + i * 18));
  const barY = 16 + lines.length * 18 + 6;
  p.noFill();
  p.stroke(120);
  p.rect(16, barY, 160, 10);
  p.noStroke();
  p.fill(255);
  p.rect(16, barY, 160 * intention.clarity, 10);
}
