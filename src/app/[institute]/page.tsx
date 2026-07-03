import { notFound } from "next/navigation";
import ListInstituteCourses from "@/domains/courses/components/ListInstituteCourses";
import { Anchor } from "@/shared/components/ui/Anchor";
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
    <>
      <div className="grid justify-center text-center p-6">
        <h1 className="text-2xl font-bold">
          Instituto: {currentInstitute.name ?? "Instituto"}
        </h1>
        <p>Bienvenido al portal del instituto {currentInstitute.name ?? "Instituto"}.</p>

        <div className="flex justify-center gap-4 py-4">
          <Anchor href={currentInstitute.moodle} external>
            Moodle
          </Anchor>
          <Anchor href={currentInstitute.jupyter} external>
            Jupyter
          </Anchor>
        </div>
      </div>

      <ListInstituteCourses institute={institute} />
    </>
  );
}
