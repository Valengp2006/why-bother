// criteria.js — los criterios: lo que la persona conservó, convertido en una intención persistente.
// Un criterio recuerda dónde se conservó, de qué origen era (fiel, desvío o deriva) y hacia dónde fluía.
// Mientras exista, emite agentes con esa dirección y proyecta su propio alcance en el campo.
import { CONFIG } from './config.js';

export function createCriteria() {
  return [];
}

// Convierte una medición (measure en trails.js) en un criterio, si la pintura tenía un flujo claro.
// Devuelve el criterio creado, o null si no había origen o la dirección no era clara.
export function addCriterion(criteria, x, y, m) {
  if (m.dominant === 'ninguno') return null;
  const len = Math.hypot(m.dirx, m.diry);
  const coherence = m.dirAbs > 0 ? len / m.dirAbs : 0; // 1 = toda la pintura fluía en la misma dirección
  if (coherence < CONFIG.CRITERION_MIN_COHERENCE) return null;
  const c = { x, y, dir: { x: m.dirx / len, y: m.diry / len }, origin: m.dominant, coherence, carry: 0 };
  criteria.push(c);
  if (criteria.length > CONFIG.MAX_CRITERIA) criteria.shift(); // el más antiguo deja de emitir
  return c;
}

// Soltar una zona apaga los criterios que estaban dentro de su radio.
export function removeCriteriaNear(criteria, x, y) {
  for (let i = criteria.length - 1; i >= 0; i--) {
    if (Math.hypot(criteria[i].x - x, criteria[i].y - y) <= CONFIG.CONSERVE_RADIUS) criteria.splice(i, 1);
  }
}
