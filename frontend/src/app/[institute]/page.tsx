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
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
        Explorar Cursos de {currentInstitute.name ?? "Facultad"}
      </h1>

      <ListInstituteCourses institute={institute} />
    </div>
  );
}
