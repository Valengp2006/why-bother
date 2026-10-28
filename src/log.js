// log.js — registro de sesión: qué se conservó y qué se soltó, de qué origen y cuánto.
// Es la evidencia de la hipótesis ("parte de lo que vale la pena conservar aparece en los desvíos").
// Se descarga como JSON (tecla L) para pegarlo en la bitácora y comparar entre personas.
import { CONFIG } from './config.js';

export function createLog() {
  return {
    seed: CONFIG.RANDOM_SEED,
    startedAt: new Date().toISOString(),
    events: [], // un evento por juicio (conservar o soltar)
    choices: [], // una entrada por decisión en la narración (qué pregunta y qué opción eligió)
    final: null, // cómo quedó la obra al guardarla: la calidez y una miniatura para compararla con la de otras personas
    counts: {
      conserve: { fiel: 0, desvio: 0, deriva: 0, ninguno: 0 },
      release: { fiel: 0, desvio: 0, deriva: 0, ninguno: 0 },
    },
  };
}

// event = { t (ms), action ('conserve' | 'release'), x, y, dominant, mass, fiel, desvio, deriva }
export function recordJudgment(log, event) {
  log.events.push(event);
  log.counts[event.action][event.dominant]++;
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
  const keys = ['WINDOW_MS', 'MIN_SPEED', 'W_DIR', 'W_SPEED', 'LOOKAHEAD', 'WANDER_STRENGTH', 'MAX_DEVIATION_ANGLE',
    'FIDELITY_HIGH', 'CRITERION_CLARITY', 'CRITERION_SPAWN_RATE', 'FLOCK_RADIUS', 'COHERENCE_NEIGHBORS', 'ALIGN_MIN', 'CONSERVE_RADIUS', 'DECAY', 'DIFFUSION'];
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
