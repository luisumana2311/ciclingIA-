function MetricCard({ titulo, valor, detalle, color = "blue" }) {
  const colores = {
    green: "border-green-500/70 bg-green-500/5",
    orange: "border-orange-500/70 bg-orange-500/5",
    red: "border-red-500/70 bg-red-500/5",
    blue: "border-blue-500/70 bg-blue-500/5",
  };

  return (
    <div
      className={`rounded-2xl border ${colores[color]} p-4 shadow-lg shadow-slate-950/20`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {titulo}
      </p>

      <h3 className="mt-2 text-2xl font-bold leading-none text-white">
        {valor}
      </h3>

      {detalle && <p className="mt-2 text-sm text-slate-400">{detalle}</p>}
    </div>
  );
}

export default MetricCard;
