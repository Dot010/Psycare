import { describe, expect, it } from "vitest";
import { demoReply } from "./logic";

describe("resposta de exemplo", () => {
  it("responde conforme o assunto", () => {
    expect(demoReply("Tenho uma dúvida sobre a medicação")).toMatch(/não mude nada/);
    expect(demoReply("quero enviar um exame")).toMatch(/Hoje/);
    expect(demoReply("estou com insônia")).toMatch(/padrão/);
  });
  it("em sinal de crise lembra do 188 primeiro", () => {
    expect(demoReply("não aguento mais")).toMatch(/188/);
  });
  it("tem resposta padrão", () => {
    expect(demoReply("oi")).toMatch(/próxima sessão/);
  });
});
