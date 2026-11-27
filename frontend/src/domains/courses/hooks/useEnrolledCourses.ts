"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { InstitutesType } from "@/shared/config/institutes";
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from "@/shared/schemas/paginationSchema";
import { usePrivilegeStore } from "@/shared/stores/privilegeStore";
import { fetchEnrolledCourses } from "../services/fetchEnrolledCourses";

/**
 * Parámetros aceptados por el hook {@link useEnrolledCourses}.
 */
interface UseEnrolledCoursesProps {
  /** Identificador del instituto actual. */
  institute: InstitutesType;
  /** Término de búsqueda estabilizado (debounced). */
  search?: string;
  /** Número de página actual (indexada desde 1). */
  page?: number;
  /** Cantidad de cursos por página. */
  limit?: number;
}

/**
 * Hook para consultar de forma paginada los cursos en los que el usuario está inscrito.
 *
 * Además de recuperar la página solicitada, procesa los roles asignados en cada
 * curso (`course.role`) y los sincroniza de forma acumulativa y sin duplicados en
 * el store global de privilegios (`usePrivilegeStore`).
 *
 * @param props Identificador del instituto, término de búsqueda y parámetros de paginación.
 * @returns Consulta de TanStack Query con la respuesta paginada de cursos inscritos.
 */
export function useEnrolledCourses({
  institute,
  search = "",
  page = DEFAULT_PAGE,
  limit = DEFAULT_PAGE_LIMIT,
}: UseEnrolledCoursesProps) {
  const addRoles = usePrivilegeStore((state) => state.addRoles);

  return useQuery({
    queryKey: ["enrolledCourses", institute, { search, page, limit }],
    queryFn: async ({ signal }) => {
      const response = await fetchEnrolledCourses({
        institute,
        search,
        page,
        limit,
        signal,
      });

      if (!response) {
        throw new Error("No se pudieron cargar los cursos inscritos.");
      }

      if (response.items.length > 0) {
        const extractedRoles = response.items.flatMap((course) => course.role);
        addRoles(extractedRoles);
      }

      return response;
    },
    placeholderData: keepPreviousData,
    enabled: !!institute,
  });
}
