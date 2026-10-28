// palette.js — la paleta actual: mezcla de la fría (COLORS) y la cálida (COLORS_WARM) según world.warmth.
import { CONFIG } from './config.js';
import { world } from './world.js';

export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const COOL = {}, WARM = {};
for (const k of Object.keys(CONFIG.COLORS)) {
  COOL[k] = hexToRgb(CONFIG.COLORS[k]);
  WARM[k] = hexToRgb(CONFIG.COLORS_WARM[k]);
}

// Se recalcula una vez por cuadro (getPalette() es barato: cuatro mezclas).
const current = {};
for (const k of Object.keys(COOL)) current[k] = [0, 0, 0];

export function getPalette() {
  const w = Math.max(0, Math.min(1, world.warmth));
  for (const k of Object.keys(COOL)) {
    for (let i = 0; i < 3; i++) current[k][i] = COOL[k][i] + (WARM[k][i] - COOL[k][i]) * w;
  }
  return current;
}
