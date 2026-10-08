import { jwtVerify, SignJWT } from "jose";

export const COOKIE_NAME = "psycare_session";
export const SESSION_MAX_AGE = 60 * 60 * 24; // 24 horas, em segundos

export type Role = "patient" | "professional";
export type Specialty = "psychologist" | "psychiatrist";

export interface SessionPayload {
  userId: string;
  role: Role;
  /** Só para role "professional". */
  specialty?: Specialty;
}

function getKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET ausente ou com menos de 32 caracteres (veja .env.example).");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const claims: Record<string, string> = { role: payload.role };
  if (payload.role === "professional") claims.specialty = payload.specialty ?? "psychologist";
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    // "psychologist" era o valor antigo de role; vira profissional/psicólogo.
    if (payload.role === "psychologist")
      return { userId: payload.sub, role: "professional", specialty: "psychologist" };
    if (payload.role === "professional") {
      const specialty: Specialty = payload.specialty === "psychiatrist" ? "psychiatrist" : "psychologist";
      return { userId: payload.sub, role: "professional", specialty };
    }
    return { userId: payload.sub, role: "patient" };
  } catch {
    return null;
  }
}
