import { describe, expect, it } from "vitest";
import {
  addContact,
  addItem,
  cleanPhone,
  EMPTY_PLAN,
  filledSteps,
  isPlanEmpty,
  isValidPhone,
  MAX_ITEMS,
  phoneHref,
  PLAN_STEPS,
  removeContact,
  removeItem,
} from "@/features/safety/logic";

describe("itens do plano", () => {
  it("acrescenta, limpa o texto e ignora vazio e repetido", () => {
    expect(addItem([], "  respirar   devagar ")).toEqual(["respirar devagar"]);
    expect(addItem(["Caminhar"], "caminhar")).toEqual(["Caminhar"]);
    expect(addItem(["Caminhar"], "  ")).toEqual(["Caminhar"]);
    expect(addItem([], "a")).toEqual([]);
  });

  it("respeita o limite de itens e de tamanho", () => {
    const cheia = Array.from({ length: MAX_ITEMS }, (_, i) => `item ${i}`);
    expect(addItem(cheia, "mais um")).toBe(cheia);
    expect(addItem([], "x".repeat(500))[0].length).toBe(120);
  });

  it("remove pelo índice", () => {
    expect(removeItem(["a", "b", "c"], 1)).toEqual(["a", "c"]);
  });
});

describe("telefones e contatos", () => {
  it("limpa o telefone para discar", () => {
    expect(cleanPhone("(11) 99999-0001")).toBe("11999990001");
    expect(cleanPhone("+55 11 99999-0001")).toBe("+5511999990001");
    expect(phoneHref("(11) 99999-0001")).toBe("tel:11999990001");
  });

  it("valida pelo número de dígitos", () => {
    expect(isValidPhone("11999990001")).toBe(true);
    expect(isValidPhone("1234")).toBe(false);
    expect(isValidPhone("1".repeat(20))).toBe(false);
  });

  it("só aceita contato com nome e telefone válidos", () => {
    const ok = addContact([], { name: " Ana ", role: "irmã", phone: "(11) 99999-0001" }, "c1");
    expect(ok).toEqual([{ id: "c1", name: "Ana", role: "irmã", phone: "(11) 99999-0001" }]);
    expect(addContact(ok, { name: "A", role: "", phone: "11999990001" }, "c2")).toBe(ok);
    expect(addContact(ok, { name: "Marcos", role: "", phone: "123" }, "c3")).toBe(ok);
    expect(removeContact(ok, "c1")).toEqual([]);
  });

  it("sabe quando o plano ainda está vazio", () => {
    expect(isPlanEmpty(EMPTY_PLAN)).toBe(true);
    expect(isPlanEmpty({ ...EMPTY_PLAN, coping: ["Respirar"] })).toBe(false);
  });
});

describe("passos preenchidos", () => {
  it("conta as listas com algum item e as pessoas, de 0 a 5", () => {
    expect(PLAN_STEPS).toBe(5);
    expect(filledSteps(EMPTY_PLAN)).toBe(0);
    expect(
      filledSteps({
        ...EMPTY_PLAN,
        warnings: ["durmo pouco"],
        coping: ["respirar"],
        contacts: [{ id: "c1", name: "Bia", role: "amiga", phone: "11999990000" }],
      }),
    ).toBe(3);
  });
});
