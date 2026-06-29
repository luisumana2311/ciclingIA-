const mongoose = require("mongoose");

const actividadGarminSchema = new mongoose.Schema(
  {
    atletaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PerfilAtleta",
      required: true,
    },

    fuente: {
      type: String,
      default: "Garmin",
    },

    nombre: {
      type: String,
      default: "",
    },

    fecha: {
      type: Date,
      required: true,
    },

    tipo: {
      type: String,
      default: "Ciclismo",
    },

    distanciaKm: {
      type: Number,
      default: 0,
    },

    duracionMin: {
      type: Number,
      default: 0,
    },

    desnivelM: {
      type: Number,
      default: 0,
    },

    potenciaPromedio: {
      type: Number,
      default: 0,
    },

    potenciaMaxima: {
      type: Number,
      default: 0,
    },

    frecuenciaPromedio: {
      type: Number,
      default: 0,
    },

    frecuenciaMaxima: {
      type: Number,
      default: 0,
    },

    cadenciaPromedio: {
      type: Number,
      default: 0,
    },

    cargaEstimacion: {
      type: Number,
      default: 0,
    },

    clasificacion: {
      type: String,
      default: "Sin clasificar",
    },
    objetivoFisiologico: {
      type: String,
      default: "",
    },

    dificultad: {
      type: Number,
      default: 0,
    },
    archivoOriginal: {
      type: String,
      default: "",
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

module.exports = mongoose.model("ActividadGarmin", actividadGarminSchema);
