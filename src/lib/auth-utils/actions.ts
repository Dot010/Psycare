"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginMock } from "./services";
import { loginSchema, registerSchema } from "./schema";

const COOKIE_NAME = "psycare_session";
const COOKIE_MAX_AGE = 86400; // 24 hours

export async function loginAction(formData: {
  email: string;
  password: string;
}) {
  try {
    const validated = loginSchema.parse(formData);

    const user = await loginMock(validated.email);

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return { success: true, user };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "Erro ao fazer login. Tente novamente.",
    };
  }
}

export async function registerAction(formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  try {
    const validated = registerSchema.parse(formData);

    const user = await loginMock(validated.email);

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return { success: true, user };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "Erro ao criar conta. Tente novamente.",
    };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/");
}
