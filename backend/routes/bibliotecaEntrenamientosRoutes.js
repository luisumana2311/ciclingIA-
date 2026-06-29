const express = require("express");

const {
  obtenerEntrenamientosBiblioteca,
  obtenerResumenBiblioteca,
  reclasificarBiblioteca,
  obtenerPatronesEntrenador,
  obtenerEstructuraSemanalBiblioteca,
} = require("../controllers/bibliotecaEntrenamientosController");

const router = express.Router();

router.get("/resumen/:atletaId", obtenerResumenBiblioteca);

router.put("/reclasificar/:atletaId", reclasificarBiblioteca);

router.get("/patrones/:atletaId", obtenerPatronesEntrenador);

router.get("/estructura-semanal/:atletaId", obtenerEstructuraSemanalBiblioteca);

router.get("/:atletaId", obtenerEntrenamientosBiblioteca);

module.exports = router;
