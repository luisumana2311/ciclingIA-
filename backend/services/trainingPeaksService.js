const axios = require("axios");

const obtenerWorkoutsTrainingPeaks = async (fechaInicio, fechaFin) => {
  const athleteId = process.env.TRAININGPEAKS_ATHLETE_ID;
  const token = process.env.TRAININGPEAKS_TOKEN;

  if (!athleteId) {
    throw new Error("Falta TRAININGPEAKS_ATHLETE_ID en el archivo .env");
  }

  if (!token) {
    throw new Error("Falta TRAININGPEAKS_TOKEN en el archivo .env");
  }

  const url = `https://tpapi.trainingpeaks.com/fitness/v7/athletes/${athleteId}/workouts/${fechaInicio}/${fechaFin}`;

  const respuesta = await axios.get(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      Origin: "https://app.trainingpeaks.com",
      Referer: "https://app.trainingpeaks.com/",
    },
  });

  return respuesta.data;
};

module.exports = {
  obtenerWorkoutsTrainingPeaks,
};
