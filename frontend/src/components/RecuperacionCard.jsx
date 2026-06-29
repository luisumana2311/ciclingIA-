function RecuperacionCard({ recuperacion }) {
  if (!recuperacion) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-white shadow-lg shadow-slate-950/20">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Recuperacion
          </p>
          <h2 className="mt-2 text-xl font-bold">Estado diario</h2>
        </div>

        <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-semibold text-orange-300">
          {recuperacion.estadoRecuperacion || "Sin dato"}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <MetricaRecuperacion
          titulo="Sueno"
          valor={recuperacion.promedioSueno}
        />

        <MetricaRecuperacion
          titulo="Energia"
          valor={recuperacion.promedioEnergia}
        />

        <MetricaRecuperacion
          titulo="Estres"
          valor={recuperacion.promedioEstres}
        />

        <MetricaRecuperacion
          titulo="Dolor muscular"
          valor={recuperacion.promedioDolorMuscular}
        />
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        Basado en {recuperacion.totalRegistros ?? 0} registros. Entrenos
        realizados: {recuperacion.entrenosRealizados ?? 0}.
      </p>
    </section>
  );
}

function MetricaRecuperacion({ titulo, valor }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
      <p className="text-xs text-slate-500">{titulo}</p>
      <p className="mt-1 text-xl font-bold">{valor ?? 0}/10</p>
    </div>
  );
}

export default RecuperacionCard;
