export function resolveApiConfig({
  isDev,
  isProd,
  configuredUrl,
  pageOrigin,
}) {
  const configured = typeof configuredUrl === "string" ? configuredUrl.trim() : "";

  if (!configured) {
    return {
      url: isDev ? "http://localhost:4000" : "",
      enabled: Boolean(isDev),
      invalid: false,
    };
  }

  if (!isProd) {
    return { url: configured, enabled: true, invalid: false };
  }

  try {
    const parsed = new URL(configured, pageOrigin);
    if (parsed.protocol === "https:") {
      return { url: configured, enabled: true, invalid: false };
    }
  } catch {
    // Treat malformed or relative URLs without a valid secure base as disabled.
  }

  return { url: "", enabled: false, invalid: true };
}
