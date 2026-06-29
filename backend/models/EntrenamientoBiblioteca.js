const mongoose = require("mongoose");

const entrenamientoBibliotecaSchema = new mongoose.Schema(
  {
    atletaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PerfilAtleta",
      required: true,
    },

    origen: {
      type: String,
      default: "TrainingPeaks",
    },

    workoutId: {
      type: Number,
      required: true,
      unique: true,
    },

    athleteIdTrainingPeaks: {
      type: Number,
      required: true,
    },

    nombre: {
      type: String,
      required: true,
    },

    descripcion: {
      type: String,
      default: "",
    },

    comentariosCoach: {
      type: String,
      default: "",
    },

    fecha: {
      type: Date,
    },

    tipo: {
      type: String,
      default: "Ciclismo",
    },

    duracionPlanificadaMin: {
      type: Number,
      default: 0,
    },

    tssPlanificado: {
      type: Number,
      default: 0,
    },

    ifPlanificado: {
      type: Number,
      default: 0,
    },

    objetivoFisiologico: {
      type: String,
      default: "Sin clasificar",
    },
    confianza: {
      type: String,
      default: "Nula",
    },
    dificultad: {
      type: Number,
      default: 0,
    },

    etiquetas: {
      type: [String],
      default: [],
    },

    estructura: {
      type: Object,
      default: {},
    },

    datosOriginales: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "EntrenamientoBiblioteca",
  entrenamientoBibliotecaSchema,
);
