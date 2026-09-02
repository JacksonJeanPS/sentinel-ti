import { Activity, Database, History, Star } from "lucide-react";
import { Analyzer } from "@/components/analyzer";
export const metadata = { title: "Dashboard" };
export default function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-[var(--accent)]">
          Centro de análise
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-[-.025em]">
          Investigue um indicador
        </h1>
        <p className="muted mt-2">
          As fontes são consultadas de forma independente; indisponibilidades
          aparecem no resultado.
        </p>
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [Activity, "Análises", "Histórico individual"],
          [Star, "Favoritos", "Acesso rápido"],
          [Database, "Fontes", "Status por consulta"],
          [History, "Retenção", "90 dias sugeridos"],
        ].map(([Icon, title, text]) => (
          <div key={String(title)} className="surface rounded-lg p-4">
            <Icon size={19} />
            <b className="mt-3 block">{String(title)}</b>
            <span className="muted text-sm">{String(text)}</span>
          </div>
        ))}
      </div>
      <Analyzer />
    </div>
  );
}
