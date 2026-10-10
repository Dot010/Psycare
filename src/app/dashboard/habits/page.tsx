import { redirect } from "next/navigation";

/** Os hábitos agora ficam dentro do Meu dia. O endereço antigo continua levando até lá. */
export default function HabitsPage() {
  redirect("/dashboard/planner?aba=habitos");
}
