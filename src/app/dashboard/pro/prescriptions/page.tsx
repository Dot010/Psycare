import { redirect } from "next/navigation";

/** Agora faz parte de "Clínico". O endereço antigo continua levando até lá. */
export default function OldPage() {
  redirect("/dashboard/pro/clinical?aba=receitas");
}
