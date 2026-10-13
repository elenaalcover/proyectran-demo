---
description: Resume en qué punto está el repo (cambios pendientes y últimos commits)
allowed-tools: Bash(git status:*), Bash(git log:*)
---

Las líneas que empiezan por exclamación se ejecutan antes de enviar el prompt
a Claude, y su resultado se inserta en su lugar:

## Cambios pendientes
!`git status --short`

## Últimos commits
!`git log --oneline -5`

Resume en 3 viñetas en qué punto está el proyecto y qué sería lo siguiente.
