import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { obtenerAtletaIdActual } from "../utils/authStorage";
import { obtenerPerfil, actualizarPerfil } from "../services/perfilService";
import {
  obtenerObjetivoActivo,
  guardarObjetivoPrincipal,
} from "../services/objetivoService";

const diasSemana = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

const formularioInicial = {
  edad: "",
  peso: "",
  estatura: "",
  ftp: "",
  frecuenciaCardiacaMaxima: "",
  frecuenciaCardiacaReposo: "",
  disciplinaPrincipal: "",
  nivel: "",
  objetivoPrincipal: "",
  fechaObjetivo: "",
  disponibilidad: {
    lunes: 0,
    martes: 0,
    miercoles: 0,
    jueves: 0,
    viernes: 0,
    sabado: 0,
    domingo: 0,
  },
};

const formatearFecha = (fecha) => {
  if (!fecha) return "";
  return new Date(fecha).toISOString().slice(0, 10);
};

function OnboardingPage() {
  const navigate = useNavigate();
  const atletaId = obtenerAtletaIdActual();
  const [formulario, setFormulario] = useState(formularioInicial);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
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

        setFormulario({
          edad: perfil.edad || "",
          peso: perfil.peso || "",
          estatura: perfil.estatura || "",
          ftp: perfil.ftp || "",
          frecuenciaCardiacaMaxima: perfil.frecuenciaCardiacaMaxima || "",
          frecuenciaCardiacaReposo: perfil.frecuenciaCardiacaReposo || "",
          disciplinaPrincipal: perfil.disciplinaPrincipal || "",
          nivel: perfil.nivel || "",
          objetivoPrincipal: objetivo?.nombre || "",
          fechaObjetivo: formatearFecha(objetivo?.fechaObjetivo),
          disponibilidad: {
            ...formularioInicial.disponibilidad,
            ...(perfil.disponibilidad || {}),
          },
        });
      } catch (errorCarga) {
        console.error("Error cargando onboarding:", errorCarga);
        setError("No fue posible cargar los datos iniciales.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [atletaId]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  const manejarDisponibilidad = (dia, valor) => {
    setFormulario({
      ...formulario,
      disponibilidad: {
        ...formulario.disponibilidad,
        [dia]: Number(valor),
      },
    });
  };

  const guardarOnboarding = async (e) => {
    e.preventDefault();
    setError("");

    if (!atletaId) {
      setError("Debe iniciar sesion");
      return;
    }

    try {
      setGuardando(true);

      await actualizarPerfil(atletaId, {
        edad: Number(formulario.edad),
        peso: Number(formulario.peso),
        estatura: Number(formulario.estatura),
        ftp: formulario.ftp ? Number(formulario.ftp) : null,
        frecuenciaCardiacaMaxima: formulario.frecuenciaCardiacaMaxima
          ? Number(formulario.frecuenciaCardiacaMaxima)
          : null,
        frecuenciaCardiacaReposo: formulario.frecuenciaCardiacaReposo
          ? Number(formulario.frecuenciaCardiacaReposo)
          : null,
        disciplinaPrincipal: formulario.disciplinaPrincipal,
        nivel: formulario.nivel,
        disponibilidad: formulario.disponibilidad,
      });

      await guardarObjetivoPrincipal(atletaId, {
        nombre: formulario.objetivoPrincipal,
        disciplina: formulario.disciplinaPrincipal,
        fechaObjetivo: formulario.fechaObjetivo,
        prioridad: "Alta",
        distancia: 0,
        desnivel: 0,
      });

      window.dispatchEvent(new Event("perfil-change"));
      navigate("/");
    } catch (errorGuardado) {
      console.error("Error guardando onboarding:", errorGuardado);
      setError(
        errorGuardado.response?.data?.mensaje ||
          "No fue posible guardar el onboarding.",
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <p className="p-6 text-white">Cargando onboarding...</p>;
  }

  if (!atletaId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <section className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold">Debe iniciar sesion</h1>
          <p className="mt-3 text-sm text-slate-400">
            Ingresa para completar tu perfil inicial.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Ir a Login
          </Link>
        </section>
      </main>
    );
  }

  const perfilTieneDatos = Boolean(
    formulario.edad ||
      formulario.peso ||
      formulario.estatura ||
      formulario.disciplinaPrincipal ||
      formulario.nivel ||
      formulario.ftp ||
      formulario.frecuenciaCardiacaMaxima ||
      formulario.frecuenciaCardiacaReposo ||
      formulario.objetivoPrincipal ||
      Object.values(formulario.disponibilidad).some((horas) => Number(horas) > 0),
  );

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange-400">
            Configuracion inicial
          </p>
          <h1 className="text-4xl font-bold">
            {perfilTieneDatos ? "Actualizar perfil" : "Completar perfil"}
          </h1>
          <p className="mt-3 text-slate-400">
            Planifica, analiza y adapta tu entrenamiento semanal.
          </p>
        </div>

        <form
          onSubmit={guardarOnboarding}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-orange-950/20"
        >
          <div className="grid gap-5 md:grid-cols-3">
            <Campo
              label="Edad"
              name="edad"
              type="number"
              value={formulario.edad}
              onChange={manejarCambio}
              required
            />
            <Campo
              label="Peso kg"
              name="peso"
              type="number"
              value={formulario.peso}
              onChange={manejarCambio}
              required
            />
            <Campo
              label="Estatura cm"
              name="estatura"
              type="number"
              value={formulario.estatura}
              onChange={manejarCambio}
              required
            />
            <Campo
              label="FTP opcional"
              name="ftp"
              type="number"
              value={formulario.ftp}
              onChange={manejarCambio}
            />
            <Campo
              label="FC maxima opcional"
              name="frecuenciaCardiacaMaxima"
              type="number"
              value={formulario.frecuenciaCardiacaMaxima}
              onChange={manejarCambio}
            />
            <Campo
              label="FC reposo opcional"
              name="frecuenciaCardiacaReposo"
              type="number"
              value={formulario.frecuenciaCardiacaReposo}
              onChange={manejarCambio}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Disciplina principal
              </label>
              <select
                name="disciplinaPrincipal"
                value={formulario.disciplinaPrincipal}
                onChange={manejarCambio}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-orange-500"
              >
                <option value="">Seleccionar</option>
                <option value="Ruta">Ruta</option>
                <option value="MTB">MTB</option>
                <option value="MTB Marathon">MTB Marathon</option>
                <option value="Gravel">Gravel</option>
                <option value="Rodillo">Rodillo</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Nivel
              </label>
              <select
                name="nivel"
                value={formulario.nivel}
                onChange={manejarCambio}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-orange-500"
              >
                <option value="">Seleccionar</option>
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
                <option value="Competitivo">Competitivo</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Objetivo principal
              </label>
              <select
                name="objetivoPrincipal"
                value={formulario.objetivoPrincipal}
                onChange={manejarCambio}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-orange-500"
              >
                <option value="">Seleccionar</option>
                <option value="Perder grasa">Perder grasa</option>
                <option value="Mejorar rendimiento">Mejorar rendimiento</option>
                <option value="Fondo">Fondo</option>
                <option value="MTB marathon">MTB marathon</option>
                <option value="Carrera especifica">Carrera especifica</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <Campo
              label="Fecha objetivo"
              name="fechaObjetivo"
              type="date"
              value={formulario.fechaObjetivo}
              onChange={manejarCambio}
              required
            />
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold">Disponibilidad semanal</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-7">
              {diasSemana.map((dia) => (
                <div key={dia}>
                  <label className="mb-2 block text-sm capitalize text-slate-300">
                    {dia}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formulario.disponibilidad[dia]}
                    onChange={(e) => manejarDisponibilidad(dia, e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-orange-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="mt-8 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          >
            {guardando ? "Guardando..." : "Guardar y continuar"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Campo({ label, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
      />
    </div>
  );
}

export default OnboardingPage;
