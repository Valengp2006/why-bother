# Explicar el dorado dentro de la narración

## Feedback de Valen
La parte del dorado necesita explicarse un poco más: por qué es así, cuál es su función y qué representa, y dentro de la misma narración.

## Diagnóstico
La narración decía *cómo* se hace ("Mantén el clic... lo que viertes sigue su camino sin ti") pero no *qué es* el dorado. El dorado es la pieza con más carga de sentido de la tesis, porque es lo único que pone la persona; sin esa lectura, parece un color más.

## Decisión de diseño
Dos momentos, cada uno cuando importa (igual que los demás colores):
1. **Invitación** (después de explicar los tres colores del sistema): *"Mantén el clic: viertes tu propia pintura."*
2. **Explicación** (cuando la persona vierte por primera vez y ya ve su dorado):
   - *"Lo dorado es lo tuyo."*
   - *"Todo lo demás lo pone el sistema solo."*
   - *"Lo tuyo dura más, atrae lo que pasa cerca y sigue su camino sin ti."*

Cada línea responde una de las preguntas de Valen: **qué representa** (lo tuyo), **por qué es así** (todo lo demás lo pone el sistema), **cuál es su función** (dura más, atrae, sigue sin ti). Corresponden a lo que de verdad hace el código: `GOLD_DECAY` más alto que `DECAY`, los sensores sobre el canal dorado y los criterios.

## Cuidado con el sesgo
La frase central describe el mecanismo, no concluye: dice que el dorado es lo único que el sistema no pone, que es verdad por construcción. No dice que sea "mejor" ni "más valioso". Se evitó a propósito una frase como "ninguna máquina pone esto por ti", porque afirmaría la tesis que la obra pone a prueba.

## Cómo funciona el disparador
- Si la persona ya vertió antes de la invitación, la invitación **se salta**.
- Si no vierte, la explicación aparece igual pasados **30 s** (`GOLD_EXPLAIN_WAIT`), para no dejar la historia esperando. Con ese texto la explicación sigue siendo válida aunque no haya vertido.
- La verificación del orden se hizo simulando tres casos (vierte pronto, nunca vierte, vierte antes de tiempo): la secuencia salió correcta en los tres. En pantalla se vieron la invitación y la explicación.

## Ritmo
La primera pregunta aparece a unos 73–90 s del inicio y la pregunta final a unos 137–175 s (según si vierte). Si se siente largo al probar con personas, se acorta con `STEP_GAP`, `NARRATIVE_MS` y `PROLOGUE_MS`.

## Qué decidí / qué delegué (propuesta de línea para la ficha, sección 10)
| Detectar que el dorado no se entendía y pedir que se explicara dentro de la narración | Yo | Criterio sobre cada resultado |
| La redacción de las tres frases (borrador) y el disparador | Delegué | Pendiente: que Valen las reescriba con sus palabras |

## Hipótesis (completar ANTES de probar con personas)
- Con la explicación, una persona nueva entiende que el dorado es lo suyo: ___
- La explicación no cambia cuánto vierte la persona (no la empuja): ___

## Observación (completar DESPUÉS)
- ___
