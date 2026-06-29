import axios from "axios";

const API_URL = "http://localhost:4000/api/motor";

export const generarSemanaMotor = async (token) => {
  const respuesta = await axios.post(
    `${API_URL}/generar-semana`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return respuesta.data;
};
