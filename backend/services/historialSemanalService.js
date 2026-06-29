const HistorialSemanal = require("../models/HistorialSemanal");

const obtenerRangoSemana = (fecha) => {
  const inicio = new Date(fecha);
  inicio.setHours(0, 0, 0, 0);

  const dia = inicio.getDay();
  const diferenciaLunes = dia === 0 ? -6 : 1 - dia;

  inicio.setDate(inicio.getDate() + diferenciaLunes);

  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 7);

  return { inicio, fin };
};

const guardarHistorialSemanal = async ({
  atletaId,
  fechaInicioSemana,
  objetivoPrincipal,
  semanaGenerada,
  adaptacion,
  fatiga,
  cumplimiento,
  perfilDinamico,
  mensajeEntrenador,
}) => {
  const fechaBase = fechaInicioSemana || new Date();
  const { inicio, fin } = obtenerRangoSemana(fechaBase);

  const historialExistente = await HistorialSemanal.findOne({
    atletaId,
    fechaInicioSemana: {
      $gte: inicio,
      $lt: fin,
    },
  });

  if (historialExistente) {
    historialExistente.fechaInicioSemana = inicio;
    historialExistente.objetivoPrincipal = objetivoPrincipal;
    historialExistente.semanaGenerada = semanaGenerada;
    historialExistente.adaptacion = adaptacion;
    historialExistente.fatiga = fatiga;
    historialExistente.cumplimiento = cumplimiento;
    historialExistente.perfilDinamico = perfilDinamico;
    historialExistente.mensajeEntrenador = mensajeEntrenador;

    await historialExistente.save();

    return historialExistente;
  }

  const historial = new HistorialSemanal({
    atletaId,
    fechaInicioSemana: inicio,
    objetivoPrincipal,
    semanaGenerada,
    adaptacion,
    fatiga,
    cumplimiento,
    perfilDinamico,
    mensajeEntrenador,
  });

  await historial.save();

  return historial;
};

const obtenerHistorialPorAtleta = async (atletaId) => {
  const historial = await HistorialSemanal.find({ atletaId }).sort({
    fechaInicioSemana: -1,
  });

  return historial;
};

const obtenerUltimaSemana = async (atletaId) => {
  const ultimaSemana = await HistorialSemanal.findOne({ atletaId }).sort({
    fechaInicioSemana: -1,
  });

  return ultimaSemana;
};

module.exports = {
  guardarHistorialSemanal,
  obtenerHistorialPorAtleta,
  obtenerUltimaSemana,
};
