import axios from "axios";

const API_URL = "http://localhost:4000/api/objetivos";

export const obtenerObjetivoActivo = async (atletaId) => {
  const respuesta = await axios.get(`${API_URL}/atleta/${atletaId}/activo`);
  return respuesta.data;
};

export const guardarObjetivoPrincipal = async (atletaId, datos) => {
  const respuesta = await axios.post(
    `${API_URL}/atleta/${atletaId}/principal`,
    datos,
  );

  return respuesta.data;
};
