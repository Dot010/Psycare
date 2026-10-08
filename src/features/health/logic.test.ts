import { describe, expect, it } from "vitest";
import {
  buildConsultSummary,
  doseSentence,
  dosesForDay,
  intensityLabel,
  medTimes,
  normalizeSintoma,
  periodOf,
  symptomStats,
  toggleKey,
  weekAdherence,
  weekSentence,
} from "./logic";
import type { Medicamento, Sintoma } from "./types";

const sertralina: Medicamento = {
  id: "m1",
  nome: "Sertralina",
  dosagem: "50 mg",
  frequencia: "Diária",
  horario: "08:00",
  observacao: "com comida",
};
const melatonina: Medicamento = {
  id: "m2",
  nome: "Melatonina",
  dosagem: "3 mg",
  frequencia: "",
  horario: "",
  horarios: ["21:00", "21:00", "x"],
};
const livre: Medicamento = {
  id: "m3",
  nome: "Vitamina",
  dosagem: "1",
  frequencia: "",
  horario: "Horário livre",
};

describe("horários", () => {
  it("usa horarios, o horário antigo ou nada", () => {
    expect(medTimes(sertralina)).toEqual(["08:00"]);
    expect(medTimes(melatonina)).toEqual(["21:00"]);
    expect(medTimes(livre)).toEqual([]);
  });
  it("divide o dia em períodos", () => {
    expect(periodOf("08:00")).toBe("Manhã");
    expect(periodOf("12:00")).toBe("Tarde");
    expect(periodOf("18:00")).toBe("Noite");
  });
  it("monta as doses do dia em ordem", () => {
    const doses = dosesForDay([melatonina, sertralina, livre], "2026-10-08");
    expect(doses.map((d) => d.nome)).toEqual(["Sertralina", "Melatonina"]);
    expect(doses[0].key).toBe("m1|2026-10-08|08:00");
  });
});

describe("doses tomadas", () => {
  it("marca e desmarca", () => {
    expect(toggleKey([], "a")).toEqual(["a"]);
    expect(toggleKey(["a", "b"], "a")).toEqual(["b"]);
  });
  it("frases sem cobrança", () => {
    expect(doseSentence(0, 0)).toBe("Nenhuma dose marcada para hoje.");
    expect(doseSentence(3, 2)).toBe("2 de 3 doses tomadas.");
    expect(doseSentence(3, 3)).toBe("Todas as doses de hoje foram tomadas.");
    expect(doseSentence(1, 1)).toBe("A dose de hoje foi tomada.");
  });
  it("adesão da semana", () => {
    const meds = [sertralina];
    const taken = ["m1|2026-10-02|08:00", "m1|2026-10-03|08:00", "m1|2026-10-05|08:00"];
    const week = weekAdherence(meds, taken, "2026-10-08");
    expect(week).toHaveLength(7);
    expect(week[0].date).toBe("2026-10-02");
    expect(week[0].state).toBe("full");
    expect(week[2].state).toBe("none");
    expect(week[6].isToday).toBe(true);
    expect(weekSentence(week)).toMatch(/3 de 6 dias/);
    expect(weekSentence(weekAdherence([], [], "2026-10-08"))).toMatch(/aparece aqui/);
  });
});

describe("sintomas", () => {
  const legado: Sintoma = { id: "1", descricao: "Dor de cabeça", data: "04/09/2026", nota: "Moderada" };
  it("converte registros antigos", () => {
    expect(normalizeSintoma(legado)).toMatchObject({ data: "2026-09-04", intensidade: 3 });
    expect(normalizeSintoma({ ...legado, intensidade: 5 }).intensidade).toBe(5);
    expect(intensityLabel(2)).toBe("Leve");
    expect(intensityLabel(undefined)).toBe("Sem nota");
  });
  it("resume por sintoma no período", () => {
    const list: Sintoma[] = [
      { id: "1", descricao: "Insônia", data: "2026-10-01", nota: "", intensidade: 2 },
      { id: "2", descricao: "Insônia", data: "2026-10-03", nota: "", intensidade: 4 },
      { id: "3", descricao: "Cansaço", data: "2026-09-01", nota: "", intensidade: 5 },
    ];
    expect(symptomStats(list, "2026-09-10", "2026-10-08")).toEqual([
      { nome: "Insônia", vezes: 2, media: 3, maxima: 4 },
    ]);
  });
});

describe("resumo para a consulta", () => {
  it("descreve só o que foi registrado", () => {
    const lines = buildConsultSummary({
      meds: [sertralina],
      taken: ["m1|2026-10-08|08:00"],
      sintomas: [{ id: "1", descricao: "Insônia", data: "2026-10-07", nota: "", intensidade: 4 }],
      moodByDay: new Map([
        ["2026-10-07", 4],
        ["2026-08-01", 1],
      ]),
      entries: [
        {
          id: "e",
          date: "2026-10-06",
          mood: "Bem",
          title: "Reunião difícil",
          content: "x",
          discussInSession: true,
        },
      ],
      today: "2026-10-08",
    });
    const text = lines.join("\n");
    expect(text).toContain("Sertralina 50 mg às 08:00 (com comida)");
    expect(text).toContain("1 de 30 doses");
    expect(text).toContain("Insônia: 1 vez, intensidade média 4 de 5");
    expect(text).toContain("Média 4 em 1 dia registrado");
    expect(text).toContain("06/10/2026: Reunião difícil");
    expect(text).toContain("Não é um laudo");
  });
});
