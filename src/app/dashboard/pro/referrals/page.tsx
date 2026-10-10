import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ReferralsView from "@/features/pro/components/ReferralsView";
import { COOKIE_NAME, verifySession } from "@/lib/session";

export default async function ReferralsPage() {
  const session = await verifySession((await cookies()).get(COOKIE_NAME)?.value);
  // Só o psiquiatra emite encaminhamentos.
  if (session?.specialty !== "psychiatrist") redirect("/dashboard/pro");
  return <ReferralsView />;
}
