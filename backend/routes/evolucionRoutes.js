const express = require("express");

const {
  obtenerEvolucionAtleta,
} = require("../controllers/evolucionController");

const router = express.Router();

router.get("/:atletaId", obtenerEvolucionAtleta);

module.exports = router;
