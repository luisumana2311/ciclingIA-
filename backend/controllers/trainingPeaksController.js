const {
  obtenerWorkoutsTrainingPeaks,
} = require("../services/trainingPeaksService");

const {
  guardarWorkoutsTrainingPeaks,
} = require("../services/entrenamientoBibliotecaService");

const importarWorkouts = async (req, res) => {
  try {
    const { atletaId, fechaInicio, fechaFin } = req.body;

    const workouts = await obtenerWorkoutsTrainingPeaks(fechaInicio, fechaFin);

    const resultado = await guardarWorkoutsTrainingPeaks(workouts, atletaId);

    return res.json({
      mensaje: "Importación completada",
      ...resultado,
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: error.message,
    });
  }
};

module.exports = {
  importarWorkouts,
};
