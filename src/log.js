// log.js — registro de sesión: cada vertido de la persona, cada decisión de la narración y cómo quedó la obra.
// Es la evidencia de la tesis ("si decisiones distintas producen obras distintas, el esfuerzo de decidir vale la pena").
// Se descarga como JSON (tecla L) para pegarlo en la bitácora y comparar entre personas.
import { CONFIG } from './config.js';

export function createLog() {
  return {
    seed: CONFIG.RANDOM_SEED,
    startedAt: new Date().toISOString(),
    pours: [],   // cada vez que la persona vertió pintura: cuándo, dónde y cuánto duró
    choices: [], // una entrada por decisión en la narración (qué pregunta y qué opción eligió)
    final: null, // cómo quedó la obra al guardarla: la calidez y una miniatura para compararla con la de otras personas
  };
}

// Un vertido: de (x0, y0) a (x1, y1), durante durationMs, a partir del instante t (ms).
export function recordPour(log, pour) {
  log.pours.push(pour);
}

// Una decisión de la narración: qué pregunta y qué opción eligió la persona.
export function recordChoice(log, nowMs, choice) {
  log.choices.push({
    t: Math.round(nowMs), question: choice.step.id, optionIndex: choice.optionIndex, option: choice.option.label,
  });
}

// Al guardar la obra: la dejamos anotada con el estado del mundo y una miniatura para comparar.
export function recordFinal(log, nowMs, world, thumb) {
  log.final = { t: Math.round(nowMs), warmth: +world.warmth.toFixed(2), thumb };
}

// Lo que se descarga: el registro más los parámetros que definen la sesión.
export function exportLog(log, nowMs) {
  const keys = ['WINDOW_MS', 'MIN_SPEED', 'LOOKAHEAD', 'WANDER_STRENGTH', 'FIDELITY_HIGH', 'AMBIENT_STRENGTH', 'AMBIENT_SPAWN_RATE',
    'POUR_RATE', 'CRITERION_LIFE', 'CRITERION_SPAWN_RATE', 'DECAY', 'GOLD_DECAY', 'DIFFUSION'];
  const params = {};
  for (const k of keys) params[k] = CONFIG[k];
  return { ...log, durationMs: Math.round(nowMs), params };
}

// Descarga el registro como archivo .json (crea un enlace temporal y lo "pulsa").
export function downloadLog(log, nowMs) {
  const blob = new Blob([JSON.stringify(exportLog(log, nowMs), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `why-bother-${log.startedAt.replace(/[:.]/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
