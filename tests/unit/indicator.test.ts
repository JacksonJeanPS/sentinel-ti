import { describe, expect, it } from "vitest";
import {
  detectIndicatorType,
  normalizeIndicator,
} from "@/lib/validation/indicator";
describe("detecção de indicadores", () => {
  it.each([
    ["8.8.8.8", "ipv4"],
    ["2001:4860:4860::8888", "ipv6"],
    ["example.com", "domain"],
    ["https://example.com/path", "url"],
    ["d41d8cd98f00b204e9800998ecf8427e", "md5"],
    ["da39a3ee5e6b4b0d3255bfef95601890afd80709", "sha1"],
    [
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "sha256",
    ],
    ["CVE-2024-3094", "cve"],
  ])("detecta %s", (input, type) =>
    expect(detectIndicatorType(input)).toBe(type),
  );
  it("rejeita texto ambíguo", () =>
    expect(detectIndicatorType("qualquer coisa")).toBeNull());
  it("normaliza domínio", () =>
    expect(normalizeIndicator("Example.COM.", "domain")).toBe("example.com"));
});
