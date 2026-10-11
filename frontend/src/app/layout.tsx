import type { Metadata } from "next";
import { Bai_Jamjuree, Inter, Rajdhani } from "next/font/google";
import "./globals.css";
import { Footer } from "@/shared/components/common/Footer";
import { Toaster } from "@/shared/shadcn/components/ui/sonner";

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
        className={`antialiased min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground`}
      >
        <div className="flex min-h-screen flex-col items-center justify-between gap-6">
          {children}
          <Footer />
        </div>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
