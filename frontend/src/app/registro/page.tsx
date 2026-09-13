import type { Metadata } from "next";
import Link from "next/link";
import MACTILogo from "@/assets/logos/MactiLogo";
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
    <div className="p-8 rounded-2xl shadow-lg max-w-xl w-full space-y-6 border border-gray-200 mx-auto mt-6 mb-6 bg-background-form text-background-form-foreground">
      <MACTILogo className="w-37.5" />
      <QueryContextProvider>
        <AccountRequestForm institute={institute} />
      </QueryContextProvider>
      <p className="text-foreground font-medium text-center">
        ¿Eres Profesor?{" "}
        <Link href="/registro/profesor" className="text-blue-500 hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}
