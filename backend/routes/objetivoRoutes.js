const express = require("express");
const router = express.Router();

const {
  crearObjetivo,
  obtenerObjetivos,
  obtenerObjetivoActivoPorAtleta,
  guardarObjetivoPrincipalPorAtleta,
} = require("../controllers/objetivoController");

router.get("/atleta/:atletaId/activo", obtenerObjetivoActivoPorAtleta);

router.post("/atleta/:atletaId/principal", guardarObjetivoPrincipalPorAtleta);

router.post("/", crearObjetivo);

router.get("/", obtenerObjetivos);

module.exports = router;
