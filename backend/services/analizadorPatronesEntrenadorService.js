const EntrenamientoBiblioteca = require("../models/EntrenamientoBiblioteca");

const obtenerTransicionesPreferidas = (patronesSecuencia) => {
  const transicionesPreferidas = [];

  Object.entries(patronesSecuencia).forEach(([desde, siguientes]) => {
    Object.entries(siguientes).forEach(([hacia, frecuencia]) => {
      transicionesPreferidas.push({
        desde,
        hacia,
        frecuencia,
      });
    });
  });

  return transicionesPreferidas.sort((a, b) => b.frecuencia - a.frecuencia);
};

const detectarPrincipios = (patronesSecuencia) => {
  const principios = [];

  const fondoRecuperacion =
    patronesSecuencia["Fondo Largo"]?.["Recuperación"] || 0;

  const umbralRecuperacion = patronesSecuencia["Umbral"]?.["Recuperación"] || 0;

  const fuerzaRecuperacion =
    patronesSecuencia["Fuerza Resistencia"]?.["Recuperación"] || 0;

  if (
    fondoRecuperacion > 0 ||
    umbralRecuperacion > 0 ||
    fuerzaRecuperacion > 0
  ) {
    principios.push({
      nombre: "Recuperación después de carga",
      evidencia: {
        "Fondo→Recuperación": fondoRecuperacion,
        "Umbral→Recuperación": umbralRecuperacion,
        "Fuerza→Recuperación": fuerzaRecuperacion,
      },
      interpretacion:
        "Las sesiones exigentes suelen ser seguidas por recuperación.",
      aplicacionMotor: "Evitar colocar sesiones intensas consecutivas.",
      confianza: "Alta",
    });
  }
  const resistenciaResistencia =
    patronesSecuencia["Resistencia aeróbica"]?.["Resistencia aeróbica"] || 0;

  const resistenciaRecuperacion =
    patronesSecuencia["Resistencia aeróbica"]?.["Recuperación"] || 0;

  const recuperacionRecuperacion =
    patronesSecuencia["Recuperación"]?.["Recuperación"] || 0;

  if (
    resistenciaResistencia > 0 ||
    resistenciaRecuperacion > 0 ||
    recuperacionRecuperacion > 0
  ) {
    principios.push({
      nombre: "Base aeróbica y recuperación frecuente",
      evidencia: {
        "Resistencia→Resistencia": resistenciaResistencia,
        "Resistencia→Recuperación": resistenciaRecuperacion,
        "Recuperación→Recuperación": recuperacionRecuperacion,
      },
      interpretacion:
        "El historial muestra una alta presencia de sesiones aeróbicas y días suaves como estructura principal del entrenamiento.",
      aplicacionMotor:
        "Priorizar bloques de base aeróbica y recuperación antes de aumentar la frecuencia de sesiones intensas.",
      confianza: "Alta",
    });
  }
  const recuperacionUmbral = patronesSecuencia["Recuperación"]?.["Umbral"] || 0;

  const recuperacionFondo =
    patronesSecuencia["Recuperación"]?.["Fondo Largo"] || 0;

  const recuperacionFuerza =
    patronesSecuencia["Recuperación"]?.["Fuerza Resistencia"] || 0;

  if (
    recuperacionUmbral > 0 ||
    recuperacionFondo > 0 ||
    recuperacionFuerza > 0
  ) {
    principios.push({
      nombre: "Preparación antes de sesiones clave",
      evidencia: {
        "Recuperación→Umbral": recuperacionUmbral,
        "Recuperación→Fondo": recuperacionFondo,
        "Recuperación→Fuerza": recuperacionFuerza,
      },
      interpretacion:
        "Las sesiones clave suelen aparecer después de días suaves, lo que sugiere búsqueda de frescura antes de esfuerzos importantes.",
      aplicacionMotor:
        "Colocar recuperación o carga baja antes de sesiones clave como Fondo, Umbral o Fuerza.",
      confianza: "Alta",
    });
  }
  return principios;
};

