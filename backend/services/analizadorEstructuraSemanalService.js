const {
  clasificarEntrenamientoV2,
} = require("./clasificadorEntrenamientoV2Service");

const DIAS_SEMANA = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

const obtenerDiaSemana = (fecha) => {
  const fechaObj = new Date(fecha);
  return DIAS_SEMANA[fechaObj.getDay()];
};

const inicializarContadorDias = () => {
  return {
    domingo: 0,
    lunes: 0,
    martes: 0,
    miércoles: 0,
    jueves: 0,
    viernes: 0,
    sábado: 0,
  };
};

const obtenerDiaMasFrecuente = (conteoDias) => {
  let diaMasFrecuente = null;
  let cantidadMayor = 0;

  for (const [dia, cantidad] of Object.entries(conteoDias)) {
    if (cantidad > cantidadMayor) {
      diaMasFrecuente = dia;
      cantidadMayor = cantidad;
    }
  }

  return {
    dia: diaMasFrecuente,
    cantidad: cantidadMayor,
  };
};

const analizarEstructuraSemanal = (entrenamientos) => {
  const distribucionPorDia = {};
  const distribucionPorCategoria = {};
  const categoriasPorDia = {};

  for (const dia of DIAS_SEMANA) {
    distribucionPorDia[dia] = {};
    categoriasPorDia[dia] = {
      total: 0,
      categorias: {},
    };
  }

  entrenamientos.forEach((entrenamiento) => {
    const diaSemana = obtenerDiaSemana(entrenamiento.fecha);

    const resultadoClasificacion = clasificarEntrenamientoV2(entrenamiento);
    const categoria =
      resultadoClasificacion.objetivoFisiologico || "Sin clasificar";

    if (!distribucionPorCategoria[categoria]) {
      distribucionPorCategoria[categoria] = inicializarContadorDias();
    }

    if (!distribucionPorDia[diaSemana][categoria]) {
      distribucionPorDia[diaSemana][categoria] = 0;
    }

    if (!categoriasPorDia[diaSemana].categorias[categoria]) {
      categoriasPorDia[diaSemana].categorias[categoria] = 0;
    }

    distribucionPorDia[diaSemana][categoria]++;
    distribucionPorCategoria[categoria][diaSemana]++;
    categoriasPorDia[diaSemana].categorias[categoria]++;
    categoriasPorDia[diaSemana].total++;
  });

  const diaMasFrecuentePorCategoria = {};

  for (const [categoria, conteoDias] of Object.entries(
    distribucionPorCategoria,
  )) {
    diaMasFrecuentePorCategoria[categoria] = obtenerDiaMasFrecuente(conteoDias);
  }

  const categoriaDominantePorDia = {};

  for (const [dia, datos] of Object.entries(categoriasPorDia)) {
    categoriaDominantePorDia[dia] = obtenerCategoriaDominante(datos.categorias);
  }

  const principiosDetectados = generarPrincipiosSemanales(
    diaMasFrecuentePorCategoria,
    categoriaDominantePorDia,
  );

  return {
    totalEntrenamientos: entrenamientos.length,
    distribucionPorDia,
    distribucionPorCategoria,
    diaMasFrecuentePorCategoria,
    categoriaDominantePorDia,
    principiosDetectados,
  };
};

const obtenerCategoriaDominante = (categorias) => {
  let categoriaDominante = null;
  let cantidadMayor = 0;

  for (const [categoria, cantidad] of Object.entries(categorias)) {
    if (cantidad > cantidadMayor) {
      categoriaDominante = categoria;
      cantidadMayor = cantidad;
    }
  }

  return {
    categoria: categoriaDominante,
    cantidad: cantidadMayor,
  };
};

const generarPrincipiosSemanales = (
  diaMasFrecuentePorCategoria,
  categoriaDominantePorDia,
) => {
  const principios = [];

  if (diaMasFrecuentePorCategoria["Fondo Largo"]) {
    principios.push({
      principio: "Ubicación del Fondo Largo",
      descripcion: `El Fondo Largo aparece con mayor frecuencia el día ${diaMasFrecuentePorCategoria["Fondo Largo"].dia}.`,
      evidencia: diaMasFrecuentePorCategoria["Fondo Largo"],
      aplicacion:
        "Priorizar el Fondo Largo en el día históricamente más usado por el entrenador.",
    });
  }

  if (diaMasFrecuentePorCategoria["Recuperación"]) {
    principios.push({
      principio: "Uso frecuente de recuperación",
      descripcion: `La Recuperación aparece con mayor frecuencia el día ${diaMasFrecuentePorCategoria["Recuperación"].dia}.`,
      evidencia: diaMasFrecuentePorCategoria["Recuperación"],
      aplicacion:
        "Usar recuperación como protección antes o después de cargas importantes.",
    });
  }

  if (diaMasFrecuentePorCategoria["Umbral"]) {
    principios.push({
      principio: "Ubicación del trabajo de Umbral",
      descripcion: `El Umbral aparece con mayor frecuencia el día ${diaMasFrecuentePorCategoria["Umbral"].dia}.`,
      evidencia: diaMasFrecuentePorCategoria["Umbral"],
      aplicacion:
        "Ubicar el Umbral en un día donde históricamente el atleta toleraba intensidad.",
    });
  }

  if (diaMasFrecuentePorCategoria["Fuerza Resistencia"]) {
    principios.push({
      principio: "Ubicación de Fuerza Resistencia",
      descripcion: `La Fuerza Resistencia aparece con mayor frecuencia el día ${diaMasFrecuentePorCategoria["Fuerza Resistencia"].dia}.`,
      evidencia: diaMasFrecuentePorCategoria["Fuerza Resistencia"],
      aplicacion:
        "Usar este patrón para ubicar sesiones de fuerza específica en bicicleta.",
    });
  }

  return principios;
};

module.exports = {
  analizarEstructuraSemanal,
};
