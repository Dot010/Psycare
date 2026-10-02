import { describe, expect, it } from "vitest";
import { nearestSnap, snapHeight } from "@/components/layout/ActionSheet";

describe("ActionSheet", () => {
  it("calcula a altura de cada posição", () => {
    expect(snapHeight("peek", 700)).toBe(84);
    expect(snapHeight("half", 700)).toBe(350);
    expect(snapHeight("full", 700)).toBe(688);
  });

  it("respeita o espaço livre no topo", () => {
    expect(snapHeight("full", 700, 120)).toBe(580);
    expect(snapHeight("half", 200, 120)).toBe(84);
    expect(nearestSnap(570, 700, 120)).toBe("full");
  });

  it("solta na posição mais próxima", () => {
    expect(nearestSnap(100, 700)).toBe("peek");
    expect(nearestSnap(400, 700)).toBe("half");
    expect(nearestSnap(650, 700)).toBe("full");
  });
});
