// narrative.js — la narración: frases que explican qué representa cada cosa, y luego preguntas
// cuyas opciones cambian el mundo. Todo se muestra en orden, cuando toca, y los textos viven en config.js.
//
// Pasos:  prólogo → intención → comportamientos → invitación a verter → qué es el dorado → preguntas → pregunta final.
// Las frases se desvanecen solas. Las preguntas esperan a que la persona haga clic en una de las dos opciones,
// que flotan dentro de la pintura.
import { CONFIG } from './config.js';
import { getPalette } from './palette.js';
import { serifText, serifWidth } from './render.js';

const FADE_IN = 1000;
const FADE_OUT = 1500;
const TEXT_GAP_MS = 3000; // entre frases explicativas se espera poco; entre preguntas, STEP_GAP

// Cuánto dura una frase en pantalla (el prólogo dura distinto que las frases explicativas).
const durationOf = (step) => (step.ms ? step.ms() : CONFIG.NARRATIVE_MS);

// Cada paso dice cuándo le toca (ready). Un paso solo se muestra después de los anteriores.
function buildSteps() {
  // Los tiempos se leen de CONFIG en cada cuadro (no al armar la lista), así se pueden cambiar en vivo al probar.
  const gap = (key) => (s, n, now) => now - n.lastEnd >= (key === 'text' ? TEXT_GAP_MS : CONFIG.STEP_GAP * 1000);
  const steps = [
    // El prólogo cuenta la historia en el centro, mientras la pintura florece; luego vienen las frases que explican.
    { type: 'text', id: 'prologo1', style: 'center', ms: () => CONFIG.PROLOGUE_MS, ready: gap('text') },
    { type: 'text', id: 'prologo2', style: 'center', ms: () => CONFIG.PROLOGUE_MS, ready: gap('text') },
    { type: 'text', id: 'prologo3', style: 'center', ms: () => CONFIG.PROLOGUE_MS, ready: gap('text') },
    { type: 'text', id: 'intencion', ready: (s) => s.intentionActive },
    { type: 'text', id: 'comportamientos', ready: (s, n, now) => gap('text')(s, n, now) && s.counts.fiel > 0 && s.counts.desvio + s.counts.deriva > 0 },
    // Si la persona ya vertió por su cuenta, la invitación sobra y se salta.
    { type: 'text', id: 'juicio', skip: (s) => s.pourCount > 0, ready: gap('text') },
    // La explicación del dorado llega cuando la persona vierte por primera vez (o, si no lo hace, pasado un tiempo).
    { type: 'text', id: 'oro', ready: (s, n, now) => gap('text')(s, n, now) && (s.pourCount > 0 || now - n.lastEnd >= CONFIG.GOLD_EXPLAIN_WAIT * 1000) },
  ];
  for (const q of CONFIG.QUESTIONS) steps.push({ type: 'question', id: q.id, question: q, ready: gap('step') });
  steps.push({ type: 'final', id: 'final', question: CONFIG.FINAL_QUESTION, ready: gap('step') });
  return steps;
}

export function createNarrative() {
  return { steps: buildSteps(), index: 0, current: null, start: 0, lastEnd: 0, rects: [], done: false };
}

// Solo en dev: salta el paso actual (sin aplicar efectos) y deja que el siguiente aparezca enseguida.
export function skipNarrative(n, nowMs) {
  n.current = null;
  n.lastEnd = nowMs - 1e9;
}

// Decide qué paso toca. state = { intentionActive, counts: { fiel, desvio, deriva }, pourCount (vertidos empezados) }.
export function updateNarrative(n, state, nowMs) {
  if (!CONFIG.NARRATIVE_ENABLED) return;
  const cur = n.current;
  if (cur && cur.type === 'text' && nowMs - n.start >= durationOf(cur)) {
    n.current = null;
    n.lastEnd = nowMs;
  }
  while (!n.current && n.index < n.steps.length && n.steps[n.index].skip && n.steps[n.index].skip(state)) n.index++;
  if (!n.current && n.index < n.steps.length && n.steps[n.index].ready(state, n, nowMs)) {
    n.current = n.steps[n.index];
    n.start = nowMs;
    n.index++;
  }
  if (!n.current && n.index >= n.steps.length) n.done = true;
}

