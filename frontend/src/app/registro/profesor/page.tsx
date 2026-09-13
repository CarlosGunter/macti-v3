import type { Metadata } from "next";
import Link from "next/link";
import MACTILogo from "@/assets/logos/MactiLogo";
import AccountRequestTeacherForm from "@/domains/register/components/AccountRequestTeacherForm";

export const metadata: Metadata = {
  title: "Registro Profesor | MACTI",
  description:
    "Solicita una cuenta de profesor para gestionar los cursos de tu instituto",
};

export default function AccountRequestTeacher() {
  return (
    <div className="p-8 rounded-2xl shadow-lg max-w-xl w-full space-y-6 border border-gray-200 mx-auto mt-6 mb-6 bg-background-form text-background-form-foreground">
      <MACTILogo className="w-37.5" />
      <AccountRequestTeacherForm />
      <p className="text-foreground font-medium text-center">
        ¿Eres Estudiante?{" "}
        <Link href="/registro" className="text-blue-500 hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}
