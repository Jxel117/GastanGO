const express = require("express");
const app = express();
const PORT = 3000;

// Endpoint raíz
app.get("/", (req, res) => {
  res.send("Hola Mundo Con Express");
});

// Levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
