import axios from "axios";

const API_URL = "http://localhost:4000/api/dashboard";

export const obtenerDashboard = async (atletaId) => {
  const respuesta = await axios.get(`${API_URL}/${atletaId}`);
  return respuesta.data;
};
