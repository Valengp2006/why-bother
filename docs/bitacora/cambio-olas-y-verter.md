# Olas y verter (sesión del cambio de rumbo)

## Feedback de Valen
1. **La textura no le gusta** (el relieve de pintura espesa, con crestas y vetas). Quiere el 3D, pero **más fluido, cercano a olas**.
2. **El gesto de soltar es terrible** (clic derecho o Shift+clic) y **el de mantener no tiene sentido** dentro de la experiencia.
3. Sobre las variantes que se le mostraron: **las líneas base generadas son demasiado angostas**; conviene hacerlas más anchas, sobre la variante B.

## Diagnóstico
- Conservar y soltar eran **controles de programa**, no gestos de la historia. Un clic derecho rompe la inmersión, y conservar una zona no se entiende si no se ve para qué.
- El relieve se calculaba solo con la cantidad de pintura, así que daba crestas finas. Las olas necesitan una superficie con ondulaciones largas que viajen.

## Decisiones de Valen
- Superficie: **variante B** (olas largas con reflejos y pigmento que se desplaza), con **líneas base más anchas**.
- Gesto: **verter**. Mantener el clic vierte pintura; soltar el clic deja de verter. Sin clic derecho ni Shift.

## Qué se hizo
- **Superficie de olas** (`render.js`): tres olas largas que viajan sobre toda la pintura; la altura es pintura + olas. De la inclinación salen la luz, el brillo mojado, el reflejo del cielo y la **refracción** (el color se ve desplazado). Se calculan con tablas por columna y fila para que sea barato (~8 ms por cuadro en una malla de 320×180).
- **Líneas más anchas** (`trails.js`): cada agente reparte lo que deposita en varias celdas con un núcleo gaussiano (`DEPOSIT_RADIUS`). La cantidad total no cambia; cambia el ancho.
- **Verter** (`main.js`): mantener el clic emite pintura **dorada** (`POUR_RATE`) en el cursor, en la dirección en que se mueve la mano. **El dorado es lo que pone la persona; el resto lo pone el sistema.**
- Al soltar el clic nace un **criterio** (la fuente que sigue sin la persona), que **se apaga solo** (`CRITERION_LIFE`) y emite menos a medida que pierde fuerza.
- La pintura dorada **dura más** que la del sistema (`GOLD_DECAY`) y **atrae** a los agentes que pasan cerca (sensores sobre el canal dorado). La pregunta 2 de la narración la controla con `senseMul`.
- **Saturación** (`PAINT_SATURATION`): mezclar pigmentos apaga el color; ahora se aviva. A media calidez, azul y dorado dan verde oliva, como pigmentos de verdad.
- Se eliminó todo el juicio por clic: máscaras de conservado y soltado, medición de origen, `judgment.js` y seis parámetros. El registro ahora guarda cada **vertido** (cuándo, dónde, cuánto duró) y cada decisión de la narración.
- Textos: la frase sobre el gesto ahora dice *"Mantén el clic: viertes tu propia pintura, en dorado. / Lo que viertes sigue su camino sin ti."* La pregunta 2 pasó de "Conservarlo / Soltarlo" a **"Seguirlo / Dejarlo pasar"**, porque ya no hay gesto de conservar. **Son borrador: la redacción es de Valen.**

## Qué cambia para la tesis
Antes el registro medía "qué conserva la persona según el origen de la pintura". Esa medida **ya no existe**: sin conservar y soltar no hay origen conservado. La evidencia ahora es:
- las **decisiones de la narración** (qué eligió en cada pregunta),
- los **vertidos** (cuánto, dónde y con qué dirección),
- la **obra final** (imagen y miniatura de 32×18 para compararla entre personas).
Esto responde mejor a la tesis nueva (decisiones distintas, obras distintas), pero se pierde la parte de la hipótesis original sobre los desvíos conservados. Es un cambio de interpretación y conviene decirlo en la presentación.

## Un error mío, ya corregido
Al editar la frase del juicio en `config.js` borré por accidente las preguntas y la pregunta final (un reemplazo de texto abarcó de más). La narración dejó de arrancar con `CONFIG.QUESTIONS is not iterable`. Lo detecté al probar en el navegador, restauré el bloque desde el último commit y comparé las claves de configuración: solo salieron los seis parámetros del juicio y entraron los nuevos.

## Verificación
- Renderizado con **el código real de dibujo** (con un p5 simulado): olas, vertido dorado y la calidez fría, media y cálida.
- En el navegador (clics simulados): el vertido queda registrado (`vertidos 1`) y nace un criterio (`criterios 1 / 10`).
- **No verificado:** cómo se siente verter con un mouse real, el movimiento de las olas a velocidad normal (las imágenes son fijas), el sonido, el rendimiento con la pantalla real.

## Hipótesis (completar ANTES de probar)
- Mantener el clic para verter se entiende sin explicación: ___
- La pintura dorada se lee como "lo mío" frente a lo del sistema: ___

## Observación (completar DESPUÉS)
- ___

## Qué decidí / qué delegué (propuesta de línea para la ficha, sección 10)
| Rechazar la textura y el gesto de soltar, pedir olas, líneas más anchas y verter | Yo (criterio sobre cada resultado) | Evidencia para las preguntas 2 y 5: juzgué lo construido y lo corregí |
| El modelo de olas, la refracción, el vertido y toda la implementación | Delegué | Pendiente: probar y ajustar yo `WAVE_SWELL`, `DEPOSIT_RADIUS` y `POUR_RATE` |
