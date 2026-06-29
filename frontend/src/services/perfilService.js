import axios from "axios";

const API_URL = "http://localhost:4000/api/perfiles";

export const obtenerPerfil = async (perfilId) => {
  const respuesta = await axios.get(`${API_URL}/${perfilId}`);
  return respuesta.data;
};

export const actualizarPerfil = async (perfilId, datos) => {
  const respuesta = await axios.patch(`${API_URL}/${perfilId}`, datos);
  return respuesta.data;
};
