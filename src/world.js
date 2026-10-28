// world.js — el estado del "mundo" que cambia con las decisiones de la persona.
// Las preguntas (narrative.js) mueven estos valores; el resto de la obra los lee.
// Cada decisión es un "efecto" escrito en config.js (QUESTIONS): ahí se ve qué mueve cada opción.
import { CONFIG } from './config.js';

// Los multiplicadores parten en 1 (neutro): una decisión los multiplica; varias se acumulan.
function initial() {
  return {
    warmth: CONFIG.WARMTH_START,       // color y sonido: 0 frío, 1 cálido (el valor actual, que sigue a warmthTarget)
    warmthTarget: CONFIG.WARMTH_START, // hacia dónde va
    clarityMul: 1,        // cuánto cuenta la mano: sube la claridad de la intención (más fieles)
    ambientMul: 1,        // fuerza del ambiente sobre los agentes (ríos firmes o vagabundos)
    wanderMul: 1,         // cuánto divagan los agentes
    ambientSpawnMul: 1,   // cuánta pintura emiten solas las fuentes
    senseMul: 1,          // cuánto atrae tu pintura dorada a los agentes
    criterionRateMul: 1,  // cuánto emite cada vertido tuyo mientras sigue sin ti
    criterionLifeMul: 1,  // cuánto dura cada vertido tuyo antes de apagarse
    decayMul: 1,          // qué tan rápido se borra lo que hace el sistema
    waveMul: 1,           // altura de las olas: mar en calma o mar bravo
    speedMul: 1,          // rapidez de los agentes: lo que fluye despacio o rápido
    densityMul: 1,        // cuánta pintura deja cada agente: capa fina o espesa
    deviationMul: 1,      // cuánto se desvían los agentes de lo que sigue la mano (más desvíos)
    glossMul: 1,          // brillo mojado de la superficie
    showMechanism: false, // si se ve el mecanismo (el campo y los agentes) además de la pintura
    bloom: 0,             // 0 a 1: cuánto ha florecido la obra desde el primer clic (pintura y sonido suben juntos); lo calcula main.js con el reloj
    closing: 0,           // 0 a 1: cuánto avanzó el cierre (la pintura se calma, el sonido se apaga); lo calcula main.js
  };
}

export const world = initial();

// Valores que se multiplican al aplicar un efecto. 'warmth' se suma; 'showMechanism' se asigna.
const MULTIPLIERS = ['clarityMul', 'ambientMul', 'wanderMul', 'ambientSpawnMul', 'senseMul', 'criterionRateMul', 'criterionLifeMul',
  'decayMul', 'waveMul', 'speedMul', 'densityMul', 'deviationMul', 'glossMul'];

// Aplica el efecto de una decisión. effect = { warmth: +0.2, ambientMul: 1.4, showMechanism: true, ... }
export function applyEffect(effect) {
  for (const k of Object.keys(effect)) {
    if (k === 'warmth') world.warmthTarget = Math.max(0, Math.min(1, world.warmthTarget + effect.warmth));
    else if (k === 'showMechanism') world.showMechanism = !!effect.showMechanism;
    else if (MULTIPLIERS.includes(k)) world[k] *= effect[k];
  }
}

// Vuelve el mundo a como empezó (para empezar de nuevo desde el reposo).
export function resetWorld() {
  Object.assign(world, initial());
}

// Mueve el mundo hacia su objetivo, un poquito cada cuadro, para que los cambios no sean bruscos.
export function updateWorld(dt) {
  const k = 1 - Math.exp(-dt / Math.max(0.05, CONFIG.WARMTH_SMOOTH / 3));
  world.warmth += (world.warmthTarget - world.warmth) * k;
}
