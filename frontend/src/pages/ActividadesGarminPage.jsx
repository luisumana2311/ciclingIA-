import { useEffect, useState } from "react";
import { obtenerActividadesGarmin } from "../services/actividadGarminService";
import { obtenerAtletaIdActual } from "../utils/authStorage";

function ActividadesGarminPage() {
  const atletaId = obtenerAtletaIdActual();
  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarActividades = async () => {
      if (!atletaId) {
        setCargando(false);
        return;
      }

      try {
        const datos = await obtenerActividadesGarmin(atletaId);
        setActividades(datos);
      } catch (error) {
        console.error("Error cargando actividades Garmin:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarActividades();
  }, [atletaId]);

  if (cargando) {
    return <p className="p-6 text-white">Cargando actividades Garmin...</p>;
  }

  if (!atletaId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <section className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold">Debe iniciar sesión</h1>
          <p className="mt-3 text-sm text-slate-400">
            Ingresa para consultar tus actividades Garmin.
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
      <h1 className="mb-2 text-3xl font-bold">Actividades Garmin</h1>

      <p className="mb-8 text-slate-400">
        Actividades importadas y clasificadas automáticamente para construir tu
        biblioteca de entrenamientos.
      </p>

      {actividades.length === 0 ? (
        <p className="text-slate-400">
          No hay actividades Garmin guardadas todavía.
        </p>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {actividades.map((actividad) => (
            <article
              key={actividad._id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">{actividad.nombre}</h2>
                  <p className="text-sm text-slate-400">
                    {new Date(actividad.fecha).toLocaleDateString()}
                  </p>
                </div>

                <span className="rounded-full bg-orange-500/20 px-3 py-1 text-sm text-orange-300">
                  {actividad.clasificacion}
                </span>
              </div>

              <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                <DatoActividad titulo="Tipo" valor={actividad.tipo} />
                <DatoActividad
                  titulo="Distancia"
                  valor={`${actividad.distanciaKm} km`}
                />
                <DatoActividad
                  titulo="Duración"
                  valor={`${actividad.duracionMin} min`}
                />
                <DatoActividad
                  titulo="Desnivel"
                  valor={`${actividad.desnivelM} m`}
                />
                <DatoActividad
                  titulo="Potencia prom."
                  valor={`${actividad.potenciaPromedio} W`}
                />
                <DatoActividad
                  titulo="FC prom."
                  valor={`${actividad.frecuenciaPromedio} ppm`}
                />
                <DatoActividad
                  titulo="Cadencia"
                  valor={`${actividad.cadenciaPromedio} rpm`}
                />
                <DatoActividad
                  titulo="Dificultad"
                  valor={`${actividad.dificultad}/10`}
                />
              </div>

              <div className="mt-4 rounded-xl bg-slate-800 p-3 text-sm text-slate-300">
                <p className="text-slate-400">Objetivo fisiológico</p>
                <p className="font-semibold">
                  {actividad.objetivoFisiologico || "Sin dato"}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

function DatoActividad({ titulo, valor }) {
  return (
    <div className="rounded-xl bg-slate-950 p-3">
      <p className="text-xs text-slate-400">{titulo}</p>
      <p className="font-semibold">{valor || "N/A"}</p>
    </div>
  );
}

export default ActividadesGarminPage;
