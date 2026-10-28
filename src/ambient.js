// ambient.js — el ambiente: corrientes que cambian despacio y fuentes que vagan por la pantalla.
// Es lo que hace que la pintura se mueva sola. Todo sale de p.noise con semilla fija (mismo tiempo, mismo ambiente).
import { CONFIG } from './config.js';

const EPS = 6; // px para calcular el gradiente del ruido

// Dirección (vector de largo 1) de la corriente ambiental en (x, y) al tiempo tSec.
// Se usa el "curl" del ruido (el gradiente girado 90°): da remolinos y ríos que se curvan sin acumularse en un punto,
// como un fluido. Es un flow field, el mismo modelo del curso, pero que cambia con el tiempo.
export function ambientDir(p, x, y, tSec, out) {
  const s = CONFIG.AMBIENT_SCALE;
  const t = tSec * CONFIG.AMBIENT_RATE;
  const dy = p.noise(x * s, (y + EPS) * s, t) - p.noise(x * s, (y - EPS) * s, t);
  const dx = p.noise((x + EPS) * s, y * s, t) - p.noise((x - EPS) * s, y * s, t);
  const len = Math.hypot(dy, dx) || 1;
  out.x = dy / len;   // gradiente girado: (∂/∂y, −∂/∂x)
  out.y = -dx / len;
  return out;
}

// Posición de la fuente i en el tiempo tSec: sigue un camino de ruido por toda la pantalla.
// Se estira (n − 0.5) porque el ruido casi siempre queda cerca de 0.5 y las fuentes no recorrerían el lienzo.
export function wellPosition(p, i, tSec, width, height, out) {
  const t = tSec * CONFIG.AMBIENT_WELL_SPEED;
  const nx = (p.noise(i * 17.3 + 100, t) - 0.5) * 2.4 + 0.5;
  const ny = (p.noise(i * 9.1 + 300, t + 50) - 0.5) * 2.4 + 0.5;
  out.x = Math.max(0.05, Math.min(0.95, nx)) * width;
  out.y = Math.max(0.05, Math.min(0.95, ny)) * height;
  return out;
}
