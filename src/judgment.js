// judgment.js — el juicio de la persona: clic para conservar, clic derecho o Shift+clic para soltar.
// El sistema no decide qué es útil: solo aplica lo que la persona elige y lo registra.
import { measure, conserve, release } from './trails.js';
import { recordJudgment } from './log.js';
import { startAudio, isAudioStarted } from './audio.js';

// Qué acción es este clic: soltar con botón derecho, Shift+clic o Ctrl+clic (el clic derecho en Mac); si no, conservar.
export function actionOf(event) {
  return event.button === 2 || event.shiftKey || event.ctrlKey ? 'release' : 'conserve';
}

// Devuelve 'audio' si este clic solo inició el audio (no cuenta), o la acción aplicada.
export function judge(trails, log, event, x, y, nowMs) {
  if (!isAudioStarted()) {
    startAudio(); // primer clic de la sesión: solo audio
    return 'audio';
  }
  const action = actionOf(event);
  const m = measure(trails, x, y); // antes de marcar: qué había bajo el cursor
  if (action === 'conserve') conserve(trails, x, y);
  else release(trails, x, y);
  recordJudgment(log, {
    t: Math.round(nowMs), action, x: Math.round(x), y: Math.round(y),
    dominant: m.dominant, mass: +m.mass.toFixed(2),
    fiel: +m.fiel.toFixed(2), desvio: +m.desvio.toFixed(2), deriva: +m.deriva.toFixed(2),
  });
  return action;
}
