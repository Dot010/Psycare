import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MedicationView from "@/features/pro/components/MedicationView";
import { COOKIE_NAME, verifySession } from "@/lib/session";

export default async function MedicationPage() {
  const session = await verifySession((await cookies()).get(COOKIE_NAME)?.value);
  // Só o psiquiatra acompanha medicação.
  if (session?.specialty !== "psychiatrist") redirect("/dashboard/pro");
  return <MedicationView />;
}
