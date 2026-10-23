# Lo que quise decir (Why Bother?)

Unidad 8 de Simulación: una obra computacional sobre la pregunta *"¿Para qué tomarte el trabajo?"*.
Contexto completo en [AGENT.md](AGENT.md) y [docs/ficha-diseno.md](docs/ficha-diseno.md).

## Correrlo en tu computador

Necesitas Node.js (probado con v22).

```bash
npm install     # descarga las librerías (solo la primera vez)
npm run dev     # arranca el servidor local
```

Abre **http://localhost:5173/why-bother/** (el `/why-bother/` final es importante, viene de `base` en `vite.config.js`).

## Qué es cada cosa

| Pieza | Para qué sirve |
|---|---|
| **git** | Guarda la historia del código. Un commit = una foto con mensaje. |
| **Vite** | Servidor de desarrollo (se recarga solo al guardar) y empaquetador: `npm run build` junta todo en la carpeta `dist/`. |
| **npm / `package.json`** | Lista las librerías (p5, Tone) y los comandos. `node_modules/` es donde se descargan; no se sube a git. |
| **GitHub Pages** | Publica la carpeta `dist/` como página web gratis. |
| `src/config.js` | Todos los parámetros de la obra. |

## Publicar en GitHub Pages (solo la primera vez)

1. En GitHub crea un repositorio **vacío** llamado `why-bother` en la cuenta `Valengp2006` (sin README, sin .gitignore, sin licencia).
2. En la terminal, dentro de esta carpeta:
   ```bash
   git remote add origin https://github.com/Valengp2006/why-bother.git
   git push -u origin main
   ```
3. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Ve a la pestaña **Actions**: el workflow "Deploy a GitHub Pages" se ejecuta solo (tarda ~1 min). Cuando quede en verde, la obra está en:
   **https://valengp2006.github.io/why-bother/**

Desde ahí, cada `git push` a `main` vuelve a publicar automáticamente.

## Si algo falla

- **Página en blanco en Pages:** revisa que `base` en `vite.config.js` sea exactamente `/why-bother/` (el nombre del repo entre barras).
- **404 al abrir localhost:5173:** falta el `/why-bother/` al final de la URL.
- **El workflow falla en `npm ci`:** asegúrate de haber subido `package-lock.json`.
