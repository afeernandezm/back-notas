const express = require("express");

const path = require("path");
const cors = require("cors");

const usuarioRoutes = require("./routes/usuarios");
const notasRoutes = require("./routes/notas");
const chatsRoutes = require("./routes/chats");

const session = require("express-session");

const app = express();

app.use(express.json());

app.use(cors());

app.use("/chatPad", usuarioRoutes);
 app.use("/chatPad", notasRoutes);
/* app.use("/chatPad", chatsRoutes);  */

app.use(express.static(path.join(__dirname, "public")));

// Ruta GET para mostrar el index

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Inicia el servidor web

// eslint-disable-next-line no-console
app.listen(3000, () => console.log("Servidor iniciado en el puerto 3000"));
