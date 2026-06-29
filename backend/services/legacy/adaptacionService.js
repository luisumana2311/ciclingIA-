const evaluarAdaptacion = (registroDiario = {}, fatigaEstimada = 0) => {
  const { sueno, energia, estres, dolorMuscular } = registroDiario;

  let puntajeRiesgo = 0;
  const motivos = [];

  if (sueno <= 5) {
    puntajeRiesgo += 25;
    motivos.push("Sueño bajo");
  }

  if (energia <= 4) {
    puntajeRiesgo += 25;
    motivos.push("Energía baja");
  }

  if (estres >= 7) {
    puntajeRiesgo += 20;
    motivos.push("Estrés alto");
  }

  if (dolorMuscular >= 7) {
    puntajeRiesgo += 20;
    motivos.push("Dolor muscular alto");
  }

  if (fatigaEstimada >= 80) {
    puntajeRiesgo += 30;
    motivos.push("Fatiga estimada muy alta");
  } else if (fatigaEstimada >= 60) {
    puntajeRiesgo += 15;
    motivos.push("Fatiga estimada moderada");
  }

  return decidirAccion(puntajeRiesgo, motivos);
};

const evaluarAdaptacionPorMetricasDiarias = (
  metricasDiarias = {},
  fatigaEstimada = 0,
) => {
  let puntajeRiesgo = 0;
  const motivos = [];

  if (metricasDiarias.promedioSueno > 0 && metricasDiarias.promedioSueno <= 5) {
    puntajeRiesgo += 20;
    motivos.push("Promedio de sueño bajo");
  }

  if (
    metricasDiarias.promedioEnergia > 0 &&
    metricasDiarias.promedioEnergia <= 5
  ) {
    puntajeRiesgo += 20;
    motivos.push("Promedio de energía bajo");
  }

  if (metricasDiarias.promedioEstres >= 7) {
    puntajeRiesgo += 15;
    motivos.push("Promedio de estrés alto");
  }

  if (metricasDiarias.promedioDolorMuscular >= 7) {
    puntajeRiesgo += 15;
    motivos.push("Promedio de dolor muscular alto");
  }

  if (metricasDiarias.estadoRecuperacion === "Comprometida") {
    puntajeRiesgo += 25;
    motivos.push("Recuperación comprometida");
  }

  if (fatigaEstimada >= 80) {
    puntajeRiesgo += 30;
    motivos.push("Fatiga estimada muy alta");
  } else if (fatigaEstimada >= 60) {
    puntajeRiesgo += 15;
    motivos.push("Fatiga estimada moderada");
  }

  return decidirAccion(puntajeRiesgo, motivos);
};

const decidirAccion = (puntajeRiesgo, motivos) => {
  let accion = "Mantener plan";

  if (puntajeRiesgo >= 80) {
    accion = "Descanso recomendado";
  } else if (puntajeRiesgo >= 50) {
    accion = "Reducir carga";
  } else if (puntajeRiesgo >= 25) {
    accion = "Monitorear";
  }

  return {
    accion,
    puntajeRiesgo,
    motivos,
  };
};

module.exports = {
  evaluarAdaptacion,
  evaluarAdaptacionPorMetricasDiarias,
};
