import type { Metadata } from "next";
import { cookies } from "next/headers";
import { NotFoundView } from "@/components/feedback/NotFoundView";
import { COOKIE_NAME, verifySession } from "@/lib/session";

export const metadata: Metadata = { title: "Página não encontrada · Psy Care" };

export default async function NotFound() {
  const session = await verifySession((await cookies()).get(COOKIE_NAME)?.value);
  const homeHref = session?.role === "professional" ? "/dashboard/pro" : "/dashboard";
  return <NotFoundView signedIn={session !== null} homeHref={homeHref} />;
}
