const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const model = mongoose.model;


const clienteSchema = Schema({
  _idCliente: String,
  RFC: String,
  Nombre: String,
  Cel: String,
}, {versionKey: false});

module.exports = model("Cliente", clienteSchema);
