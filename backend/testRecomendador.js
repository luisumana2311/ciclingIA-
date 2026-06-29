require("dotenv").config();

const conectarDB = require("./config/db");

const {
  analizarPatronesEntrenador,
} = require("./services/analizadorPatronesEntrenadorService");

const {
  recomendarCategoriaPorPatron,
} = require("./services/recomendadorEntrenamientoService");

const ejecutar = async () => {
  try {
    await conectarDB();

    const atletaId = "6a1e65b3a6869210fb67c03f";

    const analisis = await analizarPatronesEntrenador(atletaId);

    console.log("Resumen patrones:");
    console.log(analisis.resumenPatrones);

    console.log("Recomendación después de Fondo Largo:");
    console.log(
      recomendarCategoriaPorPatron({
        ultimaSesion: "Fondo Largo",
        resumenPatrones: analisis.resumenPatrones,
      }),
    );

    process.exit(0);
  } catch (error) {
    console.error("Error en test:", error.message);
    process.exit(1);
  }
};

ejecutar();
