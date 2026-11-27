import { processFetch } from "@/shared/utils/process-fetch";
import { appendPaginatedSearchParams } from "@/shared/utils/query-params";
import {
  courseRequestsStudentsSchema,
  type PaginatedCourseRequestsStudentsResponse,
} from "../schemas/courseRequestsStudentsSchema";
import type { CourseRequestsStudentsPayload } from "../types";

/**
 * Consulta a través del proxy autenticado las solicitudes de cuenta de estudiantes
 * de un curso de forma paginada y filtrable por estado.
 *
 * @param payload Parámetros de consulta: curso, instituto, estado, paginación y señal de cancelación.
 * @returns Respuesta paginada validada o `undefined` si ocurre un error.
 */
export async function fetchCourseRequestsStudents({
  course_id,
  institute,
  status,
  page,
  limit,
  signal,
}: CourseRequestsStudentsPayload): Promise<
  PaginatedCourseRequestsStudentsResponse | undefined
> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  const queryParams = new URLSearchParams({
    course_id: parseInt(course_id, 10).toString(),
    institute,
  });
  if (status) {
    queryParams.set("status", status);
  }

  appendPaginatedSearchParams(queryParams, { page, limit });

  const listCourseRequestPromise = fetch(
    `${basePath}/api/proxy/${institute}/register/list-account-requests/students?${queryParams.toString()}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      signal,
    },
  );

  const [error, listCourseRequests] = await processFetch(listCourseRequestPromise);
  if (signal?.aborted) {
    throw signal.reason ?? new DOMException("Aborted", "AbortError");
  }
  if (error) return undefined;

  const parsedListCourseRequests =
    courseRequestsStudentsSchema.safeParse(listCourseRequests);
  if (!parsedListCourseRequests.success) return undefined;

  return parsedListCourseRequests.data;
}
