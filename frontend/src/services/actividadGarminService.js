import axios from "axios";

const API_URL = "http://localhost:4000/api/actividades-garmin";

export const obtenerActividadesGarmin = async (atletaId) => {
  const respuesta = await axios.get(`${API_URL}/atleta/${atletaId}`);

  return respuesta.data;
};
