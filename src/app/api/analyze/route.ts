import { NextRequest, NextResponse } from "next/server";
import {
  analysisInputSchema,
  detectIndicatorType,
  normalizeIndicator,
} from "@/lib/validation/indicator";
import { assertSafePublicUrl, isBlockedAddress } from "@/lib/security/ssrf";
import { providersFor } from "@/services/providers";
import { calculateScore } from "@/services/scoring/engine";
import type { AnalysisResult, IndicatorType } from "@/types/analysis";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
const rateWindow = new Map<string, { count: number; reset: number }>();

export async function POST(request: NextRequest) {
  const started = Date.now();
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    if (!user && process.env.NEXT_PUBLIC_SUPABASE_URL)
      return NextResponse.json(
        { error: "Sessão necessária para iniciar uma análise." },
        { status: 401 },
      );
    const key =
      user?.id ??
      request.headers.get("x-forwarded-for")?.split(",")[0] ??
      "anonymous";
    const window = rateWindow.get(key);
    const time = Date.now();
    if (window && window.reset > time && window.count >= 12)
      return NextResponse.json(
        {
          error:
            "Limite temporário de análises atingido. Tente novamente em alguns minutos.",
        },
        { status: 429 },
      );
    rateWindow.set(
      key,
      !window || window.reset <= time
        ? { count: 1, reset: time + 10 * 60_000 }
        : { ...window, count: window.count + 1 },
    );
    const body = analysisInputSchema.parse(await request.json());
    const detected = detectIndicatorType(body.indicator);
    const type = (
      body.type === "auto" ? detected : body.type
    ) as IndicatorType | null;
    if (!type)
      return NextResponse.json(
        { error: "Não foi possível identificar o indicador." },
        { status: 400 },
      );
    const indicator = normalizeIndicator(body.indicator, type);
    if ((type === "ipv4" || type === "ipv6") && isBlockedAddress(indicator))
      return NextResponse.json(
        {
          error:
            "Endereços privados, locais ou reservados não podem ser consultados.",
        },
        { status: 400 },
      );
    if (type === "url") await assertSafePublicUrl(indicator);
    const sources = await Promise.all(providersFor(indicator, type));
    const score = calculateScore(sources);
    const failed = sources.filter(
      (source) => !["success", "empty"].includes(source.status),
    ).length;
    const result: AnalysisResult = {
      id: crypto.randomUUID(),
      indicator,
      indicatorType: type,
      ...score,
      status:
        failed === sources.length ? "failed" : failed ? "partial" : "completed",
      startedAt: new Date(started).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      sources,
      disclaimer:
        "O Sentinel TI apoia a triagem e não substitui investigação humana. Ausência de evidências não comprova segurança.",
    };
    if (supabase && user) {
      const { error: insertError } = await supabase
        .from("analyses")
        .insert({
          id: result.id,
          user_id: user.id,
          indicator,
          indicator_type: type,
          status: result.status,
          risk_score: result.score,
          confidence: result.confidence,
          risk_level: result.level,
          algorithm_version: result.algorithmVersion,
          duration_ms: result.durationMs,
          summary: { reasons: result.reasons, disclaimer: result.disclaimer },
          completed_at: result.completedAt,
        });
      if (!insertError)
        await supabase
          .from("analysis_sources")
          .insert(
            sources.map((source) => ({
              analysis_id: result.id,
              user_id: user.id,
              provider: source.provider,
              status: source.status,
              latency_ms: source.latencyMs,
              evidence: source.evidence,
              error_code: source.status === "success" ? null : source.status,
              collected_at: source.collectedAt,
              expires_at: new Date(Date.now() + 90 * 86400_000).toISOString(),
            })),
          );
    }
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Entrada inválida";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
