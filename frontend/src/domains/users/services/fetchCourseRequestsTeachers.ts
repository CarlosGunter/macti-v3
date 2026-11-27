import { processFetch } from "@/shared/utils/process-fetch";
import { appendPaginatedSearchParams } from "@/shared/utils/query-params";
import {
  courseRequestsTeachersSchema,
  type PaginatedCourseRequestsTeachersResponse,
} from "../schemas/courseRequestsTeachersSchema";
import type { CourseRequestsTeachersPayload } from "../types";

/**
 * Consulta a través del proxy autenticado las solicitudes de cuenta de docentes
 * de un instituto de forma paginada y filtrable por estado.
 *
 * @param payload Parámetros de consulta: instituto, estado, paginación y señal de cancelación.
 * @returns Respuesta paginada validada o `undefined` si ocurre un error.
 */
export async function fetchCourseRequestsTeachers({
  institute,
  status,
  page,
  limit,
  signal,
}: CourseRequestsTeachersPayload): Promise<
  PaginatedCourseRequestsTeachersResponse | undefined
> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  const queryParams = new URLSearchParams({
    institute,
  });
  if (status) {
    queryParams.set("status", status);
  }

  appendPaginatedSearchParams(queryParams, { page, limit });

  const listRequestPromise = fetch(
    `${basePath}/api/proxy/${institute}/register/list-account-requests/teachers?${queryParams.toString()}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      signal,
    },
  );

  const [error, listRequests] = await processFetch(listRequestPromise);
  if (signal?.aborted) {
    throw signal.reason ?? new DOMException("Aborted", "AbortError");
  }
  if (error) return undefined;

  const parsedListRequests = courseRequestsTeachersSchema.safeParse(listRequests);
  if (!parsedListRequests.success) return undefined;

  return parsedListRequests.data;
}
