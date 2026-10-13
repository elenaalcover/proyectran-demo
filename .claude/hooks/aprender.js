// Hook SessionEnd: al cerrar la sesión, extrae aprendizajes y los guarda en memoria.
// Claude Code envía por stdin un JSON con, entre otros, `transcript_path`
// (la conversación completa en formato JSONL).
//
// El trabajo pesado (llamar a `claude -p`) se hace en un proceso en segundo plano
// para no retrasar el cierre de la sesión.

const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const FICHERO_MEMORIA = path.join(__dirname, "..", "memoria", "aprendizajes.md");
const CLAUDE = process.env.CLAUDE_BIN || "claude";

if (process.argv[2] === "--trabajar") {
  aprender(process.argv[3]);
} else if (process.env.APRENDIZAJE_EN_CURSO) {
  // Candado: la llamada a `claude -p` también es una sesión y dispararía este hook en bucle.
  process.exit(0);
} else {
  let entrada = "";
  process.stdin.on("data", (trozo) => (entrada += trozo));
  process.stdin.on("end", () => {
    const { transcript_path } = JSON.parse(entrada);
    spawn(process.execPath, [__filename, "--trabajar", transcript_path], {
      detached: true,
      stdio: "ignore",
      env: { ...process.env, APRENDIZAJE_EN_CURSO: "1" },
    }).unref();
  });
}

// Lee la conversación, pide a Claude los aprendizajes nuevos y los añade al fichero.
function aprender(rutaTranscripcion) {
  const conversacion = leerConversacion(rutaTranscripcion);
  if (!conversacion) return;

  const memoriaActual = fs.existsSync(FICHERO_MEMORIA)
    ? fs.readFileSync(FICHERO_MEMORIA, "utf8")
    : "";

  const instrucciones = `Analiza esta conversación entre una persona y Claude Code.
Extrae como máximo 3 aprendizajes útiles para futuras sesiones en este proyecto
(preferencias, convenciones, decisiones o errores a evitar).
No repitas nada de lo que ya está en la memoria actual.
Responde SOLO con viñetas en español que empiecen por "- ", o con la palabra NADA.

## Memoria actual
${memoriaActual}

## Conversación
${conversacion}`;

  const resultado = spawnSync(`"${CLAUDE}" -p --model haiku`, {
    input: instrucciones,
    encoding: "utf8",
    shell: true,
  });
  const respuesta = (resultado.stdout || "").trim();
  if (!respuesta || respuesta === "NADA") return;

  const fecha = new Date().toISOString().slice(0, 10);
  fs.mkdirSync(path.dirname(FICHERO_MEMORIA), { recursive: true });
  fs.appendFileSync(FICHERO_MEMORIA, `\n### ${fecha}\n${respuesta}\n`);
}

// Devuelve el texto de los mensajes (persona y Claude), recortado a lo último.
function leerConversacion(ruta) {
  if (!ruta || !fs.existsSync(ruta)) return "";
  const lineas = fs.readFileSync(ruta, "utf8").split("\n").filter(Boolean);
  const textos = [];
  for (const linea of lineas) {
    let registro;
    try { registro = JSON.parse(linea); } catch { continue; }
    if (registro.type !== "user" && registro.type !== "assistant") continue;
    const contenido = registro.message?.content;
    const texto = typeof contenido === "string"
      ? contenido
      : (contenido || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
    if (texto) textos.push(`${registro.type === "user" ? "Persona" : "Claude"}: ${texto}`);
  }
  return textos.join("\n\n").slice(-20000);
}
