import axios from "axios";

const API_URL = "http://localhost:4000/api/registros-diarios";

export const crearRegistroDiario = async (registro) => {
  const respuesta = await axios.post(API_URL, registro);
  return respuesta.data;
};

export const obtenerRegistrosPorAtleta = async (atletaId) => {
  const respuesta = await axios.get(`${API_URL}/atleta/${atletaId}`);
  return respuesta.data;
};
