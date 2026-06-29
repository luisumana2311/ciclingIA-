const HistorialSemanal = require("../models/HistorialSemanal");

const {
  generarEstadoGeneral,
  generarResumenRapido,
  generarMetricasObjetivo,
} = require("../services/dashboardService");
const {
  generarPerfilDinamicoV2,
} = require("../services/perfilDinamicoV2Service");

const obtenerDashboardAtleta = async (req, res) => {
  try {
    const { atletaId } = req.params;

    const ultimoHistorial = await HistorialSemanal.findOne({ atletaId }).sort({
      createdAt: -1,
    });

    if (!ultimoHistorial) {
      return res.status(404).json({
        mensaje: "No hay historial semanal para este atleta",
      });
    }

    const estadoGeneral = generarEstadoGeneral(ultimoHistorial);
    const resumenRapido = generarResumenRapido(ultimoHistorial);
    const metricasObjetivo = generarMetricasObjetivo(ultimoHistorial);
    const perfilDinamicoV2 = await generarPerfilDinamicoV2(atletaId);
    return res.json({
      atletaId,
      estadoGeneral,
      resumenRapido,
      metricasObjetivo,
      perfilDinamicoV2,
      recuperacion: perfilDinamicoV2.metricasDiarias,
      objetivoPrincipal: ultimoHistorial.objetivoPrincipal,
      fasePreparacion: ultimoHistorial.semanaGenerada?.fasePreparacion,
      volumen: {
        volumenGenerado: ultimoHistorial.semanaGenerada?.volumenGenerado,
        volumenObjetivo: ultimoHistorial.semanaGenerada?.volumenObjetivo,
        volumenDisponible: ultimoHistorial.semanaGenerada?.volumenDisponible,
        utilizacion: ultimoHistorial.semanaGenerada?.utilizacion,
      },
      fatiga: ultimoHistorial.fatiga,
      cumplimiento: ultimoHistorial.cumplimiento,
      adaptacion: ultimoHistorial.adaptacion,
      mensajeEntrenador: ultimoHistorial.mensajeEntrenador,
      sesiones: ultimoHistorial.semanaGenerada?.sesiones || [],
      perfilDinamico: ultimoHistorial.perfilDinamico,
      fechaUltimaSemana: ultimoHistorial.createdAt,
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: error.message,
    });
  }
};

module.exports = {
  obtenerDashboardAtleta,
};
