import { isIP } from "node:net";
import { promises as dns } from "node:dns";

function isBlockedIpv4(ip: string) {
  const p = ip.split(".").map(Number);
  return (
    p[0] === 10 ||
    p[0] === 127 ||
    p[0] === 0 ||
    (p[0] === 169 && p[1] === 254) ||
    (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
    (p[0] === 192 && p[1] === 168) ||
    (p[0] === 100 && p[1] >= 64 && p[1] <= 127) ||
    p[0] >= 224
  );
}

function isBlockedIpv6(ip: string) {
  const value = ip.toLowerCase();
  return (
    value === "::" ||
    value === "::1" ||
    value.startsWith("fe80:") ||
    value.startsWith("fc") ||
    value.startsWith("fd") ||
    value.startsWith("ff")
  );
}

export function isBlockedAddress(ip: string) {
  return isIP(ip) === 4
    ? isBlockedIpv4(ip)
    : isIP(ip) === 6
      ? isBlockedIpv6(ip)
      : true;
}

export async function assertSafePublicUrl(input: string) {
  const url = new URL(input);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Esquema de URL não permitido");
  if (url.username || url.password)
    throw new Error("Credenciais na URL não são permitidas");
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (
    ["localhost", "metadata.google.internal"].includes(hostname.toLowerCase())
  )
    throw new Error("Destino interno bloqueado");
  const addresses = isIP(hostname)
    ? [{ address: hostname }]
    : await dns.lookup(hostname, { all: true, verbatim: true });
  if (
    !addresses.length ||
    addresses.some(({ address }) => isBlockedAddress(address))
  )
    throw new Error("Destino privado, local ou reservado bloqueado");
  return { url, addresses: addresses.map((item) => item.address) };
}
