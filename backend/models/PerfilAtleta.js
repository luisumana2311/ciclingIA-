const mongoose = require("mongoose");

const perfilAtletaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },

    edad: {
      type: Number,
    },

    peso: {
      type: Number,
    },

    estatura: {
      type: Number,
    },

    ftp: {
      type: Number,
      default: null,
    },

    frecuenciaCardiacaMaxima: {
      type: Number,
      default: null,
    },

    frecuenciaCardiacaReposo: {
      type: Number,
      default: null,
    },

    zonasEntrenamiento: {
      ftp: {
        fuente: {
          type: String,
          default: null,
        },
        zonas: [
          {
            nombre: {
              type: String,
              default: "",
            },
            desde: {
              type: Number,
              default: null,
            },
            hasta: {
              type: Number,
              default: null,
            },
            unidad: {
              type: String,
              default: "W",
            },
          },
        ],
      },

      frecuenciaCardiaca: {
        fuente: {
          type: String,
          default: null,
        },
        metodo: {
          type: String,
          default: null,
        },
        zonas: [
          {
            nombre: {
              type: String,
              default: "",
            },
            desde: {
              type: Number,
              default: null,
            },
            hasta: {
              type: Number,
              default: null,
            },
            unidad: {
              type: String,
              default: "ppm",
            },
          },
        ],
      },

      actualizadoEn: {
        type: Date,
        default: null,
      },
    },

    disciplinaPrincipal: {
      type: String,
      default: "",
    },

    nivel: {
      type: String,
      default: "",
    },

    disponibilidad: {
      lunes: {
        type: Number,
        default: 0,
      },

      martes: {
        type: Number,
        default: 0,
      },

      miercoles: {
        type: Number,
        default: 0,
      },

      jueves: {
        type: Number,
        default: 0,
      },

      viernes: {
        type: Number,
        default: 0,
      },

      sabado: {
        type: Number,
        default: 0,
      },

      domingo: {
        type: Number,
        default: 0,
      },
    },

    fatiga: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    motivacion: {
      type: Number,
      default: 5,
      min: 0,
      max: 10,
    },

    sueno: {
      type: Number,
      default: 5,
      min: 0,
      max: 10,
    },

    estres: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    estadoActual: {
      type: String,
      default: "Normal",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("PerfilAtleta", perfilAtletaSchema);
