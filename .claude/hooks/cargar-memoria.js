// Hook SessionStart: al abrir una sesión, carga los aprendizajes guardados.
// Todo lo que este script imprime por stdout entra en el contexto de Claude.

const fs = require("fs");
const path = require("path");

const FICHERO_MEMORIA = path.join(__dirname, "..", "memoria", "aprendizajes.md");

if (fs.existsSync(FICHERO_MEMORIA)) {
  console.log("Aprendizajes de sesiones anteriores en este proyecto:\n");
  console.log(fs.readFileSync(FICHERO_MEMORIA, "utf8"));
}
