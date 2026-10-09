import { HeaderBasic } from "@/shared/components/common/HeaderBasic";

export default function SobreMacti() {
  return (
    <>
      <HeaderBasic />
      <main className="w-11/12 mx-auto space-y-6 py-4s p-6">
        <section className="w-full bg-[#0b2027] text-white pt-10 pb-10 px-6 rounded-2xl text-center flex flex-col items-center justify-center space-y-6 max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            ¿Qué es MACTI?
          </h1>
          <div className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl leading-relaxed font-light gap-8 columns-1 md:columns-2">
            <p className="mb-4 break-inside-avoid">
              MACTI es una plataforma que alberga materiales didácticos haciendo énfasis
              en ejemplos prácticos y aplicaciones de conceptos abstractos para los cursos
              semestrales de análisis Numérico y Ecuaciones Diferenciales.
            </p>
            <p className="break-inside-avoid">
              Su nombre viene de la palabra náhuatl "temachtiani" que refiere a "aquel que
              hace que los otros sepan algo, conozcan lo que está sobre la tierra".
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
