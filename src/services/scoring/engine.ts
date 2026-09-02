import type { RiskLevel, ScoreResult, SourceResult } from "@/types/analysis";

export const ALGORITHM_VERSION = "1.0.0" as const;

export function levelFor(score: number): RiskLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 35) return "attention";
  if (score >= 15) return "low";
  return "safe";
}

export function calculateScore(sources: SourceResult[]): ScoreResult {
  const responsive = sources.filter(
    (source) => source.status === "success" || source.status === "empty",
  );
  const evidence = responsive
    .flatMap((source) => source.evidence)
    .filter((item) => item.verified);
  if (!responsive.length || !evidence.length) {
    return {
      score: null,
      confidence: 0,
      level: "inconclusive",
      algorithmVersion: ALGORITHM_VERSION,
      reasons: ["Não há evidências verificadas suficientes para pontuar."],
    };
  }
  const raw = evidence.reduce((sum, item) => sum + item.impact, 0);
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const sourceCoverage = responsive.length / Math.max(sources.length, 1);
  const confidence = Math.round(
    Math.min(100, sourceCoverage * 70 + Math.min(evidence.length, 6) * 5),
  );
  const reasons = evidence
    .filter((item) => item.impact !== 0)
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 5)
    .map(
      (item) =>
        `${item.impact > 0 ? "+" : ""}${item.impact}: ${item.title} (${item.source})`,
    );
  return {
    score,
    confidence,
    level: levelFor(score),
    algorithmVersion: ALGORITHM_VERSION,
    reasons: reasons.length
      ? reasons
      : ["As fontes responderam sem sinais relevantes de risco."],
  };
}
