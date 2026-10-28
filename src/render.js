// render.js — dibujo: los agentes (trazos orientados) y el panel de depuración (tecla D).
import { CONFIG } from './config.js';

import { getPalette, hexToRgb } from './palette.js';
import { world } from './world.js';
export { hexToRgb };

const BG = hexToRgb(CONFIG.BACKGROUND);

// Las trazas se pintan en una imagen del tamaño de la malla y se estiran a pantalla completa:
// el suavizado al agrandarla es lo que les da el aspecto de pintura que se corre.
let trailImg = null;

// La pintura se dibuja como un mar de pintura:
//  · se MEZCLA como pigmento (promedio geométrico de los colores, ponderado por cuánto hay de cada uno):
//    el azul con el dorado da verde, no un amarillo lavado;
//  · CUBRE al fondo según su cantidad (opacidad), en vez de sumarse como un resplandor;
//  · su superficie ONDULA: la cantidad de pintura y unas olas largas que viajan por toda la pantalla forman una altura;
//    de su inclinación salen la luz, el brillo mojado, el reflejo del cielo y la refracción (el color se ve desplazado).
let heights = null, heightsTmp = null, surf = null, mixc = null, cov = null;
const LIGHT = (() => { const v = [-0.5, -0.6, 0.62], l = Math.hypot(...v); return v.map((x) => x / l); })();   // luz desde arriba a la izquierda
const HALF = (() => { const v = [LIGHT[0], LIGHT[1], LIGHT[2] + 1], l = Math.hypot(...v); return v.map((x) => x / l); })();
const LN = (c) => Math.log(Math.max(8, c));

// Las tres olas: dirección, largo de onda (relativo a WAVE_LENGTH), altura (relativa) y rapidez (relativa).
const WAVES = [
  { dx: 0.87, dy: 0.5, len: 1, amp: 1, speed: 1.3 },
  { dx: -0.34, dy: 0.94, len: 0.8, amp: 0.7, speed: 0.8 },
  { dx: 0.7, dy: 0.7, len: 0.55, amp: 0.45, speed: 1.9 },
];
// Ondas que lanzan las decisiones: un anillo que se expande desde la opción elegida y se apaga.
const ripples = [];
export function addRipple(x, y, nowMs) {
  ripples.push({ x, y, t0: nowMs });
}
const RIPPLE_MS = 3200;
let waveSin = null; // tablas de seno y coseno por columna y por fila, que se rehacen en cada cuadro

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

