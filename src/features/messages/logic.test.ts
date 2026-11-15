import { describe, expect, it } from "vitest";
import { demoReply, withAllChats } from "./logic";

describe("resposta de exemplo", () => {
  it("responde conforme o assunto", () => {
    expect(demoReply("Tenho uma dúvida sobre a medicação")).toMatch(/não mude nada/);
    expect(demoReply("quero enviar um exame")).toMatch(/aba Exames/);
    expect(demoReply("estou com insônia")).toMatch(/padrão/);
  });
  it("em sinal de crise lembra do 188 primeiro", () => {
    expect(demoReply("não aguento mais")).toMatch(/188/);
  });
  it("o Dr. Rafael responde no masculino", () => {
    expect(demoReply("dúvida sobre o remédio", "Dr. Rafael Nunes")).toMatch(/^Obrigado por/);
    expect(demoReply("dúvida sobre o remédio", "Dra. Helena Prado")).toMatch(/^Obrigada por/);
  });
  it("cada profissional tem a sua conversa, sem perder a que já existia", () => {
    const helena = {
      id: "1",
      doctorName: "Dra. Helena Prado",
      specialty: "Psicologia",
      lastMessage: "",
      messages: [],
    };
    const rafael = { ...helena, id: "2", doctorName: "Dr. Rafael Nunes" };
    const old = [{ ...helena, lastMessage: "oi" }];
    expect(withAllChats(old, [helena, rafael])).toEqual([old[0], rafael]);
    expect(withAllChats([helena, rafael], [helena, rafael])).toEqual([helena, rafael]);
  });
  it("tem resposta padrão", () => {
    expect(demoReply("oi")).toMatch(/próxima sessão/);
  });
});
