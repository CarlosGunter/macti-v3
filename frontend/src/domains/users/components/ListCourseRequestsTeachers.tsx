"use client";

import { useQuery } from "@tanstack/react-query";
import Banner from "@/shared/components/feedback/Banner";
import { fetchCourseRequestsTeachers } from "../services/fetchCourseRequestsTeachers";
import { useFilterStore } from "../stores/filterStore";
import { CourseFilters } from "./ui/CourseFilters";
import { NoCourseRequestBanner } from "./ui/NoCourseRequestBanner";
import TeacherCourseRequestCard from "./ui/TeacherCourseRequestCard";

interface ListCourseRequestsTeachersProps {
  institute: string;
}

export default function ListCourseRequestsTeachers({
  institute,
}: ListCourseRequestsTeachersProps) {
  const { statusFilter, setStatusFilter } = useFilterStore();

  const {
    data: courseRequests,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["courseRequestsTeachers", institute, statusFilter],
    queryFn: async () => {
      return fetchCourseRequestsTeachers({
        institute,
        status: statusFilter || undefined,
      });
    },
    enabled: !!institute,
  });

  if (isLoading) {
    return <Banner message="Cargando solicitudes..." />;
  }

  if (error) {
    return <Banner message="Ocurrió un error al cargar las solicitudes" isError />;
  }

  if (!courseRequests?.length) {
    return (
      <section className="grid gap-4">
        <CourseFilters statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
        <NoCourseRequestBanner />
      </section>
    );
  }

  return (
    <section className="grid gap-4 mx-auto w-full max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Solicitudes de Cursos</h2>
        <p className="text-foreground/70">
          Aquí puedes ver todas las solicitudes de cursos que los docentes han realizado.
        </p>
      </div>
      <CourseFilters statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

      {courseRequests?.map((request) => (
        <TeacherCourseRequestCard
          key={`${request.user.id}-${request.courses.id}`}
          request={request}
        />
      ))}
    </section>
  );
}
