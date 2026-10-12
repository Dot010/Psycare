import type { Profile } from "./schema";

/** "Olá, Marina" ou só "Olá!" quando a pessoa não disse o nome. Nunca inventa um nome. */
export function greeting(profile: Profile): string {
  const name = profile.name.trim();
  return name ? `Olá, ${name}` : "Olá!";
}

/** Idade aproximada pelo ano de nascimento (sem mês e dia, pode errar por 1). */
export function approxAge(profile: Profile, currentYear: number): number | undefined {
  return profile.birthYear === undefined ? undefined : currentYear - profile.birthYear;
}

/** Nome do paciente de demonstração na área do profissional quando a pessoa não informou o seu. */
export const DEMO_PATIENT_FALLBACK = "Paciente demo";

export function patientDisplayName(profile: Profile): string {
  return profile.name.trim() || DEMO_PATIENT_FALLBACK;
}
