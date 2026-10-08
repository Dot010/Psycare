"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { isDemoMode } from "@/lib/demo";
import { demoUser, loginMock } from "./mock-login";
import { demoProfileSchema, loginSchema, registerSchema } from "./schema";

import { homeFor } from "@/lib/roles";
import { COOKIE_NAME, SESSION_MAX_AGE, signSession, type Role, type Specialty } from "@/lib/session";

async function createSession(user: { id: string; role: Role; specialty?: Specialty }) {
  const token = await signSession({ userId: user.id, role: user.role, specialty: user.specialty });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

const DEMO_DISABLED_ERROR = "Autenticação ainda não está disponível neste ambiente.";

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? fallback;
  }
  // Detalhes internos ficam só no log do servidor; o cliente recebe uma mensagem genérica.
  console.error("[auth]", error);
  return fallback;
}

export async function loginAction(formData: { email: string; password: string }) {
  if (!isDemoMode()) {
    return { success: false, error: DEMO_DISABLED_ERROR };
  }

  try {
    const validated = loginSchema.parse(formData);

    const user = await loginMock(validated.email);

    await createSession(user);

    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: toErrorMessage(error, "Erro ao fazer login. Tente novamente."),
    };
  }
}

/**
 * Entrada de demonstração: sem e-mail e sem senha. Só existe com DEMO_MODE ligado e entra sempre
 * numa conta fictícia, então não dá acesso a nada real.
 */
export async function demoLoginAction(profile: string) {
  if (!isDemoMode()) {
    return { success: false as const, error: DEMO_DISABLED_ERROR };
  }

  try {
    const user = demoUser(demoProfileSchema.parse(profile));
    await createSession(user);
    return { success: true as const, user, redirectTo: homeFor(user) };
  } catch (error) {
    return {
      success: false as const,
      error: toErrorMessage(error, "Não foi possível entrar na demonstração. Tente novamente."),
    };
  }
}

export async function registerAction(formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  if (!isDemoMode()) {
    return { success: false, error: DEMO_DISABLED_ERROR };
  }

  try {
    const validated = registerSchema.parse(formData);

    const user = await loginMock(validated.email);

    await createSession(user);

    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: toErrorMessage(error, "Erro ao criar conta. Tente novamente."),
    };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/");
}
