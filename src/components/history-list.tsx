"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Trash2 } from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";
export function HistoryList() {
  const [items, setItems] = useState<AnalysisResult[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  useEffect(() => {
    queueMicrotask(() => {
      try {
        setItems(
          JSON.parse(
            localStorage.getItem("sentinel-history") || "[]",
          ) as AnalysisResult[],
        );
      } catch {}
    });
  }, []);
  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          i.indicator.toLowerCase().includes(query.toLowerCase()) &&
          (type === "all" || i.indicatorType === type),
      ),
    [items, query, type],
  );
  function remove(id: string) {
    if (!confirm("Excluir esta análise do histórico deste dispositivo?"))
      return;
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    localStorage.setItem("sentinel-history", JSON.stringify(next));
  }
  return (
    <div>
      <div className="surface mb-5 grid gap-3 rounded-xl p-4 sm:grid-cols-[1fr_200px]">
        <label>
          <span className="label">Buscar</span>
          <div className="relative">
            <Search className="absolute left-3 top-3.5" size={17} />
            <input
              className="field pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Indicador"
            />
          </div>
        </label>
        <label>
          <span className="label">Tipo</span>
          <select
            className="field"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="domain">Domínio</option>
            <option value="url">URL</option>
            <option value="ipv4">IPv4</option>
            <option value="cve">CVE</option>
            <option value="sha256">SHA-256</option>
          </select>
        </label>
      </div>
      {filtered.length === 0 ? (
        <div className="surface rounded-xl p-10 text-center">
          <b>Nenhuma análise encontrada</b>
          <p className="muted mt-2">Faça uma consulta ou ajuste os filtros.</p>
          <Link className="btn btn-primary mt-5" href="/dashboard">
            Nova análise
          </Link>
        </div>
      ) : (
        <div className="surface overflow-x-auto rounded-xl">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="bg-[var(--surface-2)] text-sm">
              <tr>
                <th className="p-4">Indicador</th>
                <th>Tipo</th>
                <th>Risco</th>
                <th>Confiança</th>
                <th>Data</th>
                <th>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-[var(--line)]">
                  <td className="mono max-w-[280px] truncate p-4">
                    {item.indicator}
                  </td>
                  <td>{item.indicatorType.toUpperCase()}</td>
                  <td className={`risk-${item.level} font-semibold`}>
                    {item.score ?? "—"}/100
                  </td>
                  <td>{item.confidence}%</td>
                  <td>
                    {new Date(item.completedAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td>
                    <button
                      className="btn px-3"
                      onClick={() => remove(item.id)}
                      aria-label={`Excluir ${item.indicator}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
