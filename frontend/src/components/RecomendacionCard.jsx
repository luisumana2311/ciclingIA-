function RecomendacionCard({ mensaje }) {
  return (
    <section className="rounded-2xl border border-orange-500/20 bg-slate-900 p-5 shadow-lg shadow-slate-950/20">
      <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
        Entrenador
      </p>
      <h2 className="mt-2 text-xl font-bold">Recomendacion</h2>

      <p className="mt-3 text-sm leading-6 text-slate-300">{mensaje}</p>
    </section>
  );
}

export default RecomendacionCard;
