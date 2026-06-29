const ActividadGarmin = require("../models/ActividadGarmin");

const {
  clasificarActividad,
} = require("../services/clasificadorActividadService");

const crearActividadGarmin = async (req, res) => {
  try {
    const clasificacionAutomatica = clasificarActividad(req.body);

    const actividad = await ActividadGarmin.create({
      ...req.body,
      clasificacion: clasificacionAutomatica.clasificacion,
      objetivoFisiologico: clasificacionAutomatica.objetivoFisiologico,
      dificultad: clasificacionAutomatica.dificultad,
    });

    res.status(201).json(actividad);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error creando actividad Garmin",
      error: error.message,
    });
  }
};

const obtenerActividadesPorAtleta = async (req, res) => {
  try {
    const { atletaId } = req.params;

    const actividades = await ActividadGarmin.find({ atletaId }).sort({
      fecha: -1,
    });

    res.json(actividades);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error obteniendo actividades Garmin",
      error: error.message,
    });
  }
};

module.exports = {
  crearActividadGarmin,
  obtenerActividadesPorAtleta,
};
