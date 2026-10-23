// render.js — dibujo. Por ahora solo el indicador de depuración de la intención.
import { CONFIG } from './config.js';

// Dibuja el rastro reciente del mouse y un panel con la claridad. Se muestra con la tecla D.
export function drawIntentionDebug(p, samples, intention) {
  // Rastro: más tenue cuanto más viejo (el borde de la ventana de WINDOW_MS).
  p.noFill();
  const now = p.millis();
  for (let i = 1; i < samples.length; i++) {
    const age = (now - samples[i].t) / CONFIG.WINDOW_MS;
    p.stroke(255, 255 * (1 - age));
    p.line(samples[i - 1].x, samples[i - 1].y, samples[i].x, samples[i].y);
  }

  // Panel de texto + barra de claridad.
  p.noStroke();
  p.fill(255);
  p.textSize(13);
  p.textAlign(p.LEFT, p.TOP);
  const lines = [
    `claridad        ${intention.clarity.toFixed(2)}`,
    `intención       ${intention.active ? 'activa' : 'inactiva'}`,
    `dir. constante  ${intention.dirConstancy.toFixed(2)}`,
    `vel. constante  ${intention.speedConstancy.toFixed(2)}`,
    `rapidez media   ${Math.round(intention.meanSpeed)} px/s`,
  ];
  lines.forEach((l, i) => p.text(l, 16, 16 + i * 18));
  p.noFill();
  p.stroke(120);
  p.rect(16, 16 + lines.length * 18 + 6, 160, 10);
  p.noStroke();
  p.fill(255);
  p.rect(16, 16 + lines.length * 18 + 6, 160 * intention.clarity, 10);
}
