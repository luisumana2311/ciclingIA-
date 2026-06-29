const PerfilAtleta = require("../models/PerfilAtleta");
const Objetivo = require("../models/Objetivo");
const EntrenamientoBiblioteca = require("../models/EntrenamientoBiblioteca");
const HistorialSemanal = require("../models/HistorialSemanal");

const {
  analizarPatronesEntrenador,
} = require("./analizadorPatronesEntrenadorService");

const {
  analizarEstructuraSemanal,
} = require("./analizadorEstructuraSemanalService");

const obtenerObjetivoPrincipal = async (atletaId) => {
  return await Objetivo.findOne({
    atletaId,
    estado: "Activo",
  }).sort({
    prioridad: -1,
    fechaObjetivo: 1,
  });
};

const crearBloque = ({
  nombre,
  tipo,
  duracionMin,
  zonaObjetivo,
  rpe,
  descripcion,
  repeticiones = null,
  recuperacionMin = null,
  zonaRecuperacion = "Z1",
}) => ({
  nombre,
  tipo,
  duracionMin,
  zonaObjetivo,
  rpe,
  descripcion,
  repeticiones,
  recuperacionMin,
  zonaRecuperacion,
});

const crearEstructuraEntrenamiento = (bloques) => ({
  version: 1,
  tipoPrescripcion: "potencia_fc_rpe",
  bloques,
});

const estructurasBibliotecaBase = {
  recuperacion30: crearEstructuraEntrenamiento([
    crearBloque({
      nombre: "Calentamiento",
      tipo: "calentamiento",
      duracionMin: 8,
      zonaObjetivo: "Z1",
      rpe: "2-3",
      descripcion: "Pedaleo muy suave y progresivo.",
    }),
    crearBloque({
      nombre: "Rodaje regenerativo",
      tipo: "principal",
      duracionMin: 17,
      zonaObjetivo: "Z1",
      rpe: "2-3",
      descripcion: "Mantener cadencia comoda sin acumular fatiga.",
    }),
    crearBloque({
      nombre: "Enfriamiento",
      tipo: "enfriamiento",
      duracionMin: 5,
      zonaObjetivo: "Z1",
      rpe: "1-2",
      descripcion: "Soltar piernas.",
    }),
  ]),
  recuperacion60: crearEstructuraEntrenamiento([
    crearBloque({
      nombre: "Calentamiento",
      tipo: "calentamiento",
      duracionMin: 10,
      zonaObjetivo: "Z1",
      rpe: "2-3",
      descripcion: "Inicio suave.",
    }),
    crearBloque({
      nombre: "Aerobico suave",
      tipo: "principal",
      duracionMin: 40,
      zonaObjetivo: "Z2",
      rpe: "3-4",
      descripcion: "Rodaje estable y conversacional.",
    }),
    crearBloque({
      nombre: "Enfriamiento",
      tipo: "enfriamiento",
      duracionMin: 10,
      zonaObjetivo: "Z1",
      rpe: "2",
      descripcion: "Bajar intensidad progresivamente.",
    }),
  ]),
  resistencia60: crearEstructuraEntrenamiento([
    crearBloque({
      nombre: "Calentamiento",
      tipo: "calentamiento",
      duracionMin: 12,
      zonaObjetivo: "Z1",
      rpe: "2-3",
      descripcion: "Pedaleo progresivo hasta ritmo aerobico.",
    }),
    crearBloque({
      nombre: "Resistencia aerobica",
      tipo: "principal",
      duracionMin: 38,
      zonaObjetivo: "Z2",
      rpe: "4-5",
      descripcion: "Mantener intensidad estable sin cambios bruscos.",
    }),
    crearBloque({
      nombre: "Enfriamiento",
      tipo: "enfriamiento",
      duracionMin: 10,
      zonaObjetivo: "Z1",
      rpe: "2",
      descripcion: "Rodar suave.",
    }),
  ]),
  resistencia90: crearEstructuraEntrenamiento([
    crearBloque({
      nombre: "Calentamiento",
      tipo: "calentamiento",
      duracionMin: 15,
      zonaObjetivo: "Z1",
      rpe: "2-3",
      descripcion: "Activacion progresiva.",
    }),
    crearBloque({
      nombre: "Base sostenida",
      tipo: "principal",
      duracionMin: 65,
      zonaObjetivo: "Z2",
      rpe: "4-5",
      descripcion: "Ritmo constante, respiracion controlada.",
    }),
    crearBloque({
      nombre: "Enfriamiento",
      tipo: "enfriamiento",
      duracionMin: 10,
      zonaObjetivo: "Z1",
      rpe: "2",
      descripcion: "Soltar piernas.",
    }),
  ]),
  tempo60: crearEstructuraEntrenamiento([
    crearBloque({
      nombre: "Calentamiento",
      tipo: "calentamiento",
      duracionMin: 15,
      zonaObjetivo: "Z2",
      rpe: "3-4",
      descripcion: "Progresar hacia ritmo aerobico.",
    }),
    crearBloque({
      nombre: "Tempo controlado",
      tipo: "principal",
      duracionMin: 12,
      zonaObjetivo: "Z3",
      rpe: "6-7",
      descripcion: "Bloques firmes, sostenibles y sin sprintar.",
      repeticiones: 2,
      recuperacionMin: 5,
      zonaRecuperacion: "Z1",
    }),
    crearBloque({
      nombre: "Enfriamiento",
      tipo: "enfriamiento",
      duracionMin: 11,
      zonaObjetivo: "Z1",
      rpe: "2",
      descripcion: "Rodaje suave.",
    }),
  ]),
  umbral60: crearEstructuraEntrenamiento([
    crearBloque({
      nombre: "Calentamiento",
      tipo: "calentamiento",
      duracionMin: 15,
      zonaObjetivo: "Z2",
      rpe: "3-4",
      descripcion: "Activacion progresiva antes del trabajo intenso.",
    }),
    crearBloque({
      nombre: "Umbral progresivo",
      tipo: "principal",
      duracionMin: 8,
      zonaObjetivo: "Z4",
      rpe: "8",
      descripcion: "Intervalos cerca del umbral, controlados.",
      repeticiones: 3,
      recuperacionMin: 4,
      zonaRecuperacion: "Z1",
    }),
    crearBloque({
      nombre: "Enfriamiento",
      tipo: "enfriamiento",
      duracionMin: 9,
      zonaObjetivo: "Z1",
      rpe: "2",
      descripcion: "Bajar pulsaciones y soltar piernas.",
    }),
  ]),
  umbral90: crearEstructuraEntrenamiento([
    crearBloque({
      nombre: "Calentamiento",
      tipo: "calentamiento",
      duracionMin: 20,
      zonaObjetivo: "Z2",
      rpe: "3-4",
      descripcion: "Preparar piernas para esfuerzos largos.",
    }),
    crearBloque({
      nombre: "Umbral sostenido",
      tipo: "principal",
      duracionMin: 12,
      zonaObjetivo: "Z4",
      rpe: "8",
      descripcion: "Trabajo estable de umbral sin superar el control.",
      repeticiones: 3,
      recuperacionMin: 6,
      zonaRecuperacion: "Z1",
    }),
    crearBloque({
      nombre: "Resistencia final",
      tipo: "complementario",
      duracionMin: 15,
      zonaObjetivo: "Z2",
      rpe: "4",
      descripcion: "Completar volumen aerobico.",
    }),
    crearBloque({
      nombre: "Enfriamiento",
      tipo: "enfriamiento",
      duracionMin: 7,
      zonaObjetivo: "Z1",
      rpe: "2",
      descripcion: "Rodar muy suave.",
    }),
  ]),
  fuerza75: crearEstructuraEntrenamiento([
    crearBloque({
      nombre: "Calentamiento",
      tipo: "calentamiento",
      duracionMin: 15,
      zonaObjetivo: "Z2",
      rpe: "3-4",
      descripcion: "Activar cadencia y fuerza progresivamente.",
    }),
    crearBloque({
      nombre: "Fuerza resistencia",
      tipo: "principal",
      duracionMin: 6,
      zonaObjetivo: "Z3",
      rpe: "7",
      descripcion: "Cadencia baja controlada, sin perder tecnica.",
      repeticiones: 5,
      recuperacionMin: 4,
      zonaRecuperacion: "Z1",
    }),
    crearBloque({
      nombre: "Enfriamiento",
      tipo: "enfriamiento",
      duracionMin: 10,
      zonaObjetivo: "Z1",
      rpe: "2",
      descripcion: "Soltar piernas.",
    }),
  ]),
  vo2: crearEstructuraEntrenamiento([
    crearBloque({
      nombre: "Calentamiento",
      tipo: "calentamiento",
      duracionMin: 18,
      zonaObjetivo: "Z2",
      rpe: "3-4",
      descripcion: "Activacion progresiva con cadencia agil.",
    }),
    crearBloque({
      nombre: "VO2 max",
      tipo: "principal",
      duracionMin: 3,
      zonaObjetivo: "Z5",
      rpe: "9",
      descripcion: "Intervalos intensos, mantener calidad.",
      repeticiones: 5,
      recuperacionMin: 3,
      zonaRecuperacion: "Z1",
    }),
    crearBloque({
      nombre: "Enfriamiento",
      tipo: "enfriamiento",
      duracionMin: 12,
      zonaObjetivo: "Z1",
      rpe: "2",
      descripcion: "Rodaje suave para recuperar.",
    }),
  ]),
  fondo150: crearEstructuraEntrenamiento([
    crearBloque({
      nombre: "Calentamiento",
      tipo: "calentamiento",
      duracionMin: 15,
      zonaObjetivo: "Z1",
      rpe: "2-3",
      descripcion: "Inicio progresivo.",
    }),
    crearBloque({
      nombre: "Fondo aerobico",
      tipo: "principal",
      duracionMin: 115,
      zonaObjetivo: "Z2",
      rpe: "4-5",
      descripcion: "Ritmo estable, cuidar nutricion e hidratacion.",
    }),
    crearBloque({
      nombre: "Tempo corto final",
      tipo: "complementario",
      duracionMin: 10,
      zonaObjetivo: "Z3",
      rpe: "6",
      descripcion: "Finalizar con ritmo firme si hay buenas sensaciones.",
    }),
    crearBloque({
      nombre: "Enfriamiento",
      tipo: "enfriamiento",
      duracionMin: 10,
      zonaObjetivo: "Z1",
      rpe: "2",
      descripcion: "Soltar piernas.",
    }),
  ]),
  fondo180: crearEstructuraEntrenamiento([
    crearBloque({
      nombre: "Calentamiento",
      tipo: "calentamiento",
      duracionMin: 20,
      zonaObjetivo: "Z1",
      rpe: "2-3",
      descripcion: "Entrar progresivamente en ritmo.",
    }),
    crearBloque({
      nombre: "Fondo largo",
      tipo: "principal",
      duracionMin: 130,
      zonaObjetivo: "Z2",
      rpe: "4-5",
      descripcion: "Sostener ritmo aerobico constante.",
    }),
    crearBloque({
      nombre: "Progresivo final",
      tipo: "complementario",
      duracionMin: 15,
      zonaObjetivo: "Z3",
      rpe: "6",
      descripcion: "Subir levemente la intensidad si la fatiga lo permite.",
    }),
    crearBloque({
      nombre: "Enfriamiento",
      tipo: "enfriamiento",
      duracionMin: 15,
      zonaObjetivo: "Z1",
      rpe: "2",
      descripcion: "Cerrar muy suave.",
    }),
  ]),
};

