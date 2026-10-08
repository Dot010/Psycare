import type { Role, Specialty } from "@/lib/session";
import type { DemoProfile } from "./schema";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  specialty?: Specialty;
}

export async function loginMock(email: string): Promise<UserSession> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    id: "usr_01",
    name: "Usuário PsyCare",
    email: email,
    role: "patient",
  };
}

/** Contas fictícias da demonstração: não existe ninguém real por trás delas. */
const DEMO_USERS: Record<DemoProfile, UserSession> = {
  patient: {
    id: "usr_01",
    name: "Usuário Demonstração",
    email: "usuario@psycare.com.br",
    role: "patient",
  },
  psychologist: {
    id: "pro_psi_01",
    name: "Dra. Helena Prado",
    email: "helena@psycare.com.br",
    role: "professional",
    specialty: "psychologist",
  },
  psychiatrist: {
    id: "pro_med_01",
    name: "Dr. Rafael Nunes",
    email: "rafael@psycare.com.br",
    role: "professional",
    specialty: "psychiatrist",
  },
};

export function demoUser(profile: DemoProfile): UserSession {
  return DEMO_USERS[profile];
}
