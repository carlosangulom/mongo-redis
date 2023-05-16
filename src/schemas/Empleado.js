const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const model = mongoose.model;

const empledoSchema = Schema(
  {
    _idEmpleado: String,
    RFC: String,
    Nombre: String,
    Cel: String,
    Pago: Number,
    Actividades: [String],
  },
  { versionKey: false }
);

module.exports = model("Empleado", empledoSchema);
