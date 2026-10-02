import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { UserProvider } from "@/context/UserContext";
import { AppProviders } from "@/components/providers/AppProviders";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader" });

export const metadata: Metadata = {
  title: "Psy Care - Seu Espaço de Cuidado",
  description: "Plataforma de acompanhamento psicológico",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-br"
      className={`${inter.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className={`${inter.className} min-h-full antialiased`}>
        <AppProviders>
          <UserProvider>{children}</UserProvider>
        </AppProviders>
      </body>
    </html>
  );
}