import { cookies } from "next/headers";
import { DashboardShell } from "@/components/layout/DashboardShell";
import type { NavVariant } from "@/components/layout/nav-items";
import { COOKIE_NAME, verifySession } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession((await cookies()).get(COOKIE_NAME)?.value);
  const variant: NavVariant =
    session?.role === "professional" ? (session.specialty ?? "psychologist") : "patient";

  return <DashboardShell variant={variant}>{children}</DashboardShell>;
}
