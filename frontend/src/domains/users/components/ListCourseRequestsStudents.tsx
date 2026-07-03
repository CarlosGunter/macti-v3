"use client";

import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import Banner from "@/shared/components/feedback/Banner";
import { fetchCourseRequestsStudents } from "../services/fetchCourseRequestStudents";
import { useFilterStore } from "../stores/filterStore";
import { CourseFilters } from "./ui/CourseFilters";
import { NoCourseRequestBanner } from "./ui/NoCourseRequestBanner";
import StudentCourseRequestCard from "./ui/StudentCourseRequestCard";

interface ListCourseRequestStudentProps {
  course_id: string;
  institute: string;
}

export default function ListCourseRequestsStudent({
  course_id,
  institute,
}: ListCourseRequestStudentProps) {
  const { statusFilter, setStatusFilter } = useFilterStore();

  const {
    data: courseRequests,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["courseRequestsStudents", course_id, institute, statusFilter],
    queryFn: async () => {
      return fetchCourseRequestsStudents({
        course_id,
        institute,
        status: statusFilter || undefined,
      });
    },
    enabled: !!institute,
  });

  if (!institute) notFound();

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
    <section className="grid gap-4">
      <CourseFilters statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

      {courseRequests?.map((request) => (
        <StudentCourseRequestCard
          key={request.id}
          request={request}
          institute={institute}
          courseId={course_id}
        />
      ))}
    </section>
  );
}
