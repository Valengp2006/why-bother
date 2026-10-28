# Nuevo rumbo (28/10/2026)

## Por qué cambió
Al probar la obra (hito 6) Valen sintió que era **superficial en intención y en finalidad**. El diagnóstico (ver `2026-10-23-profundidad-criterio.md`) mostró que la "claridad" medía qué tan parejo se movía la mano y no lo que se quería decir, y que no había contraste real entre intención e interpretación.

Valen volvió a las preguntas de la Actividad 3 (borrador en `docs/presentacion-borrador.md`) y de ahí salió una idea más honesta con su experiencia en el curso:

> Una IA puede ejecutar lo que yo no sé hacer, pero lo que hace que la obra sea mía son las decisiones que tomo mientras se hace. Si distintas decisiones producen obras distintas, el esfuerzo de decidir sigue valiendo la pena.

Esto es un **cambio de interpretación** (pregunta 1 de la presentación): se pasó de "intención contra interpretación" a "qué decisiones hacen mía una obra que ejecuta una máquina".

## Lo que Valen decidió
- La tesis de arriba, y que la obra **puede refutarla**: si decisiones distintas dan obras distintas, el sistema amplifica a quien decide; si todas terminan parecidas, el temor de Hodgin (arte genérico) se confirma.
- Que la obra final **quede y se pueda guardar** como imagen.
- Una **referencia visual nueva**: pintura fluida densa, azules, naranjas, dorados, crema (imagen de arte fluido con celdas).
- Una **pintura en constante movimiento**, como ríos que vagan sin rumbo, donde la persona interviene y el sistema responde.
- **Preguntas dentro de una narración**, con dos opciones por pregunta (clic en una); lo que se elige cambia lo que ocurre.
- **Sin celdas** por ahora (la reacción-difusión no es un modelo del curso).
- **Paleta ampliada**: parte del azul y turquesa aprobados y se inclina hacia cálidos (naranja, dorado, crema) según las decisiones.
- **Sonido de agua y viento** (sin escala musical), que también se inclina con las decisiones.
- Un **modo performance y un modo dev**, una **pantalla de inicio** donde empieza la narración, una historia que fluye con visuales y audio, y **colores que actúen como pintura real**.

## Lo que hice yo (propuesta, a revisar por Valen)
- El arco de cuatro preguntas y sus efectos (en `QUESTIONS` de `config.js`): guiar o dejar ir; conservar o soltar lo inesperado; pedirle que siga sin ti; ver o no el mecanismo.
- Las frases del prólogo, a partir de lo que Valen dijo en la conversación: *"Antes, imaginar algo así podía tomar años." / "Ahora, una intención basta para ponerlo en movimiento." / "Pero lo que quiere decir, lo decides tú."* **Son borrador: la redacción es de Valen.**
- Toda la implementación.

## Qué cambió en la obra
- **Pintura viva y autónoma** (`ambient.js`): corrientes en forma de remolinos (curl de ruido) que cambian con el tiempo, y fuentes que emiten agentes por sí solas. La mano es una perturbación: donde hay trazo manda el trazo.
- **Pintura real** (`render.js`): los colores se mezclan como pigmento (promedio geométrico ponderado), cubren al fondo según su cantidad y tienen grosor: su densidad se trata como una altura y las crestas atrapan luz (relieve y brillo húmedo).
- **Lo conservado fluye en dorado**: los agentes nacidos de un criterio depositan en un cuarto canal dorado que cubre a la demás pintura. Así lo que la persona conserva se ve como ríos dorados que salen de lo elegido, y el registro de origen no se contamina.
- **Paleta que se inclina** (`palette.js`, `world.js`): `warmth` va de frío a cálido y lo mueven las decisiones; color y sonido la siguen.
- **Narración con preguntas** (`narrative.js`): prólogo → frases que explican → cuatro preguntas → pregunta final. Las opciones flotan dentro de la pintura y se eligen con el clic.
- **Sonido** (`audio.js`, Tone.js): viento que respira, corriente que sigue al movimiento, gotas de agua, y un zumbido grave por cada zona conservada. Todo sube desde el silencio con la floración.
- **Pantalla de inicio**: título, invitación y el primer clic, que inicia el audio y no cuenta como decisión. En modo performance entra en pantalla completa.
- **Modos** (`mode.js`): `?modo=dev` (panel, consola `__CONFIG`, tecla N para saltar la narración) y `?modo=performance` (limpio).
- **Registro** (`log.js`): además de los juicios, guarda cada decisión de la narración y, al guardar la obra, la calidez final y una **miniatura de 32×18 píxeles** para comparar obras entre personas.

## Cómo se verifica la tesis (pruebas con otras personas)
1. Cada persona juega sin explicación, toma sus decisiones y guarda su obra (`S` o la pregunta final).
2. Se descarga el registro (`L`) y se anota qué eligió y qué observó.
3. Se comparan las obras finales (imágenes y miniaturas): ¿decisiones distintas dieron obras distintas?
4. Si casi todas se parecen, el temor de Hodgin se confirma, y eso también es un hallazgo.

## Qué NO está verificado (honesto)
- **El sonido no se ha escuchado**: se comprobó que arranca sin errores, pero no cómo suena. Hay que oírlo y ajustar.
- **El rendimiento real**: el navegador integrado va a pocos cuadros por segundo. Se midió solo el costo de dibujar la pintura (~9 ms por cuadro a 1080p) y la malla más ligera en modo performance.
- **La pintura se evaluó en simulaciones sin pantalla**, con ruido sustituto; en el navegador real el ambiente (ruido de Perlin) se verá distinto.
- **Que el PNG se descargue** en un navegador real, y la pantalla completa.
- **El recorrido completo** (cuatro preguntas y la final) con un mouse real. Se vieron las dos primeras preguntas.
- **Nada probado todavía con otras personas.**

## Lo que queda abierto
- Si las decisiones cambian **de verdad** las obras (lo dirán las pruebas), o si el sistema produce siempre algo parecido.
- El "pedir" no tiene un gesto propio: las decisiones son las respuestas a las preguntas.
- Ajustar la intensidad de la pintura (puede saturarse con mucho movimiento) y limpiar de `config.js` los parámetros que quedaron sin uso.

## Hipótesis (completar ANTES de probar)
- Dos personas que elijan caminos opuestos (guiar/frío frente a dejar ir/cálido) producirán obras claramente distintas: ___
- La pregunta 4 (ver cómo funciona) cambiará cómo se sienten con la obra: ___

## Observación (completar DESPUÉS)
- ___

## Qué decidí / qué delegué (propuesta de línea para la ficha, sección 10)
| La tesis nueva, la referencia visual, la narración con preguntas, el final guardable, el modo performance y el sonido de agua y viento | Yo (decisiones y criterio sobre cada resultado) | Evidencia para las preguntas 1 y 5 |
| El diseño del arco de preguntas, la redacción del prólogo (borrador), el modelo de pintura y toda la implementación | Delegué | Pendiente: que Valen reescriba los textos y pruebe cambiar un texto y un color sola |
