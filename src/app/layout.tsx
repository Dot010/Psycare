import type { Metadata } from "next";
import { connection } from "next/server";
import { Inter, Newsreader } from "next/font/google";
import { UserProvider } from "@/context/UserContext";
import { DemoBanner } from "@/components/DemoBanner";
import { AppProviders } from "@/components/providers/AppProviders";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader" });

export const metadata: Metadata = {
  title: "Psy Care - Seu Espaço de Cuidado",
  description: "Plataforma de acompanhamento psicológico",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // O CSP usa um nonce por requisição, então as páginas precisam ser renderizadas a cada request.
  await connection();

  return (
    <html
      lang="pt-br"
      className={`${inter.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className={`${inter.className} min-h-full antialiased`}>
        <DemoBanner />
        <AppProviders>
          <UserProvider>{children}</UserProvider>
        </AppProviders>
      </body>
    </html>
  );
}