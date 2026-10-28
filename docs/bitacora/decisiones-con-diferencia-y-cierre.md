# Decisiones que se notan y un cierre

## Feedback de Valen
No veo mucha diferencia entre tomar una decisión u otra, y la obra no tiene un cierre.

## Diagnóstico
- **Decisiones casi invisibles.** Cada opción multiplicaba uno o dos parámetros por factores modestos (1,5 o 0,6) y movía el color un 20 %. Varias eran casi imperceptibles (p. ej. la atracción hacia el dorado solo se nota cerca de lo vertido). Es un problema de fondo para la tesis: si elegir distinto no se nota, la obra confirma el temor de Hodgin en vez de ponerlo a prueba.
- **Sin cierre.** La obra nunca terminaba.

## Qué se hizo con las decisiones
Cada opción ahora cambia **varias cosas a la vez, con efectos opuestos entre sí** (`QUESTIONS` en `config.js`). Se añadieron controles nuevos del mundo: altura de las olas, rapidez, densidad de la pintura, cuánto se desvían los agentes, brillo, y cuánto dura lo que se vierte. Y un cambio de calidez más fuerte (±0,35).

| Pregunta | Opción | Resultado |
|---|---|---|
| ¿Guías el río o lo dejas ir? | Guiarlo | La pintura sigue la mano, mar en calma, poca agua propia, colores fríos |
| | Dejarlo ir | Ríos propios abundantes, olas altas, todo más rápido y cálido |
| ¿Qué haces con lo inesperado? | Seguirlo | Más desvíos, capa espesa, lo tuyo atrae y emite mucho más |
| | Dejarlo pasar | Casi sin desvíos, capa fina, la pintura se borra rápido |
| ¿Le pides que siga sin ti? | Sí | El sistema llena la pantalla y lo que viertes dura mucho |
| | No | Casi no pone nada solo: la pantalla se vacía si la persona no la llena |
| ¿Quieres ver cómo funciona? | Mostrarme | Se ve el campo y los agentes |
| | Prefiero no verlo | Solo la pintura, más brillante y con más oleaje |

Además, cada decisión lanza una **onda** que se abre desde la opción elegida, para que el cambio se perciba en el momento.

## Verificación (con el código real de dibujo, mismo trazo y mismo vertido)
Dos recorridos opuestos:
- **A** (guiarlo, dejarlo pasar, no): oscuro, escaso y frío; casi solo se ve la línea dorada de la persona.
- **B** (dejarlo ir, seguirlo, sí): pantalla llena de seda cálida y agitada.
La diferencia es evidente a simple vista. La pregunta *"¿Le pides que siga sin ti?"* es especialmente cercana a la tesis: con *No*, la obra casi se vacía si la persona no pone nada, es decir, se nota qué cuesta no tomarse el trabajo.

## El cierre
La obra termina de forma deliberada de tres maneras:
1. Al elegir **'Guardarla'** en la pregunta final (primero se guarda la imagen, luego se cierra).
2. Con la tecla **E**, en cualquier momento.
3. Por **inactividad**: tras la pregunta final, si pasan `IDLE_TIMEOUT_MS` (45 s) sin mover el mouse ni hacer clic.

Durante el cierre (`DISSOLVE_SECONDS`, 18 s) el sistema deja de poner pintura, el mar se aquieta, lo que hizo el sistema se disuelve cada vez más rápido y **lo dorado dura mucho más** (`GOLD_DECAY_REST`): lo que queda es lo de la persona. Suena una nota grave que se extingue y todo el sonido baja a silencio. Aparece un epílogo, frase por frase (*"El agua corrió sola." / "Por dónde, lo decidiste tú."*, borrador de Valen para editar en `EPILOGUE`), y al terminar aparecen el título *Cauce* y la invitación *"Haz clic para volver a empezar"*. Un clic reinicia todo desde la pantalla de inicio.

## Verificado y no verificado
- Verificado: la secuencia de cierre en el navegador (epílogo, título, invitación) y que el clic en el reposo reinicia el estado (`started` vuelve a `false`, sin agentes) y vuelve a mostrar la pantalla de inicio.
- **No verificado:** la onda de las decisiones en pantalla (se implementó y compila, pero no se vio); el cierre por 'Guardarla' y por inactividad; el sonido de cierre (la nota final y el fundido); y todo con un mouse real.

## Atención para el análisis de la tesis
Las decisiones ahora cambian mucho la obra, así que la comparación entre personas tiene sentido: se registran las decisiones (`choices`), los vertidos (`pours`) y la obra final (`final`, con miniatura de 32×18). Al reiniciar, la sesión anterior se pierde: **descargar el registro con `L` antes de volver a empezar.**

## Hipótesis (completar ANTES de probar con personas)
- Dos personas con decisiones opuestas producirán obras que se distinguen a simple vista: ___
- El *No* de "¿Le pides que siga sin ti?" hace que la persona vierta más: ___

## Observación (completar DESPUÉS)
- ___

## Qué decidí / qué delegué (propuesta de línea para la ficha, sección 10)
| Detectar que las decisiones no se notaban y que faltaba un cierre | Yo | Criterio sobre cada resultado; evidencia para las preguntas 2 y 5 |
| El diseño de los efectos opuestos, la secuencia de cierre y toda la implementación | Delegué | Pendiente: que Valen reescriba las frases del epílogo y ajuste los efectos a su gusto |
