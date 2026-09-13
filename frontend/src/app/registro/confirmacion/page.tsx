import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MACTILogo from "@/assets/logos/MactiLogo";
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
    <div className="p-8 rounded-2xl shadow-lg max-w-xl w-full space-y-6 border border-gray-200 mx-auto mt-6 mb-6 bg-background-form text-background-form-foreground">
      <MACTILogo className="w-37.5" />
      <CreateAccount userData={userData} token={token} />
    </div>
  );
}
