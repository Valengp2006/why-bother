// criteria.js — lo que la persona vertió, convertido en una intención que sigue sin ella.
// Al terminar de verter (soltar el clic) nace un criterio en ese punto, con la dirección en que iba la mano.
// Mientras vive, emite pintura dorada con esa dirección y proyecta su propio alcance en el campo; se apaga solo.
import { CONFIG } from './config.js';
import { world } from './world.js';

export function createCriteria() {
  return [];
}

// Crea un criterio en (x, y) con la dirección dir (largo 1). nowMs: instante en que nace.
export function addCriterion(criteria, x, y, dir, nowMs) {
  const c = { x, y, dir: { x: dir.x, y: dir.y }, born: nowMs, carry: 0 };
  criteria.push(c);
  if (criteria.length > CONFIG.MAX_CRITERIA) criteria.shift(); // el más antiguo deja de emitir
  return c;
}

// Cuánto de su fuerza le queda a un criterio (1 recién nacido, 0 apagado).
export function strengthOf(c, nowMs) {
  return Math.max(0, 1 - (nowMs - c.born) / (CONFIG.CRITERION_LIFE * world.criterionLifeMul * 1000));
}

// Quita los criterios que ya se apagaron.
export function pruneCriteria(criteria, nowMs) {
  for (let i = criteria.length - 1; i >= 0; i--) {
    if (strengthOf(criteria[i], nowMs) <= 0) criteria.splice(i, 1);
  }
}
