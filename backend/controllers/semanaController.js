const { generarSemanaMotor } = require("../services/motorEntrenadorService");

const {
  guardarHistorialSemanal,
} = require("../services/historialSemanalService");

const {
  generarPerfilDinamicoV2,
} = require("../services/perfilDinamicoV2Service");

const generarSemanaPrueba = async (req, res) => {
  try {
    const atletaId = req.params.id;

    const semanaMotor = await generarSemanaMotor(atletaId);

    const perfilDinamicoV2 = await generarPerfilDinamicoV2(atletaId);

    const historial = await guardarHistorialSemanal({
      atletaId,
      fechaInicioSemana: new Date(),
      objetivoPrincipal: semanaMotor.objetivoPrincipal,
      semanaGenerada: semanaMotor,
      adaptacion: null,
      fatiga: null,
      cumplimiento: null,
      perfilDinamico: perfilDinamicoV2,
      mensajeEntrenador: null,
    });

    res.json({
      objetivoPrincipal: semanaMotor.objetivoPrincipal,
      semana: semanaMotor,
      perfilDinamicoV2,
      historial,
    });
  } catch (error) {
    console.error("Error generando semana desde semanaController:", error);

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

module.exports = {
  generarSemanaPrueba,
};
