// main.js — arranque y ciclo de p5.
import p5 from 'p5';
import { CONFIG } from './config.js';
import { recordSample, computeClarity } from './intention.js';
import { drawIntentionDebug } from './render.js';

new p5((p) => {
  const samples = []; // trayectoria reciente del mouse
  let showDebug = CONFIG.DEBUG_AT_START;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.randomSeed(CONFIG.RANDOM_SEED); // determinismo: la semilla se fija una sola vez, aquí
  };

  p.draw = () => {
    p.background(CONFIG.BACKGROUND);
    // Se muestrea cada cuadro (aunque el mouse esté quieto: quedarse quieto también cuenta).
    recordSample(samples, p.mouseX, p.mouseY, p.millis());
    const intention = computeClarity(samples);
    if (showDebug) drawIntentionDebug(p, samples, intention);
  };

  p.keyPressed = () => {
    if (p.key === 'd' || p.key === 'D') showDebug = !showDebug;
  };

  // Si cambia el tamaño de la ventana, el canvas la sigue.
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
