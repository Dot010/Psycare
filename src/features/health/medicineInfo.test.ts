import { describe, expect, it } from "vitest";
import { medicineInfoFor, unitName } from "./medicineInfo";

describe("medicineInfoFor", () => {
  it("acha pelo nome ignorando maiúsculas e espaços", () => {
    expect(medicineInfoFor("  SERTRALINA ")?.tarja).toBe("vermelha");
    expect(medicineInfoFor("Clonazepam")?.tarja).toBe("preta");
  });
  it("traz o tamanho da caixa e a forma", () => {
    expect(medicineInfoFor("Lyberdia")).toMatchObject({ caixa: 30, forma: "capsula" });
    expect(unitName("capsula", 30)).toBe("cápsulas");
    expect(unitName("comprimido", 1)).toBe("comprimido");
  });
  it("remédio sem ficha devolve nada", () => {
    expect(medicineInfoFor("Remédio inventado")).toBeUndefined();
  });
});
