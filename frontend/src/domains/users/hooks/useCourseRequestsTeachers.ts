"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DEFAULT_PAGE } from "@/shared/schemas/paginationSchema";
import { ACCOUNT_REQUESTS_PAGE_LIMIT } from "../constants";
import { fetchCourseRequestsTeachers } from "../services/fetchCourseRequestsTeachers";
import type { UserStatus } from "../types";

/**
 * Parámetros aceptados por el hook {@link useCourseRequestsTeachers}.
 */
interface UseCourseRequestsTeachersProps {
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
 * Hook para consultar de forma paginada las solicitudes de cuenta de docentes
 * de un instituto.
 *
 * Mantiene el prefijo `["courseRequestsTeachers", institute]` en la `queryKey`
 * para permitir la invalidación automática tras actualizar el estatus de una solicitud.
 *
 * @param props Instituto, filtro de estado y parámetros de paginación.
 * @returns Consulta de TanStack Query con la respuesta paginada de solicitudes de docentes.
 */
export function useCourseRequestsTeachers({
  institute,
  status = null,
  page = DEFAULT_PAGE,
  limit = ACCOUNT_REQUESTS_PAGE_LIMIT,
}: UseCourseRequestsTeachersProps) {
  return useQuery({
    queryKey: ["courseRequestsTeachers", institute, status, { page, limit }],
    queryFn: async ({ signal }) => {
      const response = await fetchCourseRequestsTeachers({
        institute,
        status: status ?? undefined,
        page,
        limit,
        signal,
      });

      if (!response) {
        throw new Error("No se pudieron cargar las solicitudes de docentes.");
      }

      return response;
    },
    placeholderData: keepPreviousData,
    enabled: Boolean(institute),
  });
}
