import { isIP } from "node:net";
import { z } from "zod";
import type { IndicatorType } from "@/types/analysis";

const domainPattern =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
const cvePattern = /^CVE-\d{4}-\d{4,}$/i;
const hexPattern = /^[a-f0-9]+$/i;

export const analysisInputSchema = z.object({
  indicator: z.string().trim().min(2).max(2048),
  type: z
    .enum([
      "auto",
      "ipv4",
      "ipv6",
      "domain",
      "url",
      "md5",
      "sha1",
      "sha256",
      "cve",
    ])
    .default("auto"),
});

export function detectIndicatorType(value: string): IndicatorType | null {
  const input = value.trim();
  if (isIP(input) === 4) return "ipv4";
  if (isIP(input) === 6) return "ipv6";
  if (cvePattern.test(input)) return "cve";
  if (hexPattern.test(input)) {
    if (input.length === 32) return "md5";
    if (input.length === 40) return "sha1";
    if (input.length === 64) return "sha256";
  }
  try {
    const url = new URL(input);
    if (
      ["http:", "https:"].includes(url.protocol) &&
      domainPattern.test(url.hostname)
    )
      return "url";
  } catch {}
  if (domainPattern.test(input.toLowerCase())) return "domain";
  return null;
}

export function normalizeIndicator(value: string, type: IndicatorType): string {
  const input = value.trim();
  if (type === "domain") return input.toLowerCase().replace(/\.$/, "");
  if (type === "url") {
    const url = new URL(input);
    url.hash = "";
    return url.toString();
  }
  if (type === "cve") return input.toUpperCase();
  return input.toLowerCase();
}
