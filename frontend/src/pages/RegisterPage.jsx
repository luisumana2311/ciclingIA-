import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registrarUsuario } from "../services/authService";
import { obtenerPerfil } from "../services/perfilService";
import { obtenerObjetivoActivo } from "../services/objetivoService";
import { onboardingEstaCompleto } from "../utils/onboarding";

function RegisterPage() {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState({
    nombre: "",
    email: "",
    password: "",
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setCargando(true);
      const datos = await registrarUsuario(formulario);

      localStorage.setItem("token", datos.token);
      localStorage.setItem("usuario", JSON.stringify(datos.usuario));

      window.dispatchEvent(new Event("auth-change"));

      const perfil = await obtenerPerfil(datos.usuario.atletaId);
      let objetivo = null;

      try {
        objetivo = await obtenerObjetivoActivo(datos.usuario.atletaId);
      } catch (errorObjetivo) {
        if (errorObjetivo.response?.status !== 404) {
          throw errorObjetivo;
        }
      }

      if (onboardingEstaCompleto(perfil, objetivo)) {
        navigate("/");
      } else {
        navigate("/onboarding");
      }
    } catch (errorRegistro) {
      console.error("Error registrando usuario:", errorRegistro);
      setError(
        errorRegistro.response?.data?.mensaje ||
          "No fue posible crear la cuenta",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-orange-950/20">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange-400">
            Nueva cuenta
          </p>
          <h1 className="text-3xl font-bold">
            Entrenador Digital para Ciclistas
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Planifica, analiza y adapta tu entrenamiento semanal.
          </p>
        </div>

        <form onSubmit={manejarRegistro} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={formulario.nombre}
              onChange={manejarCambio}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formulario.email}
              onChange={manejarCambio}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formulario.password}
              onChange={manejarCambio}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              placeholder="Crea una contrasena"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          >
            {cargando ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Ya tienes cuenta?{" "}
          <Link to="/login" className="font-semibold text-orange-400">
            Inicia sesion
          </Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