const obtenerBibliotecaBase = () => {
  const fechaBase = new Date("2026-01-05T00:00:00.000Z");
  const crearFecha = (diasDesdeBase) => {
    const fecha = new Date(fechaBase);
    fecha.setDate(fecha.getDate() + diasDesdeBase);
    return fecha;
  };

  return [
    {
      _id: "base-recuperacion-30",
      origen: "Base",
      nombre: "Recuperacion suave 30 min",
      fecha: crearFecha(0),
      tipo: "Ciclismo",
      duracionPlanificadaMin: 30,
      tssPlanificado: 12,
      ifPlanificado: 0.5,
      objetivoFisiologico: "Recuperaci\u00f3n",
      estructura: estructurasBibliotecaBase.recuperacion30,
    },
    {
      _id: "base-recuperacion-60",
      origen: "Base",
      nombre: "Recuperacion aerobia suave 60 min",
      fecha: crearFecha(1),
      tipo: "Ciclismo",
      duracionPlanificadaMin: 60,
      tssPlanificado: 28,
      ifPlanificado: 0.58,
      objetivoFisiologico: "Recuperaci\u00f3n",
      estructura: estructurasBibliotecaBase.recuperacion60,
    },
    {
      _id: "base-resistencia-60",
      origen: "Base",
      nombre: "Resistencia aerobica base 60 min",
      fecha: crearFecha(2),
      tipo: "Ciclismo",
      duracionPlanificadaMin: 60,
      tssPlanificado: 40,
      ifPlanificado: 0.66,
      objetivoFisiologico: "Resistencia aer\u00f3bica",
      estructura: estructurasBibliotecaBase.resistencia60,
    },
    {
      _id: "base-resistencia-90",
      origen: "Base",
      nombre: "Resistencia aerobica sostenida 90 min",
      fecha: crearFecha(3),
      tipo: "Ciclismo",
      duracionPlanificadaMin: 90,
      tssPlanificado: 62,
      ifPlanificado: 0.68,
      objetivoFisiologico: "Resistencia aer\u00f3bica",
      estructura: estructurasBibliotecaBase.resistencia90,
    },
    {
      _id: "base-tempo-60",
      origen: "Base",
      nombre: "Tempo controlado 60 min",
      fecha: crearFecha(4),
      tipo: "Ciclismo",
      duracionPlanificadaMin: 60,
      tssPlanificado: 58,
      ifPlanificado: 0.78,
      objetivoFisiologico: "Tempo",
      estructura: estructurasBibliotecaBase.tempo60,
    },
    {
      _id: "base-umbral-60",
      origen: "Base",
      nombre: "Umbral progresivo 60 min",
      fecha: crearFecha(5),
      tipo: "Ciclismo",
      duracionPlanificadaMin: 60,
      tssPlanificado: 70,
      ifPlanificado: 0.88,
      objetivoFisiologico: "Umbral",
      estructura: estructurasBibliotecaBase.umbral60,
    },
    {
      _id: "base-umbral-90",
      origen: "Base",
      nombre: "Umbral sostenido 90 min",
      fecha: crearFecha(6),
      tipo: "Ciclismo",
      duracionPlanificadaMin: 90,
      tssPlanificado: 92,
      ifPlanificado: 0.9,
      objetivoFisiologico: "Umbral",
      estructura: estructurasBibliotecaBase.umbral90,
    },
    {
      _id: "base-fuerza-75",
      origen: "Base",
      nombre: "Fuerza resistencia en subida 75 min",
      fecha: crearFecha(7),
      tipo: "Ciclismo",
      duracionPlanificadaMin: 75,
      tssPlanificado: 72,
      ifPlanificado: 0.82,
      objetivoFisiologico: "Fuerza Resistencia",
      estructura: estructurasBibliotecaBase.fuerza75,
    },
    {
      _id: "base-vo2-60",
      origen: "Base",
      nombre: "VO2 max introductorio 60 min",
      fecha: crearFecha(8),
      tipo: "Ciclismo",
      duracionPlanificadaMin: 60,
      tssPlanificado: 78,
      ifPlanificado: 1.05,
      objetivoFisiologico: "VO2",
      estructura: estructurasBibliotecaBase.vo2,
    },
    {
      _id: "base-fondo-150",
      origen: "Base",
      nombre: "Fondo largo base 150 min",
      fecha: crearFecha(9),
      tipo: "Ciclismo",
      duracionPlanificadaMin: 150,
      tssPlanificado: 115,
      ifPlanificado: 0.72,
      objetivoFisiologico: "Fondo Largo",
      estructura: estructurasBibliotecaBase.fondo150,
    },
    {
      _id: "base-fondo-180",
      origen: "Base",
      nombre: "Fondo largo progresivo 180 min",
      fecha: crearFecha(10),
      tipo: "Ciclismo",
      duracionPlanificadaMin: 180,
      tssPlanificado: 145,
      ifPlanificado: 0.75,
      objetivoFisiologico: "Fondo Largo",
      estructura: estructurasBibliotecaBase.fondo180,
    },
  ];
};

