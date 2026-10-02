interface BuildCspOptions {
  nonce: string;
  isDev: boolean;
  /** DSN do Sentry (opcional). Só o host é liberado em connect-src. */
  sentryDsn?: string;
}

function sentryOrigin(dsn: string | undefined): string | null {
  if (!dsn) return null;
  try {
    return new URL(dsn).origin;
  } catch {
    return null;
  }
}

/**
 * Monta o Content-Security-Policy de uma requisição.
 *
 * - script-src usa nonce + 'strict-dynamic': nenhum script inline/externo roda sem o nonce da requisição.
 * - 'unsafe-eval' só em desenvolvimento (o React usa eval para stack traces no dev).
 * - style-src mantém 'unsafe-inline' de propósito: bibliotecas de UI (toploader, radix) injetam <style>
 *   e bloqueá-los quebraria a interface. O risco de injeção de CSS é bem menor que o de script.
 */
export function buildCsp({ nonce, isDev, sentryDsn }: BuildCspOptions): string {
  const connectSrc = ["'self'"];
  const sentry = sentryOrigin(sentryDsn);
  if (sentry) connectSrc.push(sentry);

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "font-src 'self'",
    `connect-src ${connectSrc.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  if (!isDev) directives.push("upgrade-insecure-requests");

  return directives.join("; ");
}
