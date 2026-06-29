const tieneDisponibilidad = (disponibilidad = {}) => {
  return Object.values(disponibilidad).some((horas) => Number(horas) > 0);
};

export const perfilEstaCompleto = (perfil) => {
  if (!perfil) return false;

  return Boolean(
    perfil.edad &&
      perfil.peso &&
      perfil.estatura &&
      perfil.disciplinaPrincipal &&
      perfil.nivel &&
      tieneDisponibilidad(perfil.disponibilidad),
  );
};

export const objetivoActivoExiste = (objetivo) => {
  if (!objetivo) return false;

  return Boolean(
    objetivo.nombre &&
      objetivo.disciplina &&
      objetivo.fechaObjetivo &&
      (!objetivo.estado || objetivo.estado === "Activo"),
  );
};

export const onboardingEstaCompleto = (perfil, objetivo) => {
  return perfilEstaCompleto(perfil) && objetivoActivoExiste(objetivo);
};
