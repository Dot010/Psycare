export interface SafetyContact {
  id: string;
  name: string;
  /** Quem é para a pessoa (irmã, amigo, psicóloga...). */
  role: string;
  phone: string;
}

export type SafetyListKey = "warnings" | "coping" | "places" | "safeEnv";

export interface SafetyPlan {
  warnings: string[];
  coping: string[];
  places: string[];
  safeEnv: string[];
  contacts: SafetyContact[];
}