const seleccionarEntrenamientoPorCategoria = (
  biblioteca,
  categoria,
  duracionMaximaMin,
) => {
  const candidatos = biblioteca.filter((entrenamiento) => {
    const duracion = entrenamiento.duracionPlanificadaMin || 0;
    const ifValor = entrenamiento.ifPlanificado || 0;
    const tss = entrenamiento.tssPlanificado || 0;

    if (duracion > duracionMaximaMin) return false;

    if (categoria === "Recuperación") {
      return (
        entrenamiento.objetivoFisiologico === categoria &&
        ifValor <= 0.65 &&
        tss <= 100
      );
    }

    if (categoria === "Fondo Largo") {
      return (
        entrenamiento.objetivoFisiologico === categoria &&
        duracion >= 150 &&
        ifValor <= 0.85
      );
    }

    if (categoria === "Umbral") {
      return (
        entrenamiento.objetivoFisiologico === categoria &&
        ifValor >= 0.65 &&
        ifValor <= 0.95
      );
    }

    return entrenamiento.objetivoFisiologico === categoria;
  });

  if (candidatos.length === 0) return null;

  candidatos.sort(
    (a, b) => b.duracionPlanificadaMin - a.duracionPlanificadaMin,
  );

  return candidatos[0];
};

const obtenerZonaPorCodigo = (zonas = [], codigoZona) => {
  return zonas.find((zona) => zona.nombre?.startsWith(codigoZona)) || null;
};

const crearZonaFallbackFTP = (ftp, codigoZona) => {
  const ftpNumerico = Number(ftp);

  if (!ftpNumerico || ftpNumerico <= 0) return null;

  const limites = {
    Z1: [0, Math.round(ftpNumerico * 0.55)],
    Z2: [Math.round(ftpNumerico * 0.55) + 1, Math.round(ftpNumerico * 0.75)],
    Z3: [Math.round(ftpNumerico * 0.75) + 1, Math.round(ftpNumerico * 0.9)],
    Z4: [Math.round(ftpNumerico * 0.9) + 1, Math.round(ftpNumerico * 1.05)],
    Z5: [Math.round(ftpNumerico * 1.05) + 1, Math.round(ftpNumerico * 1.2)],
    Z6: [Math.round(ftpNumerico * 1.2) + 1, Math.round(ftpNumerico * 1.5)],
    Z7: [Math.round(ftpNumerico * 1.5) + 1, null],
  };
  const rango = limites[codigoZona];

  if (!rango) return null;

  return {
    nombre: codigoZona,
    desde: rango[0],
    hasta: rango[1],
    unidad: "W",
  };
};

const crearZonaFallbackFC = (frecuenciaCardiacaMaxima, codigoZona) => {
  const fcMaxima = Number(frecuenciaCardiacaMaxima);

  if (!fcMaxima || fcMaxima <= 0) return null;

  const limites = {
    Z1: [Math.round(fcMaxima * 0.5), Math.round(fcMaxima * 0.6)],
    Z2: [Math.round(fcMaxima * 0.6) + 1, Math.round(fcMaxima * 0.7)],
    Z3: [Math.round(fcMaxima * 0.7) + 1, Math.round(fcMaxima * 0.8)],
    Z4: [Math.round(fcMaxima * 0.8) + 1, Math.round(fcMaxima * 0.9)],
    Z5: [Math.round(fcMaxima * 0.9) + 1, Math.round(fcMaxima)],
  };
  const rango = limites[codigoZona];

  if (!rango) return null;

  return {
    nombre: codigoZona,
    desde: rango[0],
    hasta: rango[1],
    unidad: "ppm",
  };
};

const crearZonaSugerida = (perfil, codigoZona, rpe) => {
  const zonasFTP = perfil.zonasEntrenamiento?.ftp?.zonas || [];
  const zonasFC = perfil.zonasEntrenamiento?.frecuenciaCardiaca?.zonas || [];

  if (perfil.ftp) {
    const zona =
      obtenerZonaPorCodigo(zonasFTP, codigoZona) ||
      crearZonaFallbackFTP(perfil.ftp, codigoZona);

    if (zona) {
      return {
        metodo: "FTP",
        codigo: codigoZona,
        zona: zona.nombre,
        desde: zona.desde,
        hasta: zona.hasta,
        unidad: zona.unidad || "W",
      };
    }
  }

  if (perfil.frecuenciaCardiacaMaxima) {
    const zona =
      obtenerZonaPorCodigo(zonasFC, codigoZona) ||
      crearZonaFallbackFC(perfil.frecuenciaCardiacaMaxima, codigoZona);

    if (zona) {
      return {
        metodo: "FC_MAX",
        codigo: codigoZona,
        zona: zona.nombre,
        desde: zona.desde,
        hasta: zona.hasta,
        unidad: zona.unidad || "ppm",
      };
    }
  }

  return {
    metodo: "RPE",
    codigo: codigoZona,
    rpe,
    unidad: "RPE",
  };
};

