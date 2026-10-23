import { defineConfig } from 'vite';

// "base" es la ruta donde vive la página en GitHub Pages:
// https://valengp2006.github.io/why-bother/  →  base = '/why-bother/'
// En local (npm run dev) Vite la usa también, así que abre /why-bother/.
export default defineConfig({
  base: '/why-bother/',
});
