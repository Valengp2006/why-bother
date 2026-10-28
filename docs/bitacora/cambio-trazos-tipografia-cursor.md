# Trazos, tipografía, puntero y título (sesión del cambio de rumbo)

## Feedback de Valen
Le gusta cómo funciona. Pide:
1. Trazos **ligeramente más gruesos**.
2. Otra **tipografía**, más asociada a la narrativa.
3. El título *Lo que quise decir* no la convence del todo: quiere uno **más metafórico**.
4. **Eliminar el puntero convencional** del mouse, como prueba.
5. Un **botón para volver a pantalla completa** si se sale por accidente.

## Decisiones de Valen
- Tipografía: **Cormorant Garamond** (cursiva), entre cuatro candidatas (Cormorant, EB Garamond, IM Fell English, Playfair Display).
- Título: **Cauce**, entre cuatro propuestas metafóricas (*Cauce*, *Lo que la marea no se lleva*, *Orilla*, *Agua que obedece a medias*).

## Por qué *Cauce* (para la presentación, a revisar por Valen)
El cauce no es el río: es el camino que se le da. En la obra, el sistema pone el agua (la pintura que fluye sola) y la persona decide por dónde corre. Es la tesis en una palabra: lo técnico se delega, la dirección es de quien decide.

## Qué se hizo
- **Trazos más gruesos:** `DEPOSIT_RADIUS` 2 → 3, `DEPOSIT` 22 → 28 y `POUR_RADIUS` 16 → 22. Se comparó con radio 4 (se vuelve masa) y se eligió 3 para "ligeramente".
- **Tipografía:** Cormorant Garamond **incluida en el proyecto** (`src/fonts/`, licencia SIL OFL, ~60 KB), así funciona sin conexión. Se dibuja directamente con el canvas, porque p5 no interpretaba una lista de fuentes con respaldo y caía en Georgia. Los textos se agrandaron porque Cormorant es de ojo pequeño. El panel de depuración sigue en monoespaciada.
- **Puntero oculto** (`HIDE_CURSOR`): la mano se ve por el trazo blanco de la intención y las opciones se resaltan al acercarse. En modo performance solo se oculta en pantalla completa, para poder usar el botón. La tecla `C` lo muestra u oculta al probar.
- **Botón de pantalla completa:** aparece abajo a la derecha solo cuando se empezó y no se está en pantalla completa. Pulsarlo no cuenta como verter ni como elegir. La tecla `F` también la activa y desactiva.
- **La pintura ya no se pierde al cambiar de tamaño:** antes, entrar o salir de pantalla completa reiniciaba la pintura. Ahora se reescala y los agentes y fuentes se reubican.
- Título *Cauce* en la pantalla de inicio, en la pestaña y en el nombre del archivo guardado. La tercera frase del prólogo, que hacía eco del título viejo, pasó a *"Pero por dónde corre, lo decides tú."* (borrador).

## No verificado
- El puntero oculto **con un mouse real** (en el navegador integrado solo se comprobó el estilo).
- La pantalla completa real y el botón al salir con Esc.
- Cómo se lee la tipografía en una pantalla grande o proyectada.

## Hipótesis (completar ANTES de probar)
- Sin puntero, la persona encuentra su mano por el trazo blanco y no se pierde: ___
- Sin puntero, las opciones se eligen sin dificultad gracias al resaltado: ___

## Observación (completar DESPUÉS)
- ___

## Qué decidí / qué delegué (propuesta de línea para la ficha, sección 10)
| Elegir la tipografía, el título *Cauce*, pedir trazos más gruesos y ocultar el puntero | Yo (criterio y gusto) | Evidencia de que juzgo lo construido |
| Preparar las alternativas de fuente y de título, la implementación y la copia de la fuente al proyecto | Delegué | Pendiente: que Valen cambie `TITLE` y `FONT` en `config.js` sola |
