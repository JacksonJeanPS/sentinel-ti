import { describe, expect, it } from "vitest";
import { assertSafePublicUrl, isBlockedAddress } from "@/lib/security/ssrf";
describe("proteção SSRF", () => {
  it.each([
    "127.0.0.1",
    "10.0.0.1",
    "172.16.1.2",
    "192.168.1.1",
    "169.254.169.254",
    "::1",
    "fe80::1",
    "fd00::1",
  ])("bloqueia %s", (ip) => expect(isBlockedAddress(ip)).toBe(true));
  it("aceita IP público", () =>
    expect(isBlockedAddress("8.8.8.8")).toBe(false));
  it("bloqueia esquemas não HTTP", async () =>
    await expect(assertSafePublicUrl("file:///etc/passwd")).rejects.toThrow());
  it("bloqueia localhost", async () =>
    await expect(
      assertSafePublicUrl("http://localhost/admin"),
    ).rejects.toThrow());
});
