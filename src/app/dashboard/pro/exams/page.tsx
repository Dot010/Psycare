import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ExamsView from "@/features/pro/components/ExamsView";
import { COOKIE_NAME, verifySession } from "@/lib/session";

export default async function ExamsPage() {
  const session = await verifySession((await cookies()).get(COOKIE_NAME)?.value);
  // Só o psiquiatra pede exames.
  if (session?.specialty !== "psychiatrist") redirect("/dashboard/pro");
  return <ExamsView />;
}
