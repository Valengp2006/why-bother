// audio.js — sonificación con Tone.js: texturas de agua y viento, sin escala musical.
//   viento   : ruido filtrado que respira despacio; se aclara hacia lo cálido
//   corriente: ruido agudo y suave cuyo volumen sigue a cuánta pintura se mueve
//   gotas    : pings cortos de agua; más frecuentes con más movimiento, más agudos hacia lo cálido
//   zumbido  : una voz grave y sostenida por cada criterio conservado (hasta MAX_VOICES); al soltar, se apaga despacio
// Todo pasa por un reverb corto y un limitador. Antes del primer clic no suena nada (el navegador exige un gesto).
import * as Tone from 'tone';
import { CONFIG } from './config.js';

let started = false;
let g = null; // el grafo de audio, creado una sola vez al iniciar

// Un generador pseudoaleatorio con semilla fija: las gotas caen en los mismos tonos en cada sesión.
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const rnd = mulberry32(CONFIG.RANDOM_SEED);

function build() {
  const limiter = new Tone.Limiter(-3).toDestination();
  Tone.Destination.volume.value = CONFIG.AUDIO_VOLUME_DB;
  const reverb = new Tone.Reverb({ decay: 4, wet: 0.35 }).connect(limiter);

  // Viento: ruido rosa por un filtro que se abre y se cierra despacio.
  const windFilter = new Tone.Filter(CONFIG.WIND_COOL_HZ, 'bandpass', -12).connect(reverb);
  windFilter.Q.value = 0.8;
  const windGain = new Tone.Gain(0.5).connect(windFilter);
  const wind = new Tone.Noise('pink').connect(windGain);
  const breath = new Tone.LFO(0.07, 0.25, 0.7).connect(windGain.gain); // respiración lenta del viento
  const sweep = new Tone.LFO(0.05, CONFIG.WIND_COOL_HZ * 0.7, CONFIG.WIND_COOL_HZ * 1.4).connect(windFilter.frequency);

  // Corriente: ruido agudo, apenas audible, que sigue al movimiento de la pintura.
  const streamFilter = new Tone.Filter(2600, 'highpass').connect(reverb);
  const streamGain = new Tone.Gain(0).connect(streamFilter);
  const stream = new Tone.Noise('white').connect(streamGain);

  // Gotas: cuatro voces que se turnan para no cortarse entre sí.
  const drops = [0, 1, 2, 3].map(() => new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.002, decay: 0.16, sustain: 0, release: 0.08 },
    volume: -16,
  }).connect(reverb));

  // Zumbido: dos osciladores apenas desafinados por voz, para que respire.
  const droneGain = new Tone.Gain(0).connect(reverb);
  const droneVoices = [];
  for (let i = 0; i < CONFIG.MAX_VOICES; i++) {
    const o1 = new Tone.Oscillator(CONFIG.DRONE_HZ * (1 + i * 0.5), 'sine').connect(droneGain);
    const o2 = new Tone.Oscillator(CONFIG.DRONE_HZ * (1 + i * 0.5) * 1.004, 'sine').connect(droneGain);
    const vg = new Tone.Gain(0);
    o1.disconnect(); o2.disconnect();
    o1.connect(vg); o2.connect(vg); vg.connect(droneGain);
    droneVoices.push({ o1, o2, vg });
  }

  wind.start(); breath.start(); sweep.start(); stream.start();
  droneVoices.forEach((v) => { v.o1.start(); v.o2.start(); });

  return { windFilter, windGain, sweep, streamGain, drops, droneGain, droneVoices, dropCarry: 0, dropIndex: 0 };
}

// El navegador solo deja sonar tras un gesto de la persona: por eso el primer clic de la sesión
// solo inicia el audio y no cuenta como decisión.
export async function startAudio() {
  if (started) return;
  started = true; // se marca antes de esperar, así un segundo clic rápido ya cuenta como juicio
  try {
    await Tone.start();
    g = build();
  } catch (e) {
    console.warn('No se pudo iniciar el audio:', e);
  }
}

export const isAudioStarted = () => started;

const lerp = (a, b, t) => a + (b - a) * t;

// Cada cuadro: el sonido sigue el estado de la obra.
//   state = { flow (0 a 1: cuánta pintura se mueve), warmth (0 frío a 1 cálido), criteria (cuántas zonas conservadas) }
export function updateAudio(state, dt) {
  if (!g) return;
  const w = state.warmth;
  const bloom = state.bloom === undefined ? 1 : state.bloom;

  // El volumen general sube con la floración: el sonido emerge del silencio junto con la pintura.
  Tone.Destination.volume.rampTo(lerp(-48, CONFIG.AUDIO_VOLUME_DB, Math.pow(bloom, 0.8)), 0.4);

  // Viento: más agudo y brillante hacia lo cálido.
  const windHz = lerp(CONFIG.WIND_COOL_HZ, CONFIG.WIND_WARM_HZ, w);
  g.sweep.min = windHz * 0.7; g.sweep.max = windHz * 1.4;

  // Corriente: sube con el movimiento de la pintura.
  g.streamGain.gain.rampTo(0.02 + state.flow * 0.06, 0.4);

  // Gotas: más con más movimiento; tono según la calidez, con variación suave.
  g.dropCarry += CONFIG.DROP_RATE * (0.2 + state.flow) * (0.3 + 0.7 * bloom) * dt;
  while (g.dropCarry >= 1) {
    g.dropCarry -= 1;
    const base = lerp(CONFIG.DROP_COOL_HZ, CONFIG.DROP_WARM_HZ, w);
    const f = base * (0.7 + rnd() * 0.9);
    const synth = g.drops[g.dropIndex++ % g.drops.length];
    const t = Tone.now() + rnd() * 0.05;
    synth.triggerAttackRelease(f, 0.05, t, 0.4 + rnd() * 0.4);
    synth.frequency.setValueAtTime(f, t);
    synth.frequency.exponentialRampToValueAtTime(f * 1.7, t + 0.07); // la gota "sube" al caer en el agua
  }

  // Zumbido: una voz por criterio conservado; las que sobran se apagan despacio (el release largo).
  const voices = Math.min(state.criteria, CONFIG.MAX_VOICES);
  g.droneVoices.forEach((v, i) => {
    v.vg.gain.rampTo(i < voices ? 0.05 : 0, i < voices ? 2.5 : 4);
  });
  g.droneGain.gain.rampTo(1, 0.5);
}

// Un toque suave cuando la persona elige: una gota más grave y más lenta.
export function chime(warmth) {
  if (!g) return;
  const f = lerp(CONFIG.DROP_COOL_HZ, CONFIG.DROP_WARM_HZ, warmth) * 0.5;
  const synth = g.drops[g.dropIndex++ % g.drops.length];
  const t = Tone.now();
  synth.triggerAttackRelease(f, 0.25, t, 0.8);
}
