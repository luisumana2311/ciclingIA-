const calcularDiasHastaObjetivo = (fechaObjetivo) => {
  return Math.ceil(
    (new Date(fechaObjetivo) - new Date()) / (1000 * 60 * 60 * 24),
  );
};

const generarEstadoGeneral = (ultimoHistorial) => {
  const diasHastaObjetivo = calcularDiasHastaObjetivo(
    ultimoHistorial.objetivoPrincipal.fechaObjetivo,
  );

  let color = "verde";
  let estado = "Óptimo";
  let riesgo = "Bajo";

  if (ultimoHistorial.adaptacion?.puntajeRiesgo >= 50) {
    color = "naranja";
    estado = "Atención";
    riesgo = "Moderado";
  }

  if (ultimoHistorial.adaptacion?.puntajeRiesgo >= 80) {
    color = "rojo";
    estado = "Riesgo";
    riesgo = "Alto";
  }

  return {
    color,
    estado,
    riesgo,
    diasHastaObjetivo,
  };
};

const generarResumenRapido = (ultimoHistorial) => {
  let titulo = "Semana estable";
  let descripcion = "El atleta puede continuar con el plan programado.";
  let accionPrincipal = "Mantener la constancia semanal.";

  if (ultimoHistorial.adaptacion?.accion === "Reducir carga") {
    titulo = "Semana adaptada por riesgo moderado";
    descripcion = `Se redujo la carga por: ${ultimoHistorial.adaptacion.motivos.join(", ")}.`;
    accionPrincipal =
      "Priorizar recuperación y cumplir las sesiones restantes.";
  }

  if (ultimoHistorial.adaptacion?.accion === "Semana regenerativa") {
    titulo = "Semana regenerativa recomendada";
    descripcion = `El sistema detectó riesgo alto por: ${ultimoHistorial.adaptacion.motivos.join(", ")}.`;
    accionPrincipal = "Bajar intensidad y enfocarse en recuperación.";
  }

  if (ultimoHistorial.adaptacion?.accion === "Aumentar carga progresivamente") {
    titulo = "Semana con progresión positiva";
    descripcion = "El atleta muestra buena adherencia y recuperación.";
    accionPrincipal = "Aumentar la carga de forma controlada.";
  }
  const generarMetricasObjetivo = (ultimoHistorial) => {
    const diasHastaObjetivo = calcularDiasHastaObjetivo(
      ultimoHistorial.objetivoPrincipal.fechaObjetivo,
    );

    const semanasHastaObjetivo = Math.ceil(diasHastaObjetivo / 7);

    let progresoPreparacion = 0;

    if (semanasHastaObjetivo <= 20) {
      progresoPreparacion = Math.round(
        ((20 - semanasHastaObjetivo) / 20) * 100,
      );
    }

    return {
      diasHastaObjetivo,
      semanasHastaObjetivo,
      progresoPreparacion,
    };
  };
  return {
    titulo,
    descripcion,
    accionPrincipal,
  };
};
const generarMetricasObjetivo = (ultimoHistorial) => {
  const diasHastaObjetivo = calcularDiasHastaObjetivo(
    ultimoHistorial.objetivoPrincipal.fechaObjetivo,
  );

  const semanasHastaObjetivo = Math.ceil(diasHastaObjetivo / 7);

  let progresoPreparacion = 0;

  if (semanasHastaObjetivo <= 20) {
    progresoPreparacion = Math.round(((20 - semanasHastaObjetivo) / 20) * 100);
  }

  return {
    diasHastaObjetivo,
    semanasHastaObjetivo,
    progresoPreparacion,
  };
};
module.exports = {
  generarEstadoGeneral,
  generarResumenRapido,
  generarMetricasObjetivo,
};
