import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

const normalizarTexto = (texto = "") => {
  return texto
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const obtenerCategoria = (sesion = {}) => {
  return sesion.categoria || sesion.tipo || "Sesion";
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

  return `${codigo} - ${desde}-${hasta} ${unidad}`.trim();
};

const obtenerZonaPrincipal = (sesion = {}) => {
  const bloques = obtenerBloques(sesion);
  const bloquePrincipal =
    bloques.find((bloque) => bloque.tipo === "principal" && bloque.zonaSugerida) ||
    bloques.find((bloque) => bloque.zonaSugerida);

  return formatearZonaSugerida(bloquePrincipal?.zonaSugerida);
};

const calcularDuracionBloque = (bloque = {}) => {
  const trabajo = (bloque.duracionMin || 0) * (bloque.repeticiones || 1);
  const recuperacion =
    (bloque.recuperacionMin || 0) * (bloque.repeticiones || 0);

  return trabajo + recuperacion;
};

const formatearDuracionBloque = (bloque = {}) => {
  if (bloque.repeticiones && bloque.duracionMin) {
    return `${bloque.repeticiones} x ${bloque.duracionMin} min`;
  }

  if (bloque.duracionMin) {
    return `${bloque.duracionMin} min`;
  }

  return "Sin duracion";
};

const obtenerFraseMotivacional = (categoria = "") => {
  const normalizada = normalizarTexto(categoria);

  if (normalizada.includes("recuperacion")) {
    return "Hoy el objetivo es asimilar el trabajo y llegar mas fuerte manana.";
  }

  if (normalizada.includes("resistencia")) {
    return "Construye tu motor con paciencia; la base se gana minuto a minuto.";
  }

  if (normalizada.includes("tempo")) {
    return "Controla el ritmo, respira profundo y manten la constancia.";
  }

  if (normalizada.includes("umbral")) {
    return "Trabajo duro y controlado: quedate cerca del limite, no por encima.";
  }

  if (normalizada.includes("fondo")) {
    return "La resistencia se construye con calma, nutricion y disciplina.";
  }

  if (normalizada.includes("vo2")) {
    return "Intervalos intensos, mente firme y ejecucion precisa.";
  }

  return "Ejecuta con calma, escucha el cuerpo y cumple el objetivo del dia.";
};

const leerSesionSeleccionada = () => {
  try {
    const sesionGuardada = sessionStorage.getItem("sesionSeleccionada");

    return sesionGuardada ? JSON.parse(sesionGuardada) : null;
  } catch (error) {
    console.error("Error leyendo sesion seleccionada:", error);
    return null;
  }
};

function DetalleSesionPage() {
  const navigate = useNavigate();
  const { index } = useParams();
  const sesion = useMemo(leerSesionSeleccionada, []);

  if (!sesion) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <section className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl shadow-slate-950/30">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
            Entrenamiento
          </p>
          <h1 className="mt-2 text-2xl font-bold">
            No hay entrenamiento seleccionado
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Vuelve al Dashboard y abre una sesion desde la semana actual.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            Volver al Dashboard
          </button>
        </section>
      </main>
    );
  }

  const categoria = obtenerCategoria(sesion);
  const nombreEntrenamiento = obtenerNombreEntrenamiento(sesion);
  const tss = obtenerTSS(sesion);
  const factorIntensidad = obtenerIF(sesion);
  const objetivoFisiologico = obtenerObjetivoFisiologico(sesion);
  const nutricion = obtenerNutricionSugerida(sesion);
  const bloques = obtenerBloques(sesion);
  const zonaPrincipal = obtenerZonaPrincipal(sesion);
  const fraseMotivacional = obtenerFraseMotivacional(categoria);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-orange-500/50 hover:text-white"
        >
          Volver al Dashboard
        </button>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-slate-950/30 lg:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                Sesion {index ?? ""}
              </p>
              <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
                {nombreEntrenamiento}
              </h1>
              <p className="mt-3 text-sm text-slate-400">
                {sesion.dia || "Sin dia"} - {categoria}
              </p>
            </div>

            <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-lg font-bold text-orange-300">
              {sesion.duracion ?? 0} min
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 text-orange-100">
            {fraseMotivacional}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {tss !== null && <DatoDetalle titulo="TSS" valor={tss} />}
          {factorIntensidad !== null && (
            <DatoDetalle titulo="IF" valor={factorIntensidad} />
          )}
          {objetivoFisiologico && (
            <DatoDetalle titulo="Objetivo" valor={objetivoFisiologico} />
          )}
          {zonaPrincipal && <DatoDetalle titulo="Zona principal" valor={zonaPrincipal} />}
          <DatoDetalle titulo="Categoria" valor={categoria} />
        </section>

        <NutricionDetalle nutricion={nutricion} duracion={sesion.duracion ?? 0} />

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                Estructura
              </p>
              <h2 className="mt-1 text-2xl font-bold">Bloques del entrenamiento</h2>
            </div>

            <span className="rounded-full bg-slate-950 px-3 py-1 text-sm text-slate-400">
              {bloques.length} bloques
            </span>
          </div>

          {bloques.length === 0 ? (
            <p className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-500">
              Sin estructura detallada.
            </p>
          ) : (
            <div className="space-y-3">
              {bloques.map((bloque, bloqueIndex) => (
                <BloqueDetalle
                  key={`${bloque.nombre || "bloque"}-${bloqueIndex}`}
                  bloque={bloque}
                  index={bloqueIndex}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function DatoDetalle({ titulo, valor }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs text-slate-500">{titulo}</p>
      <p className="mt-1 text-lg font-bold text-white">{valor}</p>
    </div>
  );
}

function NutricionDetalle({ nutricion, duracion = 0 }) {
  if (!nutricion) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-500">
        Sin nutricion sugerida para esta sesion.
      </section>
    );
  }

  const esRequerida = Number(duracion) > 120;

  return (
    <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            {esRequerida ? "Nutricion requerida" : "Nutricion opcional"}
          </p>
          <h2 className="mt-1 text-xl font-bold text-emerald-50">
            Plan de energia
          </h2>
        </div>

        {nutricion.gramosCHOTotales !== undefined && (
          <span className="rounded-full bg-slate-950 px-3 py-1 text-sm font-semibold text-emerald-200">
            {nutricion.gramosCHOTotales} g CHO total
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {nutricion.gramosCHOHora !== undefined && (
          <DatoDetalle titulo="CHO/h" valor={`${nutricion.gramosCHOHora} g`} />
        )}
        {nutricion.hidratacionMlHora !== undefined && (
          <DatoDetalle
            titulo="Liquidos/h"
            valor={`${nutricion.hidratacionMlHora} ml`}
          />
        )}
        {nutricion.gramosCHOTotales !== undefined && (
          <DatoDetalle
            titulo="CHO total"
            valor={`${nutricion.gramosCHOTotales} g`}
          />
        )}
      </div>

      {nutricion.resumen && (
        <p className="mt-4 text-sm leading-6 text-emerald-100/80">
          {nutricion.resumen}
        </p>
      )}
    </section>
  );
}

function BloqueDetalle({ bloque = {}, index }) {
  const zona = formatearZonaSugerida(bloque.zonaSugerida);
  const recuperacion = formatearZonaSugerida(bloque.recuperacionSugerida);

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Bloque {index + 1}
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-100">
            {bloque.nombre || "Bloque"}
          </h3>
          <p className="mt-1 text-sm capitalize text-slate-500">
            {bloque.tipo || "estructura"}
          </p>
        </div>

        <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-slate-300">
          {formatearDuracionBloque(bloque)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-300">
          Total: {calcularDuracionBloque(bloque)} min
        </span>

        {zona && (
          <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 font-semibold text-orange-300">
            {zona}
          </span>
        )}

        {bloque.recuperacionMin && (
          <span className="rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-300">
            Rec: {bloque.recuperacionMin} min
          </span>
        )}

        {recuperacion && (
          <span className="rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-400">
            Rec zona: {recuperacion}
          </span>
        )}
      </div>

      {bloque.descripcion && (
        <p className="mt-4 text-sm leading-6 text-slate-400">
          {bloque.descripcion}
        </p>
      )}
    </article>
  );
}

export default DetalleSesionPage;
