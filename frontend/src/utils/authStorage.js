export const obtenerUsuarioActual = () => {
  const usuarioGuardado = localStorage.getItem("usuario");

  if (!usuarioGuardado) {
    return null;
  }

  try {
    return JSON.parse(usuarioGuardado);
  } catch {
    return null;
  }
};

export const obtenerAtletaIdActual = () => {
  return obtenerUsuarioActual()?.atletaId || null;
};