export function drawTrails(p, trails, nowMs = 0) {
  const { w, h } = trails;
  if (!trailImg || trailImg.width !== w || trailImg.height !== h) {
    trailImg = p.createImage(w, h);
    heights = new Float32Array(w * h);
    heightsTmp = new Float32Array(w * h);
    surf = new Float32Array(w * h);
    mixc = new Float32Array(w * h * 3);
    cov = new Float32Array(w * h);
    waveSin = WAVES.map(() => ({ sx: new Float32Array(w), cx: new Float32Array(w), sy: new Float32Array(h), cy: new Float32Array(h) }));
  }
  trailImg.loadPixels();
  const px = trailImg.pixels;
  const pal = getPalette();
  const cols = [pal.fiel, pal.desvio, pal.deriva, pal.conservado];
  const lnCol = cols.map((c) => [LN(c[0]), LN(c[1]), LN(c[2])]); // se calcula una vez por cuadro, no por celda
  const op = CONFIG.PIGMENT_OPACITY;
  const [c0, c1, c2, c3] = trails.ch;
  const COVER = CONFIG.PAINT_COVER * CONFIG.TRAIL_GAIN;

  // 1) Color de pigmento y cobertura de cada celda; y el grosor de la pintura (cantidad total).
  for (let i = 0; i < heights.length; i++) {
    const tot = c0[i] + c1[i] + c2[i] + c3[i];
    heights[i] = tot;
    const q0 = c0[i] * op[0], q1 = c1[i] * op[1], q2 = c2[i] * op[2], q3 = c3[i] * op[3];
    const S = q0 + q1 + q2 + q3;
    const m = i * 3;
    if (S < 1e-4) { mixc[m] = BG[0]; mixc[m + 1] = BG[1]; mixc[m + 2] = BG[2]; cov[i] = 0; continue; }
    const wk0 = q0 / S, wk1 = q1 / S, wk2 = q2 / S, wk3 = q3 / S;
    mixc[m] = Math.exp(wk0 * lnCol[0][0] + wk1 * lnCol[1][0] + wk2 * lnCol[2][0] + wk3 * lnCol[3][0]);
    mixc[m + 1] = Math.exp(wk0 * lnCol[0][1] + wk1 * lnCol[1][1] + wk2 * lnCol[2][1] + wk3 * lnCol[3][1]);
    mixc[m + 2] = Math.exp(wk0 * lnCol[0][2] + wk1 * lnCol[1][2] + wk2 * lnCol[2][2] + wk3 * lnCol[3][2]);
    cov[i] = 1 - Math.exp(-COVER * tot);
  }
  for (let pass = 0; pass < CONFIG.PAINT_BLUR; pass++) blur3(heights, heightsTmp, w, h);

  // 2) Olas: cada una es sin(k·(dx·x + dy·y) + ω·t). Como el argumento se separa en una parte de x y otra de y,
  //    se usan tablas por columna y por fila (sin(A+B) = sinA·cosB + cosA·sinB) en vez de un seno por celda.
  const t = nowMs / 1000 * CONFIG.WAVE_SPEED;
  const swell = CONFIG.WAVE_SWELL * world.waveMul * (1 - 0.7 * world.closing); // las decisiones calman o agitan el mar; al cerrar se aquieta
  WAVES.forEach((wv, j) => {
    const k = (2 * Math.PI) / (CONFIG.WAVE_LENGTH * wv.len);
    const T = waveSin[j];
    for (let x = 0; x < w; x++) { const A = k * wv.dx * (x / trails.sx); T.sx[x] = Math.sin(A); T.cx[x] = Math.cos(A); }
    for (let y = 0; y < h; y++) { const B = k * wv.dy * (y / trails.sy) + wv.speed * t; T.sy[y] = Math.sin(B); T.cy[y] = Math.cos(B); }
  });
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sw = 0;
      for (let j = 0; j < 3; j++) {
        const T = waveSin[j];
        sw += WAVES[j].amp * (T.sx[x] * T.cy[y] + T.cx[x] * T.sy[y]);
      }
      surf[y * w + x] = heights[y * w + x] + swell * sw;
    }
  }

  // Ondas de las decisiones: cada una es un anillo que se abre desde donde se eligió, con altura que decae.
  for (let r = ripples.length - 1; r >= 0; r--) {
    const age = nowMs - ripples[r].t0;
    if (age > RIPPLE_MS) { ripples.splice(r, 1); continue; }
    const a = age / 1000;
    const cx = ripples[r].x * trails.sx, cy = ripples[r].y * trails.sy;
    const radius = 70 * a * trails.sx * 3.2, sigma = 5 + a * 3, amp = 2.4 * Math.exp(-1.1 * a);
    const reach = radius + sigma * 3;
    const x0 = Math.max(0, Math.floor(cx - reach)), x1 = Math.min(w - 1, Math.ceil(cx + reach));
    const y0 = Math.max(0, Math.floor(cy - reach)), y1 = Math.min(h - 1, Math.ceil(cy + reach));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const e = Math.hypot(x - cx, y - cy) - radius;
        if (e > sigma * 3 || e < -sigma * 3) continue;
        surf[y * w + x] += amp * Math.cos(e * 0.9) * Math.exp(-(e * e) / (2 * sigma * sigma));
      }
    }
  }

  // 3) Sombreado: normal de la superficie, luz difusa, brillo mojado, reflejo del cielo y refracción.
  const K = CONFIG.PAINT_RELIEF, SPEC = CONFIG.PAINT_SPECULAR * world.glossMul * 255, REFR = CONFIG.WAVE_REFRACTION, SKY = CONFIG.WAVE_SKY * 3;
  const tint = pal.fiel;
  const SAT = CONFIG.PAINT_SATURATION;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const xm = x > 0 ? i - 1 : i, xp = x < w - 1 ? i + 1 : i, ym = y > 0 ? i - w : i, yp = y < h - 1 ? i + w : i;
      const gx = (surf[xp] - surf[xm]) * K, gy = (surf[yp] - surf[ym]) * K;
      const nl = Math.sqrt(gx * gx + gy * gy + 1);
      const nx = -gx / nl, ny = -gy / nl, nz = 1 / nl;

      // Refracción: el color que se ve se toma de un punto desplazado según la inclinación de la ola.
      let sx = Math.round(x + nx * REFR), sy = Math.round(y + ny * REFR);
      sx = sx < 0 ? 0 : sx >= w ? w - 1 : sx; sy = sy < 0 ? 0 : sy >= h ? h - 1 : sy;
      const j = sy * w + sx, jm = j * 3;
      const a = cov[j];
      let baseR = BG[0] * (1 - a) + mixc[jm] * a, baseG = BG[1] * (1 - a) + mixc[jm + 1] * a, baseB = BG[2] * (1 - a) + mixc[jm + 2] * a;
      // Saturación: mezclar pigmentos apaga el color; esto lo aviva alejándolo del gris de su misma luminosidad.
      const lum = 0.3 * baseR + 0.59 * baseG + 0.11 * baseB;
      baseR = lum + (baseR - lum) * SAT; baseG = lum + (baseG - lum) * SAT; baseB = lum + (baseB - lum) * SAT;

      const diff = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
      const hd = Math.max(0, nx * HALF[0] + ny * HALF[1] + nz * HALF[2]);
      const h2 = hd * hd, h4 = h2 * h2, h8 = h4 * h4, h16 = h8 * h8;
      const spec = h16 * h4 * h2 * SPEC;          // hd^22: un brillo estrecho, de superficie mojada
      const u = 1 - nz;
      const sky = SKY * u * Math.sqrt(u);         // reflejo del cielo donde la ola se inclina
      const shade = 0.62 + 0.5 * diff;
      const gloss = 0.35 + 0.65 * a;              // la pintura refleja más que el fondo oscuro

      const o = i * 4;
      px[o] = baseR * shade + (spec + sky * tint[0]) * gloss;
      px[o + 1] = baseG * shade + (spec + sky * tint[1]) * gloss;
      px[o + 2] = baseB * shade + (spec + sky * tint[2]) * gloss;
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

