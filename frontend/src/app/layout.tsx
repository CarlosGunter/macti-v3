import type { Metadata } from "next";
import { Bai_Jamjuree, Inter, Rajdhani } from "next/font/google";
import "./globals.css";
import { Footer } from "@/shared/components/common/Footer";

const baiJamjuree = Bai_Jamjuree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bai-jamjuree",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html
      lang="es"
      className={`${baiJamjuree.variable} ${rajdhani.variable} ${inter.variable} scheme-light`}
    >
      <body
        className={`antialiased flex flex-col gap-6 min-h-screen justify-between items-center bg-background text-foreground selection:bg-accent selection:text-accent-foreground`}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
