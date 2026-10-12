/**
 * Limite de tentativas em memória (janela deslizante).
 *
 * Vale para uma instância do servidor: protege a demonstração contra robôs simples.
 * Quando houver backend e várias instâncias, troque o armazenamento por um serviço compartilhado
 * (por exemplo Redis), mantendo esta mesma interface.
 */
const hits = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  /** Segundos até a próxima tentativa liberada (0 quando permitido). */
  retryAfter: number;
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
  now: number = Date.now(),
): RateLimitResult {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return { allowed: false, retryAfter: Math.ceil((recent[0] + windowMs - now) / 1000) };
  }

  recent.push(now);
  hits.set(key, recent);

  // evita crescer sem limite: descarta chaves antigas de vez em quando
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }

  return { allowed: true, retryAfter: 0 };
}

export function resetRateLimits() {
  hits.clear();
}
