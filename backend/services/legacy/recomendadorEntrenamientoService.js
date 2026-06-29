const obtenerClaveResumen = (categoria) => {
  const mapa = {
    "Fondo Largo": "despuesDeFondo",
    Umbral: "despuesDeUmbral",
    "Fuerza Resistencia": "despuesDeFuerza",
    Recuperación: "despuesDeRecuperacion",
    "Resistencia aeróbica": "despuesDeResistencia",
  };

  return mapa[categoria] || null;
};

const recomendarCategoriaPorPatron = ({ ultimaSesion, resumenPatrones }) => {
  if (!ultimaSesion || !resumenPatrones) {
    return {
      categoria: null,
      confianza: 0,
      origen: "Sin datos suficientes",
      razon: "No existe última sesión o resumen de patrones históricos.",
    };
  }

  const clave = obtenerClaveResumen(ultimaSesion);

  if (!clave || !resumenPatrones[clave]) {
    return {
      categoria: null,
      confianza: 0,
      origen: "Sin patrón histórico",
      razon: `No existe patrón histórico para ${ultimaSesion}.`,
    };
  }

  const patron = resumenPatrones[clave];

  return {
    categoria: patron.hacia,
    confianza: patron.frecuencia,
    origen: "Patrones históricos",
    razon: `Históricamente después de ${patron.desde} suele venir ${patron.hacia}.`,
  };
};

module.exports = {
  recomendarCategoriaPorPatron,
};
