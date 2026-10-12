import type { Profile } from "./schema";

/** "Olá, Marina" ou só "Olá!" quando a pessoa não disse o nome. Nunca inventa um nome. */
export function greeting(profile: Profile): string {
  const name = profile.name.trim();
  return name ? `Olá, ${name}` : "Olá!";
}

/** Idade completa em anos na data de hoje (AAAA-MM-DD), ou undefined sem data de nascimento. */
export function ageOn(profile: Profile, todayISO: string): number | undefined {
  if (!profile.birthDate) return undefined;
  const [by, bm, bd] = profile.birthDate.split("-").map(Number);
  const [ty, tm, td] = todayISO.split("-").map(Number);
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0);
}

/** Nome do paciente de demonstração na área do profissional quando a pessoa não informou o seu. */
export const DEMO_PATIENT_FALLBACK = "Paciente demo";

export function patientDisplayName(profile: Profile): string {
  return profile.name.trim() || DEMO_PATIENT_FALLBACK;
}