const enriquecerBloqueConZonas = (perfil, bloque) => {
  const bloqueEnriquecido = {
    ...bloque,
    zonaSugerida: crearZonaSugerida(perfil, bloque.zonaObjetivo, bloque.rpe),
  };

  if (bloque.recuperacionMin) {
    bloqueEnriquecido.recuperacionSugerida = crearZonaSugerida(
      perfil,
      bloque.zonaRecuperacion || "Z1",
      "2-3",
    );
  }

  return bloqueEnriquecido;
};

const enriquecerEstructuraConZonas = (perfil, estructura) => {
  if (!estructura?.bloques || !Array.isArray(estructura.bloques)) {
    return null;
  }

  return {
    ...estructura,
    bloques: estructura.bloques.map((bloque) =>
      enriquecerBloqueConZonas(perfil, bloque),
    ),
  };
};

const convertirDisponibilidadHorasAMinutos = (disponibilidad = {}) => {
  const resultado = {};

  for (const [dia, horas] of Object.entries(disponibilidad)) {
    resultado[dia] = horas * 60;
  }

  return resultado;
};

const agregarBloqueSiHayTiempo = (
  estructura,
  disponibilidadMinutos,
  dia,
  categoria,
  prioridad,
) => {
  const minutosDisponibles = disponibilidadMinutos[dia] || 0;

  if (minutosDisponibles > 0) {
    estructura.push({
      dia,
      categoria,
      prioridad,
      minutosDisponibles,
    });
  }
};

const generarEstructuraBase = (disponibilidadMinutos) => {
  const estructura = [];

  const mapaDias = {
    lunes: "lunes",
    martes: "martes",
    miércoles: "miercoles",
    jueves: "jueves",
    viernes: "viernes",
    sábado: "sabado",
    domingo: "domingo",
  };

  const agregarSiHayTiempo = (dia, categoria, prioridad) => {
    const claveDisponibilidad = mapaDias[dia] || dia;
    const minutosDisponibles = disponibilidadMinutos[claveDisponibilidad] || 0;

    if (minutosDisponibles > 0) {
      estructura.push({
        dia,
        categoria,
        prioridad,
        minutosDisponibles,
      });
    }
  };

  agregarSiHayTiempo("martes", "Umbral", 1);
  agregarSiHayTiempo("miércoles", "Resistencia aeróbica", 2);
  agregarSiHayTiempo("jueves", "Recuperación", 4);
  agregarSiHayTiempo("sábado", "Recuperación", 3);
  agregarSiHayTiempo("domingo", "Fondo Largo", 1);

  return estructura;
};

const generarEstructuraBaseInteligente = (disponibilidadMinutos) => {
  const estructura = [];

  agregarBloqueSiHayTiempo(
    estructura,
    disponibilidadMinutos,
    "lunes",
    "Recuperaci\u00f3n",
    5,
  );
  agregarBloqueSiHayTiempo(
    estructura,
    disponibilidadMinutos,
    "martes",
    "Umbral",
    1,
  );
  agregarBloqueSiHayTiempo(
    estructura,
    disponibilidadMinutos,
    "miercoles",
    "Resistencia aer\u00f3bica",
    2,
  );
  agregarBloqueSiHayTiempo(
    estructura,
    disponibilidadMinutos,
    "jueves",
    "Tempo",
    3,
  );
  agregarBloqueSiHayTiempo(
    estructura,
    disponibilidadMinutos,
    "viernes",
    "Recuperaci\u00f3n",
    5,
  );
  agregarBloqueSiHayTiempo(
    estructura,
    disponibilidadMinutos,
    "sabado",
    "Resistencia aer\u00f3bica",
    3,
  );
  agregarBloqueSiHayTiempo(
    estructura,
    disponibilidadMinutos,
    "domingo",
    "Fondo Largo",
    1,
  );

  return estructura;
};

const calcularSemanasHastaObjetivo = (objetivoPrincipal) => {
  if (!objetivoPrincipal?.fechaObjetivo) return null;

  const hoy = new Date();
  const fechaObjetivo = new Date(objetivoPrincipal.fechaObjetivo);
  const diferenciaMs = fechaObjetivo - hoy;
  const semanas = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24 * 7));

  return semanas > 0 ? semanas : 0;
};

const determinarFase = (objetivoPrincipal) => {
  const semanasHastaObjetivo = calcularSemanasHastaObjetivo(objetivoPrincipal);

  if (semanasHastaObjetivo === null) return "Sin objetivo";
  if (semanasHastaObjetivo > 16) return "Base";
  if (semanasHastaObjetivo > 8) return "Construccion";
  if (semanasHastaObjetivo > 4) return "Especializacion";
  if (semanasHastaObjetivo > 2) return "Pico";

  return "Taper";
};

const calcularVolumenDisponibleMin = (disponibilidadMinutos) => {
  return Object.values(disponibilidadMinutos).reduce(
    (total, minutos) => total + minutos,
    0,
  );
};

const obtenerPorcentajeObjetivoSegunFase = (fase) => {
  const porcentajes = {
    Base: 0.65,
    Construccion: 0.75,
    Especializacion: 0.85,
    Pico: 0.8,
    Taper: 0.5,
  };

  return porcentajes[fase] || 0.65;
};

const obtenerFactorAdaptacion = (adaptacion) => {
  const accion = adaptacion?.accion || adaptacion?.estado || adaptacion;

  if (accion === "Reducir carga") return 0.8;
  if (accion === "Monitorear") return 0.9;

  return 1;
};

const obtenerHistorialSemanalReciente = async (atletaId, limite = 8) => {
  return await HistorialSemanal.find({ atletaId })
    .sort({ fechaInicioSemana: -1, createdAt: -1 })
    .limit(limite);
};

const extraerFondosLargos = (historiales = []) => {
  return historiales
    .slice()
    .reverse()
    .flatMap((historial) => historial.semanaGenerada?.sesiones || [])
    .filter((sesion) => sesion.categoria === "Fondo Largo")
    .map((sesion) => sesion.duracion || 0)
    .filter((duracion) => duracion > 0);
};

const calcularDuracionFondoLargoObjetivo = (historiales = []) => {
  const fondos = extraerFondosLargos(historiales);

  if (fondos.length === 0) return 180;

  const ultimo = fondos[fondos.length - 1];
  const penultimo = fondos[fondos.length - 2];
  const maximoHistorico = Math.max(...fondos);
  const semanaDeDescarga = (fondos.length + 1) % 4 === 0;

  if (semanaDeDescarga) {
    return Math.max(150, Math.min(ultimo, 180));
  }

  if (ultimo < maximoHistorico && maximoHistorico >= 240) {
    return Math.min(maximoHistorico + 30, 270);
  }

  if (ultimo === penultimo && ultimo >= 180) {
    return Math.min(ultimo + 30, 270);
  }

  return Math.min(ultimo, 270);
};

const calcularVolumenGeneradoMin = (sesiones = []) => {
  return sesiones.reduce((total, sesion) => total + (sesion.duracion || 0), 0);
};

const calcularPorcentajeUtilizacionReal = (
  volumenGeneradoMin,
  volumenObjetivoMin,
) => {
  if (!volumenObjetivoMin) return 0;

  return Math.round((volumenGeneradoMin / volumenObjetivoMin) * 100);
};

const calcularDuracionBloque = (bloque = {}) => {
  const duracionTrabajo =
    (bloque.duracionMin || 0) * (bloque.repeticiones || 1);
  const duracionRecuperacion =
    (bloque.recuperacionMin || 0) * (bloque.repeticiones || 0);

  return duracionTrabajo + duracionRecuperacion;
};

