const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const model = mongoose.model;

const obraSchema = Schema({
    idObra: String,
    Descripcion: String,
    CostoBase: Number,
    idCliente: String,
    idEmpleados: [String],
  }, {versionKey: false});

  module.exports = model("Obra", obraSchema);