"use client";

import { useQuery } from "@tanstack/react-query";
import type { InstitutesType } from "@/shared/config/institutes";
import { usePrivilegeStore } from "@/shared/stores/privilegeStore";
import { fetchEnrolledCourses } from "../services/fetchEnrolledCourses";

interface UseEnrolledCoursesProps {
  institute: InstitutesType;
}

/**
 * Hook para consultar los cursos en los que el usuario está inscrito.
 *
 * Además de recuperar la lista de cursos, procesa en el mismo ciclo los roles
 * asignados en cada curso (`course.role`) y los sincroniza de forma acumulativa
 * y sin duplicados en el store global de privilegios (`usePrivilegeStore`).
 *
 * @param props - Identificador del instituto actual.
 * @returns Consulta de TanStack Query con la lista de cursos inscritos.
 */
export function useEnrolledCourses({ institute }: UseEnrolledCoursesProps) {
  const addRoles = usePrivilegeStore((state) => state.addRoles);

  return useQuery({
    queryKey: ["enrolledCourses", institute],
    queryFn: async () => {
      const courses = await fetchEnrolledCourses({ institute });

      if (courses && courses.length > 0) {
        const extractedRoles = courses.flatMap((course) => course.role);
        addRoles(extractedRoles);
      }

      return courses;
    },
    enabled: !!institute,
  });
}
