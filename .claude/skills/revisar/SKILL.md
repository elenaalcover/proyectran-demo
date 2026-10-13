---
name: revisar
description: Revisión completa del código antes de una pull request (tests, formato y documentación). La usa el agente integrador antes de subir cambios; también se puede lanzar con /revisar para revisar los cambios pendientes.
allowed-tools: Bash(node --test), Bash(node --check:*), Bash(git status), Bash(git diff:*), Bash(git log:*), Read, Grep, Glob
---

# Revisión antes de la PR

Esta skill define **cómo se revisa el código en Proyectran**. Es la única fuente de criterios:
si cambia la forma de revisar, se cambia aquí y el agente integrador la aplica tal cual.

## Qué revisar
- Si te indican un rango de commits o unos ficheros, revisa eso.
- Si no, revisa los cambios pendientes (`git status` y `git diff`).

## Pasos (en orden; si uno da ❌, los siguientes quedan ⏭️)

### 1. Tests
- [ ] `node --test`: todos los tests pasan.
- [ ] El cambio tiene un test (`*.test.js`) que lo cubre, incluidos los casos límite razonables.

### 2. Formato
- [ ] `node --check <fichero>` en cada `.js` modificado: sin errores de sintaxis.
- [ ] Sangría de 2 espacios.
- [ ] Cumple `.claude/rules/estilo.md`: `const` por defecto, nombres en español y camelCase,
      plantillas de texto en vez de concatenar.

### 3. Documentación
- [ ] Cada función nueva o modificada lleva un comentario de una línea (`src/CLAUDE.md`).
- [ ] Todo en español: código, comentarios y mensajes de commit.
- [ ] Si cambia cómo se usa el proyecto, el `README.md` está actualizado.

## Resultado
```
1. Tests          ✅ / ❌ / ⏭️  <detalle>
2. Formato        ✅ / ❌ / ⏭️  <fichero:línea si falla>
3. Documentación  ✅ / ❌ / ⏭️  <fichero:línea si falla>
⚠️ Sugerencias: <lo mejorable que no bloquea>
Veredicto: APROBADA / CAMBIOS SOLICITADOS
```
Solo es APROBADA si los tres pasos están en ✅. No modifiques nada: solo informa.
