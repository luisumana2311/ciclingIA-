const express = require("express");

const {
  crearActividadGarmin,
  obtenerActividadesPorAtleta,
} = require("../controllers/actividadGarminController");

const router = express.Router();

router.post("/", crearActividadGarmin);

router.get("/atleta/:atletaId", obtenerActividadesPorAtleta);

module.exports = router;
