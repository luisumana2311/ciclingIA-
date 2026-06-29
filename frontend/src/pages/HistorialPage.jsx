import { useEffect, useState } from "react";
import { obtenerHistorialPorAtleta } from "../services/historialService";
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

function HistorialPage() {
  const atletaId = obtenerAtletaIdActual();
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarHistorial = async () => {
      if (!atletaId) {
        setCargando(false);
        return;
      }

      try {
        const datos = await obtenerHistorialPorAtleta(atletaId);
        setHistorial(Array.isArray(datos) ? datos : []);
      } catch (error) {
        console.error("Error cargando historial:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarHistorial();
  }, [atletaId]);

  if (cargando) {
    return <p className="p-6 text-white">Cargando historial...</p>;
  }

  if (!atletaId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <section className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold">Debe iniciar sesion</h1>
          <p className="mt-3 text-sm text-slate-400">
            Ingresa para ver tu historial semanal.
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

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
          Memoria del entrenador
        </p>
        <h1 className="mt-2 text-3xl font-bold">Historial semanal</h1>

        <p className="mt-3 max-w-3xl text-slate-400">
          Semanas generadas, volumen planificado y recomendaciones guardadas por
          el entrenador digital.
        </p>

        {historial.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 text-slate-400">
            No hay semanas guardadas todavia.
          </p>
        ) : (
          <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {historial.map((item) => {
              const volumenGenerado = obtenerVolumenGenerado(item);
              const volumenObjetivo = obtenerVolumenObjetivo(item);
              const utilizacion = obtenerUtilizacion(item);
              const estado = obtenerEstadoUtilizacion(utilizacion);
              const anchoBarra = Math.min(Number(utilizacion) || 0, 100);

              return (
                <article
                  key={item._id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-slate-950/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Inicio semana
                      </p>
                      <h2 className="mt-1 text-xl font-bold">
                        {obtenerFecha(item.fechaInicioSemana)}
                      </h2>
                    </div>

                    <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${estado.chip}`}>
                      {utilizacion}%
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-slate-400">
                    {item.objetivoPrincipal?.nombre || "Objetivo no disponible"}
                  </p>

                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${estado.barra}`}
                      style={{ width: `${anchoBarra}%` }}
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <DatoHistorial titulo="Fase" valor={obtenerFase(item)} />
                    <DatoHistorial titulo="Sesiones" valor={obtenerSesiones(item)} />
                    <DatoHistorial
                      titulo="Volumen generado"
                      valor={`${volumenGenerado} min`}
                    />
                    <DatoHistorial
                      titulo="Volumen objetivo"
                      valor={`${volumenObjetivo} min`}
                    />
                  </div>

                  {(item.mensajeEntrenador || item.semanaGenerada?.mensaje) && (
                    <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm leading-6 text-slate-300">
                      {item.mensajeEntrenador || item.semanaGenerada?.mensaje}
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

function DatoHistorial({ titulo, valor }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
      <p className="text-xs text-slate-500">{titulo}</p>
      <p className="mt-1 font-semibold text-slate-100">{valor}</p>
    </div>
  );
}

export default HistorialPage;
