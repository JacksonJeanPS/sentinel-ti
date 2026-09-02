export async function fetchJson(
  url: string,
  init: RequestInit = {},
  timeoutMs = 8000,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "Sentinel-TI/1.0",
        ...init.headers,
      },
      cache: "no-store",
    });
    if (response.status === 429)
      throw Object.assign(new Error("Limite da fonte atingido"), { code: 429 });
    if (!response.ok)
      throw new Error(`Fonte respondeu HTTP ${response.status}`);
    return {
      data: (await response.json()) as unknown,
      latencyMs: Date.now() - started,
    };
  } finally {
    clearTimeout(timeout);
  }
}
