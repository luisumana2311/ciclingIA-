const Objetivo = require("../models/Objetivo");

const crearObjetivo = async (req, res) => {
  try {
    const objetivo = new Objetivo(req.body);

    await objetivo.save();

    res.status(201).json(objetivo);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

const obtenerObjetivos = async (req, res) => {
  try {
    const objetivos = await Objetivo.find();

    res.json(objetivos);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

const obtenerObjetivoActivoPorAtleta = async (req, res) => {
  try {
    const { atletaId } = req.params;

    const objetivo = await Objetivo.findOne({
      atletaId,
      estado: "Activo",
    }).sort({
      prioridad: -1,
      fechaObjetivo: 1,
    });

    if (!objetivo) {
      return res.status(404).json({
        mensaje: "No hay objetivo activo para este atleta",
      });
    }

    res.json(objetivo);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error obteniendo objetivo activo",
      error: error.message,
    });
  }
};

const guardarObjetivoPrincipalPorAtleta = async (req, res) => {
  try {
    const { atletaId } = req.params;
    const datosObjetivo = {
      ...req.body,
      atletaId,
      estado: "Activo",
    };

    const objetivoExistente = await Objetivo.findOne({
      atletaId,
      estado: "Activo",
    }).sort({
      prioridad: -1,
      fechaObjetivo: 1,
    });

    if (objetivoExistente) {
      Object.assign(objetivoExistente, datosObjetivo);

      await objetivoExistente.save();

      return res.json(objetivoExistente);
    }

    const objetivo = await Objetivo.create(datosObjetivo);

    res.status(201).json(objetivo);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error guardando objetivo principal",
      error: error.message,
    });
  }
};

module.exports = {
  crearObjetivo,
  obtenerObjetivos,
  obtenerObjetivoActivoPorAtleta,
  guardarObjetivoPrincipalPorAtleta,
};
