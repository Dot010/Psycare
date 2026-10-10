import { cookies } from "next/headers";
import ProDashboard from "@/features/pro/components/ProDashboard";
import { COOKIE_NAME, verifySession } from "@/lib/session";

export default async function ProHomePage() {
  const session = await verifySession((await cookies()).get(COOKIE_NAME)?.value);
  return <ProDashboard specialty={session?.specialty} />;
}
