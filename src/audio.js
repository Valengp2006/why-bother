// audio.js — sonificación con Tone.js. Por ahora solo el arranque del audio (el sonido llega en el hito 7).
import * as Tone from 'tone';

let started = false;

// El navegador solo deja sonar si hay un gesto de la persona: por eso el primer clic de la sesión
// solo inicia el audio y no cuenta como juicio.
export async function startAudio() {
  if (started) return;
  started = true; // se marca antes de esperar, así un segundo clic rápido ya cuenta como juicio
  await Tone.start();
}

export const isAudioStarted = () => started;
