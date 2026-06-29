const API_URL = "http://localhost:4000/api/historial";

export const obtenerHistorialPorAtleta = async (atletaId) => {
  const respuesta = await fetch(`${API_URL}/${atletaId}`);

  if (!respuesta.ok) {
    throw new Error("Error al obtener historial del atleta");
  }

  return await respuesta.json();
};
