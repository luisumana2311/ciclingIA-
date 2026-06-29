const RegistroDiario = require("../models/RegistroDiario");

const ESTADOS_SESION = ["completada", "parcial", "no_realizada"];

const normalizarEstadoSesion = (estado) => {
  if (ESTADOS_SESION.includes(estado)) return estado;

  return "no_realizada";
};

const calcularCumplimientoSesion = ({
  estadoSesion,
  duracionRealizada,
  duracionPlanificada,
}) => {
  if (estadoSesion === "no_realizada") return 0;

  const duracionReal = Number(duracionRealizada) || 0;
  const duracionPlan = Number(duracionPlanificada) || 0;

  if (estadoSesion === "completada" && duracionPlan === 0) return 100;
  if (duracionPlan <= 0) return 0;

  return Math.min(100, Math.round((duracionReal / duracionPlan) * 100));
};

const obtenerNombreSesionPlanificada = (sesion = {}) => {
  return (
    sesion.entrenamientoSeleccionado?.nombre ||
    sesion.entrenamientoSeleccionado?.titulo ||
    sesion.entrenamiento?.nombre ||
    sesion.entrenamiento?.titulo ||
    sesion.nombreEntrenamiento ||
    sesion.nombre ||
    sesion.categoria ||
    ""
  );
};

const prepararRegistroDiario = (body = {}) => {
  const sesionPlanificadaSnapshot = body.sesionPlanificadaSnapshot || null;
  const estadoSesion = normalizarEstadoSesion(body.estadoSesion);
  const duracionPlanificada = Number(
    body.duracionPlanificada ?? sesionPlanificadaSnapshot?.duracion ?? 0,
  );
  const duracionRealizada = Number(body.duracionRealizada) || 0;
  const cumplimientoSesion = calcularCumplimientoSesion({
    estadoSesion,
    duracionRealizada,
    duracionPlanificada,
  });

  return {
    ...body,
    entrenoRealizado:
      estadoSesion === "completada" || estadoSesion === "parcial",
    estadoSesion,
    historialSemanalId: body.historialSemanalId || null,
    sesionPlanificadaIndex:
      body.sesionPlanificadaIndex === "" || body.sesionPlanificadaIndex === undefined
        ? null
        : Number(body.sesionPlanificadaIndex),
    sesionPlanificadaSnapshot,
    sesionPlanificadaDia:
      body.sesionPlanificadaDia || sesionPlanificadaSnapshot?.dia || "",
    sesionPlanificadaCategoria:
      body.sesionPlanificadaCategoria ||
      sesionPlanificadaSnapshot?.categoria ||
      sesionPlanificadaSnapshot?.tipo ||
      "",
    sesionPlanificadaNombre:
      body.sesionPlanificadaNombre ||
      obtenerNombreSesionPlanificada(sesionPlanificadaSnapshot),
    entrenamientoRealizado:
      body.entrenamientoRealizado ||
      body.sesionPlanificadaNombre ||
      obtenerNombreSesionPlanificada(sesionPlanificadaSnapshot),
    duracionPlanificada,
    duracionRealizada,
    sensacion: Number(body.sensacion) || 5,
    fatigaPercibida: Number(body.fatigaPercibida) || 5,
    cumplimientoSesion,
  };
};

const crearRegistroDiario = async (req, res) => {
  try {
    const registroPreparado = prepararRegistroDiario(req.body);
    const nuevoRegistro = await RegistroDiario.create(registroPreparado);

    res.status(201).json(nuevoRegistro);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear el registro diario",
      error: error.message,
    });
  }
};

const obtenerRegistrosPorAtleta = async (req, res) => {
  try {
    const registros = await RegistroDiario.find({
      atletaId: req.params.atletaId,
    }).sort({ fecha: -1 });

    res.json(registros);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener registros diarios",
      error: error.message,
    });
  }
};

module.exports = {
  crearRegistroDiario,
  obtenerRegistrosPorAtleta,
};
