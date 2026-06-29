import { useEffect, useState } from "react";
import { obtenerBibliotecaEntrenamientos } from "../services/bibliotecaService";
import { obtenerAtletaIdActual } from "../utils/authStorage";

function BibliotecaPage() {
  const atletaId = obtenerAtletaIdActual();
  const [biblioteca, setBiblioteca] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarBiblioteca = async () => {
      if (!atletaId) {
        setCargando(false);
        return;
      }

      try {
        const datos = await obtenerBibliotecaEntrenamientos(atletaId);
        setBiblioteca(datos);
      } catch (error) {
        console.error("Error cargando biblioteca:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarBiblioteca();
  }, [atletaId]);

  if (cargando) {
    return <p className="p-6 text-white">Cargando biblioteca...</p>;
  }

  if (!atletaId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <section className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold">Debe iniciar sesión</h1>
          <p className="mt-3 text-sm text-slate-400">
            Ingresa para explorar tu biblioteca de entrenamientos.
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

  if (!biblioteca) {
    return <p className="p-6 text-red-400">No se pudo cargar la biblioteca.</p>;
  }

  const distribucion = Object.entries(biblioteca.distribucionTipos || {});

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <h1 className="mb-2 text-3xl font-bold">Biblioteca de entrenamientos</h1>

      <p className="mb-8 text-slate-400">
        Análisis de tus actividades Garmin para conocer cómo entrenas realmente.
      </p>

      <section className="grid gap-4 md:grid-cols-3">
        <TarjetaBiblioteca
          titulo="Total actividades"
          valor={biblioteca.totalActividades}
        />

        <TarjetaBiblioteca
          titulo="Sesión más frecuente"
          valor={biblioteca.sesionMasFrecuente}
        />

        <TarjetaBiblioteca
          titulo="Sesión menos frecuente"
          valor={biblioteca.sesionMenosFrecuente}
        />

        <TarjetaBiblioteca
          titulo="Duración promedio"
          valor={`${biblioteca.duracionPromedio} min`}
        />

        <TarjetaBiblioteca
          titulo="Desnivel promedio"
          valor={`${biblioteca.desnivelPromedio} m`}
        />

        <TarjetaBiblioteca
          titulo="Potencia promedio"
          valor={`${biblioteca.potenciaPromedioHistorica} W`}
        />
      </section>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-2xl font-bold">Distribución por tipo</h2>

        {distribucion.length === 0 ? (
          <p className="text-slate-400">No hay distribución disponible.</p>
        ) : (
          <div className="space-y-4">
            {distribucion.map(([tipo, cantidad]) => (
              <div key={tipo}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-300">{tipo}</span>
                  <span className="text-slate-400">{cantidad}</span>
                </div>

                <div className="h-3 rounded-full bg-slate-800">
                  <div
                    className="h-3 rounded-full bg-orange-500"
                    style={{
                      width: `${Math.min(
                        (cantidad / biblioteca.totalActividades) * 100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function TarjetaBiblioteca({ titulo, valor }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{titulo}</p>
      <p className="mt-2 text-2xl font-bold">{valor}</p>
    </article>
  );
}

export default BibliotecaPage;
