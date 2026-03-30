import type { Metadata } from "next";
import { Inter, Montserrat } from 'next/font/google';
import "./globals.css";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });


export const metadata: Metadata = {
  title: "Psy Care - Seu Espaço de Cuidado",
  description: "Plataforma de acompanhamento psicológico",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html
      lang="pt-br"
      className={`${inter.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className={`${montserrat.className} min-h-full antialiased`}>
        {children} 
      </body>
    </html>
  );
};

export default RootLayout;