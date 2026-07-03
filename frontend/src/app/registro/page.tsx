import type { Metadata } from "next";
import Link from "next/link";
import AccountRequestForm from "@/domains/register/components/AccountRequestForm";
import { QueryContextProvider } from "@/shared/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Registro Alumno | MACTI",
  description: "Solicita una cuenta para acceder a los cursos de tu instituto",
};

interface RegistroPageProps {
  searchParams: {
    institute: string;
  };
}

export default async function RegistroPage({ searchParams }: RegistroPageProps) {
  const { institute } = await searchParams;

  return (
    <div className="w-full max-w-md mx-auto py-10 px-4 grid gap-4">
      <QueryContextProvider>
        <AccountRequestForm institute={institute} />
      </QueryContextProvider>
      <p className="text-foreground font-medium text-center text-sm">
        ¿Eres Profesor?{" "}
        <Link href="/registro/profesor" className="text-blue-500 hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}
