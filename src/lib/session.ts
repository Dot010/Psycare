import { jwtVerify, SignJWT } from "jose";

export const COOKIE_NAME = "psycare_session";
export const SESSION_MAX_AGE = 60 * 60 * 24; // 24 horas, em segundos

export interface SessionPayload {
  userId: string;
  role: "patient" | "psychologist";
}

function getKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET ausente ou com menos de 32 caracteres (veja .env.example).");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
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
    const role = payload.role === "psychologist" ? "psychologist" : "patient";
    return { userId: payload.sub, role };
  } catch {
    return null;
  }
}
