const HistorialSemanal = require("../models/HistorialSemanal");

const obtenerEvolucionAtleta = async (req, res) => {
  try {
    const { atletaId } = req.params;

    const historial = await HistorialSemanal.find({
      atletaId,
    }).sort({
      fechaInicioSemana: 1,
    });

    res.json(historial);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error obteniendo evolución",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerEvolucionAtleta,
};
