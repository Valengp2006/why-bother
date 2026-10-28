// world.js — el estado del "mundo" que cambia con las decisiones de la persona.
// Las preguntas (narrative.js) mueven estos valores; el resto de la obra los lee.
// Cada decisión es un "efecto" escrito en config.js (QUESTIONS): ahí se ve qué mueve cada opción.
import { CONFIG } from './config.js';

// Los multiplicadores parten en 1 (neutro): una decisión los multiplica; varias se acumulan.
export const world = {
  warmth: CONFIG.WARMTH_START,       // color y sonido: 0 frío, 1 cálido (el valor actual, que sigue a warmthTarget)
  warmthTarget: CONFIG.WARMTH_START, // hacia dónde va
  clarityMul: 1,        // cuánto cuenta la mano: sube la claridad de la intención (más fieles)
  ambientMul: 1,        // fuerza del ambiente sobre los agentes (ríos firmes o vagabundos)
  wanderMul: 1,         // cuánto divagan los agentes
  ambientSpawnMul: 1,   // cuánta pintura emiten solas las fuentes
  senseMul: 1,          // cuánto atrae lo conservado a los agentes
  criterionRateMul: 1,  // cuánto emite cada zona conservada
  decayMul: 1,          // qué tan rápido se borra la pintura no conservada
  showMechanism: false, // si se ve el mecanismo (el campo y los agentes) además de la pintura
};

// Valores que se multiplican al aplicar un efecto. 'warmth' se suma; 'showMechanism' se asigna.
const MULTIPLIERS = ['clarityMul', 'ambientMul', 'wanderMul', 'ambientSpawnMul', 'senseMul', 'criterionRateMul', 'decayMul'];

// Aplica el efecto de una decisión. effect = { warmth: +0.2, ambientMul: 1.4, showMechanism: true, ... }
export function applyEffect(effect) {
  for (const k of Object.keys(effect)) {
    if (k === 'warmth') world.warmthTarget = Math.max(0, Math.min(1, world.warmthTarget + effect.warmth));
    else if (k === 'showMechanism') world.showMechanism = !!effect.showMechanism;
    else if (MULTIPLIERS.includes(k)) world[k] *= effect[k];
  }
}

// Mueve el mundo hacia su objetivo, un poquito cada cuadro, para que los cambios no sean bruscos.
export function updateWorld(dt) {
  const k = 1 - Math.exp(-dt / Math.max(0.05, CONFIG.WARMTH_SMOOTH / 3));
  world.warmth += (world.warmthTarget - world.warmth) * k;
}
