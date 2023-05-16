const express = require("express");
const Cliente = require("../schemas/Cliente");
const Obra = require("../schemas/Obra");
const Empleado = require("../schemas/Empleado");
const cache = require("./cache");

//Middleware
const router = express.Router();

router
  .route("/")
  .all(cache)
  .get(async (req, res) => {
    await res.send("API - OK");
  });

router
  .route("/cliente/:_idCliente")
  .all(cache)
  .get(async (req, res) => {
    await Obra.aggregate([
      { $match: { idCliente: req.params._idCliente } },
      {
        $lookup: {
          from: "clientes",
          localField: "idCliente",
          foreignField: "_idCliente",
          as: "cliente",
        },
      },
      { $unwind: "$cliente" },
      {
        $group: {
          _id: "$cliente._idCliente",
          RFC: { $first: "$cliente.RFC" },
          Nombre: { $first: "$cliente.Nombre" },
          Cel: { $first: "$cliente.Cel" },
          Obras: {
            $push: {
              idObra: "$idObra",
              Descripcion: "$Descripcion",
              CostoBase: "$CostoBase",
            },
          },
        },
      },
      {
        $project: {
          RFC: 1,
          Nombre: 1,
          Cel: 1,
          Obras: 1,
        },
      },
    ]).then((data) => {
      res.json(data);
    });
  });

router
  .route("/empleado/:_idEmpleado")
  .all(cache)
  .get(async (req, res) => {
    await Cliente.aggregate([
      {
        $lookup: {
          from: "obras",
          localField: "_idCliente",
          foreignField: "idCliente",
          as: "obras",
        },
      },
      { $unwind: "$obras" },
      {
        $lookup: {
          from: "empleados",
          localField: "obras.idEmpleados",
          foreignField: "_idEmpleado",
          as: "empleados",
        },
      },
      { $unwind: "$empleados" },
      { $match: { "empleados._idEmpleado": req.params._idEmpleado } },
      {
        $group: {
          _id: "$empleados._idEmpleado",
          RFC: { $first: "$empleados.RFC" },
          Nombre: { $first: "$empleados.Nombre" },
          Cel: { $first: "$empleados.Cel" },
          Actividades: { $sum: "$empleados.Actividades" },
          Pago: { $first: "$empleados.Pago" },
          Obras: {
            $push: {
              idObra: "$obras.idObra",
              Descripcion: "$obras.Descripcion",
              CostoBase: "$obras.CostoBase",
            },
          },
        },
      },
      {
        $project: {
          Nombre: 1,
          RFC: 1,
          Cel: 1,
          Pago: 1,
          Actividades: 1,
          Obras: 1,
        },
      },
    ]).then((data) => {
      res.json(data);
    });
  });

router
  .route("/obra/:idObra")
  .all(cache)
  .get(async (req, res) => {
    await Obra.aggregate([
      { $match: { idObra: req.params.idObra } },
      {
        $lookup: {
          from: "clientes",
          localField: "idCliente",
          foreignField: "_idCliente",
          as: "cliente",
        },
      },
      {
        $project: { Descripcion: 1, CostoBase: 1, Cliente: "$cliente.Nombre" },
      },
    ]).then((data) => res.json(data));
  });

router
  .route("/obra/pago/:idObra")
  .all(cache)
  .get(async (req, res) => {
    await Obra.aggregate([
      { $match: { idObra: req.params.idObra } },
      {
        $lookup: {
          from: "empleados",
          localField: "idEmpleados",
          foreignField: "_idEmpleado",
          as: "empleados",
        },
      },
      { $unwind: "$empleados" },
      { $group: { _id: "$idObra", total_pagos: { $sum: "$empleados.Pago" } } },
      { $project: { _id: 0, total_pagos: 1 } },
    ]).then((data) => res.json({ Pago: data }));
  });

