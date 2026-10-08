import { cookies } from "next/headers";
import { ProIdentityProvider } from "@/features/pro/components/ProIdentity";
import { professionalFor } from "@/features/pro/identity";
import { COOKIE_NAME, verifySession } from "@/lib/session";

export default async function ProLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession((await cookies()).get(COOKIE_NAME)?.value);
  return <ProIdentityProvider value={professionalFor(session?.userId)}>{children}</ProIdentityProvider>;
}
