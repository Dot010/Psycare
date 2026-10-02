"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { isDemoMode } from "@/lib/demo";
import { loginMock } from "./mock-login";
import { loginSchema, registerSchema } from "./schema";

import { COOKIE_NAME, SESSION_MAX_AGE, signSession } from "@/lib/session";

async function createSession(user: { id: string; role: "patient" | "psychologist" }) {
  const token = await signSession({ userId: user.id, role: user.role });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

const DEMO_DISABLED_ERROR =
  "Autenticação ainda não está disponível neste ambiente.";

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? fallback;
  }
  // Detalhes internos ficam só no log do servidor; o cliente recebe uma mensagem genérica.
  console.error("[auth]", error);
  return fallback;
}

export async function loginAction(formData: {
  email: string;
  password: string;
}) {
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
