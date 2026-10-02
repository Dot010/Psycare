import { describe, expect, it } from "vitest";
import { insertAt, removeById, upsertById } from "./list";

const a = { id: "a", n: 1 };
const b = { id: "b", n: 2 };
const c = { id: "c", n: 3 };

describe("list", () => {
  it("remove pelo id sem alterar a lista original", () => {
    const list = [a, b];
    expect(removeById(list, "a")).toEqual([b]);
    expect(list).toHaveLength(2);
  });

  it("upsert troca o item existente e mantém a posição", () => {
    expect(upsertById([a, b], { id: "b", n: 99 })).toEqual([a, { id: "b", n: 99 }]);
  });

  it("upsert coloca item novo no começo", () => {
    expect(upsertById([a], b)).toEqual([b, a]);
  });

  it("insertAt devolve o item para a posição original", () => {
    expect(insertAt([a, c], b, 1)).toEqual([a, b, c]);
  });

  it("insertAt não duplica nem estoura o índice", () => {
    expect(insertAt([a], a, 0)).toEqual([a]);
    expect(insertAt([a], b, 10)).toEqual([a, b]);
  });
});
