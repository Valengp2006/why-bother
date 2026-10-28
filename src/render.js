// render.js — dibujo: los agentes (trazos orientados) y el panel de depuración (tecla D).
import { CONFIG } from './config.js';

import { getPalette, hexToRgb } from './palette.js';
export { hexToRgb };

const BG = hexToRgb(CONFIG.BACKGROUND);

// Las trazas se pintan en una imagen del tamaño de la malla y se estiran a pantalla completa:
// el suavizado al agrandarla es lo que les da el aspecto de pintura que se corre.
let trailImg = null;

// La pintura se dibuja como pintura de verdad, no como luz:
//  · se MEZCLA como pigmento (promedio geométrico de los colores, ponderado por cuánto hay de cada uno):
//    el azul con el dorado da verde, no un amarillo lavado;
//  · CUBRE al fondo según su cantidad (opacidad), en vez de sumarse como un resplandor;
//  · tiene GROSOR: su cantidad se trata como una altura y sus crestas atrapan luz (relieve y brillo húmedo).
let heights = null, heightsTmp = null;
const LIGHT = (() => { const v = [-0.5, -0.6, 0.62], l = Math.hypot(...v); return v.map((x) => x / l); })();   // luz desde arriba a la izquierda
const HALF = (() => { const v = [LIGHT[0], LIGHT[1], LIGHT[2] + 1], l = Math.hypot(...v); return v.map((x) => x / l); })();
const LN = (c) => Math.log(Math.max(8, c));

// Suaviza un arreglo w×h con un promedio de 3 vecinos en cada eje (una pasada).
function blur3(src, dst, w, h) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      dst[i] = (src[x > 0 ? i - 1 : i] + src[i] + src[x < w - 1 ? i + 1 : i]) / 3;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      src[i] = (dst[y > 0 ? i - w : i] + dst[i] + dst[y < h - 1 ? i + w : i]) / 3;
    }
  }
}

export function drawTrails(p, trails) {
  const { w, h } = trails;
  if (!trailImg || trailImg.width !== w || trailImg.height !== h) {
    trailImg = p.createImage(w, h);
    heights = new Float32Array(w * h);
    heightsTmp = new Float32Array(w * h);
  }
  trailImg.loadPixels();
  const px = trailImg.pixels;
  const pal = getPalette();
  const cols = [pal.fiel, pal.desvio, pal.deriva, pal.conservado];
  const lnCol = cols.map((c) => [LN(c[0]), LN(c[1]), LN(c[2])]); // se calcula una vez por cuadro, no por celda
  const op = CONFIG.PIGMENT_OPACITY;
  const [c0, c1, c2, c3] = trails.ch;

  // El grosor es la cantidad total de pintura, suavizada para que el relieve sea de pintura continua.
  for (let i = 0; i < heights.length; i++) heights[i] = c0[i] + c1[i] + c2[i] + c3[i];
  for (let pass = 0; pass < CONFIG.PAINT_BLUR; pass++) blur3(heights, heightsTmp, w, h);

  const K = CONFIG.PAINT_RELIEF, SPEC = CONFIG.PAINT_SPECULAR, COVER = CONFIG.PAINT_COVER * CONFIG.TRAIL_GAIN;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const q0 = c0[i] * op[0], q1 = c1[i] * op[1], q2 = c2[i] * op[2], q3 = c3[i] * op[3];
      const S = q0 + q1 + q2 + q3;
      const o = i * 4;
      if (S < 1e-4) { px[o] = BG[0]; px[o + 1] = BG[1]; px[o + 2] = BG[2]; px[o + 3] = 255; continue; }

      // Mezcla de pigmentos (promedio geométrico ponderado).
      const wk0 = q0 / S, wk1 = q1 / S, wk2 = q2 / S, wk3 = q3 / S;
      const mr = Math.exp(wk0 * lnCol[0][0] + wk1 * lnCol[1][0] + wk2 * lnCol[2][0] + wk3 * lnCol[3][0]);
      const mg = Math.exp(wk0 * lnCol[0][1] + wk1 * lnCol[1][1] + wk2 * lnCol[2][1] + wk3 * lnCol[3][1]);
      const mb = Math.exp(wk0 * lnCol[0][2] + wk1 * lnCol[1][2] + wk2 * lnCol[2][2] + wk3 * lnCol[3][2]);

      // Cuánto cubre al fondo.
      const a = 1 - Math.exp(-COVER * (c0[i] + c1[i] + c2[i] + c3[i]));

      // Relieve: normal a partir del gradiente del grosor; luz difusa y brillo especular.
      const xm = x > 0 ? i - 1 : i, xp = x < w - 1 ? i + 1 : i, ym = y > 0 ? i - w : i, yp = y < h - 1 ? i + w : i;
      const gx = (heights[xp] - heights[xm]) * K, gy = (heights[yp] - heights[ym]) * K;
      const nl = Math.sqrt(gx * gx + gy * gy + 1);
      const nx = -gx / nl, ny = -gy / nl, nz = 1 / nl;
      const diff = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
      const hd = Math.max(0, nx * HALF[0] + ny * HALF[1] + nz * HALF[2]);
      const h2 = hd * hd, h4 = h2 * h2, h8 = h4 * h4, h16 = h8 * h8;
      const spec = h16 * h8 * h4 * SPEC * 255; // hd^28
      const shade = 0.55 + 0.6 * diff;

      px[o] = BG[0] * (1 - a) + (mr * shade + spec) * a;
      px[o + 1] = BG[1] * (1 - a) + (mg * shade + spec) * a;
      px[o + 2] = BG[2] * (1 - a) + (mb * shade + spec) * a;
      px[o + 3] = 255;
    }
  }
  trailImg.updatePixels();
  // Se recorta el borde de una celda: ahí la malla no se difunde y dejaría el marco dentado.
  p.image(trailImg, 0, 0, p.width, p.height, 1, 1, w - 2, h - 2);
}

