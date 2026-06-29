import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerDashboard } from "../services/dashboardService";
import { generarSemanaMotor } from "../services/motorService";
import { obtenerPerfil } from "../services/perfilService";
import { obtenerObjetivoActivo } from "../services/objetivoService";
import { obtenerAtletaIdActual } from "../utils/authStorage";
import { onboardingEstaCompleto } from "../utils/onboarding";
import MetricCard from "../components/MetricCard";
import SesionesCard from "../components/SesionesCard";
import RecomendacionCard from "../components/RecomendacionCard";
import EstadoGeneralCard from "../components/EstadoGeneralCard";
import RecuperacionCard from "../components/RecuperacionCard";

const diasSemana = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
];

const normalizarTexto = (texto = "") => {
  return texto
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const obtenerSesionDeHoy = (sesiones = []) => {
  const diaActual = diasSemana[new Date().getDay()];

  return (
    sesiones.find((sesion) => normalizarTexto(sesion.dia) === diaActual) ||
    null
  );
};

const obtenerNombreEntrenamiento = (sesion = {}) => {
  return (
    sesion.entrenamientoSeleccionado?.nombre ||
    sesion.entrenamientoSeleccionado?.titulo ||
    sesion.entrenamiento?.nombre ||
    sesion.entrenamiento?.titulo ||
    sesion.nombreEntrenamiento ||
    sesion.nombre ||
    "Sin entrenamiento asignado"
  );
};

const obtenerTSS = (sesion = {}) => {
  return (
    sesion.tss ??
    sesion.TSS ??
    sesion.entrenamientoSeleccionado?.tss ??
    sesion.entrenamientoSeleccionado?.tssPlanificado ??
    sesion.entrenamiento?.tss ??
    null
  );
};

const obtenerIF = (sesion = {}) => {
  return (
    sesion.if ??
    sesion.IF ??
    sesion.intensityFactor ??
    sesion.entrenamientoSeleccionado?.if ??
    sesion.entrenamientoSeleccionado?.ifPlanificado ??
    sesion.entrenamiento?.if ??
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

const obtenerNutricionSugerida = (sesion = {}) => {
  return (
    sesion.nutricionSugerida ||
    sesion.entrenamientoSeleccionado?.nutricionSugerida ||
    sesion.entrenamiento?.nutricionSugerida ||
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

  return `${codigo} · ${desde}-${hasta} ${unidad}`.trim();
};

const obtenerZonaPrincipal = (sesion = {}) => {
  const bloques = obtenerBloques(sesion);
  const bloquePrincipal =
    bloques.find((bloque) => bloque.tipo === "principal" && bloque.zonaSugerida) ||
    bloques.find((bloque) => bloque.zonaSugerida);

  return formatearZonaSugerida(bloquePrincipal?.zonaSugerida);
};

const obtenerValorSemana = (...valores) => {
  return valores.find((valor) => valor !== undefined && valor !== null);
};

const esFaseReal = (fase) => {
  if (!fase) return false;

  const texto = fase.toString().trim();

  return texto !== "" && texto !== "Sin dato" && texto !== "Semana generada";
};

const obtenerFaseReal = (...valores) => {
  return valores.find(esFaseReal) || null;
};

const obtenerTextoFaseHeader = (faseReal) => {
  if (!faseReal) return "Semana generada";

  return faseReal.toString().startsWith("Fase ")
    ? faseReal
    : `Fase ${faseReal}`;
};

const obtenerTextoPreparacion = (faseReal) => {
  if (!faseReal) return "Semana generada";

  return faseReal.toString().replace(/^Fase\s+/i, "");
};

const obtenerEstadoUtilizacion = (utilizacion) => {
  const valor = Number(utilizacion) || 0;

  if (valor >= 90) {
    return {
      colorMetrica: "green",
      tarjeta:
        "border-emerald-500/30 bg-emerald-500/5 text-emerald-100",
      valor: "text-emerald-300",
    };
  }

  if (valor >= 70) {
    return {
      colorMetrica: "orange",
      tarjeta: "border-yellow-500/30 bg-yellow-500/5 text-yellow-100",
      valor: "text-yellow-300",
    };
  }

  return {
    colorMetrica: "red",
    tarjeta: "border-red-500/30 bg-red-500/5 text-red-100",
    valor: "text-red-300",
  };
};

function DashboardPage() {
  const navigate = useNavigate();
  const atletaId = obtenerAtletaIdActual();
  const [dashboard, setDashboard] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [generandoSemana, setGenerandoSemana] = useState(false);
  const [mensajeGeneracion, setMensajeGeneracion] = useState("");
  const [errorGeneracion, setErrorGeneracion] = useState("");
  const [sinHistorial, setSinHistorial] = useState(false);
  const [errorDashboard, setErrorDashboard] = useState("");
  const [mostrarOnboarding, setMostrarOnboarding] = useState(false);

  const cargarDashboard = async () => {
    if (!atletaId) {
      setCargando(false);
      return;
    }

    try {
      const perfil = await obtenerPerfil(atletaId);
      let objetivo = null;

      try {
        objetivo = await obtenerObjetivoActivo(atletaId);
      } catch (errorObjetivo) {
        if (errorObjetivo.response?.status !== 404) {
          throw errorObjetivo;
        }
      }

      if (!onboardingEstaCompleto(perfil, objetivo)) {
        navigate("/onboarding");
        return;
      }

      const datos = await obtenerDashboard(atletaId);
      setDashboard(datos);
      setSinHistorial(false);
      setErrorDashboard("");
    } catch (error) {
      console.error("Error cargando dashboard:", error);
      setDashboard(null);

      if (error.response?.status === 404) {
        setSinHistorial(true);
        setErrorDashboard("");
      } else {
        setSinHistorial(false);
        setErrorDashboard("No se pudo cargar el dashboard.");
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
  }, [atletaId]);

  const manejarGenerarSemana = async () => {
    const token = localStorage.getItem("token");

    setMensajeGeneracion("");
    setErrorGeneracion("");
    setMostrarOnboarding(false);

    if (!token) {
      setErrorGeneracion("Debe iniciar sesion para generar la semana");
      return;
    }

    try {
      setGenerandoSemana(true);
      const resultado = await generarSemanaMotor(token);
      setMensajeGeneracion(
        resultado?.semana?.mensaje || "Semana generada correctamente.",
      );
      await cargarDashboard();
    } catch (error) {
      console.error("Error generando semana:", error);
      setErrorGeneracion(
        error.response?.data?.mensaje || "Error al generar la semana",
      );
      setMostrarOnboarding(error.response?.status === 400);
    } finally {
      setGenerandoSemana(false);
    }
  };

  if (cargando) {
    return <p className="p-6 text-white">Cargando dashboard...</p>;
  }

  if (!atletaId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <section className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold">Debe iniciar sesion</h1>
          <p className="mt-3 text-sm text-slate-400">
            Ingresa para ver y generar tu semana de entrenamiento.
          </p>
          <a
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Ir a Login
          </a>
        </section>
      </main>
    );
  }

  if (sinHistorial) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <section className="max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl shadow-orange-950/20">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange-400">
            Nueva planificacion
          </p>
          <h1 className="text-3xl font-bold">
            Todavia no hay una semana generada
          </h1>
          <p className="mt-3 text-slate-400">
            Presiona Generar semana para crear tu primera planificacion.
          </p>

          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={manejarGenerarSemana}
              disabled={generandoSemana}
              className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
            >
              {generandoSemana ? "Generando..." : "Generar semana"}
            </button>

            {mensajeGeneracion && (
              <p className="text-sm text-green-400">{mensajeGeneracion}</p>
            )}

            {errorGeneracion && (
              <p className="text-sm text-red-400">{errorGeneracion}</p>
            )}

            {mostrarOnboarding && (
              <a
                href="/onboarding"
                className="rounded-xl border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-300 hover:bg-orange-500 hover:text-white"
              >
                Completar onboarding
              </a>
            )}
          </div>
        </section>
      </main>
    );
  }

  if (errorDashboard) {
    return <p className="p-6 text-red-400">{errorDashboard}</p>;
  }

  if (!dashboard) {
    return <p className="p-6 text-red-400">No se pudo cargar el dashboard.</p>;
  }

  const estadoGeneral = dashboard.estadoGeneral || {};
  const resumenRapido = dashboard.resumenRapido || {};
  const metricasObjetivo = dashboard.metricasObjetivo || {};
  const objetivoPrincipal = dashboard.objetivoPrincipal || {};
  const fatiga = dashboard.fatiga || {};
  const cumplimiento = dashboard.cumplimiento || {};
  const volumen = dashboard.volumen || {};
  const sesiones = Array.isArray(dashboard.sesiones) ? dashboard.sesiones : [];
  const progresoPreparacion = metricasObjetivo.progresoPreparacion ?? 0;
  const sesionHoy = obtenerSesionDeHoy(sesiones);
  const nutricionHoy = obtenerNutricionSugerida(sesionHoy || {});
  const objetivoFisiologicoHoy = obtenerObjetivoFisiologico(sesionHoy || {});
  const zonaPrincipalHoy = obtenerZonaPrincipal(sesionHoy || {});
  const resumenSemana = dashboard.resumen || dashboard.resumenSemana || {};
  const faseReal = obtenerFaseReal(
    dashboard.fasePreparacion,
    dashboard.fase,
    resumenSemana.fase,
  );
  const volumenGeneradoSemana = obtenerValorSemana(
    volumen.volumenGenerado,
    volumen.volumenGeneradoMin,
    dashboard.volumenGeneradoMin,
    resumenSemana.volumenGeneradoMin,
  );
  const volumenObjetivoSemana = obtenerValorSemana(
    volumen.volumenObjetivo,
    volumen.volumenObjetivoMin,
    dashboard.volumenObjetivoMin,
    resumenSemana.volumenObjetivoMin,
  );
  const utilizacionSemana = obtenerValorSemana(
    volumen.utilizacion,
    volumen.porcentajeUtilizacionReal,
    dashboard.porcentajeUtilizacionReal,
    resumenSemana.porcentajeUtilizacionReal,
  );
  const volumenDisponibleSemana = obtenerValorSemana(
    dashboard.volumenDisponibleMin,
    volumen.volumenDisponible,
    volumen.volumenDisponibleMin,
    resumenSemana.volumenDisponibleMin,
  );
  const horasDisponiblesSemana =
    volumenDisponibleSemana !== undefined && volumenDisponibleSemana !== null
      ? Math.round((Number(volumenDisponibleSemana) / 60) * 10) / 10
      : null;
  const textoFaseSemana = obtenerTextoFaseHeader(faseReal);
  const textoPreparacion = obtenerTextoPreparacion(faseReal);
  const estadoUtilizacion = obtenerEstadoUtilizacion(utilizacionSemana);

  const colorEstado =
    estadoGeneral.color === "verde"
      ? "bg-green-500"
      : estadoGeneral.color === "rojo"
        ? "bg-red-500"
        : "bg-orange-500";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-slate-950/30 lg:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                Objetivo principal
              </p>
              <h1 className="mt-2 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
                {objetivoPrincipal.nombre || "Sin objetivo activo"}
              </h1>

              <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-300">
                <InfoChip
                  label="Fase"
                  value={textoFaseSemana}
                />
                <InfoChip
                  label="Dias restantes"
                  value={`${metricasObjetivo.diasHastaObjetivo ?? "-"} dias`}
                />
                <InfoChip
                  label="Disciplina"
                  value={objetivoPrincipal.disciplina || "Sin disciplina"}
                />
                <InfoChip
                  label="Prioridad"
                  value={objetivoPrincipal.prioridad || "Sin prioridad"}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-400">
                {Number(objetivoPrincipal.distancia) > 0 && (
                  <InfoChip
                    label="Distancia"
                    value={`${objetivoPrincipal.distancia} km`}
                    muted
                  />
                )}
                {Number(objetivoPrincipal.desnivel) > 0 && (
                  <InfoChip
                    label="Desnivel"
                    value={`${objetivoPrincipal.desnivel} m`}
                    muted
                  />
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <button
                type="button"
                onClick={manejarGenerarSemana}
                disabled={generandoSemana}
                className="w-full rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
              >
                {generandoSemana ? "Generando..." : "Generar semana"}
              </button>

              {mensajeGeneracion && (
                <p className="mt-3 text-sm text-green-400">
                  {mensajeGeneracion}
                </p>
              )}

              {errorGeneracion && (
                <p className="mt-3 text-sm text-red-400">{errorGeneracion}</p>
              )}

              {mostrarOnboarding && (
                <a
                  href="/onboarding"
                  className="mt-3 inline-flex w-full justify-center rounded-xl border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-300 hover:bg-orange-500 hover:text-white"
                >
                  Completar onboarding
                </a>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            {progresoPreparacion === 0 ? (
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Preparacion inicial
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  El plan esta comenzando a construir tu base.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-2 flex justify-between text-sm text-slate-400">
                  <span>Progreso de preparacion</span>
                  <span>{progresoPreparacion}%</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{
                      width: `${progresoPreparacion}%`,
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-slate-950/20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                Semana actual
              </p>
              <h2 className="mt-2 text-2xl font-bold">{textoFaseSemana}</h2>
              <p className="mt-2 text-sm text-slate-400">
                Resumen del volumen planificado por el motor.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <DatoHoy titulo="Sesiones" valor={sesiones.length} />
              <DatoHoy
                titulo="Volumen"
                valor={`${volumenGeneradoSemana ?? 0} min`}
              />
              <DatoHoy
                titulo="Objetivo"
                valor={`${volumenObjetivoSemana ?? 0} min`}
              />
              <DatoHoy
                titulo="Utilizacion"
                valor={`${utilizacionSemana ?? 0}%`}
                className={estadoUtilizacion.tarjeta}
                valorClassName={estadoUtilizacion.valor}
              />
              {volumenDisponibleSemana !== undefined &&
                volumenDisponibleSemana !== null && (
                  <DatoHoy
                    titulo="Disponible"
                    valor={`${volumenDisponibleSemana} min`}
                  />
                )}
              {horasDisponiblesSemana !== null && (
                <DatoHoy
                  titulo="Horas/semana"
                  valor={`${horasDisponiblesSemana} h`}
                />
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-orange-500/20 bg-slate-900 p-5 shadow-lg shadow-slate-950/20">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                  Entrenamiento de hoy
                </p>
                {sesionHoy ? (
                  <>
                    <h2 className="mt-2 text-2xl font-bold">
                      {obtenerNombreEntrenamiento(sesionHoy)}
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      {sesionHoy.dia || "Hoy"} ·{" "}
                      {sesionHoy.categoria || sesionHoy.tipo || "Sesion"}
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="mt-2 text-2xl font-bold">
                      Hoy toca recuperacion o descanso
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      No hay una sesion planificada para el dia actual.
                    </p>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("sesiones-semana")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Ver entrenamiento
              </button>
            </div>

            {sesionHoy && (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <DatoHoy
                    titulo="Duracion"
                    valor={`${sesionHoy.duracion ?? 0} min`}
                  />
                  <DatoHoy
                    titulo="Categoria"
                    valor={sesionHoy.categoria || sesionHoy.tipo || "Sesion"}
                  />
                  {obtenerTSS(sesionHoy) !== null && (
                    <DatoHoy titulo="TSS" valor={obtenerTSS(sesionHoy)} />
                  )}
                  {obtenerIF(sesionHoy) !== null && (
                    <DatoHoy titulo="IF" valor={obtenerIF(sesionHoy)} />
                  )}
                </div>

                {(objetivoFisiologicoHoy || zonaPrincipalHoy) && (
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    {objetivoFisiologicoHoy && (
                      <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 font-semibold text-slate-300">
                        {objetivoFisiologicoHoy}
                      </span>
                    )}
                    {zonaPrincipalHoy && (
                      <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 font-semibold text-orange-300">
                        {zonaPrincipalHoy}
                      </span>
                    )}
                  </div>
                )}

                {nutricionHoy && (
                  <NutricionHoy
                    nutricion={nutricionHoy}
                    duracion={sesionHoy.duracion ?? 0}
                  />
                )}
              </>
            )}
          </div>

        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            titulo="Fatiga"
            valor={fatiga.fatigaEstimada ?? 0}
            detalle={fatiga.estadoFatiga || "Sin dato"}
            color="green"
          />

          <MetricCard
            titulo="Cumplimiento"
            valor={`${cumplimiento.cumplimiento ?? 0}%`}
            detalle={cumplimiento.estado || "Sin dato"}
            color="red"
          />

          <MetricCard
            titulo="Volumen"
            valor={`${volumen.utilizacion ?? 0}%`}
            detalle={`${volumen.volumenGenerado ?? 0} / ${volumen.volumenObjetivo ?? 0} min`}
            color={estadoUtilizacion.colorMetrica}
          />

          <MetricCard
            titulo="Preparacion"
            valor={textoPreparacion}
            detalle={`${metricasObjetivo.semanasHastaObjetivo ?? 0} semanas restantes`}
            color="blue"
          />
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1.25fr]">
          <div className="space-y-5">
            <EstadoGeneralCard
              estado={estadoGeneral.estado || "Sin dato"}
              colorEstado={colorEstado}
              descripcion={
                resumenRapido.descripcion ||
                "Genera o actualiza tu semana para ver el resumen."
              }
            />
            <RecomendacionCard
              mensaje={
                dashboard.mensajeEntrenador || "Sin recomendacion disponible."
              }
            />
          </div>

          <RecuperacionCard recuperacion={dashboard.recuperacion} />
        </section>

        <div id="sesiones-semana">
          <SesionesCard sesiones={sesiones} />
        </div>
      </div>
    </main>
  );
}

function DatoHoy({ titulo, valor, className = "", valorClassName = "text-white" }) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-950 p-3 ${className}`}>
      <p className="text-xs text-slate-500">{titulo}</p>
      <p className={`mt-1 text-lg font-bold ${valorClassName}`}>{valor}</p>
    </div>
  );
}

function NutricionHoy({ nutricion = {}, duracion = 0 }) {
  const esRequerida = Number(duracion) > 120;

  return (
    <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
          {esRequerida ? "Nutricion requerida" : "Nutricion opcional"}
        </p>
        {nutricion.gramosCHOTotales !== undefined && (
          <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-emerald-200">
            {nutricion.gramosCHOTotales} g CHO total
          </span>
        )}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {nutricion.gramosCHOHora !== undefined && (
          <DatoHoy titulo="CHO/h" valor={`${nutricion.gramosCHOHora} g`} />
        )}
        {nutricion.hidratacionMlHora !== undefined && (
          <DatoHoy
            titulo="Liquidos/h"
            valor={`${nutricion.hidratacionMlHora} ml`}
          />
        )}
        {nutricion.gramosCHOTotales !== undefined && (
          <DatoHoy
            titulo="CHO total"
            valor={`${nutricion.gramosCHOTotales} g`}
          />
        )}
      </div>

      {nutricion.resumen && (
        <p className="mt-3 text-sm leading-6 text-emerald-100/80">
          {nutricion.resumen}
        </p>
      )}
    </div>
  );
}

function InfoChip({ label, value, muted = false }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 ${
        muted
          ? "border-slate-800 bg-slate-950 text-slate-400"
          : "border-slate-700 bg-slate-950 text-slate-200"
      }`}
    >
      <span className="text-slate-500">{label}: </span>
      {value}
    </span>
  );
}

export default DashboardPage;
