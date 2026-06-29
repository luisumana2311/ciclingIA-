import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerPerfil } from "../services/perfilService";
import { obtenerAtletaIdActual } from "../utils/authStorage";

function PerfilPage() {
  const atletaId = obtenerAtletaIdActual();
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarPerfil = async () => {
      if (!atletaId) {
        setCargando(false);
        return;
      }

      try {
        const datos = await obtenerPerfil(atletaId);
        setPerfil(datos);
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, [atletaId]);

  if (cargando) {
    return <p className="p-6 text-white">Cargando perfil...</p>;
  }

  if (!atletaId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <section className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold">Debe iniciar sesión</h1>
          <p className="mt-3 text-sm text-slate-400">
            Ingresa para consultar tu perfil de atleta.
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

  if (!perfil) {
    return <p className="p-6 text-red-400">No se pudo cargar el perfil.</p>;
  }

  const zonasFTP = perfil.zonasEntrenamiento?.ftp?.zonas || [];
  const zonasFrecuenciaCardiaca =
    perfil.zonasEntrenamiento?.frecuenciaCardiaca?.zonas || [];

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <section className="flex flex-wrap items-start justify-between gap-4 rounded-2xl bg-slate-900 p-6">
        <div>
          <h1 className="text-4xl font-bold">{perfil.nombre}</h1>

          <p className="mt-2 text-slate-300">{perfil.disciplinaPrincipal}</p>
        </div>

        <Link
          to="/onboarding"
          className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
        >
          Editar perfil
        </Link>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Edad</p>
          <h3 className="mt-2 text-3xl font-bold">{perfil.edad || "-"}</h3>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Peso</p>
          <h3 className="mt-2 text-3xl font-bold">
            {perfil.peso ? `${perfil.peso} kg` : "-"}
          </h3>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Estatura</p>
          <h3 className="mt-2 text-3xl font-bold">
            {perfil.estatura ? `${perfil.estatura} cm` : "-"}
          </h3>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-sm text-slate-400">FTP</p>
          <h3 className="mt-2 text-3xl font-bold">
            {perfil.ftp ? `${perfil.ftp} W` : "-"}
          </h3>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-sm text-slate-400">FC maxima</p>
          <h3 className="mt-2 text-3xl font-bold">
            {perfil.frecuenciaCardiacaMaxima
              ? `${perfil.frecuenciaCardiacaMaxima} ppm`
              : "-"}
          </h3>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <p className="text-sm text-slate-400">FC reposo</p>
          <h3 className="mt-2 text-3xl font-bold">
            {perfil.frecuenciaCardiacaReposo
              ? `${perfil.frecuenciaCardiacaReposo} ppm`
              : "-"}
          </h3>
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-400">
            Intensidades
          </p>
          <h2 className="mt-1 text-2xl font-bold">Zonas de entrenamiento</h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <ZonasCard
            titulo="Zonas por FTP"
            subtitulo={perfil.ftp ? `${perfil.ftp} W` : "FTP no definido"}
            zonas={zonasFTP}
            mensajeVacio="Agrega tu FTP en el onboarding para calcular zonas de potencia."
          />

          <ZonasCard
            titulo="Zonas por frecuencia cardiaca"
            subtitulo={
              perfil.frecuenciaCardiacaMaxima
                ? `${perfil.frecuenciaCardiacaMaxima} ppm max`
                : "FC maxima no definida"
            }
            zonas={zonasFrecuenciaCardiaca}
            mensajeVacio="Agrega tu FC maxima en el onboarding para calcular zonas de frecuencia cardiaca."
          />
        </div>
      </section>
    </main>
  );
}

function ZonasCard({ titulo, subtitulo, zonas, mensajeVacio }) {
  const tieneZonas = zonas.length > 0;

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">{titulo}</h3>
          <p className="mt-1 text-sm text-slate-400">{subtitulo}</p>
        </div>
      </div>

      {!tieneZonas ? (
        <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-orange-200">
          {mensajeVacio}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <div className="grid grid-cols-[1.4fr_0.6fr_0.6fr] bg-slate-950 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <span>Zona</span>
            <span>Desde</span>
            <span>Hasta</span>
          </div>

          {zonas.map((zona) => (
            <div
              key={`${zona.nombre}-${zona.desde}-${zona.hasta}`}
              className="grid grid-cols-[1.4fr_0.6fr_0.6fr] border-t border-slate-800 px-4 py-3 text-sm"
            >
              <span className="font-semibold text-white">{zona.nombre}</span>
              <span className="text-slate-300">
                {formatearValorZona(zona.desde, zona.unidad)}
              </span>
              <span className="text-slate-300">
                {formatearValorZona(zona.hasta, zona.unidad, true)}
              </span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function formatearValorZona(valor, unidad, esHasta = false) {
  if (valor === null || valor === undefined) {
    return esHasta ? "+" : "-";
  }

  return `${valor} ${unidad || ""}`.trim();
}

export default PerfilPage;
