const normalizarTexto = (texto = "") =>
  texto
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const contiene = (texto, palabras) =>
  palabras.some((palabra) => texto.includes(palabra));

const clasificarEntrenamientoV2 = (entrenamiento) => {
  const texto = normalizarTexto(`
  ${entrenamiento.nombre || ""}
  ${entrenamiento.descripcion || ""}
  ${entrenamiento.comentariosCoach || ""}
`);

  const duracion = entrenamiento.duracionPlanificadaMin || 0;

  const puntajes = {
    Recuperación: 0,
    "Resistencia aeróbica": 0,
    "Fondo Largo": 0,
    Tempo: 0,
    "Sweet Spot": 0,
    Umbral: 0,
    VO2: 0,
    Neuromuscular: 0,
    "Fuerza Resistencia": 0,
    "Técnica MTB": 0,
  };

  if (contiene(texto, ["recuperacion", "recovery", "suave", "easy"])) {
    puntajes["Recuperación"] += 5;
  }

  if (contiene(texto, ["resistencia", "endurance", "z2", "zona 2"])) {
    puntajes["Resistencia aeróbica"] += 5;
  }
  if (
    contiene(texto, [
      "aerobico",
      "aerobica",
      "zona 3",
      "z3",
      "terreno variado",
      "rodillo",
    ])
  ) {
    puntajes["Resistencia aeróbica"] += 6;
  }

  if (contiene(texto, ["fondo", "long ride", "larga"])) {
    puntajes["Fondo Largo"] += 6;
  }

  if (duracion >= 150) {
    puntajes["Fondo Largo"] += 10;
  }

  if (
    contiene(texto, [
      "recuperacion",
      "recovery",
      "suave",
      "easy",
      "retomando",
      "regenerativo",
      "soltar piernas",
      "rodaje suave",
    ])
  ) {
    puntajes["Recuperación"] += 8;
  }

  if (contiene(texto, ["sweet spot", "sweetspot", "sst"])) {
    puntajes["Sweet Spot"] += 6;
  }

  if (contiene(texto, ["umbral", "threshold", "ftp", "crono", "cronometro"])) {
    puntajes["Umbral"] += 6;
  }

  if (contiene(texto, ["vo2", "vo2max", "alta intensidad"])) {
    puntajes["VO2"] += 7;
  }

  if (contiene(texto, ["sprint", "arranques", "explosivo", "neuromuscular"])) {
    puntajes["Neuromuscular"] += 7;
  }

  if (
    contiene(texto, [
      "subidas",
      "fuerza",
      "torque",
      "baja cadencia",
      "low cadence",
    ])
  ) {
    puntajes["Fuerza Resistencia"] += 7;
  }
  if (
    contiene(texto, [
      "anaerobico",
      "cuestas",
      "subiendo",
      "escalada",
      "fuerza en subida",
      "40-60rpm",
      "baja cadencia",
    ])
  ) {
    puntajes["Fuerza Resistencia"] += 12;
  }

  if (contiene(texto, ["tecnica", "sendero", "curvas", "bajadas", "trail"])) {
    puntajes["Técnica MTB"] += 7;
  }
  if (
    contiene(texto, [
      "tempo",
      "ritmo",
      "sostenido",
      "progresivo",
      "aumento de ritmo",
      "aumento progresivamente",
      "ritmo progresivo",
    ])
  ) {
    puntajes["Tempo"] += 6;
  }
  if (contiene(texto, ["cronos", "contrarreloj", "tt"])) {
    puntajes["Umbral"] += 8;
  }

  if (contiene(texto, ["intervalos", "6x6", "3x8", "repeticiones", "series"])) {
    puntajes["Tempo"] += 5;
  }
  if (contiene(texto, ["paseo", "ride", "rodada"])) {
    puntajes["Resistencia aeróbica"] += 5;
  }
  const intensidad = entrenamiento.ifPlanificado || 0;

  if (intensidad > 0) {
    if (intensidad < 0.6) puntajes["Recuperación"] += 3;

    if (intensidad >= 0.6 && intensidad < 0.75) {
      puntajes["Resistencia aeróbica"] += 3;
    }

    if (intensidad >= 0.75 && intensidad < 0.85) puntajes["Tempo"] += 3;

    if (intensidad >= 0.85 && intensidad < 0.95) {
      puntajes["Sweet Spot"] += 3;
    }

    if (intensidad >= 0.85 && intensidad < 0.95) {
      puntajes["Sweet Spot"] += 2;
    }

    if (intensidad > 1.05) puntajes["VO2"] += 4;
  }

  const categoriasOrdenadas = Object.entries(puntajes).sort(
    (a, b) => b[1] - a[1],
  );

  const categoriaGanadora = categoriasOrdenadas[0];
  const categoriaSegunda = categoriasOrdenadas[1];

  const objetivoFisiologico =
    categoriaGanadora[1] > 0 ? categoriaGanadora[0] : "Sin clasificar";

  const diferencia = categoriaGanadora[1] - categoriaSegunda[1];

  const confianza =
    objetivoFisiologico === "Sin clasificar"
      ? "Nula"
      : diferencia >= 8
        ? "Alta"
        : diferencia >= 4
          ? "Media"
          : "Baja";

  return {
    objetivoFisiologico,
    tipo: objetivoFisiologico,
    confianza,
    puntajes,
  };
};

module.exports = {
  normalizarTexto,
  contiene,
  clasificarEntrenamientoV2,
};
