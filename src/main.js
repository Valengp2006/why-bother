// main.js — arranque y ciclo de p5.
// Hito 1: solo un canvas oscuro a pantalla completa.
import p5 from 'p5';
import { CONFIG } from './config.js';

new p5((p) => {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.randomSeed(CONFIG.RANDOM_SEED); // determinismo: la semilla se fija una sola vez, aquí
  };

  p.draw = () => {
    p.background(CONFIG.BACKGROUND);
  };

  // Si cambia el tamaño de la ventana, el canvas la sigue.
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
