import { useEffect, useMemo, useState } from "react";
import {
  crearRegistroDiario,
  obtenerRegistrosPorAtleta,
} from "../services/registroDiarioService";
import { obtenerHistorialPorAtleta } from "../services/historialService";
import { obtenerAtletaIdActual } from "../utils/authStorage";

const obtenerNombreSesion = (sesion = {}) => {
  return (
    sesion.entrenamientoSeleccionado?.nombre ||
    sesion.entrenamientoSeleccionado?.titulo ||
    sesion.entrenamiento?.nombre ||
    sesion.entrenamiento?.titulo ||
    sesion.nombreEntrenamiento ||
    sesion.nombre ||
    sesion.categoria ||
    "Sesion planificada"
  );
};

const calcularCumplimientoPreview = ({ estadoSesion, duracionRealizada, duracionPlanificada }) => {
  if (estadoSesion === "no_realizada") return 0;

  const real = Number(duracionRealizada) || 0;
  const plan = Number(duracionPlanificada) || 0;

  if (estadoSesion === "completada" && plan === 0) return 100;
  if (plan <= 0) return 0;

  return Math.min(100, Math.round((real / plan) * 100));
};

const obtenerEstadoEtiqueta = (estado) => {
  const etiquetas = {
    completada: "Completada",
    parcial: "Parcial",
    no_realizada: "No realizada",
  };

  return etiquetas[estado] || "No realizada";
};

