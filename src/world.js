// world.js — el estado del "mundo" que cambia con las decisiones de la persona.
// Las preguntas (narrative.js) mueven estos valores; el resto de la obra los lee.
// Cada valor parte de un valor neutro, y la configuración dice cuánto mueve cada decisión.
import { CONFIG } from './config.js';

export const world = {
  warmth: CONFIG.WARMTH_START,       // color y sonido: 0 frío, 1 cálido (el valor al que se está acercando abajo)
  warmthTarget: CONFIG.WARMTH_START, // hacia dónde va; world.warmth lo sigue con suavidad
};

// Mueve el mundo hacia su objetivo, un poquito cada cuadro, para que los cambios no sean bruscos.
export function updateWorld(dt) {
  const k = 1 - Math.exp(-dt / Math.max(0.05, CONFIG.WARMTH_SMOOTH / 3));
  world.warmth += (world.warmthTarget - world.warmth) * k;
}