// Posiciones de las dos opciones: cada una flota despacio alrededor de su ancla (izquierda y derecha).
function optionPositions(p, nowMs) {
  const t = nowMs / 1000;
  return [0, 1].map((i) => ({
    x: p.width * (i === 0 ? 0.27 : 0.73) + Math.sin(t * 0.5 + i * 2.1) * 40,
    y: p.height * 0.62 + Math.cos(t * 0.37 + i * 1.3) * 34,
  }));
}

// Dibuja el paso actual. mouse = { x, y } para resaltar la opción bajo el cursor.
export function drawNarrative(p, n, nowMs, mouse) {
  n.rects = [];
  const cur = n.current;
  if (!cur) return;
  const t = nowMs - n.start;
  const pal = getPalette();
  p.noStroke();

  if (cur.type === 'text') {
    const dur = durationOf(cur);
    const alpha = Math.max(0, Math.min(1, t / FADE_IN, (dur - t) / FADE_OUT));
    const lines = CONFIG.NARRATIVE_TEXT[cur.id];
    const center = cur.style === 'center'; // el prólogo va grande y al centro; las frases explicativas, abajo
    const lineH = center ? 46 : 34;
    lines.forEach((l, i) => {
      // 'deriva' es un azul casi del color del fondo; para leerse como texto se aclara hacia el blanco.
      let rgb = l.color ? pal[l.color] : pal.fiel;
      if (l.color === 'deriva') rgb = rgb.map((v, k) => v + (pal.fiel[k] - v) * 0.5);
      const y = center ? p.height * 0.46 + i * lineH : p.height - 70 - (lines.length - 1 - i) * lineH;
      serifText(p, l.text, p.width / 2, y, center ? 38 : 26, rgb, 210 * alpha);
    });
    return;
  }

  // Pregunta: el texto abajo y las dos opciones flotando dentro de la pintura.
  const alpha = Math.min(1, t / (FADE_IN * 1.5));
  const q = cur.question;
  serifText(p, q.text, p.width / 2, p.height - 90, 34, pal.fiel, 235 * alpha);

  const pos = optionPositions(p, nowMs);
  q.options.forEach((opt, i) => {
    const w = serifWidth(p, opt.label, 30) + 64, h = 58;
    const { x, y } = pos[i];
    const hover = Math.abs(mouse.x - x) <= w / 2 + 14 && Math.abs(mouse.y - y) <= h / 2 + 14;
    n.rects[i] = { x, y, w, h };
    // Un fondo oscuro translúcido para que la palabra se lea sobre la pintura más clara.
    p.fill(5, 11, 20, (hover ? 215 : 160) * alpha);
    p.stroke(pal.fiel[0], pal.fiel[1], pal.fiel[2], (hover ? 255 : 130) * alpha);
    p.strokeWeight(hover ? 2 : 1);
    p.rect(x - w / 2, y - h / 2, w, h, 29);
    p.noStroke();
    serifText(p, opt.label, x, y, 30, pal.fiel, (hover ? 255 : 215) * alpha);
  });
}

// ¿El clic cayó sobre una opción? Si sí, el paso termina y se devuelve la elección; si no, null.
export function narrativeClick(n, x, y, nowMs) {
  const cur = n.current;
  if (!cur || cur.type === 'text') return null;
  for (let i = 0; i < n.rects.length; i++) {
    const r = n.rects[i];
    if (r && Math.abs(x - r.x) <= r.w / 2 + 14 && Math.abs(y - r.y) <= r.h / 2 + 14) {
      n.current = null;
      n.lastEnd = nowMs;
      return { step: cur, optionIndex: i, option: cur.question.options[i] };
    }
  }
  return null;
}
