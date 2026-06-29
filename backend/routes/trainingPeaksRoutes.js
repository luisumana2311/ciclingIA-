const express = require("express");

const { importarWorkouts } = require("../controllers/trainingPeaksController");

const router = express.Router();

router.post("/importar", importarWorkouts);

module.exports = router;
