const clasificarActividad = (actividad) => {
  const {
    distanciaKm = 0,
    duracionMin = 0,
    desnivelM = 0,
    potenciaPromedio = 0,
  } = actividad;

  let clasificacion = "Rodaje";
  let objetivoFisiologico = "Base aeróbica";
  let dificultad = 3;

  if (duracionMin >= 180) {
    clasificacion = "Fondo Largo";
    objetivoFisiologico = "Resistencia aeróbica";
    dificultad = 7;
  }

  if (duracionMin >= 240 && desnivelM >= 1000) {
    clasificacion = "Fondo Largo MTB";
    objetivoFisiologico = "Resistencia específica";
    dificultad = 8;
  }

  if (potenciaPromedio >= 180 && duracionMin <= 120) {
    clasificacion = "Tempo";
    objetivoFisiologico = "Resistencia muscular";
    dificultad = 6;
  }

  if (potenciaPromedio >= 220 && duracionMin <= 90) {
    clasificacion = "Umbral";
    objetivoFisiologico = "FTP";
    dificultad = 8;
  }

  if (potenciaPromedio >= 250 && duracionMin <= 75) {
    clasificacion = "VO2";
    objetivoFisiologico = "Consumo máximo de oxígeno";
    dificultad = 9;
  }

  return {
    clasificacion,
    objetivoFisiologico,
    dificultad,
    resumen: `${clasificacion} - ${objetivoFisiologico}`,
  };
};

module.exports = {
  clasificarActividad,
};
