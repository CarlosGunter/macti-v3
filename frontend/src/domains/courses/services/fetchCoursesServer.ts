import type { PaginatedSearchParams } from "@/shared/schemas/paginationSchema";
import { processFetch } from "@/shared/utils/process-fetch";
import { appendPaginatedSearchParams } from "@/shared/utils/query-params";
import {
  listCoursesSchema,
  type PaginatedCoursesResponse,
} from "../schemas/listCoursesSchema";

/**
 * Parámetros de consulta en servidor para el catálogo de cursos de un instituto.
 */
interface FetchCoursesServerPayload extends PaginatedSearchParams {
  /** Identificador del instituto a consultar. */
  institute: string;
  /** Lista opcional de IDs de cursos para filtrar resultados. */
  ids?: number[];
}

/**
 * Consulta la lista paginada de cursos disponibles desde el servidor para un instituto.
 *
 * @param payload Parámetros de instituto, filtrado por IDs, búsqueda y paginación.
 * @returns Respuesta paginada validada o `undefined` si ocurre un error de red o contrato.
 */
export async function fetchCoursesServer({
  institute,
  ids,
  search,
  page,
  limit,
}: FetchCoursesServerPayload): Promise<PaginatedCoursesResponse | undefined> {
  const queryParams = new URLSearchParams({ institute });
  if (ids && Array.isArray(ids)) {
    ids.forEach((id) => {
      queryParams.append("ids", String(id));
    });
  }

  appendPaginatedSearchParams(queryParams, { search, page, limit });

  const listCoursesPromise = fetch(
    `${process.env.K8S_API_URL}/courses/?${queryParams.toString()}`,
    {
      method: "GET",
      next: { revalidate: 300 },
      headers: { "Content-Type": "application/json" },
    },
  );

  const [error, listCourses] = await processFetch(listCoursesPromise);
  if (error) return undefined;

  const parsedListCourses = listCoursesSchema.safeParse(listCourses);
  if (!parsedListCourses.success) return undefined;

  return parsedListCourses.data;
}
