"use client";

import { useEffect } from "react";
import Banner from "@/shared/components/feedback/Banner";
import { Anchor } from "@/shared/components/ui/Anchor";
import { type InstitutesType, institutes } from "@/shared/config/institutes";
import { privilegeRoles, rolesMap } from "@/shared/config/rolesMap";
import { usePrivilegeStore } from "@/shared/stores/privilegeStore";
import { useEnrolledCourses } from "../hooks/useEnrolledCourses";
import CourseCard from "./ui/CourseCard";

interface ListEnrolledCoursesProps {
  institute: InstitutesType;
  isAdmin?: boolean;
}

/**
 * Componente que renderiza la lista de cursos en los que el usuario está inscrito.
 *
 * Muestra las tarjetas de cursos con accesos directos a Moodle y Jupyter,
 * así como el botón de gestión de solicitudes si el usuario es docente del curso
 * según la respuesta de la API o si cuenta con rol de administrador recibido por props.
 *
 * @param props - Identificador del instituto y bandera de privilegios de administrador.
 */
export default function ListEnrolledCourses({
  institute,
  isAdmin = false,
}: ListEnrolledCoursesProps) {
  const currentInstitute = institutes[institute];
  const addRoles = usePrivilegeStore((state) => state.addRoles);
  const {
    data: enrolledCourses,
    isLoading: isEnrolledCoursesLoading,
    error,
  } = useEnrolledCourses({ institute });

  useEffect(() => {
    if (isAdmin) {
      addRoles([rolesMap.manager]);
    } else {
      const currentRoles = usePrivilegeStore.getState().roles;
      if (currentRoles.includes(rolesMap.manager)) {
        const filteredRoles = currentRoles.filter((r) => r !== rolesMap.manager);
        usePrivilegeStore.getState().setRoles(filteredRoles);
      }
    }
  }, [isAdmin, addRoles]);

  if (isEnrolledCoursesLoading) {
    return <Banner message="Cargando cursos inscritos..." />;
  }

  if (error) {
    return <Banner message="Error al cargar los cursos inscritos." isError />;
  }

  return (
    <article className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
      {enrolledCourses && enrolledCourses.length > 0 ? (
        enrolledCourses.map((course) => {
          const isCourseTeacher = course.role.some((r) =>
            privilegeRoles.high.includes(r),
          );
          const canManageRequests = isAdmin || isCourseTeacher;

          return (
            <CourseCard
              courseId={course.id}
              key={course.id}
              title={course.displayname}
              description={course.summary}
              progress={course.progress}
            >
              {canManageRequests && (
                <Anchor
                  variant="secondary"
                  href={`./${course.id}/solicitudes`}
                  aria-label="Solicitudes de usuarios que queran inscribirse en el curso"
                >
                  Solicitudes
                </Anchor>
              )}
              <Anchor
                href={`${currentInstitute.moodle}/course/view.php?id=${course.id}`}
                variant="bordered"
                external
              >
                Moodle
              </Anchor>
              <Anchor href={currentInstitute.jupyter} variant="bordered" external>
                Jupyter
              </Anchor>
            </CourseCard>
          );
        })
      ) : (
        <Banner message="No hay cursos inscritos." />
      )}
    </article>
  );
}
