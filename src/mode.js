// mode.js — el modo de la obra: "performance" para presentarla, "dev" para construirla y probarla.
//   performance : pantalla limpia (sin paneles), pantalla completa al empezar y una malla un poco más ligera.
//   dev         : panel de depuración, consola de parámetros (__CONFIG) y atajos para saltar la narración.
// Se elige con la dirección:  ?modo=dev  o  ?modo=performance.  Sin indicarlo, `npm run dev` abre en dev
// y la versión publicada abre en performance.
// Importa este archivo antes que los demás: ajusta CONFIG antes de que nadie lo lea.
import { CONFIG } from './config.js';

function detect() {
  const asked = new URLSearchParams(window.location.search).get('modo');
  if (asked === 'dev' || asked === 'performance') return asked;
  return import.meta.env.DEV ? 'dev' : 'performance';
}

export const MODE = detect();
Object.assign(CONFIG, CONFIG.MODES[MODE]);
