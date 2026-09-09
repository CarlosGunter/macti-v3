import { notFound } from "next/navigation";
import ListInstituteCourses from "@/domains/courses/components/ListInstituteCourses";
import { institutes } from "@/shared/config/institutes";

export const revalidate = 3600; // 1 hora en segundos

interface InstitutePageProps {
  params: Promise<{
    institute: string;
  }>;
}

export async function generateMetadata({ params }: InstitutePageProps) {
  const { institute } = await params;
  const currentInstitute = institutes[institute];

  return {
    title: `${currentInstitute?.name ?? "Instituto"} | MACTI`,
    description: `Bienvenido al portal del instituto ${currentInstitute?.name ?? "Instituto"}.`,
  };
}

type InstituteStaticParams = {
  institute: string;
};

export async function generateStaticParams(): Promise<InstituteStaticParams[]> {
  return Object.keys(institutes).map((institute) => ({
    institute,
  }));
}

export default async function InstitutePage({ params }: InstitutePageProps) {
  const { institute } = await params;
  const currentInstitute = institutes[institute];

  if (!currentInstitute) notFound();

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-6">
        Explorar Cursos de {currentInstitute.name ?? "Facultad"}
      </h1>

      <div className="w-full bg-secondary p-6 rounded-xl shadow-xl">
        <div className="relative max-w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg
              className="w-4 h-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <title>Lupa</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Curso"
            className="w-full pl-9 pr-4 py-1.5 bg-[#eff9e6] text-xs font-semibold rounded-lg text-slate-700 placeholder-slate-500 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
          />
        </div>
      </div>

      <ListInstituteCourses institute={institute} />
    </div>
  );
}