const calcularDuracionEstructura = (estructura) => {
  if (!Array.isArray(estructura?.bloques)) return 0;

  return estructura.bloques.reduce((total, bloque) => {
    return total + calcularDuracionBloque(bloque);
  }, 0);
};

const clonarEstructura = (estructura) => {
  if (!estructura?.bloques) return estructura;

  return {
    ...estructura,
    bloques: estructura.bloques.map((bloque) => ({ ...bloque })),
  };
};

const encontrarBloquePrincipal = (bloques = []) => {
  return (
    bloques.find((bloque) => bloque.tipo === "principal") ||
    bloques.find((bloque) => bloque.tipo !== "calentamiento") ||
    bloques[0]
  );
};

const encontrarBloqueSimpleAjustable = (bloques = []) => {
  return (
    bloques.find(
      (bloque) =>
        !bloque.repeticiones &&
        bloque.tipo === "complementario" &&
        bloque.tipo !== "enfriamiento",
    ) ||
    bloques.find(
      (bloque) => !bloque.repeticiones && bloque.tipo === "principal",
    ) ||
    bloques.find(
      (bloque) =>
        !bloque.repeticiones &&
        bloque.tipo !== "calentamiento" &&
        bloque.tipo !== "enfriamiento",
    )
  );
};

const encontrarIndiceEnfriamiento = (bloques = []) => {
  const indice = bloques.findIndex((bloque) => bloque.tipo === "enfriamiento");

  return indice === -1 ? bloques.length : indice;
};

const crearBloqueComplementarioZ2 = (minutos, bloqueReferencia = {}) => {
  const bloque = crearBloque({
    nombre: "Volumen aerobico complementario",
    tipo: "complementario",
    duracionMin: minutos,
    zonaObjetivo: "Z2",
    rpe: "4-5",
    descripcion:
      "Rodaje aerobico estable para completar el volumen sin aumentar la intensidad.",
  });

  if (bloqueReferencia.zonaSugerida) {
    bloque.zonaSugerida = bloqueReferencia.zonaSugerida;
  }

  return bloque;
};

const crearBloqueConZonaReferencia = ({
  nombre,
  tipo,
  duracionMin,
  zonaObjetivo,
  rpe,
  descripcion,
  bloqueReferencia = {},
}) => {
  const bloque = crearBloque({
    nombre,
    tipo,
    duracionMin,
    zonaObjetivo,
    rpe,
    descripcion,
  });

  if (bloqueReferencia.zonaSugerida) {
    bloque.zonaSugerida = bloqueReferencia.zonaSugerida;
  }

  return bloque;
};

const crearBloquePausaNutricion = (duracionMin) =>
  crearBloque({
    nombre: "Pausa nutricion breve",
    tipo: "pausa",
    duracionMin,
    zonaObjetivo: "Z1",
    rpe: "1-2",
    descripcion: "Bajar intensidad, comer, beber y reorganizar el esfuerzo.",
  });

const obtenerBloquePorTipo = (bloques = [], tipo) => {
  return bloques.find((bloque) => bloque.tipo === tipo);
};

const obtenerBloqueAerobicoReferencia = (bloques = []) => {
  return (
    bloques.find((bloque) => bloque.zonaObjetivo === "Z2") ||
    encontrarBloquePrincipal(bloques)
  );
};

const crearSegmentosAerobicos = ({
  duracionTotal,
  cantidadSegmentos,
  prefijo,
  bloqueReferencia,
}) => {
  const base = Math.floor(duracionTotal / cantidadSegmentos);
  let restante = duracionTotal;

  return Array.from({ length: cantidadSegmentos }, (_, indice) => {
    const esUltimo = indice === cantidadSegmentos - 1;
    const duracionMin = esUltimo ? restante : base;

    restante -= duracionMin;

    return crearBloqueConZonaReferencia({
      nombre: `${prefijo} ${indice + 1}`,
      tipo: "principal",
      duracionMin,
      zonaObjetivo: "Z2",
      rpe: "4-5",
      descripcion: "Mantener intensidad aerobica estable y sostenible.",
      bloqueReferencia,
    });
  });
};

const reconstruirResistenciaLarga = (estructura, duracionObjetivo) => {
  const calentamiento = obtenerBloquePorTipo(
    estructura.bloques,
    "calentamiento",
  );
  const enfriamiento = obtenerBloquePorTipo(
    estructura.bloques,
    "enfriamiento",
  );
  const bloqueReferencia = obtenerBloqueAerobicoReferencia(estructura.bloques);
  const duracionCalentamiento = calentamiento?.duracionMin || 15;
  const duracionEnfriamiento = enfriamiento?.duracionMin || 10;
  const incluirProgresivo = duracionObjetivo > 180;
  const duracionProgresivo = incluirProgresivo ? 20 : 0;
  const duracionAerobica = Math.max(
    0,
    duracionObjetivo -
      duracionCalentamiento -
      duracionEnfriamiento -
      duracionProgresivo,
  );
  const cantidadSegmentos = duracionObjetivo > 180 ? 3 : 2;
  const bloques = [
    calentamiento || crearBloqueConZonaReferencia({
      nombre: "Calentamiento",
      tipo: "calentamiento",
      duracionMin: duracionCalentamiento,
      zonaObjetivo: "Z1",
      rpe: "2-3",
      descripcion: "Activacion progresiva.",
      bloqueReferencia,
    }),
    ...crearSegmentosAerobicos({
      duracionTotal: duracionAerobica,
      cantidadSegmentos,
      prefijo: "Bloque aerobico",
      bloqueReferencia,
    }),
  ];

  if (incluirProgresivo) {
    bloques.push(
      crearBloqueConZonaReferencia({
        nombre: "Progresivo final",
        tipo: "complementario",
        duracionMin: duracionProgresivo,
        zonaObjetivo: "Z3",
        rpe: "6",
        descripcion: "Terminar con ritmo tempo controlado, sin sprintar.",
        bloqueReferencia,
      }),
    );
  }

  bloques.push(
    enfriamiento || crearBloqueConZonaReferencia({
      nombre: "Enfriamiento",
      tipo: "enfriamiento",
      duracionMin: duracionEnfriamiento,
      zonaObjetivo: "Z1",
      rpe: "2",
      descripcion: "Rodar suave.",
      bloqueReferencia,
    }),
  );

  estructura.bloques = bloques;
};

