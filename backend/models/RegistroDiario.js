const mongoose = require("mongoose");

const registroDiarioSchema = new mongoose.Schema(
  {
    atletaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PerfilAtleta",
      required: true,
    },

    fecha: {
      type: Date,
      default: Date.now,
    },

    sueno: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },

    energia: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },

    estres: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },

    dolorMuscular: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },

    entrenoRealizado: {
      type: Boolean,
      default: false,
    },

    historialSemanalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HistorialSemanal",
      default: null,
    },

    sesionPlanificadaIndex: {
      type: Number,
      default: null,
    },

    sesionPlanificadaSnapshot: {
      type: Object,
      default: null,
    },

    sesionPlanificadaDia: {
      type: String,
      default: "",
    },

    sesionPlanificadaCategoria: {
      type: String,
      default: "",
    },

    sesionPlanificadaNombre: {
      type: String,
      default: "",
    },

    duracionPlanificada: {
      type: Number,
      default: 0,
    },

    entrenamientoRealizado: {
      type: String,
      default: "",
    },

    duracionRealizada: {
      type: Number,
      default: 0,
    },

    estadoSesion: {
      type: String,
      enum: ["completada", "parcial", "no_realizada"],
      default: "no_realizada",
    },

    sensacion: {
      type: Number,
      min: 0,
      max: 10,
      default: 5,
    },

    fatigaPercibida: {
      type: Number,
      min: 0,
      max: 10,
      default: 5,
    },

    cumplimientoSesion: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    comentario: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("RegistroDiario", registroDiarioSchema);
