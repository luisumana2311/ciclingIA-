import { useNavigate } from "react-router-dom";

const diasTimeline = [
  { clave: "lunes", etiqueta: "Lun" },
  { clave: "martes", etiqueta: "Mar" },
  { clave: "miercoles", etiqueta: "Mie" },
  { clave: "jueves", etiqueta: "Jue" },
  { clave: "viernes", etiqueta: "Vie" },
  { clave: "sabado", etiqueta: "Sab" },
  { clave: "domingo", etiqueta: "Dom" },
];

const estilosCategoria = {
  recuperacion: {
    chip: "border-emerald-500/20 bg-emerald-500/5 text-emerald-300/80",
    timeline: "border-emerald-500/20 bg-emerald-500/5 text-emerald-200/80",
    borde: "border-emerald-500/20 hover:border-emerald-400/40",
  },
  resistencia: {
    chip: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    timeline: "border-sky-500/30 bg-sky-500/10 text-sky-200",
    borde: "border-sky-500/30 hover:border-sky-400/60",
  },
  tempo: {
    chip: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    timeline: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
    borde: "border-yellow-500/30 hover:border-yellow-400/60",
  },
  umbral: {
    chip: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    timeline: "border-orange-500/30 bg-orange-500/10 text-orange-200",
    borde: "border-orange-500/30 hover:border-orange-400/60",
  },
  vo2: {
    chip: "border-red-500/30 bg-red-500/10 text-red-300",
    timeline: "border-red-500/30 bg-red-500/10 text-red-200",
    borde: "border-red-500/30 hover:border-red-400/60",
  },
  fondo: {
    chip: "border-purple-500/30 bg-purple-500/10 text-purple-300",
    timeline: "border-purple-500/30 bg-purple-500/10 text-purple-200",
    borde: "border-purple-500/30 hover:border-purple-400/60",
  },
  fuerza: {
    chip: "border-violet-500/30 bg-violet-500/10 text-violet-300",
    timeline: "border-violet-500/30 bg-violet-500/10 text-violet-200",
    borde: "border-violet-500/30 hover:border-violet-400/60",
  },
  descanso: {
    chip: "border-slate-700 bg-slate-900 text-slate-400",
    timeline: "border-slate-800 bg-slate-950 text-slate-500",
    borde: "border-slate-800 hover:border-slate-700",
  },
};

const normalizarTexto = (texto = "") => {
  return texto
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const obtenerIndiceDia = (dia = "") => {
  const diaNormalizado = normalizarTexto(dia);
  const indice = diasTimeline.findIndex((item) => item.clave === diaNormalizado);

  return indice === -1 ? diasTimeline.length : indice;
};

const obtenerDiaActual = () => {
  const indiceDia = new Date().getDay();
  const claves = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];

  return claves[indiceDia];
};

const ordenarSesionesPorDia = (sesiones = []) => {
  return [...sesiones].sort((a, b) => {
    return obtenerIndiceDia(a?.dia) - obtenerIndiceDia(b?.dia);
  });
};

const obtenerCategoria = (sesion = {}) => {
  return sesion.categoria || sesion.tipo || "Sesion";
};

const obtenerClaveCategoria = (categoria = "") => {
  const normalizada = normalizarTexto(categoria);

  if (normalizada.includes("recuperacion")) return "recuperacion";
  if (normalizada.includes("resistencia")) return "resistencia";
  if (normalizada.includes("tempo")) return "tempo";
  if (normalizada.includes("umbral")) return "umbral";
  if (normalizada.includes("vo2")) return "vo2";
  if (normalizada.includes("fondo")) return "fondo";
  if (normalizada.includes("fuerza")) return "fuerza";

  return "descanso";
};

const obtenerEstilosCategoria = (categoria) => {
  return estilosCategoria[obtenerClaveCategoria(categoria)] || estilosCategoria.descanso;
};

const obtenerEtiquetaCortaCategoria = (categoria) => {
  const clave = obtenerClaveCategoria(categoria);
  const etiquetas = {
    recuperacion: "Rec",
    resistencia: "RA",
    tempo: "Tempo",
    umbral: "Umb",
    vo2: "VO2",
    fondo: "Fondo",
    fuerza: "Fuerza",
    descanso: "Descanso",
  };

  return etiquetas[clave] || "Sesion";
};

const obtenerEntrenamiento = (sesion = {}) => {
  return (
    sesion.entrenamientoSeleccionado?.nombre ||
    sesion.entrenamientoSeleccionado?.titulo ||
    sesion.entrenamiento?.nombre ||
    sesion.entrenamiento?.titulo ||
    sesion.nombreEntrenamiento ||
    sesion.nombre ||
    null
  );
};

const obtenerObjetivoFisiologico = (sesion = {}) => {
  return (
    sesion.objetivoFisiologico ||
    sesion.entrenamientoSeleccionado?.objetivoFisiologico ||
    sesion.entrenamiento?.objetivoFisiologico ||
    null
  );
};

const obtenerBloques = (sesion = {}) => {
  const bloques = sesion.entrenamientoSeleccionado?.estructura?.bloques;

  return Array.isArray(bloques) ? bloques : [];
};

