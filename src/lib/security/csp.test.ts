import { describe, expect, it } from "vitest";
import { buildCsp } from "./csp";

describe("buildCsp", () => {
  const base = { nonce: "abc123", isDev: false };

  it("inclui o nonce e strict-dynamic em script-src, sem unsafe-inline/unsafe-eval", () => {
    const csp = buildCsp(base);
    const scriptSrc = csp.split("; ").find((d) => d.startsWith("script-src"));
    expect(scriptSrc).toContain("'nonce-abc123'");
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
  });

  it("permite unsafe-eval apenas em desenvolvimento", () => {
    expect(buildCsp({ ...base, isDev: true })).toContain("'unsafe-eval'");
    expect(buildCsp(base)).not.toContain("'unsafe-eval'");
  });

  it("libera só a origem do Sentry em connect-src quando há DSN", () => {
    const csp = buildCsp({ ...base, sentryDsn: "https://key@o123.ingest.us.sentry.io/456" });
    expect(csp).toContain("connect-src 'self' https://o123.ingest.us.sentry.io");
  });

  it("ignora DSN inválido ou ausente", () => {
    expect(buildCsp({ ...base, sentryDsn: "isso-nao-e-url" })).toContain("connect-src 'self';");
    expect(buildCsp(base)).toContain("connect-src 'self';");
  });

  it("bloqueia framing, objetos e base-uri externos", () => {
    const csp = buildCsp(base);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
  });

  it("só força upgrade-insecure-requests em produção", () => {
    expect(buildCsp(base)).toContain("upgrade-insecure-requests");
    expect(buildCsp({ ...base, isDev: true })).not.toContain("upgrade-insecure-requests");
  });
});
