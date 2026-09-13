import Link from "next/link";
import { Arrow } from "@/assets/icons/arrow";
import { Quetzalcoatl } from "@/assets/QuetzalcoatlMacti";
import { HeaderBasic } from "@/shared/components/common/HeaderBasic";

export default function Home() {
  return (
    <>
      <HeaderBasic />
      <main className="max-w-7xl mx-auto px-16 py-12 md:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6 text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.15] tracking-tight">
            Aprende en cursos de instituciones de la UNAM
          </h1>
          <p className="text-lg sm:text-xl text-foreground/80 leading-relaxed max-w-2xl">
            Accede a cursos de las mejores instituciones educativas. Desarrolla nuevas
            habilidades para alcanzar tus metas educativas.
          </p>
          <div className="mx-auto flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/sobre-macti"
              className="mx-auto inline-flex items-center justify-center font-semibold px-8 py-4 rounded-xl bg-primary border-2 text-primary-foreground border-primary-foreground hover:text-accent hover:border-border transition text-base shadow-xl hover:-translate-y-0.5 duration-200"
            >
              ¿Qué es MACTI?
            </Link>
            <Link
              href="/dependencias"
              className="mx-auto inline-flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-xl shadow-xl text-secondary-foreground bg-secondary hover:bg-accent transition group text-xl hover:-translate-y-0.5 duration-200"
            >
              Dependencias
              <Arrow className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5 flex justify-center items-center">
          <Quetzalcoatl className="w-auto h-auto object-cover rounded-[2.5rem] shadow-xl" />
        </div>
      </main>
    </>
  );
}
