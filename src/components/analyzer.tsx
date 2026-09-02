"use client";
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileDown,
  Search,
  ShieldAlert,
  Star,
} from "lucide-react";
import type { AnalysisResult, RiskLevel } from "@/types/analysis";

const labels: Record<RiskLevel, string> = {
  safe: "Sem evidências relevantes",
  low: "Baixo risco",
  attention: "Atenção",
  high: "Alto risco",
  critical: "Crítico",
  inconclusive: "Inconclusivo",
};

function persist(result: AnalysisResult) {
  try {
    const current = JSON.parse(
      localStorage.getItem("sentinel-history") || "[]",
    ) as AnalysisResult[];
    localStorage.setItem(
      "sentinel-history",
      JSON.stringify([result, ...current].slice(0, 50)),
    );
  } catch {}
}

export function Analyzer() {
  const [indicator, setIndicator] = useState("");
  const [type, setType] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [favorite, setFavorite] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indicator, type }),
      });
      const payload = (await response.json()) as
        | AnalysisResult
        | { error: string };
      if (!response.ok || "error" in payload)
        throw new Error(
          "error" in payload ? payload.error : "Falha na análise",
        );
      setResult(payload);
      persist(payload);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível concluir a análise.",
      );
    } finally {
      setLoading(false);
    }
  }
  function toggleFavorite() {
    if (!result) return;
    const next = !favorite;
    setFavorite(next);
    try {
      const items = JSON.parse(
        localStorage.getItem("sentinel-favorites") || "[]",
      ) as string[];
      localStorage.setItem(
        "sentinel-favorites",
        JSON.stringify(
          next
            ? [...new Set([result.indicator, ...items])]
            : items.filter((i) => i !== result.indicator),
        ),
      );
    } catch {}
  }
  return (
    <div className="grid gap-6">
      <form onSubmit={submit} className="surface rounded-xl p-5 sm:p-7">
        <div className="flex items-center gap-2">
          <Search size={22} />
          <h2 className="text-xl font-bold">Nova análise</h2>
        </div>
        <p className="muted mt-2">
          Informe um IP público, domínio, URL HTTPS/HTTP, hash ou identificador
          CVE.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <label>
            <span className="label">Indicador</span>
            <input
              className="field mono"
              value={indicator}
              onChange={(e) => setIndicator(e.target.value)}
              placeholder="example.com ou CVE-2024-3094"
              required
              maxLength={2048}
            />
          </label>
          <label>
            <span className="label">Tipo</span>
            <select
              className="field"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="auto">Detectar automaticamente</option>
              <option value="domain">Domínio</option>
              <option value="url">URL</option>
              <option value="ipv4">IPv4</option>
              <option value="ipv6">IPv6</option>
              <option value="sha256">SHA-256</option>
              <option value="cve">CVE</option>
            </select>
          </label>
          <button className="btn btn-primary self-end" disabled={loading}>
            {loading ? (
              <>
                <Clock3 className="animate-spin" size={18} />
                Consultando
              </>
            ) : (
              <>
                Analisar
                <Search size={18} />
              </>
            )}
          </button>
        </div>
        <p className="muted mt-4 text-xs">
          Use apenas em contexto autorizado. Destinos internos e esquemas
          inseguros são bloqueados.
        </p>
      </form>
      {error && (
        <div
          role="alert"
          className="surface flex gap-3 rounded-xl border-l-4 border-l-[var(--danger)] p-5"
        >
          <AlertTriangle className="shrink-0 text-[var(--danger)]" />
          <div>
            <b>Análise não concluída</b>
            <p className="muted mt-1">{error}</p>
          </div>
        </div>
      )}
      {result && (
        <section aria-live="polite" className="grid gap-5">
          <div className="surface rounded-xl p-5 sm:p-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="muted text-sm">Resultado consolidado</p>
                <h2 className="mono mt-1 break-all text-2xl font-bold">
                  {result.indicator}
                </h2>
                <p className="muted mt-2 text-sm">
                  {result.indicatorType.toUpperCase()} ·{" "}
                  {new Date(result.completedAt).toLocaleString("pt-BR")} ·{" "}
                  {result.durationMs} ms
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleFavorite}
                  className="btn"
                  aria-pressed={favorite}
                >
                  <Star size={18} fill={favorite ? "currentColor" : "none"} />
                  {favorite ? "Favorito" : "Favoritar"}
                </button>
                <button onClick={() => window.print()} className="btn">
                  <FileDown size={18} />
                  Relatório
                </button>
              </div>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-[var(--surface-2)] p-5">
                <span className="muted text-sm">Risco</span>
                <div className={`risk-${result.level} mt-1 text-3xl font-bold`}>
                  {result.score ?? "—"}
                  <span className="text-base">/100</span>
                </div>
              </div>
              <div className="rounded-lg bg-[var(--surface-2)] p-5">
                <span className="muted text-sm">Classificação</span>
                <div className={`risk-${result.level} mt-2 font-bold`}>
                  {labels[result.level]}
                </div>
              </div>
              <div className="rounded-lg bg-[var(--surface-2)] p-5">
                <span className="muted text-sm">Confiança</span>
                <div className="mt-1 text-3xl font-bold">
                  {result.confidence}%
                </div>
              </div>
            </div>
            <div className="mt-6">
              <b>Como a pontuação foi formada</b>
              <ul className="muted mt-2 grid gap-1 text-sm">
                {result.reasons.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
              <p className="muted mt-3 text-xs">
                Algoritmo {result.algorithmVersion}. Pontuação e confiança
                representam medidas diferentes.
              </p>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {result.sources.map((source) => (
              <article className="surface rounded-xl p-5" key={source.provider}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {source.status === "success" ? (
                      <CheckCircle2
                        className="text-[var(--success)]"
                        size={19}
                      />
                    ) : (
                      <ShieldAlert
                        className="text-[var(--warning)]"
                        size={19}
                      />
                    )}
                    <h3 className="font-bold">{source.provider}</h3>
                  </div>
                  <span className="muted text-xs">{source.latencyMs} ms</span>
                </div>
                {source.message && (
                  <p className="muted mt-3 text-sm">{source.message}</p>
                )}
                <div className="mt-4 grid gap-3">
                  {source.evidence.map((item) => (
                    <div
                      className="border-l-2 border-[var(--line)] pl-3"
                      key={item.id}
                    >
                      <div className="flex justify-between gap-3">
                        <b className="text-sm">{item.title}</b>
                        <span
                          className={`text-sm font-bold ${item.impact > 0 ? "text-[var(--danger)]" : item.impact < 0 ? "text-[var(--success)]" : "muted"}`}
                        >
                          {item.impact > 0 ? "+" : ""}
                          {item.impact}
                        </span>
                      </div>
                      <p className="muted mt-1 text-sm leading-6">
                        {item.detail}
                      </p>
                      <p className="muted mt-1 text-xs">
                        Dado retornado pela fonte ·{" "}
                        {new Date(item.observedAt).toLocaleTimeString("pt-BR")}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <p className="surface rounded-lg p-4 text-sm">
            <b>Limitação:</b> {result.disclaimer}
          </p>
        </section>
      )}
    </div>
  );
}
