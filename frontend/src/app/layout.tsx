import type { Metadata } from "next";
import { Hind_Madurai, Lora, Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  weight: ["300", "400", "600", "700"],
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const hindMadurai = Hind_Madurai({
  weight: ["300", "400", "600", "700"],
  variable: "--font-hind-madurai",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MACTI",
  description:
    "MACTI es una plataforma que alberga materiales didácticos haciendo énfasis en ejemplos prácticos y aplicaciones de conceptos abstractos para los cursos semestrales de análisis Numérico y Ecuaciones Diferenciales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scheme-light-dark">
      <body
        className={`${montserrat.variable} ${hindMadurai.variable} ${lora.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
