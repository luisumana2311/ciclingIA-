const crearZona = (nombre, desde, hasta, unidad) => ({
  nombre,
  desde,
  hasta,
  unidad,
});

const calcularZonasFTP = (ftp) => {
  const ftpNumerico = Number(ftp);

  if (!ftpNumerico || ftpNumerico <= 0) {
    return {
      fuente: null,
      zonas: [],
    };
  }

  return {
    fuente: "FTP",
    zonas: [
      crearZona("Z1 Recuperacion", 0, Math.round(ftpNumerico * 0.55), "W"),
      crearZona(
        "Z2 Resistencia",
        Math.round(ftpNumerico * 0.55) + 1,
        Math.round(ftpNumerico * 0.75),
        "W",
      ),
      crearZona(
        "Z3 Tempo",
        Math.round(ftpNumerico * 0.75) + 1,
        Math.round(ftpNumerico * 0.9),
        "W",
      ),
      crearZona(
        "Z4 Umbral",
        Math.round(ftpNumerico * 0.9) + 1,
        Math.round(ftpNumerico * 1.05),
        "W",
      ),
      crearZona(
        "Z5 VO2",
        Math.round(ftpNumerico * 1.05) + 1,
        Math.round(ftpNumerico * 1.2),
        "W",
      ),
      crearZona(
        "Z6 Anaerobica",
        Math.round(ftpNumerico * 1.2) + 1,
        Math.round(ftpNumerico * 1.5),
        "W",
      ),
      crearZona(
        "Z7 Neuromuscular",
        Math.round(ftpNumerico * 1.5) + 1,
        null,
        "W",
      ),
    ],
  };
};

const calcularZonasFCMaxima = (frecuenciaCardiacaMaxima) => {
  const fcMaxima = Number(frecuenciaCardiacaMaxima);

  if (!fcMaxima || fcMaxima <= 0) {
    return {
      fuente: null,
      metodo: null,
      zonas: [],
    };
  }

  return {
    fuente: "FC_MAX",
    metodo: "Porcentaje FC maxima",
    zonas: [
      crearZona(
        "Z1 Recuperacion",
        Math.round(fcMaxima * 0.5),
        Math.round(fcMaxima * 0.6),
        "ppm",
      ),
      crearZona(
        "Z2 Aerobica",
        Math.round(fcMaxima * 0.6) + 1,
        Math.round(fcMaxima * 0.7),
        "ppm",
      ),
      crearZona(
        "Z3 Tempo",
        Math.round(fcMaxima * 0.7) + 1,
        Math.round(fcMaxima * 0.8),
        "ppm",
      ),
      crearZona(
        "Z4 Umbral",
        Math.round(fcMaxima * 0.8) + 1,
        Math.round(fcMaxima * 0.9),
        "ppm",
      ),
      crearZona(
        "Z5 Maxima",
        Math.round(fcMaxima * 0.9) + 1,
        Math.round(fcMaxima),
        "ppm",
      ),
    ],
  };
};

const calcularZonasEntrenamiento = (perfil = {}) => {
  const zonasFTP = calcularZonasFTP(perfil.ftp);
  const zonasFrecuenciaCardiaca = calcularZonasFCMaxima(
    perfil.frecuenciaCardiacaMaxima,
  );
  const tieneZonas =
    zonasFTP.zonas.length > 0 || zonasFrecuenciaCardiaca.zonas.length > 0;

  return {
    ftp: zonasFTP,
    frecuenciaCardiaca: zonasFrecuenciaCardiaca,
    actualizadoEn: tieneZonas ? new Date() : null,
  };
};

module.exports = {
  calcularZonasFTP,
  calcularZonasFCMaxima,
  calcularZonasEntrenamiento,
};
