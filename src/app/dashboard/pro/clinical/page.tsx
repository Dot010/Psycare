import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ClinicalView from "@/features/pro/components/ClinicalView";
import { COOKIE_NAME, verifySession } from "@/lib/session";

export default async function ClinicalPage() {
  const session = await verifySession((await cookies()).get(COOKIE_NAME)?.value);
  // Só o psiquiatra cuida de receitas, exames e encaminhamentos.
  if (session?.specialty !== "psychiatrist") redirect("/dashboard/pro");
  return <ClinicalView />;
}
