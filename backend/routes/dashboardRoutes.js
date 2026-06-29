const express = require("express");
const {
  obtenerDashboardAtleta,
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/:atletaId", obtenerDashboardAtleta);

module.exports = router;
