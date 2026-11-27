"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { InstitutesType } from "@/shared/config/institutes";
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from "@/shared/schemas/paginationSchema";
import type { PaginatedCoursesResponse } from "../schemas/listCoursesSchema";
import { fetchCoursesClient } from "../services/fetchCoursesClient";

/**
 * Parámetros aceptados por el hook {@link useInstituteCourses}.
 */
interface UseInstituteCoursesProps {
  /** Identificador del instituto a consultar. */
  institute: InstitutesType;
  /** Término de búsqueda estabilizado (debounced). */
  search?: string;
  /** Número de página actual (indexada desde 1). */
  page?: number;
  /** Cantidad de cursos por página. */
  limit?: number;
  /** Datos iniciales precargados desde el servidor para la primera página sin filtros. */
  initialData?: PaginatedCoursesResponse;
}

/**
 * Hook de TanStack Query para consultar el catálogo paginado de cursos de un instituto
 * con soporte para búsqueda debounced y datos iniciales hidratados desde SSR.
 *
 * @param props Parámetros de consulta, paginación y datos iniciales opcionales.
 * @returns Resultado de consulta de TanStack Query con los cursos paginados.
 */
export function useInstituteCourses({
  institute,
  search = "",
  page = DEFAULT_PAGE,
  limit = DEFAULT_PAGE_LIMIT,
  initialData,
}: UseInstituteCoursesProps) {
  const isInitialUnfilteredPage = page === DEFAULT_PAGE && !search;

  return useQuery({
    queryKey: ["instituteCourses", institute, { search, page, limit }],
    queryFn: async ({ signal }) => {
      const result = await fetchCoursesClient({
        institute,
        search,
        page,
        limit,
        signal,
      });

      if (!result) {
        throw new Error("No se pudieron cargar los cursos.");
      }

      return result;
    },
    initialData: isInitialUnfilteredPage ? initialData : undefined,
    placeholderData: keepPreviousData,
    enabled: !!institute,
  });
}
