import type { PaginatedSearchParams } from "@/shared/schemas/paginationSchema";
import { processFetch } from "@/shared/utils/process-fetch";
import { appendPaginatedSearchParams } from "@/shared/utils/query-params";
import {
  listCoursesSchema,
  type PaginatedCoursesResponse,
} from "../schemas/listCoursesSchema";

/**
 * Parámetros de consulta en cliente para el catálogo de cursos de un instituto.
 */
export interface FetchCoursesClientPayload extends PaginatedSearchParams {
  /** Identificador del instituto a consultar. */
  institute: string;
  /** Lista opcional de IDs de cursos para filtrar resultados. */
  ids?: number[];
  /** Señal opcional para cancelar peticiones obsoletas desde TanStack Query. */
  signal?: AbortSignal;
}

/**
 * Consulta desde el navegador el catálogo paginado de cursos de un instituto,
 * con soporte para búsqueda por término, paginación y cancelación mediante `AbortSignal`.
 *
 * @param payload Parámetros de consulta, paginación y señal de cancelación.
 * @returns Respuesta paginada validada o `undefined` si falla la petición o validación.
 */
export async function fetchCoursesClient({
  institute,
  ids,
  search,
  page,
  limit,
  signal,
}: FetchCoursesClientPayload): Promise<PaginatedCoursesResponse | undefined> {
  const queryParams = new URLSearchParams({ institute });
  if (ids && Array.isArray(ids)) {
    ids.forEach((id) => {
      queryParams.append("ids", String(id));
    });
  }

  appendPaginatedSearchParams(queryParams, { search, page, limit });

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const listCoursesPromise = fetch(`${baseUrl}/courses/?${queryParams.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    signal,
  });

  const [error, listCourses] = await processFetch(listCoursesPromise);
  if (signal?.aborted) {
    throw signal.reason ?? new DOMException("Aborted", "AbortError");
  }
  if (error) return undefined;

  const parsedListCourses = listCoursesSchema.safeParse(listCourses);
  if (!parsedListCourses.success) return undefined;

  return parsedListCourses.data;
}