const reconstruirFondoLargo = (estructura, duracionObjetivo) => {
  const calentamiento = obtenerBloquePorTipo(
    estructura.bloques,
    "calentamiento",
  );
  const enfriamiento = obtenerBloquePorTipo(
    estructura.bloques,
    "enfriamiento",
  );
  const bloqueReferencia = obtenerBloqueAerobicoReferencia(estructura.bloques);
  const duracionCalentamiento = calentamiento?.duracionMin || 15;
  const duracionEnfriamiento = enfriamiento?.duracionMin || 10;
  const duracionPausa = 5;
  const incluirProgresivo = duracionObjetivo > 240;
  const duracionProgresivo = incluirProgresivo ? 25 : 0;
  const duracionAerobica = Math.max(
    0,
    duracionObjetivo -
      duracionCalentamiento -
      duracionEnfriamiento -
      duracionPausa -
      duracionProgresivo,
  );
  const duracionPrimerFondo = Math.floor(duracionAerobica / 2);
  const duracionSegundoFondo = duracionAerobica - duracionPrimerFondo;
  const bloques = [
    calentamiento || crearBloqueConZonaReferencia({
      nombre: "Calentamiento",
      tipo: "calentamiento",
      duracionMin: duracionCalentamiento,
      zonaObjetivo: "Z1",
      rpe: "2-3",
      descripcion: "Activacion progresiva.",
      bloqueReferencia,
    }),
    crearBloqueConZonaReferencia({
      nombre: "Fondo aerobico 1",
      tipo: "principal",
      duracionMin: duracionPrimerFondo,
      zonaObjetivo: "Z2",
      rpe: "4-5",
      descripcion: "Primer bloque largo estable con cadencia comoda.",
      bloqueReferencia,
    }),
    crearBloquePausaNutricion(duracionPausa),
    crearBloqueConZonaReferencia({
      nombre: "Fondo aerobico 2",
      tipo: "principal",
      duracionMin: duracionSegundoFondo,
      zonaObjetivo: "Z2",
      rpe: "4-5",
      descripcion: "Segundo bloque aerobico manteniendo consumo regular.",
      bloqueReferencia,
    }),
  ];

  if (incluirProgresivo) {
    bloques.push(
      crearBloqueConZonaReferencia({
        nombre: "Progresivo final",
        tipo: "complementario",
        duracionMin: duracionProgresivo,
        zonaObjetivo: "Z3",
        rpe: "6",
        descripcion: "Cerrar con ritmo sostenido sin pasar de control.",
        bloqueReferencia,
      }),
    );
  }

  bloques.push(
    enfriamiento || crearBloqueConZonaReferencia({
      nombre: "Enfriamiento",
      tipo: "enfriamiento",
      duracionMin: duracionEnfriamiento,
      zonaObjetivo: "Z1",
      rpe: "2",
      descripcion: "Soltar piernas.",
      bloqueReferencia,
    }),
  );

  estructura.bloques = bloques;
};

const ajustarEstructuraSuave = (estructura, diferenciaMinutos) => {
  const bloquePrincipal = encontrarBloquePrincipal(estructura.bloques);

  if (!bloquePrincipal) return;

  bloquePrincipal.duracionMin += diferenciaMinutos;

  if (!bloquePrincipal.zonaObjetivo) {
    bloquePrincipal.zonaObjetivo = "Z1";
  }

  if (bloquePrincipal.zonaObjetivo !== "Z1") {
    bloquePrincipal.zonaObjetivo = "Z2";
  }

  bloquePrincipal.rpe = bloquePrincipal.rpe || "2-4";
};

const ajustarEstructuraResistencia = (estructura, diferenciaMinutos) => {
  const bloquePrincipal = encontrarBloquePrincipal(estructura.bloques);

  if (!bloquePrincipal) return;

  bloquePrincipal.duracionMin += diferenciaMinutos;
};

const ajustarEstructuraIntensa = (estructura, diferenciaMinutos) => {
  const bloquePrincipal = encontrarBloquePrincipal(estructura.bloques);
  const bloquePrincipalEsRepetido = Boolean(bloquePrincipal?.repeticiones);
  const incrementoIntenso = bloquePrincipalEsRepetido
    ? 0
    : Math.min(diferenciaMinutos, 10);

  if (bloquePrincipal && incrementoIntenso > 0) {
    bloquePrincipal.duracionMin += incrementoIntenso;
  }

  const volumenComplementario = diferenciaMinutos - incrementoIntenso;

  if (volumenComplementario <= 0) return;

  const indiceEnfriamiento = encontrarIndiceEnfriamiento(estructura.bloques);
  const bloqueComplementario = crearBloqueComplementarioZ2(
    volumenComplementario,
    bloquePrincipal,
  );

  estructura.bloques.splice(indiceEnfriamiento, 0, bloqueComplementario);
};

const reducirEstructuraHastaDuracion = (estructura, duracionObjetivo) => {
  let exceso = calcularDuracionEstructura(estructura) - duracionObjetivo;

  const bloquesReducibles = estructura.bloques
    .filter(
      (bloque) =>
        !bloque.repeticiones &&
        bloque.tipo !== "calentamiento" &&
        bloque.tipo !== "enfriamiento",
    )
    .reverse();

  for (const bloque of bloquesReducibles) {
    if (exceso <= 0) break;

    const minimo = bloque.tipo === "principal" ? 10 : 0;
    const reduccion = Math.min(exceso, Math.max(0, bloque.duracionMin - minimo));

    bloque.duracionMin -= reduccion;
    exceso -= reduccion;
  }
};

const ajustarRedondeoEstructura = (estructura, duracionObjetivo) => {
  const diferencia = duracionObjetivo - calcularDuracionEstructura(estructura);

  if (Math.abs(diferencia) <= 1) return;

  const bloquePrincipal =
    encontrarBloqueSimpleAjustable(estructura.bloques) ||
    encontrarBloquePrincipal(estructura.bloques);

  if (!bloquePrincipal) return;

  if (bloquePrincipal.repeticiones) return;

  bloquePrincipal.duracionMin = Math.max(
    1,
    bloquePrincipal.duracionMin + diferencia,
  );
};

const sincronizarEstructuraConDuracionSesion = (sesion, perfil) => {
  const estructuraOriginal = sesion.entrenamientoSeleccionado?.estructura;

  if (!Array.isArray(estructuraOriginal?.bloques)) return sesion;

  const estructura = clonarEstructura(estructuraOriginal);
  const duracionObjetivo = Math.round(sesion.duracion || 0);
  const duracionActual = calcularDuracionEstructura(estructura);
  const diferenciaMinutos = duracionObjetivo - duracionActual;

  if (!duracionObjetivo || Math.abs(diferenciaMinutos) <= 1) {
    return {
      ...sesion,
      entrenamientoSeleccionado: {
        ...sesion.entrenamientoSeleccionado,
        estructura,
      },
    };
  }

  if (diferenciaMinutos > 0) {
    if (
      sesion.categoria === "Resistencia aer\u00f3bica" &&
      duracionObjetivo > 120
    ) {
      reconstruirResistenciaLarga(estructura, duracionObjetivo);
    } else if (
      sesion.categoria === "Fondo Largo" &&
      duracionObjetivo > 180
    ) {
      reconstruirFondoLargo(estructura, duracionObjetivo);
    } else if (
      ["Resistencia aer\u00f3bica", "Fondo Largo"].includes(sesion.categoria)
    ) {
      ajustarEstructuraResistencia(estructura, diferenciaMinutos);
    } else if (sesion.categoria === "Recuperaci\u00f3n") {
      ajustarEstructuraSuave(estructura, diferenciaMinutos);
    } else if (
      ["Umbral", "Tempo", "VO2", "Fuerza Resistencia"].includes(
        sesion.categoria,
      )
    ) {
      ajustarEstructuraIntensa(estructura, diferenciaMinutos);
    } else {
      ajustarEstructuraResistencia(estructura, diferenciaMinutos);
    }
  } else {
    reducirEstructuraHastaDuracion(estructura, duracionObjetivo);
  }

  ajustarRedondeoEstructura(estructura, duracionObjetivo);
  estructura.bloques = estructura.bloques.map((bloque) =>
    enriquecerBloqueConZonas(perfil, bloque),
  );

  return {
    ...sesion,
    entrenamientoSeleccionado: {
      ...sesion.entrenamientoSeleccionado,
      estructura,
    },
  };
};