// Cada agente es un trazo corto orientado según su rumbo; se desvanece a medida que envejece.
export function drawAgents(p, agents) {
  const pal = getPalette();
  p.strokeWeight(CONFIG.AGENT_STROKE_WEIGHT);
  for (const a of agents) {
    const speed = Math.hypot(a.vx, a.vy) || 1;
    const alpha = 255 * (1 - a.age / CONFIG.AGENT_LIFETIME);
    const [r, g, b] = pal[a.behavior];
    p.stroke(r, g, b, alpha);
    p.line(a.x, a.y, a.x - (a.vx / speed) * CONFIG.AGENT_STROKE_LEN, a.y - (a.vy / speed) * CONFIG.AGENT_STROKE_LEN);
  }
}

// Flechas tenues del campo, para ver qué dejó el trazo y hasta dónde llega.
export function drawFieldDebug(p, field) {
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
export function drawDebug(p, { samples, intention, agents, field, log, criteria, mode }) {
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
    `modo            ${mode}`,
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
  const pal = getPalette();
  const [r, g, b] = pal.fiel;
  const now = p.millis();

  for (const c of criteria) {
    drawFan(p, c.x, c.y, c.dir, CONFIG.CRITERION_CLARITY * CONFIG.LOOKAHEAD, pal.conservado, CONFIG.INTENTION_ALPHA * 0.3);
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
  drawFan(p, last.x, last.y, intention.dir, intention.clarity * CONFIG.LOOKAHEAD, pal.fiel, CONFIG.INTENTION_ALPHA * 0.35);
}

// Instrucción mínima del inicio, centrada y tenue. alpha va de 0 a 1.
export function drawHint(p, alpha, text = CONFIG.HINT_TEXT) {
  if (alpha < 0.01) return;
  const [r, g, b] = getPalette().fiel;
  p.noStroke();
  p.fill(r, g, b, 150 * alpha);
  p.textSize(18);
  p.textAlign(p.CENTER, p.CENTER);
  p.text(text, p.width / 2, p.height / 2);
}

// Miniatura de la última pintura dibujada (cols × rows, promedio por bloque): sirve para comparar,
// entre personas, si decisiones distintas dieron obras distintas. Devuelve { cols, rows, data: [r,g,b, r,g,b, ...] }.
export function thumbnail(cols, rows) {
  if (!trailImg) return { cols, rows, data: [] };
  const w = trailImg.width, h = trailImg.height, px = trailImg.pixels;
  const data = [];
  for (let by = 0; by < rows; by++) {
    for (let bx = 0; bx < cols; bx++) {
      const x0 = Math.floor((bx * w) / cols), x1 = Math.max(x0 + 1, Math.floor(((bx + 1) * w) / cols));
      const y0 = Math.floor((by * h) / rows), y1 = Math.max(y0 + 1, Math.floor(((by + 1) * h) / rows));
      let r = 0, g = 0, b = 0, n = 0;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const o = (y * w + x) * 4; r += px[o]; g += px[o + 1]; b += px[o + 2]; n++; }
      data.push(Math.round(r / n), Math.round(g / n), Math.round(b / n));
    }
  }
  return { cols, rows, data };
}

// La pantalla de inicio: el título de la obra y la invitación a empezar, sobre la oscuridad.
// t = segundos desde que se abrió la página; fade = 1 antes del clic, baja a 0 cuando la historia empieza.
export function drawStartScreen(p, t, fade, mode) {
  if (fade < 0.01) return;
  const pal = getPalette();
  const [r, g, b] = pal.fiel;
  const titleA = Math.min(1, t / 3) * fade;                    // el título aparece despacio
  const inviteA = Math.max(0, Math.min(1, (t - 3.5) / 2)) * fade * (0.65 + 0.35 * Math.sin(t * 1.6)); // y la invitación respira
  p.noStroke();
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(Math.max(28, Math.min(72, p.width / 16)));
  p.fill(r, g, b, 235 * titleA);
  p.text(CONFIG.TITLE, p.width / 2, p.height * 0.42);
  p.stroke(r, g, b, 90 * titleA);
  p.strokeWeight(1);
  p.line(p.width / 2 - 60, p.height * 0.5, p.width / 2 + 60, p.height * 0.5);
  p.noStroke();
  p.textSize(18);
  p.fill(r, g, b, 170 * inviteA);
  p.text(CONFIG.HINT_TEXT, p.width / 2, p.height * 0.57);
  if (mode === 'dev') {
    p.textSize(12);
    p.fill(r, g, b, 90 * fade);
    p.text('modo dev  ·  ?modo=performance para presentar  ·  N salta la narración  ·  D panel  ·  S guardar  ·  L registro', p.width / 2, p.height - 28);
  }
}
