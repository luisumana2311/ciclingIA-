import axios from "axios";

const API_URL = "http://localhost:4000/api/auth";

export const loginUsuario = async ({ email, password }) => {
  const respuesta = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });

  return respuesta.data;
};

export const registrarUsuario = async ({ nombre, email, password }) => {
  const respuesta = await axios.post(`${API_URL}/registro`, {
    nombre,
    email,
    password,
  });

  return respuesta.data;
};
