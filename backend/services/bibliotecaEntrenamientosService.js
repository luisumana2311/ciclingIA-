const ActividadGarmin = require("../models/ActividadGarmin");

const analizarBibliotecaEntrenamientos = async (atletaId) => {
  const actividades = await ActividadGarmin.find({ atletaId });

  if (actividades.length === 0) {
    return {
      totalActividades: 0,
      sesionMasFrecuente: "Sin datos",
      sesionMenosFrecuente: "Sin datos",
      duracionPromedio: 0,
      desnivelPromedio: 0,
      potenciaPromedioHistorica: 0,
      distribucionTipos: {},
    };
  }

  const distribucionTipos = {};

  let totalDuracion = 0;
  let totalDesnivel = 0;
  let totalPotencia = 0;

  actividades.forEach((actividad) => {
    totalDuracion += actividad.duracionMin || 0;
    totalDesnivel += actividad.desnivelM || 0;
    totalPotencia += actividad.potenciaPromedio || 0;

    const tipo = actividad.clasificacion || "Sin clasificar";

    distribucionTipos[tipo] = (distribucionTipos[tipo] || 0) + 1;
  });

  const tiposOrdenados = Object.entries(distribucionTipos).sort(
    (a, b) => b[1] - a[1],
  );

  const sesionMasFrecuente =
    tiposOrdenados.length > 0 ? tiposOrdenados[0][0] : "Sin datos";

  const sesionMenosFrecuente =
    tiposOrdenados.length > 0
      ? tiposOrdenados[tiposOrdenados.length - 1][0]
      : "Sin datos";

  return {
    totalActividades: actividades.length,

    sesionMasFrecuente,

    sesionMenosFrecuente,

    duracionPromedio: Math.round(totalDuracion / actividades.length),

    desnivelPromedio: Math.round(totalDesnivel / actividades.length),

    potenciaPromedioHistorica: Math.round(totalPotencia / actividades.length),

    distribucionTipos,
  };
};

module.exports = {
  analizarBibliotecaEntrenamientos,
};
