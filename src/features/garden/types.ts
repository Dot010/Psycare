export type WaterSource = "habit" | "diary" | "checkin" | "breathing";

/** Uma gota de água ganha por uma ação real. `id` impede ganhar duas vezes pela mesma ação no dia. */
export interface WaterDrop {
  id: string;
  source: WaterSource;
  /** Dia em que foi ganha (AAAA-MM-DD). */
  date: string;
}

export interface CheckIn {
  /** Dia (AAAA-MM-DD). Um registro por dia. */
  date: string;
  mood: string;
}

export type PlantKind = "sunflower" | "daisy" | "tulip" | "lavender";

export interface PlantState {
  kind: PlantKind;
  /** 0 (broto) a 1 (crescida). */
  growth: number;
}
