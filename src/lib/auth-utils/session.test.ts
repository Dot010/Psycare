// @vitest-environment node
import { SignJWT } from "jose";
import { beforeEach, describe, expect, it } from "vitest";
import { signSession, verifySession } from "./session";

const SECRET = "x".repeat(40);

describe("session", () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = SECRET;
  });

  it("assina e verifica uma sessão válida", async () => {
    const token = await signSession({ userId: "usr_01", role: "patient" });
    expect(await verifySession(token)).toEqual({ userId: "usr_01", role: "patient" });
  });

  it("rejeita valores forjados (ex.: o antigo cookie 'usr_01')", async () => {
    expect(await verifySession("usr_01")).toBeNull();
    expect(await verifySession(undefined)).toBeNull();
  });

  it("rejeita token assinado com outra chave", async () => {
    const forged = await new SignJWT({ role: "patient" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("usr_01")
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("y".repeat(40)));
    expect(await verifySession(forged)).toBeNull();
  });

  it("rejeita token expirado", async () => {
    const expired = await new SignJWT({ role: "patient" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("usr_01")
      .setExpirationTime(Math.floor(Date.now() / 1000) - 10)
      .sign(new TextEncoder().encode(SECRET));
    expect(await verifySession(expired)).toBeNull();
  });
});
