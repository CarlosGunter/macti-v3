"use client";

import { useQuery } from "@tanstack/react-query";
import Banner from "@/shared/components/feedback/Banner";
import { Anchor } from "@/shared/components/ui/Anchor";
import { privilegeRoles } from "@/shared/config/rolesMap";
import { fetchEnrolledCourses } from "../services/fetchEnrolledCourses";
import CourseCard from "./ui/CourseCard";

interface ListEnrolledCoursesProps {
  institute: string;
}

export default function ListEnrolledCourses({ institute }: ListEnrolledCoursesProps) {
  const {
    data: enrolledCourses,
    isLoading: isEnrolledCoursesLoading,
    error,
  } = useQuery({
    queryKey: ["enrolledCourses", institute],
    queryFn: async () => {
      return fetchEnrolledCourses({
        institute,
      });
    },
    enabled: !!institute,
  });

  if (isEnrolledCoursesLoading) {
    return <Banner message="Cargando cursos inscritos..." />;
  }

  if (error) {
    return <Banner message="Error al cargar los cursos inscritos." isError />;
  }

  return (
    <article className="mx-auto max-w-6xl md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8  w-full">
      {enrolledCourses && enrolledCourses.length > 0 ? (
        enrolledCourses.map((course) => (
          <CourseCard
            courseId={course.id}
            key={course.id}
            title={course.displayname}
            description={course.summary}
          >
            {course.role.some((r) => privilegeRoles.high.includes(r)) && (
              <Anchor href={`./${course.id}/solicitudes`}>Solicitudes</Anchor>
            )}
          </CourseCard>
        ))
      ) : (
        <Banner message="No hay cursos inscritos." />
      )}
    </article>
  );
}