function RegistroPage() {
  const atletaId = obtenerAtletaIdActual();
  const [formulario, setFormulario] = useState({
    sueno: 5,
    energia: 5,
    estres: 5,
    dolorMuscular: 5,
    historialSemanalId: "",
    sesionPlanificadaIndex: "",
    sesionPlanificadaSnapshot: null,
    sesionPlanificadaDia: "",
    sesionPlanificadaCategoria: "",
    sesionPlanificadaNombre: "",
    duracionPlanificada: 0,
    estadoSesion: "completada",
    sensacion: 5,
    fatigaPercibida: 5,
    entrenamientoRealizado: "",
    duracionRealizada: 0,
    comentario: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [registros, setRegistros] = useState([]);
  const [historialActual, setHistorialActual] = useState(null);

  const sesionesPlanificadas = useMemo(() => {
    const sesiones = historialActual?.semanaGenerada?.sesiones;

    return Array.isArray(sesiones) ? sesiones : [];
  }, [historialActual]);

  const cumplimientoPreview = calcularCumplimientoPreview({
    estadoSesion: formulario.estadoSesion,
    duracionRealizada: formulario.duracionRealizada,
    duracionPlanificada: formulario.duracionPlanificada,
  });

  useEffect(() => {
    cargarDatos();
  }, [atletaId]);

  const cargarDatos = async () => {
    if (!atletaId) return;

    try {
      const [registrosDatos, historialDatos] = await Promise.all([
        obtenerRegistrosPorAtleta(atletaId),
        obtenerHistorialPorAtleta(atletaId),
      ]);

      setRegistros(Array.isArray(registrosDatos) ? registrosDatos : []);
      setHistorialActual(
        Array.isArray(historialDatos) && historialDatos.length > 0
          ? historialDatos[0]
          : null,
      );
    } catch (error) {
      console.error("Error cargando datos de registro:", error);
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  const seleccionarSesionPlanificada = (e) => {
    const index = e.target.value;
    const sesion = index === "" ? null : sesionesPlanificadas[Number(index)];

    if (!sesion) {
      setFormulario({
        ...formulario,
        historialSemanalId: "",
        sesionPlanificadaIndex: "",
        sesionPlanificadaSnapshot: null,
        sesionPlanificadaDia: "",
        sesionPlanificadaCategoria: "",
        sesionPlanificadaNombre: "",
        duracionPlanificada: 0,
        entrenamientoRealizado: "",
        duracionRealizada: 0,
      });
      return;
    }

    const nombre = obtenerNombreSesion(sesion);
    const duracion = Number(sesion.duracion) || 0;

    setFormulario({
      ...formulario,
      historialSemanalId: historialActual?._id || "",
      sesionPlanificadaIndex: index,
      sesionPlanificadaSnapshot: sesion,
      sesionPlanificadaDia: sesion.dia || "",
      sesionPlanificadaCategoria: sesion.categoria || sesion.tipo || "",
      sesionPlanificadaNombre: nombre,
      duracionPlanificada: duracion,
      entrenamientoRealizado: nombre,
      duracionRealizada: duracion,
    });
  };

  const guardarRegistro = async (e) => {
    e.preventDefault();

    if (!atletaId) {
      setMensaje("Debe iniciar sesion");
      return;
    }

    const registro = {
      atletaId,
      ...formulario,
      sueno: Number(formulario.sueno),
      energia: Number(formulario.energia),
      estres: Number(formulario.estres),
      dolorMuscular: Number(formulario.dolorMuscular),
      sensacion: Number(formulario.sensacion),
      fatigaPercibida: Number(formulario.fatigaPercibida),
      duracionPlanificada: Number(formulario.duracionPlanificada),
      duracionRealizada: Number(formulario.duracionRealizada),
    };

    try {
      await crearRegistroDiario(registro);
      await cargarDatos();
      setMensaje("Registro real guardado correctamente.");

      setFormulario({
        sueno: 5,
        energia: 5,
        estres: 5,
        dolorMuscular: 5,
        historialSemanalId: "",
        sesionPlanificadaIndex: "",
        sesionPlanificadaSnapshot: null,
        sesionPlanificadaDia: "",
        sesionPlanificadaCategoria: "",
        sesionPlanificadaNombre: "",
        duracionPlanificada: 0,
        estadoSesion: "completada",
        sensacion: 5,
        fatigaPercibida: 5,
        entrenamientoRealizado: "",
        duracionRealizada: 0,
        comentario: "",
      });
    } catch (error) {
      console.error("Error guardando registro:", error);
      setMensaje("Error al guardar el registro real.");
    }
  };

  if (!atletaId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <section className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold">Debe iniciar sesion</h1>
          <p className="mt-3 text-sm text-slate-400">
            Ingresa para registrar tu entrenamiento real.
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
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
          Registro real
        </p>
        <h1 className="mt-2 text-3xl font-bold">Registro de entrenamiento</h1>

        <p className="mt-3 text-slate-400">
          Selecciona una sesion planificada y registra lo que realmente hiciste.
        </p>

        <form
          onSubmit={guardarRegistro}
          className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <CampoNumero label="Sueno" name="sueno" value={formulario.sueno} onChange={manejarCambio} />
            <CampoNumero label="Energia" name="energia" value={formulario.energia} onChange={manejarCambio} />
            <CampoNumero label="Estres" name="estres" value={formulario.estres} onChange={manejarCambio} />
            <CampoNumero label="Dolor muscular" name="dolorMuscular" value={formulario.dolorMuscular} onChange={manejarCambio} />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-slate-400">
              Sesion planificada
            </label>
            <select
              value={formulario.sesionPlanificadaIndex}
              onChange={seleccionarSesionPlanificada}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white outline-none"
            >
              <option value="">Seleccionar sesion de la semana actual</option>
              {sesionesPlanificadas.map((sesion, index) => (
                <option key={`${sesion.dia || "dia"}-${index}`} value={index}>
                  {sesion.dia || "Sin dia"} - {sesion.categoria || sesion.tipo || "Sesion"} - {sesion.duracion || 0} min
                </option>
              ))}
            </select>
            {!historialActual && (
              <p className="mt-2 text-sm text-yellow-300">
                No hay semana generada todavia. Puedes guardar un registro libre.
              </p>
            )}
          </div>

          {formulario.sesionPlanificadaSnapshot && (
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">
                {formulario.sesionPlanificadaNombre}
              </p>
              <p className="mt-1">
                {formulario.sesionPlanificadaDia || "Sin dia"} - {formulario.sesionPlanificadaCategoria || "Sin categoria"} - Plan: {formulario.duracionPlanificada} min
              </p>
            </div>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <CampoSelect
              label="Estado"
              name="estadoSesion"
              value={formulario.estadoSesion}
              onChange={manejarCambio}
              opciones={[
                { value: "completada", label: "Completada" },
                { value: "parcial", label: "Parcial" },
                { value: "no_realizada", label: "No realizada" },
              ]}
            />

            <CampoNumeroSimple
              label="Duracion real min"
              name="duracionRealizada"
              value={formulario.duracionRealizada}
              onChange={manejarCambio}
            />

            <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3">
              <p className="text-xs text-orange-300">Cumplimiento estimado</p>
              <p className="mt-1 text-2xl font-bold text-orange-100">
                {cumplimientoPreview}%
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <CampoNumero label="Sensacion" name="sensacion" value={formulario.sensacion} onChange={manejarCambio} />
            <CampoNumero label="Fatiga percibida" name="fatigaPercibida" value={formulario.fatigaPercibida} onChange={manejarCambio} />
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm text-slate-400">
              Entrenamiento realizado
            </label>
            <input
              type="text"
              name="entrenamientoRealizado"
              value={formulario.entrenamientoRealizado}
              onChange={manejarCambio}
              placeholder="Ej: Fondo largo, VO2, Recuperacion..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white outline-none"
            />
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm text-slate-400">Comentario</label>
            <textarea
              name="comentario"
              value={formulario.comentario}
              onChange={manejarCambio}
              placeholder="Ej: Recorte por lluvia, buenas piernas, fatiga alta..."
              className="min-h-28 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white outline-none"
            />
          </div>

          <button
            type="submit"
            className="mt-6 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Guardar registro real
          </button>

          {mensaje && <p className="mt-4 text-sm text-slate-300">{mensaje}</p>}
        </form>

        <section className="mt-8">
          <h2 className="mb-4 text-2xl font-bold">Registros guardados</h2>

          {registros.length === 0 ? (
            <p className="text-slate-400">No hay registros diarios todavia.</p>
          ) : (
            <div className="space-y-4">
              {registros.map((registro) => (
                <article
                  key={registro._id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {new Date(registro.fecha).toLocaleDateString()}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {registro.sesionPlanificadaNombre || registro.entrenamientoRealizado || "Registro libre"}
                      </p>
                    </div>

                    <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-300">
                      {registro.cumplimientoSesion ?? 0}%
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-3">
                    <p>Estado: {obtenerEstadoEtiqueta(registro.estadoSesion)}</p>
                    <p>Plan: {registro.duracionPlanificada || 0} min</p>
                    <p>Real: {registro.duracionRealizada || 0} min</p>
                    <p>Sensacion: {registro.sensacion ?? "-"}/10</p>
                    <p>Fatiga: {registro.fatigaPercibida ?? "-"}/10</p>
                    <p>Energia: {registro.energia}/10</p>
                  </div>

                  {registro.comentario && (
                    <p className="mt-3 rounded-xl bg-slate-800 p-3 text-sm text-slate-300">
                      {registro.comentario}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function CampoNumero({ label, name, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">
        {label}: {value}/10
      </label>
      <input
        type="range"
        name={name}
        min="0"
        max="10"
        value={value}
        onChange={onChange}
        className="w-full"
      />
    </div>
  );
}

function CampoNumeroSimple({ label, name, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">{label}</label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white outline-none"
      />
    </div>
  );
}

function CampoSelect({ label, name, value, onChange, opciones }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white outline-none"
      >
        {opciones.map((opcion) => (
          <option key={opcion.value} value={opcion.value}>
            {opcion.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default RegistroPage;
