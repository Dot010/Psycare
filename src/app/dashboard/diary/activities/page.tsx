import { redirect } from "next/navigation";

/** O endereço antigo de Atividades: quem guardou o link continua chegando. */
export default function OldActivitiesPage() {
  redirect("/dashboard/activities");
}
