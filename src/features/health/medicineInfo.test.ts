import { describe, expect, it } from "vitest";
import { medicineInfoFor } from "./medicineInfo";

describe("medicineInfoFor", () => {
  it("acha pelo nome ignorando maiúsculas e espaços", () => {
    expect(medicineInfoFor("  SERTRALINA ")?.tarja).toBe("vermelha");
    expect(medicineInfoFor("Clonazepam")?.tarja).toBe("preta");
  });
  it("remédio sem ficha devolve nada", () => {
    expect(medicineInfoFor("Remédio inventado")).toBeUndefined();
  });
});
