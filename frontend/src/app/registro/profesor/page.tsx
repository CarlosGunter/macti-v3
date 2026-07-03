import type { Metadata } from "next";
import AccountRequestTeacherForm from "@/domains/register/components/AccountRequestTeacherForm";

export const metadata: Metadata = {
  title: "Registro Profesor | MACTI",
  description:
    "Solicita una cuenta de profesor para gestionar los cursos de tu instituto",
};

export default function AccountRequestTeacher() {
  return (
    <div className="w-full max-w-md mx-auto py-10 px-4">
      <AccountRequestTeacherForm />
    </div>
  );
}
