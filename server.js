const express = require("express");
const { engine } = require("express-handlebars");
const PORT = 8080;
const Contenedor = require("./Contenedor");
const productosBD = new Contenedor("productos.json");
const chatBD = new Contenedor("chat.json");

const app = express();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer);

httpServer.listen(process.env.PORT || PORT, () => console.log("SERVER ON"));
httpServer.on("error", (error) => console.log(`Error en el servidor ${error}`));

//
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuracion del motor HANDLEBARS
app.set("view engine", "hbs");
app.set("views", "./views");
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "index.hbs",
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
  })
);

let productos = [];
let chat = [];

app.get("/", async (req, res) => {
  productos = await productosBD.getAll();
  chat = await chatBD.getAll();
  res.render("form-list-chat", { productos, chat });
});

io.on("connection", (socket) => {
  console.log("Usuario Conectado" + socket.id);
  socket.on("producto", async (data) => {
    await productosBD.save(data);
    productos = await productosBD.getAll();
    io.sockets.emit("producto-row", data);
  });
  socket.on("mensaje", async (data) => {
    await chatBD.save(data);
    chat = await chatBD.getAll();
    io.sockets.emit("chat", chat);
  });
});