router
  .route("/cliente/Q5/:_idCliente")
  .all(cache)
  .get(async (req, res) => {
    await Cliente.aggregate([
      { $match: { _idCliente: "Cliente1" } },
      {
        $lookup: {
          from: "obras",
          localField: "_idCliente",
          foreignField: "idCliente",
          as: "obra",
        },
      },
      { $unwind: "$obra" },
      {
        $lookup: {
          from: "empleados",
          localField: "obra.idEmpleados",
          foreignField: "_idEmpleado",
          as: "empleados",
        },
      },
      {
        $group: {
          _id: req.params._idCliente,
          Cliente: { $first: "$Nombre" },
          Obras: {
            $push: {
              Descripcion: "$obra.Descripcion",
              Empleados: {
                Nombre: "$empleados.Nombre",
                Actividades: { $concatArrays: "$empleados.Actividades" },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          Cliente: 1,
          Obras: 1,
          Empleados: 1,
        },
      },
    ]).then((data) => res.json(data));
  });

router
  .route("/cliente/nuevo")
  .all(cache)
  .post(async (req, res) => {
    let nuevoCliente = {
      _idCliente: req.body.idCliente,
      RFC: req.body.RFC,
      Nombre: req.body.Nombre,
      Cel: req.body.Cel,
    };

    await Cliente.create(nuevoCliente).then((data) =>
      res.json({ "Nuevo Cliente": data })
    );
  });

router
  .route("/obra/nueva/:idCliente")
  .all(cache)
  .post(async (req, res) => {
    let _idCliente = req.params.idCliente;

    let nuevaObra = {
      idObra: req.body.idObra,
      Descripcion: req.body.Descripcion,
      CostoBase: req.body.CostoBase,
      idCliente: _idCliente,
      idEmpleado: [],
    };

    await Obra.create(nuevaObra).then((data) =>
      res.json({ "Nueva Obra": data })
    );
  });

router
  .route("/empleado/nuevo/:idObra")
  .all(cache)
  .post(async (req, res) => {
    let _idObra = req.params.idObra;

    let nuevoEmpleado = {
      _idEmpleado: req.body.idEmpleado,
      RFC: req.body.RFC,
      Nombre: req.body.Nombre,
      Cel: req.body.Cel,
      Pago: req.body.Pago,
      Actividades: req.body.Actividades,
    };

    await Empleado.create(nuevoEmpleado);
    await Obra.findOneAndUpdate(
      { idObra: _idObra },
      { $push: { Empleado: nuevoEmpleado._idEmpleado } }
    ).then(() => {
      res.json({ "Nuevo Empleado": nuevoEmpleado, Obra: _idObra });
    });
  });

router
  .route("/cliente/:idCliente")
  .all(cache)
  .put(async (req, res) => {
    const filter = { _idCliente: req.params.idCliente };
    const update = {
      RFC: req.body.RFC,
      Nombre: req.body.Nombre,
      Cel: req.body.Cel,
    };

    await Cliente.findOneAndUpdate(filter, update, { new: true }).then((data) =>
      res.json({ "Datos Actualizados": data })
    );
  });

router
  .route("/obra/:idObra")
  .all(cache)
  .put(async (req, res) => {
    const filter = { idObra: req.params.idObra };
    const update = {
      Descripcion: req.body.Descripcion,
      CostoBase: req.body.CostoBase,
      idCliente: req.body.idCliente,
      idEmpleados: req.body.idEmpleados,
    };

    Obra.findOneAndUpdate(filter, update, { new: true }).then((data) =>
      res.json({ "Datos Actualizados": data })
    );
  });

router
  .route("/empleado/:idEmpleado")
  .all(cache)
  .put(async (req, res) => {
    const filter = { _idEmpleado: req.params.idEmpleado };
    const update = {
      RFC: req.body.RFC,
      Nombre: req.body.Nombre,
      Cel: req.body.Cel,
      Pago: req.body.Pago,
      Actividades: req.body.Actividades,
    };

    await Empleado.findOneAndUpdate(filter, update, { new: true }).then(
      (data) => res.json({ "Datos Actualizados": data })
    );
  });

router
  .route("/cliente/:idCliente")
  .all(cache)
  .delete(async (req, res) => {
    const idCliente = req.params.idCliente;

    await Obra.find({ idCliente: idCliente })
      .then((data) => {
        data.map((obra) => {
          obra.idEmpleados.forEach((f) => {
            Empleado.deleteOne({ _idEmpleado: f }).exec();
          });
        });
      })
      .then(Obra.deleteMany({ idCliente: idCliente }).exec())
      .then(Cliente.findOneAndDelete({ _idCliente: idCliente }))
      .then(res.json({ Eliminado: true }));
  });

module.exports = router;
