"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DEFAULT_PAGE } from "@/shared/schemas/paginationSchema";
import { ACCOUNT_REQUESTS_PAGE_LIMIT } from "../constants";
import { fetchCourseRequestsStudents } from "../services/fetchCourseRequestStudents";
import type { UserStatus } from "../types";

/**
 * Parámetros aceptados por el hook {@link useCourseRequestsStudents}.
 */
interface UseCourseRequestsStudentsProps {
  /** Identificador del curso en Moodle. */
  courseId: string;
  /** Identificador del instituto actual. */
  institute: string;
  /** Filtro opcional por estado de solicitud. */
  status?: UserStatus | null;
  /** Número de página actual (indexada desde 1). */
  page?: number;
  /** Cantidad de solicitudes por página. */
  limit?: number;
}

/**
 * Hook para consultar de forma paginada las solicitudes de cuenta de alumnos
 * asociadas a un curso e instituto.
 *
 * Mantiene el prefijo `["courseRequestsStudents", courseId, institute]` en la `queryKey`
 * para permitir la invalidación automática tras actualizar el estatus de una solicitud.
 *
 * @param props Curso, instituto, filtro de estado y parámetros de paginación.
 * @returns Consulta de TanStack Query con la respuesta paginada de solicitudes de estudiantes.
 */
export function useCourseRequestsStudents({
  courseId,
  institute,
  status = null,
  page = DEFAULT_PAGE,
  limit = ACCOUNT_REQUESTS_PAGE_LIMIT,
}: UseCourseRequestsStudentsProps) {
  return useQuery({
    queryKey: ["courseRequestsStudents", courseId, institute, status, { page, limit }],
    queryFn: async ({ signal }) => {
      const response = await fetchCourseRequestsStudents({
        course_id: courseId,
        institute,
        status: status ?? undefined,
        page,
        limit,
        signal,
      });

      if (!response) {
        throw new Error("No se pudieron cargar las solicitudes de estudiantes.");
      }

      return response;
    },
    placeholderData: keepPreviousData,
    enabled: Boolean(institute && courseId),
  });
}
