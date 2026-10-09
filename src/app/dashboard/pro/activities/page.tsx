import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LibraryView from "@/features/pro/components/LibraryView";
import { COOKIE_NAME, verifySession } from "@/lib/session";

export default async function ActivitiesPage() {
  const session = await verifySession((await cookies()).get(COOKIE_NAME)?.value);
  // Atividades terapêuticas são da psicóloga; o psiquiatra vai para o painel.
  if (session?.specialty === "psychiatrist") redirect("/dashboard/pro");
  return <LibraryView />;
}
