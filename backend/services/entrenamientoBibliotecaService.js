const EntrenamientoBiblioteca = require("../models/EntrenamientoBiblioteca");

const clasificarObjetivoFisiologico = (workout) => {
  const texto =
    `${workout.title || ""} ${workout.description || ""}`.toLowerCase();

  if (texto.includes("vo2")) {
    return {
      objetivoFisiologico: "VO2",
      dificultad: 9,
    };
  }

  if (
    texto.includes("ftp") ||
    texto.includes("threshold") ||
    texto.includes("umbral")
  ) {
    return {
      objetivoFisiologico: "Umbral",
      dificultad: 8,
    };
  }

  if (texto.includes("sweetspot") || texto.includes("sweet spot")) {
    return {
      objetivoFisiologico: "Sweet Spot",
      dificultad: 7,
    };
  }

  if (
    texto.includes("sprint") ||
    texto.includes("sprints") ||
    texto.includes("activación")
  ) {
    return {
      objetivoFisiologico: "Neuromuscular",
      dificultad: 8,
    };
  }

  if (
    texto.includes("recovery") ||
    texto.includes("recuperacion") ||
    texto.includes("recuperación") ||
    texto.includes("easy")
  ) {
    return {
      objetivoFisiologico: "Recuperación",
      dificultad: 2,
    };
  }

  if (
    texto.includes("endurance") ||
    texto.includes("base") ||
    texto.includes("fondo")
  ) {
    return {
      objetivoFisiologico: "Resistencia aeróbica",
      dificultad: 5,
    };
  }

  return {
    objetivoFisiologico: "Sin clasificar",
    dificultad: 0,
  };
};

const convertirWorkoutTrainingPeaks = (workout, atletaId) => {
  const clasificacion = clasificarObjetivoFisiologico(workout);

  return {
    atletaId,
    origen: "TrainingPeaks",
    workoutId: workout.workoutId,
    athleteIdTrainingPeaks: workout.athleteId,
    nombre: workout.title || "Entrenamiento sin nombre",
    descripcion: workout.description || "",
    comentariosCoach: workout.coachComments || "",
    fecha: workout.workoutDay,
    tipo: workout.workoutTypeValueId === 8 ? "MTB" : "Ciclismo",
    duracionPlanificadaMin: workout.totalTimePlanned
      ? Math.round(workout.totalTimePlanned * 60)
      : 0,
    tssPlanificado: workout.tssPlanned || 0,
    ifPlanificado: workout.ifPlanned || 0,
    objetivoFisiologico: clasificacion.objetivoFisiologico,
    dificultad: clasificacion.dificultad,
    etiquetas: workout.userTags ? workout.userTags.split(",") : [],
    estructura: workout.structure || {},
    datosOriginales: workout,
  };
};

const guardarWorkoutsTrainingPeaks = async (workouts, atletaId) => {
  let creados = 0;
  let actualizados = 0;
  let ignorados = 0;

  for (const workout of workouts) {
    if (!workout.structure) {
      ignorados += 1;
      continue;
    }

    const datos = convertirWorkoutTrainingPeaks(workout, atletaId);

    const existente = await EntrenamientoBiblioteca.findOne({
      workoutId: workout.workoutId,
    });

    if (existente) {
      await EntrenamientoBiblioteca.updateOne(
        { workoutId: workout.workoutId },
        datos,
      );

      actualizados += 1;
    } else {
      await EntrenamientoBiblioteca.create(datos);
      creados += 1;
    }
  }

  return {
    totalRecibidos: workouts.length,
    creados,
    actualizados,
    ignorados,
  };
};

module.exports = {
  clasificarObjetivoFisiologico,
  convertirWorkoutTrainingPeaks,
  guardarWorkoutsTrainingPeaks,
};
