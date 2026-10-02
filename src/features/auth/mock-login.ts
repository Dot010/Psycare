export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "patient" | "psychologist";
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