const sincronizarEstructurasConDuracionSesiones = (sesiones = [], perfil) => {
  return sesiones.map((sesion) =>
    sincronizarEstructuraConDuracionSesion(sesion, perfil),
  );
};

const obtenerNombreDinamicoEntrenamiento = (categoria, duracion) => {
  if (categoria === "Resistencia aer\u00f3bica") {
    if (duracion <= 90) {
      return `Resistencia aer\u00f3bica sostenida ${duracion} min`;
    }

    if (duracion <= 180) {
      return `Resistencia aer\u00f3bica extensiva ${duracion} min`;
    }

    return `Fondo aer\u00f3bico progresivo ${duracion} min`;
  }

  if (categoria === "Fondo Largo") {
    if (duracion <= 180) {
      return `Fondo largo progresivo ${duracion} min`;
    }

    return `Fondo largo extensivo ${duracion} min`;
  }

  if (categoria === "Tempo") {
    return `Tempo progresivo ${duracion} min`;
  }

  if (categoria === "Umbral") {
    return `Trabajo de umbral ${duracion} min`;
  }

  if (categoria === "VO2") {
    return `VO2 Max ${duracion} min`;
  }

  if (categoria === "Recuperaci\u00f3n") {
    return `Recuperaci\u00f3n aer\u00f3bica ${duracion} min`;
  }

  return `${categoria} ${duracion} min`;
};

const generarNutricionSugerida = (duracion) => {
  const duracionHoras = duracion / 60;
  let gramosCHOHora = 0;
  let hidratacionMlHora = 0;

  if (duracion <= 90) {
    return {
      gramosCHOHora,
      gramosCHOTotales: 0,
      hidratacionMlHora,
      resumen: "Agua segun sensacion de sed",
    };
  }

  if (duracion <= 180) {
    gramosCHOHora = 60;
    hidratacionMlHora = 600;
  } else if (duracion <= 300) {
    gramosCHOHora = 75;
    hidratacionMlHora = 700;
  } else {
    gramosCHOHora = 90;
    hidratacionMlHora = 750;
  }

  const gramosCHOTotales = Math.round(duracionHoras * gramosCHOHora);

  return {
    gramosCHOHora,
    gramosCHOTotales,
    hidratacionMlHora,
    resumen: `Consumir aproximadamente ${gramosCHOHora} g de carbohidratos por hora y ${hidratacionMlHora} ml de liquidos por hora.`,
  };
};

const enriquecerSesionConNombreYNutricion = (sesion) => {
  if (!sesion.entrenamientoSeleccionado) return sesion;

  const duracion = Math.round(sesion.duracion || 0);

  return {
    ...sesion,
    entrenamientoSeleccionado: {
      ...sesion.entrenamientoSeleccionado,
      nombre: obtenerNombreDinamicoEntrenamiento(sesion.categoria, duracion),
      nutricionSugerida: generarNutricionSugerida(duracion),
    },
  };
};

const enriquecerSesionesConNombreYNutricion = (sesiones = []) => {
  return sesiones.map(enriquecerSesionConNombreYNutricion);
};

const obtenerDuracionInicialSesion = (bloque, duracionFondoLargoObjetivo) => {
  const maximoDia = bloque.minutosDisponibles || 0;

  if (bloque.categoria === "Fondo Largo") {
    return Math.min(maximoDia, duracionFondoLargoObjetivo);
  }

  if (bloque.categoria === "Recuperaci\u00f3n") {
    return Math.min(maximoDia, 60);
  }

  if (bloque.categoria === "Resistencia aer\u00f3bica") {
    return Math.min(maximoDia, 90);
  }

  if (bloque.categoria === "Tempo") {
    return Math.min(maximoDia, 75);
  }

  if (bloque.categoria === "Umbral") {
    return Math.min(maximoDia, 90);
  }

  return Math.min(maximoDia, 60);
};

const aumentarDuracion = (sesion, incrementoMaximo, limiteExtra = Infinity) => {
  const margenDia = Math.max(
    0,
    Math.min(sesion.minutosDisponibles, limiteExtra) - sesion.duracion,
  );
  const incremento = Math.min(margenDia, incrementoMaximo);

  sesion.duracion += incremento;

  return incremento;
};

const reducirDuracion = (sesion, decrementoMaximo, minimo) => {
  const margen = Math.max(0, sesion.duracion - minimo);
  const decremento = Math.min(margen, decrementoMaximo);

  sesion.duracion -= decremento;

  return decremento;
};

const ajustarSesionesAlVolumenObjetivo = ({
  sesiones,
  volumenObjetivoMin,
  duracionFondoLargoObjetivo,
}) => {
  const minimoAceptable = volumenObjetivoMin * 0.95;
  const maximoAceptable = volumenObjetivoMin * 1.05;
  let volumenGeneradoMin = calcularVolumenGeneradoMin(sesiones);
  let guardia = 0;

  while (volumenGeneradoMin < minimoAceptable && guardia < 20) {
    let incremento = 0;
    const fondo = sesiones.find((sesion) => sesion.categoria === "Fondo Largo");

    if (fondo) {
      incremento += aumentarDuracion(
        fondo,
        30,
        Math.min(duracionFondoLargoObjetivo, 270),
      );
    }

    for (const sesion of sesiones.filter(
      (item) => item.categoria === "Resistencia aer\u00f3bica",
    )) {
      if (volumenGeneradoMin + incremento >= minimoAceptable) break;
      incremento += aumentarDuracion(sesion, 30);
    }

    for (const sesion of sesiones.filter((item) =>
      ["Tempo", "Umbral"].includes(item.categoria),
    )) {
      if (volumenGeneradoMin + incremento >= minimoAceptable) break;
      incremento += aumentarDuracion(sesion, 15);
    }

    if (incremento === 0) break;

    volumenGeneradoMin += incremento;
    guardia += 1;
  }

  guardia = 0;

  while (volumenGeneradoMin > maximoAceptable && guardia < 20) {
    let decremento = 0;

    for (const sesion of sesiones
      .filter((item) => item.categoria === "Resistencia aer\u00f3bica")
      .reverse()) {
      if (volumenGeneradoMin - decremento <= maximoAceptable) break;
      decremento += reducirDuracion(sesion, 30, 60);
    }

    for (const sesion of sesiones.filter((item) =>
      ["Tempo", "Umbral"].includes(item.categoria),
    )) {
      if (volumenGeneradoMin - decremento <= maximoAceptable) break;
      decremento += reducirDuracion(sesion, 15, 45);
    }

    const fondo = sesiones.find((sesion) => sesion.categoria === "Fondo Largo");

    if (fondo && volumenGeneradoMin - decremento > maximoAceptable) {
      decremento += reducirDuracion(fondo, 30, 150);
    }

    if (decremento === 0) break;

    volumenGeneradoMin -= decremento;
    guardia += 1;
  }

  return sesiones;
};

