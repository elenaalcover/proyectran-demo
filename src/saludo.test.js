// Tests de saludo.js con el runner integrado de Node: `node --test`.

const test = require("node:test");
const assert = require("node:assert");
const { saludar } = require("./saludo.js");

test("saluda por su nombre a la persona indicada", () => {
  assert.strictEqual(saludar("Ana"), "¡Hola, Ana! Bienvenido a Proyectran.");
});
