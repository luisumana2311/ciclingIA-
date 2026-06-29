import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function GraficoCumplimiento({ datos }) {
  const datosGrafico = datos.map((semana, index) => ({
    semana: `S${index + 1}`,
    cumplimiento: semana.cumplimiento?.cumplimiento || 0,
  }));

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-2 text-2xl font-bold text-white">
        Cumplimiento histórico
      </h2>

      <p className="mb-6 text-sm text-slate-400">
        Evolución del cumplimiento semanal del plan.
      </p>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datosGrafico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semana" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="cumplimiento" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default GraficoCumplimiento;
