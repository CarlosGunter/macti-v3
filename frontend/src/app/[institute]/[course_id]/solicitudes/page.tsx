import type { Metadata } from "next";
import { fetchCoursesServer } from "@/domains/courses/services/fetchCoursesServer";
import ListCourseRequestsStudent from "@/domains/users/components/ListCourseRequestsStudents";

export const metadata: Metadata = {
  title: "Solicitudes de Alumnos | MACTI",
  description: "Revisa las solicitudes de los estudiantes para este curso",
};

interface SolicitudesPageProps {
  params: Promise<{
    course_id: string;
    institute: string;
  }>;
}

export default async function SolicitudesPage({ params }: SolicitudesPageProps) {
  const { course_id, institute } = await params;
  const currentCourse =
    (
      await fetchCoursesServer({
        institute,
        ids: [parseInt(course_id, 10)],
      })
    )?.[0] ?? null;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold">{currentCourse?.fullname ?? "Sin nombre"}</h1>
        <h2 className="text-xl">Solicitudes</h2>
      </div>

      <ListCourseRequestsStudent course_id={course_id} institute={institute} />
    </div>
  );
}