const generarResumenSemana = ({
  sesiones,
  volumenDisponibleMin,
  volumenObjetivoMin,
  volumenGeneradoMin,
  porcentajeUtilizacionReal,
  fase,
  porcentajeObjetivoFase,
  patrones,
  estructuraSemanal,
  usandoBibliotecaBase,
}) => {
  const sesionesConEntrenamiento = sesiones.filter(
    (sesion) => sesion.entrenamientoSeleccionado,
  ).length;

  const volumenPlanificadoMin = sesiones.reduce((total, sesion) => {
    return total + (sesion.duracion || 0);
  }, 0);

  return {
    totalSesiones: sesiones.length,
    sesionesConEntrenamiento,
    sesionesSinEntrenamiento: sesiones.length - sesionesConEntrenamiento,
    volumenDisponibleMin,
    volumenObjetivoMin,
    volumenGeneradoMin,
    porcentajeUtilizacionReal,
    fase,
    porcentajeObjetivoFase,
    volumenPlanificadoMin,
    categoriasPlanificadas: sesiones.map((sesion) => sesion.categoria),
    patronesDetectados: patrones?.principiosDetectados?.length || 0,
    principiosSemanalesDetectados:
      estructuraSemanal?.principiosDetectados?.length || 0,
    usandoBibliotecaBase,
  };
};

const generarMensajeSemana = (resumen) => {
  if (resumen.totalSesiones === 0) {
    return "No se generaron sesiones porque no hay disponibilidad semanal cargada.";
  }

  if (resumen.sesionesSinEntrenamiento > 0) {
    return `Semana generada parcialmente: ${resumen.sesionesConEntrenamiento} de ${resumen.totalSesiones} sesiones tienen un entrenamiento compatible en biblioteca.`;
  }

  return `Semana generada correctamente con ${resumen.totalSesiones} sesiones y ${resumen.volumenPlanificadoMin} minutos planificados.`;
};

const generarSemanaMotor = async (atletaId) => {
  const perfil = await PerfilAtleta.findById(atletaId);

  if (!perfil) {
    throw new Error("Perfil de atleta no encontrado");
  }

  const objetivoPrincipal = await obtenerObjetivoPrincipal(atletaId);

  const bibliotecaAtleta = await EntrenamientoBiblioteca.find({
    atletaId,
  }).sort({
    fecha: 1,
  });

  const usandoBibliotecaBase = bibliotecaAtleta.length === 0;
  const biblioteca = usandoBibliotecaBase
    ? obtenerBibliotecaBase()
    : bibliotecaAtleta;
  const bibliotecaOrigen = usandoBibliotecaBase ? "Base" : "Atleta";

  const patrones = await analizarPatronesEntrenador(atletaId);
  const estructuraSemanal = analizarEstructuraSemanal(biblioteca);

  const disponibilidadMinutos = convertirDisponibilidadHorasAMinutos(
    perfil.disponibilidad,
  );
  const fase = determinarFase(objetivoPrincipal);
  const volumenDisponibleMin =
    calcularVolumenDisponibleMin(disponibilidadMinutos);
  const porcentajeObjetivoFase = obtenerPorcentajeObjetivoSegunFase(fase);
  const historialesRecientes = await obtenerHistorialSemanalReciente(atletaId);
  const ultimaAdaptacion = historialesRecientes[0]?.adaptacion;
  const factorAdaptacion = obtenerFactorAdaptacion(ultimaAdaptacion);
  const volumenObjetivoMin = Math.round(
    volumenDisponibleMin * porcentajeObjetivoFase * factorAdaptacion,
  );
  const duracionFondoLargoObjetivo =
    calcularDuracionFondoLargoObjetivo(historialesRecientes);

  const estructuraBase = generarEstructuraBaseInteligente(disponibilidadMinutos);
  const entrenamientosUsados = new Set();

  const sesiones = estructuraBase.map((bloque) => {
    const bibliotecaDisponible = biblioteca.filter(
      (entrenamiento) => !entrenamientosUsados.has(String(entrenamiento._id)),
    );

    const entrenamientoSeleccionado = seleccionarEntrenamientoPorCategoria(
      bibliotecaDisponible,
      bloque.categoria,
      bloque.minutosDisponibles,
    );

    if (entrenamientoSeleccionado) {
      entrenamientosUsados.add(String(entrenamientoSeleccionado._id));
    }

    const estructuraDetallada = entrenamientoSeleccionado
      ? enriquecerEstructuraConZonas(
          perfil,
          entrenamientoSeleccionado.estructura,
        )
      : null;

    return {
      dia: bloque.dia,
      categoria: bloque.categoria,
      tipo: bloque.categoria,
      prioridad: bloque.prioridad,
      minutosDisponibles: bloque.minutosDisponibles,
      duracion: obtenerDuracionInicialSesion(
        bloque,
        duracionFondoLargoObjetivo,
      ),
      entrenamientoSeleccionado: entrenamientoSeleccionado
        ? {
            id: entrenamientoSeleccionado._id,
            nombre: entrenamientoSeleccionado.nombre,
            duracionPlanificadaMin:
              entrenamientoSeleccionado.duracionPlanificadaMin,
            tssPlanificado: entrenamientoSeleccionado.tssPlanificado,
            ifPlanificado: entrenamientoSeleccionado.ifPlanificado,
            objetivoFisiologico: entrenamientoSeleccionado.objetivoFisiologico,
            estructura: estructuraDetallada,
          }
        : null,
    };
  });

  const sesionesAjustadas = ajustarSesionesAlVolumenObjetivo({
    sesiones,
    volumenObjetivoMin,
    duracionFondoLargoObjetivo,
  });
  const sesionesConEstructuraSincronizada =
    sincronizarEstructurasConDuracionSesiones(sesionesAjustadas, perfil);
  const sesionesFinales = enriquecerSesionesConNombreYNutricion(
    sesionesConEstructuraSincronizada,
  );
  const volumenGeneradoMin = calcularVolumenGeneradoMin(sesionesFinales);
  const porcentajeUtilizacionReal = calcularPorcentajeUtilizacionReal(
    volumenGeneradoMin,
    volumenObjetivoMin,
  );
  const resumen = generarResumenSemana({
    sesiones: sesionesFinales,
    volumenDisponibleMin,
    volumenObjetivoMin,
    volumenGeneradoMin,
    porcentajeUtilizacionReal,
    fase,
    porcentajeObjetivoFase,
    patrones,
    estructuraSemanal,
    usandoBibliotecaBase,
  });
  const mensaje = generarMensajeSemana(resumen);

  return {
    atletaId,
    objetivoPrincipal,
    fase,
    volumenDisponibleMin,
    volumenObjetivoMin,
    volumenGeneradoMin,
    porcentajeUtilizacionReal,
    porcentajeObjetivoFase,
    volumenDisponible: volumenDisponibleMin,
    volumenObjetivo: volumenObjetivoMin,
    volumenGenerado: volumenGeneradoMin,
    utilizacion: porcentajeUtilizacionReal,
    duracionFondoLargoObjetivo,
    bibliotecaOrigen,
    sesiones: sesionesFinales,
    resumen,
    mensaje,
  };
};

module.exports = {
  generarSemanaMotor,
};