// Panel (tecla D): claridad, agentes por comportamiento, vertidos, criterios y campo.
export function drawDebug(p, { samples, intention, agents, field, log, criteria, mode }) {
  drawFieldDebug(p, field);

  const counts = { fiel: 0, desvio: 0, deriva: 0 };
  for (const a of agents) counts[a.behavior]++;

  p.noStroke();
  p.fill(255);
  p.textFont('monospace');
  p.textStyle(p.NORMAL);
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
    `vertidos        ${log.pours.length}`,
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
    drawFan(p, c.x, c.y, c.dir, CONFIG.CRITERION_CLARITY * c.strength * CONFIG.LOOKAHEAD, pal.conservado, CONFIG.INTENTION_ALPHA * 0.3);
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

// La letra de la obra (serif cursiva, Cormorant Garamond). El texto se dibuja directamente con el canvas y no con
// p.text, porque p5 no interpreta bien una lista de fuentes con respaldo. Cormorant es de ojo pequeño: se usa más
// grande que una sans. alpha va de 0 a 255; align: 'center' | 'left' | 'right'.
function applyFont(ctx, size, italic) {
  ctx.font = `${italic ? 'italic ' : ''}${size}px ${CONFIG.FONT}`;
}

export function serifText(p, str, x, y, size, rgb, alpha, { italic = true, align = 'center' } = {}) {
  if (alpha <= 0) return;
  const ctx = p.drawingContext;
  ctx.save();
  applyFont(ctx, size, italic);
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = `rgba(${rgb[0] | 0}, ${rgb[1] | 0}, ${rgb[2] | 0}, ${Math.min(1, alpha / 255)})`;
  ctx.fillText(str, x, y);
  ctx.restore();
}

// Ancho (px) que ocupa un texto con la letra de la obra: para dimensionar, por ejemplo, el fondo de una opción.
export function serifWidth(p, str, size, italic = true) {
  const ctx = p.drawingContext;
  ctx.save();
  applyFont(ctx, size, italic);
  const w = ctx.measureText(str).width;
  ctx.restore();
  return w;
}

// Instrucción mínima, centrada y tenue. alpha va de 0 a 1.
export function drawHint(p, alpha, text = CONFIG.HINT_TEXT) {
  if (alpha < 0.01) return;
  serifText(p, text, p.width / 2, p.height / 2, 28, getPalette().fiel, 150 * alpha);
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
  serifText(p, CONFIG.TITLE, p.width / 2, p.height * 0.42, Math.max(44, Math.min(110, p.width / 11)), pal.fiel, 235 * titleA);
  p.stroke(r, g, b, 90 * titleA);
  p.strokeWeight(1);
  p.line(p.width / 2 - 60, p.height * 0.5, p.width / 2 + 60, p.height * 0.5);
  p.noStroke();
  serifText(p, CONFIG.HINT_TEXT, p.width / 2, p.height * 0.57, 30, pal.fiel, 170 * inviteA);
  if (mode === 'dev') {
    p.textFont('monospace');
    p.textStyle(p.NORMAL);
    p.textSize(12);
    p.textAlign(p.CENTER, p.CENTER);
    p.fill(r, g, b, 90 * fade);
    p.text('modo dev  ·  ?modo=performance para presentar  ·  N salta la narración  ·  E cierra  ·  D panel  ·  S guardar  ·  L registro  ·  C puntero  ·  F pantalla completa  ·  mantén el clic: verter', p.width / 2, p.height - 28);
  }
}

// El epílogo y el reposo. closeT va de 0 a 1 durante el cierre; tSec es el tiempo para el pulso de la invitación.
// Las frases del epílogo aparecen una a una; al terminar el cierre aparecen el título y la invitación a empezar de nuevo.
export function drawEpilogue(p, closeT, tSec) {
  const pal = getPalette();
  const ramp = (v) => Math.max(0, Math.min(1, v));
  CONFIG.EPILOGUE.forEach((l, i) => {
    const a = ramp((closeT - (0.1 + 0.3 * i)) / 0.2);
    serifText(p, l.text, p.width / 2, p.height * 0.44 + i * 54, 42, pal.fiel, 235 * a);
  });
  const titleA = ramp((closeT - 0.85) / 0.15);
  serifText(p, CONFIG.TITLE, p.width / 2, p.height * 0.25, Math.max(44, Math.min(100, p.width / 12)), pal.fiel, 220 * titleA);
  if (closeT >= 1) {
    const pulse = 0.65 + 0.35 * Math.sin(tSec * 1.6);
    serifText(p, CONFIG.RESTART_TEXT, p.width / 2, p.height * 0.74, 28, pal.fiel, 170 * pulse);
  }
}
