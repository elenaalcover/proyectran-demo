// Hook PreToolUse (Bash): bloquea cualquier `git push` si los tests fallan.
// Es la garantía del pipeline: aunque el agente se salte un paso, no se sube código roto.
// Solo el código de salida 2 bloquea (el 1 NO); el mensaje de stderr le llega a Claude.

const path = require("path");
const { spawnSync } = require("child_process");

const RAIZ = path.join(__dirname, "..", "..");
const ES_PUSH = /\bgit\b[^;&|\n]*\bpush\b/; // también detecta `git -C ruta push`

let entrada = "";
process.stdin.on("data", (trozo) => (entrada += trozo));
process.stdin.on("end", () => {
  let comando;
  try {
    comando = JSON.parse(entrada).tool_input?.command || "";
  } catch {
    // Si no se puede leer la entrada, mejor bloquear (fallar "en cerrado") que dejar pasar un push.
    comando = entrada;
  }
  if (!ES_PUSH.test(comando)) process.exit(0);

  const tests = spawnSync(process.execPath, ["--test"], {
    cwd: RAIZ,
    encoding: "utf8",
    timeout: 60000,
  });
  if (tests.status !== 0) {
    const motivo = tests.error ? tests.error.message : `${tests.stdout}\n${tests.stderr}`;
    console.error(`Push bloqueado por hook: los tests no pasan.\n${motivo}`);
    process.exit(2);
  }
  process.exit(0);
});
