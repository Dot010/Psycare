import type { SessionPayload } from "@/lib/session";

export const PRO_HOME = "/dashboard/pro";
export const PATIENT_HOME = "/dashboard/home";

/** Para onde cada tipo de conta vai depois de entrar. */
export function homeFor(session: Pick<SessionPayload, "role">): string {
  return session.role === "professional" ? PRO_HOME : PATIENT_HOME;
}

/** A área do profissional é só dele; o resto do /dashboard é só do paciente. */
export function canAccess(session: Pick<SessionPayload, "role">, pathname: string): boolean {
  if (!pathname.startsWith("/dashboard")) return true;
  const inProArea = pathname === PRO_HOME || pathname.startsWith(`${PRO_HOME}/`);
  return session.role === "professional" ? inProArea : !inProArea;
}
