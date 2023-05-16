const express = require("express");
const bodyparser = require("body-parser");
const fs = require("fs");
const { default: mongoose } = require("mongoose");
const cache = require("./routes/cache")


const routes = require("./routes/endpoints");
const Cliente = require("./schemas/Cliente");
const Obra = require("./schemas/Obra");
const Empleado = require("./schemas/Empleado");

const PORT = 3000;
const app = express();

app.get("/", (req, res) => {
  res.send("API Node + MongoBD + Redis - 18401081");
});

const clienteData = JSON.parse(fs.readFileSync("src/assets/clientes.json", "utf-8"));
const empleadoData = JSON.parse(fs.readFileSync("src/assets/empleados.json", "utf-8"));
const obrasData = JSON.parse(fs.readFileSync("src/assets/obras.json", "utf-8"));

async function connect() {
  try {
    await mongoose.connect("mongodb://localhost:27017/Obras");
    await Cliente.collection.drop();
    await Obra.collection.drop();
    await Empleado.collection.drop();

    await Cliente.create(clienteData);
    await Empleado.create(empleadoData);
    await Obra.create(obrasData);

  } catch (error) {
    console.log(error);
  }
}

connect().catch((error) => console.log(error));

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
//app.use(cache);
app.use("/api", routes);

app.listen(PORT, () => console.log("Server en http://localhost: ", PORT));
