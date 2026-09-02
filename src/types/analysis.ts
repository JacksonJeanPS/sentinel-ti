export type IndicatorType =
  | "ipv4"
  | "ipv6"
  | "domain"
  | "url"
  | "md5"
  | "sha1"
  | "sha256"
  | "cve";
export type RiskLevel =
  | "safe"
  | "low"
  | "attention"
  | "high"
  | "critical"
  | "inconclusive";
export type SourceStatus = "success" | "empty" | "unavailable" | "rate_limited";

export interface Evidence {
  id: string;
  source: string;
  title: string;
  detail: string;
  impact: number;
  kind: "positive" | "negative" | "neutral";
  observedAt: string;
  verified: boolean;
}

export interface SourceResult {
  provider: string;
  status: SourceStatus;
  collectedAt: string;
  latencyMs: number;
  evidence: Evidence[];
  message?: string;
  rawSummary?: Record<string, unknown>;
}

export interface ScoreResult {
  score: number | null;
  confidence: number;
  level: RiskLevel;
  algorithmVersion: "1.0.0";
  reasons: string[];
}

export interface AnalysisResult extends ScoreResult {
  id: string;
  indicator: string;
  indicatorType: IndicatorType;
  status: "completed" | "partial" | "failed";
  startedAt: string;
  completedAt: string;
  durationMs: number;
  sources: SourceResult[];
  disclaimer: string;
}
