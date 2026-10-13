# proyectran-demo

Repo de formación para aprender a **usar Claude Code** en el equipo de Proyectran.

El código (`src/saludo.js`) es mínimo a propósito: lo importante es **cómo se organiza
Claude Code dentro de un proyecto**.

## Empezar

```bash
node src/saludo.js Ana   # comprobar que funciona
claude                   # abrir Claude Code en la carpeta del repo
```

## La estructura de Claude Code

```
proyectran-demo/
├── CLAUDE.md                          Memoria del proyecto (compartida)
├── .mcp.json                          Servidores MCP del proyecto
├── .gitignore                         Excluye lo personal (settings.local, CLAUDE.local.md)
├── .claude/
│   ├── settings.json                  Permisos y hooks del equipo
│   ├── rules/
│   │   └── estilo.md                  Reglas que se aplican solo a ciertos ficheros
│   ├── commands/
│   │   ├── saludar.md                 /saludar Ana
│   │   └── estado.md                  /estado
│   ├── skills/
│   │   └── revisar/SKILL.md           Cómo se revisa el código antes de la PR · /revisar
│   ├── agents/
│   │   └── integrador.md              Hace la PR: usa la skill revisar y, si aprueba, git push
│   ├── hooks/
│   │   ├── aprender.js                SessionEnd: extrae aprendizajes de la sesión
│   │   ├── cargar-memoria.js          SessionStart: los carga en el contexto
│   │   └── tests-antes-de-push.js     PreToolUse: bloquea git push si fallan los tests
│   └── memoria/
│       └── aprendizajes.md            Lo que Claude va aprendiendo (lo escriben los hooks)
└── src/
    ├── CLAUDE.md                      Memoria específica de esta carpeta
    ├── saludo.js                      Código de juguete
    └── saludo.test.js                 Su test (node --test)
```

| Pieza | Qué es | Cómo se usa / se ve |
|---|---|---|
| `CLAUDE.md` | Instrucciones que Claude lee al iniciar cada sesión. | `/memory` para verlo y editarlo. `/init` genera uno automáticamente. |
| `src/CLAUDE.md` | Memoria por carpeta: se carga al trabajar con ficheros de esa carpeta. | Automático. |
| `CLAUDE.local.md` | Memoria personal, no se versiona. | Créalo si lo necesitas (está en `.gitignore`). |
| `.claude/settings.json` | Configuración compartida: qué puede hacer Claude sin preguntar (`allow`), qué debe confirmarte antes (`ask`, aquí `git push`), qué tiene prohibido (`deny`) y hooks. | `/permissions` para ver los permisos activos. |
| `.claude/settings.local.json` | Tus ajustes personales en este repo (no se versiona). | Créalo si lo necesitas (está en `.gitignore`). |
| `.claude/rules/` | Reglas por tema; con `paths` solo se aplican a ciertos ficheros. | Automático al tocar `src/**/*.js`. |
| `.claude/commands/` | Comandos propios: un `.md` con un prompt que lanzas con `/nombre`. Admiten argumentos (`$ARGUMENTS`) y ejecutar comandos antes de enviarse (`` !`git status` ``). | `/saludar Ana`, `/estado`. |
| `.claude/skills/` | Habilidades reutilizables: el "cómo se hace" de una tarea (instrucciones y, si hace falta, scripts). Claude las usa cuando encajan, tú las lanzas con `/nombre` y los agentes las cargan. Aquí: `revisar`, la revisión previa a la PR. | `/revisar`. |
| `.claude/agents/` | Subagentes: asistentes especializados con su propio contexto y herramientas limitadas. Aquí: `integrador`, que hace la PR. Carga la skill con `skills: [revisar]`: **la skill dice cómo se revisa, el agente lo hace aparte y decide si sube**. | "Sube los cambios" (o `@agent-integrador`). Si editas el fichero, abre una sesión nueva para que se cargue. |
| Hooks (en `settings.json`) | Scripts que Claude Code ejecuta **siempre** en un momento concreto (no dependen de que Claude "se acuerde"). Aquí: `SessionStart`/`SessionEnd` para la memoria y `PreToolUse` como garantía antes del push. | `/hooks`. Ver más abajo. |
| `.mcp.json` | Conecta Claude con herramientas externas. Aquí: n8n de DataGrowth (consultar y lanzar workflows de automatización). Se autentica con la variable de entorno `N8N_MCP_TOKEN` (ver más abajo). | `/mcp` para conectarte. Prueba: "¿qué workflows hay en n8n?". |

