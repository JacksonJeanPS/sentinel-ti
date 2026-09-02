import tls from "node:tls";
import type { IndicatorType, SourceResult } from "@/types/analysis";
import { fetchJson } from "./http";

const now = () => new Date().toISOString();
const evidence = (
  source: string,
  title: string,
  detail: string,
  impact = 0,
  kind: "positive" | "negative" | "neutral" = "neutral",
) => ({
  id: crypto.randomUUID(),
  source,
  title,
  detail,
  impact,
  kind,
  observedAt: now(),
  verified: true,
});

async function safely(
  provider: string,
  task: () => Promise<Omit<SourceResult, "provider" | "collectedAt">>,
): Promise<SourceResult> {
  const started = Date.now();
  try {
    return { provider, collectedAt: now(), ...(await task()) };
  } catch (error) {
    const rate =
      typeof error === "object" &&
      error &&
      "code" in error &&
      error.code === 429;
    return {
      provider,
      status: rate ? "rate_limited" : "unavailable",
      collectedAt: now(),
      latencyMs: Date.now() - started,
      evidence: [],
      message: rate
        ? "Limite temporário da fonte atingido."
        : error instanceof Error
          ? error.message
          : "Fonte indisponível",
    };
  }
}

export async function dnsProvider(domain: string): Promise<SourceResult> {
  return safely("Google DNS over HTTPS", async () => {
    const { data, latencyMs } = await fetchJson(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`,
    );
    const payload = data as {
      Status?: number;
      Answer?: { data: string; type: number }[];
    };
    const answers =
      payload.Answer?.filter((item) => item.type === 1).map(
        (item) => item.data,
      ) ?? [];
    return {
      status: answers.length ? "success" : "empty",
      latencyMs,
      evidence: [
        evidence(
          "Google DNS",
          answers.length ? "Registros A resolvidos" : "Sem registro A",
          answers.length
            ? answers.join(", ")
            : "A fonte não retornou endereços IPv4.",
          0,
        ),
      ],
      rawSummary: { addresses: answers, dnsStatus: payload.Status },
    };
  });
}

export async function rdapProvider(
  indicator: string,
  type: IndicatorType,
): Promise<SourceResult> {
  return safely("RDAP", async () => {
    const endpoint =
      type === "ipv4" || type === "ipv6"
        ? `https://rdap.org/ip/${encodeURIComponent(indicator)}`
        : `https://rdap.org/domain/${encodeURIComponent(indicator)}`;
    const { data, latencyMs } = await fetchJson(endpoint);
    const payload = data as {
      name?: string;
      handle?: string;
      country?: string;
      events?: { eventAction: string; eventDate: string }[];
    };
    const created = payload.events?.find(
      (item) => item.eventAction === "registration",
    )?.eventDate;
    return {
      status: "success",
      latencyMs,
      evidence: [
        evidence(
          "RDAP",
          "Registro localizado",
          [
            payload.name || payload.handle,
            payload.country,
            created && `registrado em ${created}`,
          ]
            .filter(Boolean)
            .join(" · ") || "Registro público disponível.",
          0,
        ),
      ],
      rawSummary: {
        name: payload.name,
        handle: payload.handle,
        country: payload.country,
        registeredAt: created,
      },
    };
  });
}

export async function nvdProvider(cve: string): Promise<SourceResult> {
  return safely("NVD/NIST", async () => {
    const { data, latencyMs } = await fetchJson(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${encodeURIComponent(cve)}`,
      {},
      12000,
    );
    const payload = data as {
      vulnerabilities?: Array<{
        cve?: {
          descriptions?: Array<{ lang: string; value: string }>;
          metrics?: Record<
            string,
            Array<{ cvssData?: { baseScore?: number; baseSeverity?: string } }>
          >;
        };
      }>;
    };
    const cveData = payload.vulnerabilities?.[0]?.cve;
    if (!cveData)
      return {
        status: "empty",
        latencyMs,
        evidence: [],
        message: "CVE não localizada na NVD.",
      };
    const metric = Object.values(cveData.metrics ?? {}).flat()[0]?.cvssData;
    const score = metric?.baseScore ?? 0;
    const description =
      cveData.descriptions?.find((item) => item.lang === "en")?.value ??
      "Registro localizado.";
    return {
      status: "success",
      latencyMs,
      evidence: [
        evidence(
          "NVD/NIST",
          `CVSS ${score || "não informado"} — ${metric?.baseSeverity ?? "sem severidade"}`,
          description.slice(0, 500),
          score >= 9 ? 75 : score >= 7 ? 55 : score >= 4 ? 30 : 5,
          score >= 7 ? "negative" : "neutral",
        ),
      ],
      rawSummary: { cvss: score, severity: metric?.baseSeverity, description },
    };
  });
}

export async function tlsProvider(domain: string): Promise<SourceResult> {
  return safely(
    "TLS",
    () =>
      new Promise((resolve, reject) => {
        const started = Date.now();
        const socket = tls.connect(
          {
            host: domain,
            port: 443,
            servername: domain,
            rejectUnauthorized: false,
            timeout: 7000,
          },
          () => {
            const cert = socket.getPeerCertificate();
            const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
            const authorized = socket.authorized;
            socket.end();
            const expired = Boolean(validTo && validTo.getTime() < Date.now());
            resolve({
              status: "success",
              latencyMs: Date.now() - started,
              evidence: [
                evidence(
                  "TLS",
                  authorized && !expired
                    ? "Certificado válido"
                    : "Certificado requer atenção",
                  `${cert.subject?.CN ?? domain} · expira em ${validTo?.toISOString() ?? "data desconhecida"}${socket.authorizationError ? ` · ${socket.authorizationError}` : ""}`,
                  expired ? 45 : authorized ? -5 : 25,
                  authorized && !expired ? "positive" : "negative",
                ),
              ],
              rawSummary: {
                subject: cert.subject?.CN,
                issuer: cert.issuer?.O,
                validTo: validTo?.toISOString(),
                authorized,
              },
            });
          },
        );
        socket.once("timeout", () =>
          socket.destroy(new Error("Tempo limite na conexão TLS")),
        );
        socket.once("error", reject);
      }),
  );
}

export async function abuseIpDbProvider(ip: string): Promise<SourceResult> {
  if (!process.env.ABUSEIPDB_API_KEY)
    return {
      provider: "AbuseIPDB",
      status: "unavailable",
      collectedAt: now(),
      latencyMs: 0,
      evidence: [],
      message: "Provedor não configurado.",
    };
  return safely("AbuseIPDB", async () => {
    const { data, latencyMs } = await fetchJson(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90&verbose=true`,
      { headers: { Key: process.env.ABUSEIPDB_API_KEY! } },
    );
    const item = (
      data as {
        data?: {
          abuseConfidenceScore?: number;
          totalReports?: number;
          lastReportedAt?: string;
        };
      }
    ).data;
    const score = item?.abuseConfidenceScore ?? 0;
    return {
      status: "success",
      latencyMs,
      evidence: [
        evidence(
          "AbuseIPDB",
          `Confiança de abuso: ${score}%`,
          `${item?.totalReports ?? 0} denúncia(s) nos últimos 90 dias.`,
          score >= 75 ? 55 : score >= 25 ? 25 : score ? 10 : -5,
          score ? "negative" : "positive",
        ),
      ],
      rawSummary: {
        abuseConfidenceScore: score,
        totalReports: item?.totalReports,
        lastReportedAt: item?.lastReportedAt,
      },
    };
  });
}

export async function virusTotalProvider(
  indicator: string,
  type: IndicatorType,
): Promise<SourceResult> {
  if (!process.env.VIRUSTOTAL_API_KEY)
    return {
      provider: "VirusTotal",
      status: "unavailable",
      collectedAt: now(),
      latencyMs: 0,
      evidence: [],
      message: "Provedor não configurado.",
    };
  return safely("VirusTotal", async () => {
    const collection =
      type.startsWith("sha") || type === "md5"
        ? "files"
        : type === "ipv4" || type === "ipv6"
          ? "ip_addresses"
          : "domains";
    const value = type === "url" ? new URL(indicator).hostname : indicator;
    const { data, latencyMs } = await fetchJson(
      `https://www.virustotal.com/api/v3/${collection}/${encodeURIComponent(value)}`,
      { headers: { "x-apikey": process.env.VIRUSTOTAL_API_KEY! } },
    );
    const stats =
      (
        data as {
          data?: {
            attributes?: { last_analysis_stats?: Record<string, number> };
          };
        }
      ).data?.attributes?.last_analysis_stats ?? {};
    const malicious = stats.malicious ?? 0;
    const suspicious = stats.suspicious ?? 0;
    return {
      status: "success",
      latencyMs,
      evidence: [
        evidence(
          "VirusTotal",
          `${malicious} detecção(ões) maliciosa(s)`,
          `${suspicious} mecanismo(s) classificaram como suspeito.`,
          malicious ? Math.min(70, 25 + malicious * 5) : suspicious ? 20 : -5,
          malicious || suspicious ? "negative" : "positive",
        ),
      ],
      rawSummary: stats,
    };
  });
}

export function providersFor(indicator: string, type: IndicatorType) {
  const domain = type === "url" ? new URL(indicator).hostname : indicator;
  if (type === "cve") return [nvdProvider(indicator)];
  if (type === "domain" || type === "url")
    return [
      dnsProvider(domain),
      rdapProvider(domain, "domain"),
      tlsProvider(domain),
      virusTotalProvider(indicator, type),
    ];
  if (type === "ipv4" || type === "ipv6")
    return [
      rdapProvider(indicator, type),
      abuseIpDbProvider(indicator),
      virusTotalProvider(indicator, type),
    ];
  return [virusTotalProvider(indicator, type)];
}
