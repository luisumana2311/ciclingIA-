import { useEffect, useState } from "react";
import { obtenerEvolucionAtleta } from "../services/evolucionService";
import GraficoCumplimiento from "../components/GraficoCumplimiento";
import GraficoFatiga from "../components/GraficoFatiga";
import { obtenerAtletaIdActual } from "../utils/authStorage";

const obtenerValor = (...valores) => {
  return valores.find((valor) => valor !== undefined && valor !== null);
};

const obtenerFecha = (fecha) => {
  if (!fecha) return "Fecha no disponible";

  return new Date(fecha).toLocaleDateString();
};

const obtenerFase = (item = {}) => {
  return (
    obtenerValor(
      item.semanaGenerada?.fase,
      item.semanaGenerada?.fasePreparacion,
      item.semanaGenerada?.resumen?.fase,
    ) || "Semana generada"
  );
};

const obtenerSesiones = (item = {}) => {
  const sesiones = item.semanaGenerada?.sesiones;

  if (Array.isArray(sesiones)) return sesiones.length;

  return obtenerValor(item.semanaGenerada?.resumen?.totalSesiones, 0);
};

const obtenerVolumenGenerado = (item = {}) => {
  return obtenerValor(
    item.semanaGenerada?.volumenGeneradoMin,
    item.semanaGenerada?.volumenGenerado,
    item.semanaGenerada?.resumen?.volumenGeneradoMin,
    item.semanaGenerada?.resumen?.volumenPlanificadoMin,
    0,
  );
};

const obtenerVolumenObjetivo = (item = {}) => {
  return obtenerValor(
    item.semanaGenerada?.volumenObjetivoMin,
    item.semanaGenerada?.volumenObjetivo,
    item.semanaGenerada?.resumen?.volumenObjetivoMin,
    0,
  );
};

const obtenerUtilizacion = (item = {}) => {
  return obtenerValor(
    item.semanaGenerada?.porcentajeUtilizacionReal,
    item.semanaGenerada?.utilizacion,
    item.semanaGenerada?.resumen?.porcentajeUtilizacionReal,
    0,
  );
};

const obtenerEstadoUtilizacion = (utilizacion) => {
  const valor = Number(utilizacion) || 0;

  if (valor >= 90) {
    return {
      barra: "bg-emerald-500",
      chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    };
  }

  if (valor >= 70) {
    return {
      barra: "bg-yellow-500",
      chip: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    };
  }

  return {
    barra: "bg-red-500",
    chip: "border-red-500/30 bg-red-500/10 text-red-300",
  };
};

const calcularPromedio = (valores = []) => {
  if (valores.length === 0) return 0;

  const total = valores.reduce((suma, valor) => suma + (Number(valor) || 0), 0);

  return Math.round(total / valores.length);
};

const obtenerFlechaVolumen = (actual, anterior) => {
  if (anterior === null || anterior === undefined) return "→";
  if (actual > anterior) return "↑";
  if (actual < anterior) return "↓";

  return "→";
};

function EvolucionPage() {
  const atletaId = obtenerAtletaIdActual();
  const [evolucion, setEvolucion] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarEvolucion = async () => {
      if (!atletaId) {
        setCargando(false);
        return;
      }

      try {
        const datos = await obtenerEvolucionAtleta(atletaId);
        setEvolucion(Array.isArray(datos) ? datos : []);
      } catch (error) {
        console.error("Error cargando evolucion:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarEvolucion();
  }, [atletaId]);

  if (cargando) {
    return <p className="p-6 text-white">Cargando evolucion...</p>;
  }

  if (!atletaId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <section className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold">Debe iniciar sesion</h1>
          <p className="mt-3 text-sm text-slate-400">
            Ingresa para analizar tu evolucion.
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

  const semanasGeneradas = evolucion.length;
  const volumenes = evolucion.map(obtenerVolumenGenerado);
  const utilizaciones = evolucion.map(obtenerUtilizacion);
  const volumenPromedio = calcularPromedio(volumenes);
  const utilizacionPromedio = calcularPromedio(utilizaciones);
  const faseActual = obtenerFase(evolucion[evolucion.length - 1] || {});

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
          Evolucion
        </p>
        <h1 className="mt-2 text-3xl font-bold">Evolucion del atleta</h1>

        <p className="mt-3 max-w-3xl text-slate-400">
          Seguimiento historico de volumen, utilizacion, sesiones y fase de
          entrenamiento.
        </p>

        {evolucion.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 text-slate-400">
            No hay datos de evolucion todavia.
          </p>
        ) : (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <ResumenEvolucion
                titulo="Semanas generadas"
                valor={semanasGeneradas}
              />
              <ResumenEvolucion
                titulo="Volumen promedio"
                valor={`${volumenPromedio} min`}
              />
              <ResumenEvolucion
                titulo="Utilizacion promedio"
                valor={`${utilizacionPromedio}%`}
              />
              <ResumenEvolucion titulo="Fase actual" valor={faseActual} />
            </section>

            <section className="mt-6 grid gap-5 xl:grid-cols-2">
              <GraficoCumplimiento datos={evolucion} />
              <GraficoFatiga datos={evolucion} />
            </section>

            <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                  Tendencia semanal
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  Volumen generado vs objetivo
                </h2>
              </div>

              <div className="space-y-4">
                {evolucion.map((semana, index) => {
                  const volumenGenerado = obtenerVolumenGenerado(semana);
                  const volumenObjetivo = obtenerVolumenObjetivo(semana);
                  const utilizacion = obtenerUtilizacion(semana);
                  const sesiones = obtenerSesiones(semana);
                  const fase = obtenerFase(semana);
                  const volumenAnterior =
                    index > 0 ? obtenerVolumenGenerado(evolucion[index - 1]) : null;
                  const flecha = obtenerFlechaVolumen(
                    volumenGenerado,
                    volumenAnterior,
                  );
                  const estado = obtenerEstadoUtilizacion(utilizacion);
                  const anchoBarra = Math.min(Number(utilizacion) || 0, 100);

                  return (
                    <article
                      key={semana._id || index}
                      className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Semana {index + 1}
                          </p>
                          <h3 className="mt-1 text-lg font-bold">
                            {obtenerFecha(semana.fechaInicioSemana)}
                          </h3>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">
                            {fase}
                          </span>
                          <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${estado.chip}`}>
                            {utilizacion}%
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={`h-full rounded-full ${estado.barra}`}
                          style={{ width: `${anchoBarra}%` }}
                        />
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-4">
                        <DatoEvolucion
                          titulo="Volumen"
                          valor={`${volumenGenerado} / ${volumenObjetivo} min`}
                        />
                        <DatoEvolucion titulo="Sesiones" valor={sesiones} />
                        <DatoEvolucion titulo="Tendencia" valor={flecha} />
                        <DatoEvolucion
                          titulo="Utilizacion"
                          valor={`${utilizacion}%`}
                        />
                      </div>

                      {(semana.mensajeEntrenador ||
                        semana.semanaGenerada?.mensaje) && (
                        <p className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm leading-6 text-slate-300">
                          {semana.mensajeEntrenador ||
                            semana.semanaGenerada?.mensaje}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function ResumenEvolucion({ titulo, valor }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-xs text-slate-500">{titulo}</p>
      <p className="mt-2 text-2xl font-bold text-white">{valor}</p>
    </div>
  );
}

function DatoEvolucion({ titulo, valor }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
      <p className="text-xs text-slate-500">{titulo}</p>
      <p className="mt-1 font-semibold text-slate-100">{valor}</p>
    </div>
  );
}

export default EvolucionPage;
