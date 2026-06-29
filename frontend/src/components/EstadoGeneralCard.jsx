function EstadoGeneralCard({ estado, colorEstado, descripcion }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-slate-950/20">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Estado general
      </p>

      <div className="mt-3 flex items-center gap-3">
        <span className={`h-3 w-3 rounded-full ${colorEstado}`} />

        <h2 className="text-xl font-bold">{estado}</h2>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-300">{descripcion}</p>
    </section>
  );
}

export default EstadoGeneralCard;
