import type { Metadata } from "next";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { Poppins } from "next/font/google";
import { UserProvider } from "@/components/providers/UserProvider";
import { DemoBanner } from "@/components/feedback/DemoBanner";
import { AppProviders } from "@/components/providers/AppProviders";
import { parseTheme, THEME_COOKIE } from "@/lib/theme-cookie";
import "@/app/globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Psy Care - Seu Espaço de Cuidado",
  description: "Plataforma de acompanhamento psicológico",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // O CSP usa um nonce por requisição, então as páginas precisam ser renderizadas a cada request.
  await connection();
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <html lang="pt-br" className={`${poppins.variable} h-full antialiased${theme === "dark" ? " dark" : ""}`}>
      <body className={`${poppins.className} min-h-full antialiased`}>
        <DemoBanner />
        <AppProviders>
          <UserProvider>{children}</UserProvider>
        </AppProviders>
      </body>
    </html>
  );
}
