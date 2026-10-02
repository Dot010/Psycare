// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const set = vi.fn();
vi.mock("next/headers", () => ({
  cookies: async () => ({ set, delete: vi.fn() }),
}));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { loginAction, registerAction } from "./actions";

const validLogin = { email: "ana@example.com", password: "123456" };

describe("auth actions", () => {
  beforeEach(() => {
    set.mockClear();
    process.env.SESSION_SECRET = "x".repeat(40);
    delete process.env.DEMO_MODE;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("recusa login e não cria cookie quando DEMO_MODE não está ligado", async () => {
    const result = await loginAction(validLogin);
    expect(result.success).toBe(false);
    expect(set).not.toHaveBeenCalled();
  });

  it("recusa registro quando DEMO_MODE não está ligado", async () => {
    const result = await registerAction({
      name: "Ana Souza",
      ...validLogin,
      confirmPassword: "123456",
    });
    expect(result.success).toBe(false);
    expect(set).not.toHaveBeenCalled();
  });

  it("em modo demo, cria cookie httpOnly com token assinado (não o id cru)", async () => {
    process.env.DEMO_MODE = "true";
    const result = await loginAction(validLogin);
    expect(result.success).toBe(true);
    expect(set).toHaveBeenCalledTimes(1);
    const [name, value, options] = set.mock.calls[0];
    expect(name).toBe("psycare_session");
    expect(value).not.toBe("usr_01");
    expect(value.split(".")).toHaveLength(3); // JWT
    expect(options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
  });

  it("devolve a mensagem de validação do Zod em dados inválidos", async () => {
    process.env.DEMO_MODE = "true";
    const result = await loginAction({ email: "nao-e-email", password: "123456" });
    expect(result).toEqual({ success: false, error: "Email inválido" });
  });

  it("não vaza detalhes internos quando o segredo está ausente", async () => {
    process.env.DEMO_MODE = "true";
    delete process.env.SESSION_SECRET;
    const result = await loginAction(validLogin);
    expect(result.success).toBe(false);
    expect(JSON.stringify(result)).not.toContain("SESSION_SECRET");
  });
});
