// render.js — dibujo: los agentes (trazos orientados) y el panel de depuración (tecla D).
import { CONFIG } from './config.js';

// Los colores de la paleta se leen una vez a [r, g, b] (más barato que pedir p.color() en cada agente).
export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const RGB = {
  fiel: hexToRgb(CONFIG.COLORS.fiel),
  desvio: hexToRgb(CONFIG.COLORS.desvio),
  deriva: hexToRgb(CONFIG.COLORS.deriva),
};
const BG = hexToRgb(CONFIG.BACKGROUND);
const GOLD = hexToRgb(CONFIG.COLORS.conservado);

// Las trazas se pintan en una imagen del tamaño de la malla y se estiran a pantalla completa:
// el suavizado al agrandarla es lo que les da el aspecto de pintura que se corre.
let trailImg = null;

// Brillo suave: crece rápido con poca traza y se aplana al saturar (nunca pasa de 1).
const tone = (v) => 1 - Math.exp(-CONFIG.TRAIL_GAIN * v);

export function drawTrails(p, trails) {
  if (!trailImg || trailImg.width !== trails.w || trailImg.height !== trails.h) {
    trailImg = p.createImage(trails.w, trails.h);
  }
  trailImg.loadPixels();
  const px = trailImg.pixels;
  const [f, d, r] = trails.ch;
  for (let i = 0; i < f.length; i++) {
    const tf = tone(f[i]), td = tone(d[i]), tr = tone(r[i]);
    // Color = fondo + cada canal con su color de la paleta.
    let R = BG[0] + tf * RGB.fiel[0] + td * RGB.desvio[0] + tr * RGB.deriva[0];
    let G = BG[1] + tf * RGB.fiel[1] + td * RGB.desvio[1] + tr * RGB.deriva[1];
    let B = BG[2] + tf * RGB.fiel[2] + td * RGB.desvio[2] + tr * RGB.deriva[2];
    // Lo conservado se tiñe de dorado, con la intensidad de la traza que hay ahí.
    // El dorado sigue a la pintura (no a la forma de la máscara): donde no hay traza no se ve.
    const lum = Math.min(1, tf + td + tr);
    const gm = trails.cons[i] * CONFIG.GOLD_MIX * Math.min(1, lum * 2.5);
    if (gm > 0) {
      R += (BG[0] + GOLD[0] * lum - R) * gm;
      G += (BG[1] + GOLD[1] * lum - G) * gm;
      B += (BG[2] + GOLD[2] * lum - B) * gm;
    }
    const o = i * 4;
    px[o] = R; px[o + 1] = G; px[o + 2] = B; px[o + 3] = 255;
  }
  trailImg.updatePixels();
  p.image(trailImg, 0, 0, p.width, p.height);
}

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

// Panel (tecla D): claridad, agentes por comportamiento, juicios por origen (f fiel, d desvío, v deriva, - sin traza) y campo.
export function drawDebug(p, { samples, intention, agents, field, log, criteria }) {
  drawFieldDebug(p, field);

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
    `conservado      f ${log.counts.conserve.fiel} · d ${log.counts.conserve.desvio} · v ${log.counts.conserve.deriva} · - ${log.counts.conserve.ninguno}`,
    `soltado         f ${log.counts.release.fiel} · d ${log.counts.release.desvio} · v ${log.counts.release.deriva} · - ${log.counts.release.ninguno}`,
    `criterios       ${criteria.length} / ${CONFIG.MAX_CRITERIA}`,
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

// Un abanico tenue que parte de (ox, oy) hacia dir y llega hasta reach px: el alcance de una intención.
function drawFan(p, ox, oy, dir, reach, rgb, alpha) {
  if (reach < CONFIG.FIELD_CELL) return;
  const { x: dx, y: dy } = dir;
  const nx = -dy, ny = dx; // perpendicular, para el ancho del abanico
  const steps = 24;
  p.noStroke();
  for (let s = 0; s < steps; s++) {
    const d0 = (s / steps) * reach, d1 = ((s + 1) / steps) * reach;
    const w0 = 3 + d0 * CONFIG.FAN_SPREAD * 0.5, w1 = 3 + d1 * CONFIG.FAN_SPREAD * 0.5;
    p.fill(rgb[0], rgb[1], rgb[2], alpha * (1 - s / steps));
    p.quad(
      ox + dx * d0 + nx * w0, oy + dy * d0 + ny * w0,
      ox + dx * d1 + nx * w1, oy + dy * d1 + ny * w1,
      ox + dx * d1 - nx * w1, oy + dy * d1 - ny * w1,
      ox + dx * d0 - nx * w0, oy + dy * d0 - ny * w0,
    );
  }
}

// La intención: el trazo del mouse (lo que pone la persona, se desvanece con el tiempo) y, por delante,
// un abanico tenue con el alcance (hasta dónde llega el campo; lo que pone el sistema).
// Cada criterio conservado muestra además su propio abanico dorado: una intención que sigue sin la mano.
export function drawIntention(p, samples, intention, criteria) {
  const [r, g, b] = RGB.fiel;
  const now = p.millis();

  for (const c of criteria) {
    drawFan(p, c.x, c.y, c.dir, CONFIG.CRITERION_CLARITY * CONFIG.LOOKAHEAD, GOLD, CONFIG.INTENTION_ALPHA * 0.3);
  }

  if (samples.length < 2) return;
  p.noFill();
  p.strokeWeight(CONFIG.INTENTION_WEIGHT);
  for (let i = 1; i < samples.length; i++) {
    const age = (now - samples[i].t) / CONFIG.WINDOW_MS;
    p.stroke(r, g, b, CONFIG.INTENTION_ALPHA * Math.max(0, 1 - age));
    p.line(samples[i - 1].x, samples[i - 1].y, samples[i].x, samples[i].y);
  }

  if (!intention.active) return;
  const last = samples[samples.length - 1];
  drawFan(p, last.x, last.y, intention.dir, intention.clarity * CONFIG.LOOKAHEAD, RGB.fiel, CONFIG.INTENTION_ALPHA * 0.35);
}

// Instrucción mínima del inicio, centrada y tenue. alpha va de 0 a 1.
export function drawHint(p, alpha) {
  if (alpha < 0.01) return;
  const [r, g, b] = RGB.fiel;
  p.noStroke();
  p.fill(r, g, b, 150 * alpha);
  p.textSize(18);
  p.textAlign(p.CENTER, p.CENTER);
  p.text(CONFIG.HINT_TEXT, p.width / 2, p.height / 2);
}
