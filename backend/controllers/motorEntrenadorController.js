const { generarSemanaMotor } = require("../services/motorEntrenadorService");
const PerfilAtleta = require("../models/PerfilAtleta");
const Objetivo = require("../models/Objetivo");
const {
  guardarHistorialSemanal,
} = require("../services/historialSemanalService");
const {
  generarPerfilDinamicoV2,
} = require("../services/perfilDinamicoV2Service");

const perfilTieneDisponibilidad = (disponibilidad = {}) => {
  return Object.values(disponibilidad).some((horas) => Number(horas) > 0);
};

const validarPerfilYObjetivo = async (atletaId) => {
  const perfil = await PerfilAtleta.findById(atletaId);

  if (!perfil) {
    return "Perfil de atleta no encontrado";
  }

  const camposFaltantes = [];

  if (!perfil.edad) camposFaltantes.push("edad");
  if (!perfil.peso) camposFaltantes.push("peso");
  if (!perfil.estatura) camposFaltantes.push("estatura");
  if (!perfil.disciplinaPrincipal) {
    camposFaltantes.push("disciplina principal");
  }
  if (!perfil.nivel) camposFaltantes.push("nivel");
  if (!perfilTieneDisponibilidad(perfil.disponibilidad)) {
    camposFaltantes.push("disponibilidad semanal");
  }

  if (camposFaltantes.length > 0) {
    return `Perfil incompleto. Faltan: ${camposFaltantes.join(", ")}.`;
  }

  const objetivoActivo = await Objetivo.findOne({
    atletaId,
    estado: "Activo",
  });

  if (!objetivoActivo) {
    return "No hay objetivo activo. Completa el onboarding antes de generar la semana.";
  }

  return null;
};

const generarSemanaDesdeMotor = async (req, res) => {
  try {
    const atletaId = req.usuario.atletaId;
    const errorValidacion = await validarPerfilYObjetivo(atletaId);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion,
      });
    }

    const semana = await generarSemanaMotor(atletaId);
    const perfilDinamico = await generarPerfilDinamicoV2(atletaId);

    const historial = await guardarHistorialSemanal({
      atletaId,
      fechaInicioSemana: new Date(),
      objetivoPrincipal: semana.objetivoPrincipal,
      semanaGenerada: semana,
      adaptacion: null,
      fatiga: null,
      cumplimiento: null,
      perfilDinamico,
      mensajeEntrenador: semana.mensaje,
    });

    res.json({
      semana,
      historial,
    });
  } catch (error) {
    console.error("Error generando semana desde motor:", error);

    res.status(500).json({
      mensaje: "Error generando semana desde motor",
      error: error.message,
    });
  }
};

module.exports = {
  generarSemanaDesdeMotor,
};