const analizarPatronesEntrenador = async (atletaId) => {
  const entrenamientos = await EntrenamientoBiblioteca.find({
    atletaId,
  }).sort({
    fecha: 1,
  });
  const obtenerSiguienteSesionMasProbable = (patronesSecuencia, categoria) => {
    const siguientes = patronesSecuencia[categoria];

    if (!siguientes) return null;

    const [hacia, frecuencia] = Object.entries(siguientes).sort(
      (a, b) => b[1] - a[1],
    )[0];

    return {
      desde: categoria,
      hacia,
      frecuencia,
    };
  };
  const patronesSecuencia = {};
  const estadisticasCategorias = {};

  for (let i = 0; i < entrenamientos.length - 1; i++) {
    const actual = entrenamientos[i];
    const siguiente = entrenamientos[i + 1];

    const categoriaActual = actual.objetivoFisiologico || "Sin clasificar";
    const categoriaSiguiente =
      siguiente.objetivoFisiologico || "Sin clasificar";

    if (!patronesSecuencia[categoriaActual]) {
      patronesSecuencia[categoriaActual] = {};
    }

    if (!patronesSecuencia[categoriaActual][categoriaSiguiente]) {
      patronesSecuencia[categoriaActual][categoriaSiguiente] = 0;
    }

    patronesSecuencia[categoriaActual][categoriaSiguiente]++;
  }

  const transicionesPreferidas =
    obtenerTransicionesPreferidas(patronesSecuencia);

  const principiosDetectados = detectarPrincipios(patronesSecuencia);
  const resumenPatrones = {
    despuesDeFondo: obtenerSiguienteSesionMasProbable(
      patronesSecuencia,
      "Fondo Largo",
    ),

    despuesDeUmbral: obtenerSiguienteSesionMasProbable(
      patronesSecuencia,
      "Umbral",
    ),

    despuesDeFuerza: obtenerSiguienteSesionMasProbable(
      patronesSecuencia,
      "Fuerza Resistencia",
    ),

    despuesDeRecuperacion: obtenerSiguienteSesionMasProbable(
      patronesSecuencia,
      "Recuperación",
    ),

    despuesDeResistencia: obtenerSiguienteSesionMasProbable(
      patronesSecuencia,
      "Resistencia aeróbica",
    ),
  };
  for (const entrenamiento of entrenamientos) {
    const categoria = entrenamiento.objetivoFisiologico || "Sin clasificar";

    if (!estadisticasCategorias[categoria]) {
      estadisticasCategorias[categoria] = {
        cantidad: 0,
        duracionTotal: 0,
        tssTotal: 0,
        ifTotal: 0,
      };
    }

    estadisticasCategorias[categoria].cantidad++;

    estadisticasCategorias[categoria].duracionTotal +=
      entrenamiento.duracionPlanificadaMin || 0;

    estadisticasCategorias[categoria].tssTotal +=
      entrenamiento.tssPlanificado || 0;

    estadisticasCategorias[categoria].ifTotal +=
      entrenamiento.ifPlanificado || 0;
  }
  const resumenCategorias = {};

  Object.entries(estadisticasCategorias).forEach(([categoria, datos]) => {
    resumenCategorias[categoria] = {
      cantidad: datos.cantidad,
      duracionPromedioMin: Math.round(datos.duracionTotal / datos.cantidad),
      tssPromedio: Number((datos.tssTotal / datos.cantidad).toFixed(2)),
      ifPromedio: Number((datos.ifTotal / datos.cantidad).toFixed(2)),
    };
  });
  return {
    totalEntrenamientos: entrenamientos.length,
    primerEntrenamiento: entrenamientos[0]?.fecha || null,
    ultimoEntrenamiento:
      entrenamientos[entrenamientos.length - 1]?.fecha || null,
    patronesSecuencia,
    transicionesPreferidas,
    principiosDetectados,
    resumenPatrones,
    resumenCategorias,
    entrenamientos: entrenamientos.map((entrenamiento) => ({
      fecha: entrenamiento.fecha,
      nombre: entrenamiento.nombre,
      objetivoFisiologico: entrenamiento.objetivoFisiologico,
      duracionPlanificadaMin: entrenamiento.duracionPlanificadaMin,
      tssPlanificado: entrenamiento.tssPlanificado,
      ifPlanificado: entrenamiento.ifPlanificado,
    })),
  };
};

module.exports = {
  analizarPatronesEntrenador,
};
