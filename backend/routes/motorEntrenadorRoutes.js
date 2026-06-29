const express = require("express");

const {
  generarSemanaDesdeMotor,
} = require("../controllers/motorEntrenadorController");

const { protegerRuta } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/generar-semana", protegerRuta, generarSemanaDesdeMotor);

module.exports = router;
