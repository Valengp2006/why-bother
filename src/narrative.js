// narrative.js — la capa narrativa: frases cortas que explican qué representa cada cosa.
// Cada frase aparece UNA vez, en orden, cuando su elemento aparece en pantalla. Los textos viven en config.js.
import { CONFIG } from './config.js';
import { getPalette } from './palette.js';

const FADE_IN = 1000;
const FADE_OUT = 1500;

// Cada beat tiene una condición (ready) que dice cuándo su elemento ya está en pantalla.
// Un beat solo se muestra después de los anteriores, para que se lean en orden.
const BEATS = [
  { id: 'intencion', ready: (s) => s.intentionActive },
  { id: 'comportamientos', ready: (s) => s.counts.fiel > 0 && s.counts.desvio + s.counts.deriva > 0 },
  { id: 'juicio', ready: (s, n, now) => CONFIG.JUDGMENT_ENABLED && now - n.lastEnd >= CONFIG.NARRATIVE_JUDGMENT_DELAY },
];

export function createNarrative() {
  return { index: 0, current: null, start: 0, lastEnd: 0 };
}

// Decide qué frase toca. state = { intentionActive, counts: { fiel, desvio, deriva } }.
export function updateNarrative(n, state, nowMs) {
  if (!CONFIG.NARRATIVE_ENABLED) return;
  if (n.current && nowMs - n.start >= CONFIG.NARRATIVE_MS) {
    n.current = null;
    n.lastEnd = nowMs;
  }
  if (!n.current && n.index < BEATS.length && BEATS[n.index].ready(state, n, nowMs)) {
    n.current = BEATS[n.index].id;
    n.start = nowMs;
    n.index++;
  }
}

export function drawNarrative(p, n, nowMs) {
  if (!n.current) return;
  const t = nowMs - n.start;
  const alpha = Math.max(0, Math.min(1, t / FADE_IN, (CONFIG.NARRATIVE_MS - t) / FADE_OUT));
  const lines = CONFIG.NARRATIVE_TEXT[n.current];
  const lineH = 28;
  const pal = getPalette();
  const neutral = pal.fiel;
  p.noStroke();
  p.textSize(18);
  p.textAlign(p.CENTER, p.CENTER);
  lines.forEach((l, i) => {
    // 'deriva' es un azul casi del color del fondo; para leerse como texto se aclara hacia el blanco.
    let [r, g, b] = l.color ? pal[l.color] : neutral;
    if (l.color === 'deriva') { r += (neutral[0] - r) * 0.5; g += (neutral[1] - g) * 0.5; b += (neutral[2] - b) * 0.5; }
    p.fill(r, g, b, 210 * alpha);
    p.text(l.text, p.width / 2, p.height - 70 - (lines.length - 1 - i) * lineH);
  });
}
