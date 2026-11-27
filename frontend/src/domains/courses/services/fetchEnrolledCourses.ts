import type { PaginatedSearchParams } from "@/shared/schemas/paginationSchema";
import { processFetch } from "@/shared/utils/process-fetch";
import { appendPaginatedSearchParams } from "@/shared/utils/query-params";
import {
  enrolledCoursesSchema,
  type PaginatedEnrolledCoursesResponse,
} from "../schemas/enrolledCoursesSchema";

/**
 * Parámetros de consulta para los cursos en los que el usuario está inscrito.
 */
export interface FetchEnrolledCoursesPayload extends PaginatedSearchParams {
  /** Identificador del instituto actual. */
  institute: string;
  /** Señal opcional para cancelar peticiones obsoletas desde TanStack Query. */
  signal?: AbortSignal;
}

/**
 * Consulta a través del proxy autenticado los cursos inscritos del usuario de forma paginada.
 *
 * @param payload Instituto, término de búsqueda, paginación y señal opcional de cancelación.
 * @returns Respuesta paginada validada o `undefined` si ocurre un error.
 */
export async function fetchEnrolledCourses({
  institute,
  search,
  page,
  limit,
  signal,
}: FetchEnrolledCoursesPayload): Promise<PaginatedEnrolledCoursesResponse | undefined> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const queryParams = new URLSearchParams({
    institute,
  });

  appendPaginatedSearchParams(queryParams, { search, page, limit });

  const enrolledCoursesPromise = fetch(
    `${basePath}/api/proxy/${institute}/courses/enrolled?${queryParams.toString()}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      signal,
    },
  );

  const [error, enrolledCourses] = await processFetch(enrolledCoursesPromise);
  if (signal?.aborted) {
    throw signal.reason ?? new DOMException("Aborted", "AbortError");
  }
  if (error) return undefined;

  const parsedEnrolledCourses = enrolledCoursesSchema.safeParse(enrolledCourses);
  if (!parsedEnrolledCourses.success) return undefined;

  return parsedEnrolledCourses.data;
}
