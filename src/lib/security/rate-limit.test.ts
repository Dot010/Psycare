import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimits } from "./rate-limit";

const rule = { limit: 3, windowMs: 60_000 };

describe("checkRateLimit", () => {
  beforeEach(() => resetRateLimits());

  it("libera até o limite e bloqueia a tentativa seguinte", () => {
    expect(checkRateLimit("a", rule, 0).allowed).toBe(true);
    expect(checkRateLimit("a", rule, 1000).allowed).toBe(true);
    expect(checkRateLimit("a", rule, 2000).allowed).toBe(true);
    const blocked = checkRateLimit("a", rule, 3000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBe(57);
  });

  it("libera de novo quando a janela passa", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("a", rule, i);
    expect(checkRateLimit("a", rule, 30_000).allowed).toBe(false);
    expect(checkRateLimit("a", rule, 60_001).allowed).toBe(true);
  });

  it("conta cada chave separadamente", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("a", rule, i);
    expect(checkRateLimit("a", rule, 10).allowed).toBe(false);
    expect(checkRateLimit("b", rule, 10).allowed).toBe(true);
  });

  it("tentativas bloqueadas não estendem o bloqueio", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("a", rule, 0);
    for (let i = 0; i < 10; i++) checkRateLimit("a", rule, 30_000);
    expect(checkRateLimit("a", rule, 60_001).allowed).toBe(true);
  });
});
