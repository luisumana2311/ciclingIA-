require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const conectarDB = require("./config/db");
const perfilRoutes = require("./routes/perfilRoutes");
const objetivoRoutes = require("./routes/objetivoRoutes");
const semanaRoutes = require("./routes/semanaRoutes");
const registroDiarioRoutes = require("./routes/registroDiarioRoutes");
const historialSemanalRoutes = require("./routes/historialSemanalRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const evolucionRoutes = require("./routes/evolucionRoutes");
const actividadGarminRoutes = require("./routes/actividadGarminRoutes");
const bibliotecaEntrenamientosRoutes = require("./routes/bibliotecaEntrenamientosRoutes");
const motorEntrenadorRoutes = require("./routes/motorEntrenadorRoutes");
const authRoutes = require("./routes/authRoutes");
dotenv.config();

conectarDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/perfiles", perfilRoutes);
app.use("/api/objetivos", objetivoRoutes);
app.use("/api/semanas", semanaRoutes);
app.use("/api/registros-diarios", registroDiarioRoutes);
app.use("/api/historial", historialSemanalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/evolucion", evolucionRoutes);
app.use("/api/actividades-garmin", actividadGarminRoutes);
app.use("/api/biblioteca", bibliotecaEntrenamientosRoutes);
app.use("/api/motor", motorEntrenadorRoutes);
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("Entrenador Digital para Ciclistas funcionando");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
