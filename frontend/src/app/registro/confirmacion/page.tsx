import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CreateAccount from "@/domains/register/components/CreateAccoutForm";
import { fetchAccountInfo } from "@/domains/register/services/fetchAccountInfo";

export const metadata: Metadata = {
  title: "Confirmación de Cuenta | MACTI",
  description: "Confirma tu cuenta para acceder a los cursos de tu instituto",
};

interface ConfirmacionPageProps {
  searchParams: {
    token?: string;
  };
}

export default async function ConfirmacionPage({ searchParams }: ConfirmacionPageProps) {
  const { token } = await searchParams;
  if (!token) notFound();

  const userData = await fetchAccountInfo(token);
  if (!userData) notFound();

  return (
    <div className="w-full max-w-md mx-auto py-10 px-4">
      <CreateAccount userData={userData} token={token} />
    </div>
  );
}
