import { describe, expect, it } from "vitest";
import { calculateScore } from "@/services/scoring/engine";
import type { SourceResult } from "@/types/analysis";
const source = (
  impact: number,
  status: SourceResult["status"] = "success",
): SourceResult => ({
  provider: "Teste",
  status,
  collectedAt: new Date(0).toISOString(),
  latencyMs: 10,
  evidence:
    status === "success"
      ? [
          {
            id: "1",
            source: "Teste",
            title: "Sinal",
            detail: "Evidência",
            impact,
            kind: impact > 0 ? "negative" : "positive",
            observedAt: new Date(0).toISOString(),
            verified: true,
          },
        ]
      : [],
});
describe("motor de risco", () => {
  it("classifica evidência crítica", () =>
    expect(calculateScore([source(90)]).level).toBe("critical"));
  it("separa confiança da pontuação", () => {
    const result = calculateScore([source(60), source(0, "unavailable")]);
    expect(result.score).toBe(60);
    expect(result.confidence).toBeLessThan(100);
  });
  it("não inventa risco sem evidência", () =>
    expect(calculateScore([source(0, "empty")]).level).toBe("inconclusive"));
  it("limita a faixa", () =>
    expect(calculateScore([source(500)]).score).toBe(100));
});