const formatearZonaSugerida = (zona) => {
  if (!zona) return null;

  if (zona.metodo === "RPE") {
    return `RPE ${zona.rpe || "-"}`;
  }

  const codigo = zona.codigo || zona.zona || "Zona";
  const desde = zona.desde ?? "-";
  const hasta = zona.hasta ?? "+";
  const unidad = zona.unidad || "";

  return `${codigo} - ${desde}-${hasta} ${unidad}`.trim();
};

const obtenerZonaPrincipal = (sesion = {}) => {
  const bloques = obtenerBloques(sesion);
  const bloquePrincipal =
    bloques.find((bloque) => bloque.tipo === "principal" && bloque.zonaSugerida) ||
    bloques.find((bloque) => bloque.zonaSugerida);

  return formatearZonaSugerida(bloquePrincipal?.zonaSugerida);
};

function SesionesCard({ sesiones = [] }) {
  const navigate = useNavigate();
  const sesionesOrdenadas = ordenarSesionesPorDia(sesiones);

  const abrirSesion = (sesion, index) => {
    sessionStorage.setItem("sesionSeleccionada", JSON.stringify(sesion));
    navigate(`/sesion/${index}`);
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-slate-950/20">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
            Plan semanal
          </p>
          <h2 className="mt-1 text-2xl font-bold">Sesiones de la semana</h2>
        </div>

        <span className="rounded-full bg-slate-950 px-3 py-1 text-sm text-slate-400">
          {sesiones.length} sesiones
        </span>
      </div>

      <TimelineSemanal sesiones={sesionesOrdenadas} />

      {sesionesOrdenadas.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 text-sm text-slate-400">
          No hay sesiones cargadas para esta semana.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sesionesOrdenadas.map((sesion, index) => {
            const entrenamiento = obtenerEntrenamiento(sesion);
            const objetivoFisiologico = obtenerObjetivoFisiologico(sesion);
            const zonaPrincipal = obtenerZonaPrincipal(sesion);
            const categoria = obtenerCategoria(sesion);
            const estilos = obtenerEstilosCategoria(categoria);
            const claveCategoria = obtenerClaveCategoria(categoria);
            const esFondoLargo = claveCategoria === "fondo";
            const esRecuperacion = claveCategoria === "recuperacion";

            return (
              <article
                key={`${sesion.dia || "dia"}-${index}`}
                onClick={() => abrirSesion(sesion, index)}
                className={`cursor-pointer rounded-2xl border bg-slate-950 p-4 transition ${estilos.borde} ${
                  esFondoLargo ? "shadow-lg shadow-purple-950/20" : ""
                } ${esRecuperacion ? "opacity-90" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {sesion.dia || "Sin dia"}
                    </p>
                    <h3 className="mt-1 text-lg font-bold">{categoria}</h3>
                    <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${estilos.chip}`}>
                      {obtenerEtiquetaCortaCategoria(categoria)}
                    </span>
                    {esFondoLargo && (
                      <span className="ml-2 mt-2 inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-200">
                        Sesion clave
                      </span>
                    )}
                  </div>

                  <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${estilos.chip}`}>
                    {sesion.duracion ?? 0} min
                  </span>
                </div>

                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-3">
                  <p className="text-xs text-slate-500">Entrenamiento</p>
                  <p className="mt-1 text-sm font-semibold text-slate-200">
                    {entrenamiento || "Sin entrenamiento asignado"}
                  </p>
                </div>

                {(objetivoFisiologico || zonaPrincipal) && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {objetivoFisiologico && (
                      <span className="rounded-full border border-slate-800 bg-slate-900/80 px-2.5 py-1 font-medium text-slate-300">
                        {objetivoFisiologico}
                      </span>
                    )}

                    {zonaPrincipal && (
                      <span className={`rounded-full border px-2.5 py-1 font-semibold ${estilos.chip}`}>
                        {zonaPrincipal}
                      </span>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    abrirSesion(sesion, index);
                  }}
                  className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-orange-500/50 hover:text-white"
                >
                  <span>Abrir entrenamiento</span>
                  <span>&gt;</span>
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function TimelineSemanal({ sesiones = [] }) {
  const diaActual = obtenerDiaActual();
  const obtenerSesionPorDia = (dia) => {
    return sesiones.find((sesion) => normalizarTexto(sesion.dia) === dia);
  };

  return (
    <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-950 p-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {diasTimeline.map((dia) => {
          const sesion = obtenerSesionPorDia(dia.clave);
          const categoria = sesion ? obtenerCategoria(sesion) : "Descanso";
          const estilos = obtenerEstilosCategoria(categoria);
          const esHoy = dia.clave === diaActual;

          return (
            <div
              key={dia.clave}
              className={`rounded-xl border px-3 py-3 text-center ${estilos.timeline} ${
                esHoy ? "ring-2 ring-orange-400/70 ring-offset-2 ring-offset-slate-950" : ""
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                  {dia.etiqueta}
                </p>
                {esHoy && (
                  <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    Hoy
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-bold">
                {sesion ? obtenerEtiquetaCortaCategoria(categoria) : "Descanso"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SesionesCard;
