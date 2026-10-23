// field.js — el flow field que deja el trazo del mouse, y su extrapolación hacia delante (el alcance).
// Cada celda guarda un vector (vx, vy): su dirección es hacia dónde fluye, su largo (0 a 1) es la fuerza.
import { CONFIG } from './config.js';

export function createField(width, height) {
  const cols = Math.ceil(width / CONFIG.FIELD_CELL);
  const rows = Math.ceil(height / CONFIG.FIELD_CELL);
  return { cols, rows, vx: new Float32Array(cols * rows), vy: new Float32Array(cols * rows) };
}

// El campo se desvanece solo: queda FIELD_DECAY de su fuerza después de 1 segundo.
export function decayField(field, dt) {
  const k = Math.pow(CONFIG.FIELD_DECAY, dt);
  for (let i = 0; i < field.vx.length; i++) {
    field.vx[i] *= k;
    field.vy[i] *= k;
  }
}

// Deja la dirección (dx, dy) en las celdas cerca de (x, y). Cuanto más cerca del centro,
// más se acerca la celda a esa dirección (mezcla en vez de reemplazar, así los giros son suaves).
function stamp(field, x, y, dx, dy, radius, weight) {
  const cell = CONFIG.FIELD_CELL;
  const c0 = Math.max(0, Math.floor((x - radius) / cell));
  const c1 = Math.min(field.cols - 1, Math.floor((x + radius) / cell));
  const r0 = Math.max(0, Math.floor((y - radius) / cell));
  const r1 = Math.min(field.rows - 1, Math.floor((y + radius) / cell));
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const dist = Math.hypot((c + 0.5) * cell - x, (r + 0.5) * cell - y);
      if (dist > radius) continue;
      const w = weight * (1 - dist / radius);
      const i = r * field.cols + c;
      field.vx[i] += (dx - field.vx[i]) * w;
      field.vy[i] += (dy - field.vy[i]) * w;
    }
  }
}

// El mouse deja su dirección actual alrededor suyo y, además, un abanico por delante.
// Alcance = claridad × LOOKAHEAD: a más claridad, el campo llega más lejos que la mano.
export function updateField(field, mouseX, mouseY, intention, dt) {
  decayField(field, dt);
  if (!intention.active) return;

  const { recentDir, dir, clarity } = intention;
  if (recentDir.x !== 0 || recentDir.y !== 0) {
    stamp(field, mouseX, mouseY, recentDir.x, recentDir.y, CONFIG.FIELD_RADIUS, 0.35);
  }

  const reach = clarity * CONFIG.LOOKAHEAD;
  for (let d = CONFIG.FIELD_CELL; d <= reach; d += CONFIG.FIELD_CELL) {
    const radius = CONFIG.FIELD_RADIUS * 0.5 + d * CONFIG.FAN_SPREAD;
    // El peso cae con la distancia: lo lejano se insinúa, lo cercano manda.
    stamp(field, mouseX + dir.x * d, mouseY + dir.y * d, dir.x, dir.y, radius, 0.12 * (1 - d / reach));
  }
}

// Lee el campo en (x, y). Escribe en `out` para no crear objetos nuevos en cada agente y cada cuadro.
// out.strength es el largo del vector (0 a 1); dx, dy es su dirección (largo 1).
export function sampleField(field, x, y, out) {
  const c = Math.floor(x / CONFIG.FIELD_CELL);
  const r = Math.floor(y / CONFIG.FIELD_CELL);
  if (c < 0 || r < 0 || c >= field.cols || r >= field.rows) {
    out.strength = 0; out.dx = 0; out.dy = 0;
    return out;
  }
  const i = r * field.cols + c;
  const len = Math.hypot(field.vx[i], field.vy[i]);
  out.strength = Math.min(1, len);
  out.dx = len > 0 ? field.vx[i] / len : 0;
  out.dy = len > 0 ? field.vy[i] / len : 0;
  return out;
}