### Conectar con n8n: la variable `N8N_MCP_TOKEN`

`.mcp.json` no guarda el token: solo lo referencia (`Bearer ${N8N_MCP_TOKEN}`), así que el
secreto nunca llega a git. Cada persona define la variable en su equipo:

1. Consigue tu token de acceso MCP de n8n (en la configuración de n8n o pídeselo a quien lo administre).
2. Defínelo como variable de entorno de usuario. En Windows:
   ```powershell
   setx N8N_MCP_TOKEN "tu-token"
   ```
3. Cierra y vuelve a abrir el editor o la terminal (las variables nuevas solo se ven en procesos nuevos)
   y comprueba la conexión con `/mcp`.

Si la variable no existe, `/mcp` mostrará el servidor `n8n` con error.

## Ideas para practicar

1. "Explícame qué hay en este repo y qué hace `src/saludo.js`" → Claude explora solo.
2. `/saludar Ana` y `/estado` → comandos propios.
   Diferencia con una skill: un **comando** es un prompt que lanzas tú; una **skill** es una
   carpeta (puede llevar scripts y otros ficheros) que Claude y los agentes usan cuando encaja.
3. "Añade una función `despedir` en `src/saludo.js` con su test" → fíjate en cómo aplica `estilo.md`.
4. `/revisar` → la skill revisa el cambio en tu conversación.
5. "Sube los cambios" → el agente `integrador` revisa, hace commit y push a `main`.
   Prueba también a romper el test (cambia el texto de `saludar`): verás que no hace ni commit.
6. Di una preferencia ("los commits, siempre en una línea"), cierra la sesión y abre otra:
   mira `.claude/memoria/aprendizajes.md` y pregunta "¿qué sabes de mis preferencias?".

### Subir cambios: el integrador hace la PR

```
"sube los cambios"
   └─▶ agente integrador (contexto propio)
         1. Preparar   cambios sin commit + commits sin subir; nada secreto
         2. Revisar    skill revisar: tests → formato → documentación
         3. Commit     solo si APROBADA (mensaje en español)   permiso "allow": local, reversible
         4. Push       git push origin main
               └─▶ hook PreToolUse: vuelve a pasar los tests  (garantía)
                     └─▶ permiso "ask": te pide confirmación   (tu aprobación)
                           └─▶ GitHub
```

Se trabaja en `main`: se revisa **antes** del commit, así que a `main` no llega nada sin revisar.

- La **skill dice cómo**: los criterios de revisión están en un solo sitio.
- El **agente decide**: aplica la skill, no corrige nada y, si algo falla, devuelve el informe.
- **Permisos según el riesgo**: `git add`/`git commit` en `allow` (es local y se puede deshacer);
  `git push` en `ask` (sale de tu equipo).
- El **hook garantiza**: `PreToolUse` se dispara antes de *cada* comando Bash; si es un
  `git push` y los tests fallan, lo bloquea (código de salida 2), lo haya pedido quien lo haya pedido.
- **Tú apruebas**: `git push` está en `ask`, así que siempre te pide confirmación.

### Hooks de memoria: cómo funcionan

- **`aprender.js` (SessionEnd)** recibe por stdin la ruta de la conversación (`transcript_path`),
  y en segundo plano llama a `claude -p --model haiku` para extraer lo aprendido (≈10 s).
  Usa la variable `APRENDIZAJE_EN_CURSO` como candado: esa llamada también es una sesión
  y, sin él, el hook se dispararía en bucle.
- **`cargar-memoria.js` (SessionStart)** imprime el fichero; lo que un hook `SessionStart`
  imprime entra en el contexto de Claude.
- Necesita el CLI `claude` en el PATH. Si solo tienes la extensión del editor, apunta
  `CLAUDE_BIN` a su ejecutable en `.claude/settings.local.json`: `{ "env": { "CLAUDE_BIN": "C:\\ruta\\claude.exe" } }`.
- Es un ejercicio para entender el mecanismo: Claude Code ya trae su propia memoria
  automática (`/memory`). Revisa el fichero de vez en cuando y borra lo que no sirva.

### Atajos útiles

| Atajo / comando | Para qué |
|---|---|
| `Shift+Tab` | Cambiar de modo (normal → aceptar ediciones → plan). |
| `Esc` / `Esc Esc` | Interrumpir / volver a un mensaje anterior. |
| `@fichero` | Añadir un fichero al contexto. |
| `/clear` · `/compact` | Empezar de cero · resumir la conversación. |
| `/model` | Cambiar de modelo. |
| `/help` | Ver todos los comandos. |
