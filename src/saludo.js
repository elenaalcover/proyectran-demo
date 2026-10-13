// Código de prueba: solo es la excusa para practicar con Claude Code.

// Devuelve el mensaje de bienvenida para la persona indicada.
function saludar(nombre) {
  return `¡Hola, ${nombre}! Bienvenido a Proyectran.`;
}

module.exports = { saludar };

// Solo imprime si se ejecuta directamente (`node src/saludo.js Ana`), no al importarlo en los tests.
if (require.main === module) {
  console.log(saludar(process.argv[2] || "equipo"));
}
