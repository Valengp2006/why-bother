# Capa narrativa (23/10/2026)

## Feedback de Valen
Tras añadir la instrucción mínima y la intención visible, mejora, pero sigue faltando algo para que la persona entienda. Propone una **capa narrativa corta** que explique por qué es así y qué representa cada cosa.

## Cambio de interpretación / de diseño
`AGENT.md` decía: no agregar textos ni mensajes que concluyan por la persona. Valen decide agregar texto explicativo. Se acordó que la capa **describe el mecanismo** (qué es cada cosa y cómo se relaciona) y **no juzga**: no dice que el desvío sea bueno o malo, porque eso es lo que la obra pone a prueba. Esto queda como evidencia para la pregunta 1 (cómo cambió mi interpretación).

## Decisión de Valen sobre el cuándo
Opción **contextual**: cada frase aparece una vez, en orden, cuando su elemento aparece en pantalla, y se desvanece sola.

## Las frases (editables en `NARRATIVE_TEXT` de `config.js`)
1. **Intención** (al empezar a moverse con intención): *"Tu mano marca una intención. Mientras más clara, más lejos llega."*
2. **Comportamientos** (cuando ya hay fieles y otros agentes): *"Lo que nace de ella la interpreta."* / *"Blanco: sigue lo que quisiste."* / *"Turquesa: se desvía, pero en grupo."* / *"Azul: se pierde."* Cada línea va en el color que nombra.
3. **Juicio** (5 s después de la anterior): *"Tú decides qué se queda."* / *"Clic: conservar, en dorado. Clic derecho: soltar."* Está **desactivada** (`JUDGMENT_ENABLED: false`) hasta el hito 6, cuando existen los clics.

## Qué se hizo
- `narrative.js`: máquina de estados con las frases en orden, condición de aparición de cada una y desvanecimiento.
- Las frases se dibujan abajo, centradas, para no tapar la pintura. La instrucción inicial sigue en el centro.
- Con `NARRATIVE_ENABLED: false` la obra queda sin texto salvo la instrucción inicial.

## Para probar con otras personas
- Comparar la comprensión con y sin la capa (`NARRATIVE_ENABLED`): ¿qué creen que representa cada color? ¿Entienden que el trazo produce el resto?
- Observar si la frase 2 influye en lo que conservan: si el texto "explica" a los desvíos como algo valioso o no. Anotarlo, porque podría sesgar el experimento.

## Hipótesis (completar ANTES de probar)
- Con la capa, una persona nueva identifica los tres comportamientos sin ayuda: ___
- La frase 2 cambia cuántos desvíos se conservan respecto a una sesión sin ella: ___

## Observación (completar DESPUÉS)
- ___

## Qué decidí / qué delegué (propuesta de línea para la ficha, sección 10)
| Agregar una capa narrativa que explique sin concluir, y que aparezca de forma contextual | Yo propuse la capa y elegí el cuándo; delegué la redacción del borrador y la implementación | Cambio respecto a AGENT.md ("no agregar textos"); revisar el sesgo que puede introducir |
