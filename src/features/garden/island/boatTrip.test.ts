import { describe, expect, it } from "vitest";
import { breathAt, tripSeconds, tripStatus } from "@/features/garden/island/boatTrip";

describe("travessia de barco respirando", () => {
  it("3 respirações calmantes levam 30 segundos", () => {
    expect(tripSeconds(3)).toBe(30);
  });

  it("a vela enche inspirando e o barco só anda soltando o ar", () => {
    expect(breathAt(0, 3)).toEqual({ fill: 0, travel: 0 });
    expect(breathAt(2, 3)).toEqual({ fill: 0.5, travel: 0 });
    expect(breathAt(4, 3).fill).toBe(1);
    expect(breathAt(4, 3).travel).toBe(0);
    expect(breathAt(7, 3).fill).toBeCloseTo(0.5);
    expect(breathAt(7, 3).travel).toBeCloseTo(1 / 6);
    expect(breathAt(10, 3).travel).toBeCloseTo(1 / 3);
    expect(breathAt(30, 3)).toEqual({ fill: 0, travel: 1 });
  });

  it("mostra a fase e o ciclo, e nada depois de chegar", () => {
    expect(tripStatus(1, 3)).toMatchObject({ label: "Inspire", cycle: 1 });
    expect(tripStatus(15, 3)).toMatchObject({ label: "Expire", cycle: 2 });
    expect(tripStatus(30, 3)).toBeNull();
  });
});
