import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PrescriptionsView from "@/features/pro/components/PrescriptionsView";
import { COOKIE_NAME, verifySession } from "@/lib/session";

export default async function PrescriptionsPage() {
  const session = await verifySession((await cookies()).get(COOKIE_NAME)?.value);
  // Só o psiquiatra acompanha receitas.
  if (session?.specialty !== "psychiatrist") redirect("/dashboard/pro");
  return <PrescriptionsView />;
}
