import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { obtenerPerfil } from "../services/perfilService";
import { obtenerObjetivoActivo } from "../services/objetivoService";
import { onboardingEstaCompleto } from "../utils/onboarding";

const obtenerUsuarioGuardado = () => {
  const usuarioGuardado = localStorage.getItem("usuario");

  if (!usuarioGuardado) {
    return null;
  }

  try {
    return JSON.parse(usuarioGuardado);
  } catch {
    return null;
  }
};

const linksPrincipales = [
  { to: "/", label: "Dashboard" },
  { to: "/historial", label: "Historial" },
  { to: "/registro", label: "Registro diario" },
  { to: "/evolucion", label: "Evolucion" },
  { to: "/garmin", label: "Garmin" },
  { to: "/biblioteca", label: "Biblioteca" },
];

const linkClassName = ({ isActive }) =>
  `rounded-xl px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-slate-800 text-white"
      : "text-slate-400 hover:bg-slate-900 hover:text-white"
  }`;

function Navbar() {
  const navigate = useNavigate();
  const [tieneToken, setTieneToken] = useState(
    Boolean(localStorage.getItem("token")),
  );
  const [usuario, setUsuario] = useState(obtenerUsuarioGuardado);
  const [onboardingCompleto, setOnboardingCompleto] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const actualizarAuth = () => {
      setTieneToken(Boolean(localStorage.getItem("token")));
      setUsuario(obtenerUsuarioGuardado());
    };

    window.addEventListener("storage", actualizarAuth);
    window.addEventListener("auth-change", actualizarAuth);

    return () => {
      window.removeEventListener("storage", actualizarAuth);
      window.removeEventListener("auth-change", actualizarAuth);
    };
  }, []);

  useEffect(() => {
    const verificarOnboarding = async () => {
      if (!tieneToken || !usuario?.atletaId) {
        setOnboardingCompleto(true);
        return;
      }

      try {
        const perfil = await obtenerPerfil(usuario.atletaId);
        let objetivo = null;

        try {
          objetivo = await obtenerObjetivoActivo(usuario.atletaId);
        } catch (errorObjetivo) {
          if (errorObjetivo.response?.status !== 404) {
            throw errorObjetivo;
          }
        }

        setOnboardingCompleto(onboardingEstaCompleto(perfil, objetivo));
      } catch (error) {
        console.error("Error verificando onboarding:", error);
        setOnboardingCompleto(false);
      }
    };

    verificarOnboarding();

    window.addEventListener("perfil-change", verificarOnboarding);

    return () => {
      window.removeEventListener("perfil-change", verificarOnboarding);
    };
  }, [tieneToken, usuario?.atletaId]);

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  const salir = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setTieneToken(false);
    setUsuario(null);
    cerrarMenu();
    navigate("/login");
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-950/95 text-white shadow-lg shadow-slate-950/40 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex min-h-16 items-center justify-between gap-4">
          <Link to="/" onClick={cerrarMenu} className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-2xl border border-orange-500/30 bg-orange-500/10">
              <span className="h-3 w-3 rounded-full bg-orange-500" />
            </span>
            <div>
              <h1 className="font-bold leading-tight">Entrenador Digital</h1>
              <p className="text-xs text-slate-500">Ciclismo inteligente</p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            <DesktopLinks
              tieneToken={tieneToken}
              onboardingCompleto={onboardingCompleto}
            />
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <SesionActions
              tieneToken={tieneToken}
              usuario={usuario}
              salir={salir}
            />
          </div>

          <button
            type="button"
            aria-label={menuAbierto ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto((abierto) => !abierto)}
            className="inline-flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 transition hover:border-orange-500 lg:hidden"
          >
            <span className="h-0.5 w-5 rounded-full bg-slate-200" />
            <span className="h-0.5 w-5 rounded-full bg-slate-200" />
            <span className="h-0.5 w-5 rounded-full bg-slate-200" />
          </button>
        </div>

        {menuAbierto && (
          <div className="border-t border-slate-800 py-4 lg:hidden">
            <div className="flex flex-col gap-2">
              <MobileLinks
                tieneToken={tieneToken}
                onboardingCompleto={onboardingCompleto}
                cerrarMenu={cerrarMenu}
              />
            </div>

            <div className="mt-4 border-t border-slate-800 pt-4">
              <SesionActions
                tieneToken={tieneToken}
                usuario={usuario}
                salir={salir}
                cerrarMenu={cerrarMenu}
                mobile
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function DesktopLinks({ tieneToken, onboardingCompleto }) {
  return (
    <>
      {linksPrincipales.map((link) => (
        <NavLink key={link.to} to={link.to} className={linkClassName} end>
          {link.label}
        </NavLink>
      ))}

      {tieneToken && onboardingCompleto && (
        <NavLink to="/perfil" className={linkClassName}>
          Mi perfil
        </NavLink>
      )}

      {tieneToken && !onboardingCompleto && <CompletarPerfilLink />}
    </>
  );
}

function MobileLinks({ tieneToken, onboardingCompleto, cerrarMenu }) {
  return (
    <>
      {linksPrincipales.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={cerrarMenu}
          className={linkClassName}
          end
        >
          {link.label}
        </NavLink>
      ))}

      {tieneToken && onboardingCompleto && (
        <NavLink to="/perfil" onClick={cerrarMenu} className={linkClassName}>
          Mi perfil
        </NavLink>
      )}

      {tieneToken && !onboardingCompleto && (
        <CompletarPerfilLink onClick={cerrarMenu} />
      )}
    </>
  );
}

function CompletarPerfilLink({ onClick }) {
  return (
    <NavLink
      to="/onboarding"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-orange-500/60 bg-orange-500/10 px-3 py-2 text-sm font-semibold text-orange-300 transition hover:bg-orange-500 hover:text-white"
    >
      <span className="h-2 w-2 rounded-full bg-orange-400" />
      Completar perfil
    </NavLink>
  );
}

function SesionActions({ tieneToken, usuario, salir, cerrarMenu, mobile }) {
  if (tieneToken) {
    return (
      <div
        className={
          mobile
            ? "flex flex-col gap-3"
            : "flex items-center gap-3"
        }
      >
        {usuario?.nombre && (
          <span className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300">
            {usuario.nombre}
          </span>
        )}
        <button
          type="button"
          onClick={salir}
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-orange-500 hover:text-white"
        >
          Salir
        </button>
      </div>
    );
  }

  return (
    <div className={mobile ? "grid gap-3" : "flex items-center gap-3"}>
      <NavLink
        to="/login"
        onClick={cerrarMenu}
        className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-orange-500 hover:text-white"
      >
        Login
      </NavLink>
      <NavLink
        to="/registrarse"
        onClick={cerrarMenu}
        className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
      >
        Registrarse
      </NavLink>
    </div>
  );
}

export default Navbar;
