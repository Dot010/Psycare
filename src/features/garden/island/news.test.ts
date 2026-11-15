import { describe, expect, it } from "vitest";
import { placeNews, placesWithNews, type NewsInput } from "@/features/garden/island/news";

const base: NewsInput = {
  assignments: [
    { id: "a", kind: "sleep", by: "Dra. Helena Prado", assignedAt: "2026-11-10" },
    { id: "b", kind: "values", by: "Dra. Helena Prado", assignedAt: "2026-11-01", doneRecordId: "r1" },
  ] as NewsInput["assignments"],
  chats: [
    {
      id: "1",
      doctorName: "Dra. Helena Prado",
      specialty: "Psicologia",
      lastMessage: "",
      messages: [{ id: "1", sender: "doctor", content: "Como foi a semana?", timestamp: "" }],
    },
  ],
  appointments: [
    {
      id: "1",
      profissional: "Dr. Rafael Nunes",
      data: "2026-11-20",
      hora: "10:00",
      status: "pendente",
      tipo: "online",
    },
    {
      id: "2",
      profissional: "Dra. Helena Prado",
      data: "2026-11-01",
      hora: "10:00",
      status: "confirmado",
      tipo: "online",
    },
  ],
  diaryPages: 3,
  now: "2026-11-15T09:00",
};

describe("o que há de novo em cada lugar da ilha", () => {
  it("garrafa conta só as atividades que faltam", () => {
    expect(placeNews("garrafa", base)).toBe("1 atividade esperando você.");
  });
  it("correio mostra a última mensagem de um profissional", () => {
    expect(placeNews("correio", base)).toBe("Última de Dra. Helena Prado: “Como foi a semana?”");
  });
  it("consulta mostra a próxima, e se ainda falta confirmar", () => {
    expect(placeNews("consulta", base)).toMatch(/Dr\. Rafael Nunes, .* às 10:00 \(esperando confirmação\)\./);
  });
  it("cabana conta as páginas do diário", () => {
    expect(placeNews("cabana", base)).toBe("3 páginas na estante.");
    expect(placeNews("cabana", { ...base, diaryPages: 0 })).toBe("A estante ainda está vazia.");
  });
});

describe("lugares com novidade", () => {
  it("brilham a garrafa com atividade esperando e a consulta esperando confirmação", () => {
    expect(placesWithNews(base)).toEqual(["garrafa", "consulta"]);
  });
  it("sem nada pendente, nenhum brilho", () => {
    expect(placesWithNews({ ...base, assignments: [], appointments: [] })).toEqual([]);
  });
  it("mensagem nova do profissional faz o correio brilhar", () => {
    const chat = base.chats[0];
    const answered = {
      ...chat,
      messages: [
        { id: "0", sender: "user" as const, content: "Oi", timestamp: "" },
        { id: "1", sender: "doctor" as const, content: "Oi! Tudo bem?", timestamp: "" },
      ],
    };
    expect(placesWithNews({ ...base, assignments: [], appointments: [], chats: [answered] })).toEqual([
      "correio",
    ]);
  });
});
