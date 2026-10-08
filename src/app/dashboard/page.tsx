import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { homeFor } from "@/lib/roles";
import { COOKIE_NAME, verifySession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await verifySession((await cookies()).get(COOKIE_NAME)?.value);
  redirect(session ? homeFor(session) : "/login");
}
