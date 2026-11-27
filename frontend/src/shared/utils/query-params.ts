import type { PaginatedSearchParams } from "@/shared/schemas/paginationSchema";

/**
 * Adjunta los parámetros opcionales de búsqueda y paginación a una instancia de `URLSearchParams`.
 *
 * Omite `search` cuando es nulo, indefinido o solo contiene espacios en blanco.
 *
 * @param queryParams Instancia de `URLSearchParams` que será enriquecida.
 * @param params Parámetros de búsqueda y paginación a serializar.
 * @returns La misma instancia de `URLSearchParams` con los parámetros agregados.
 */
export function appendPaginatedSearchParams(
  queryParams: URLSearchParams,
  params: PaginatedSearchParams,
): URLSearchParams {
  const normalizedSearch = params.search?.trim();
  if (normalizedSearch) {
    queryParams.set("search", normalizedSearch);
  }

  if (params.page !== undefined) {
    queryParams.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    queryParams.set("limit", String(params.limit));
  }

  return queryParams;
}
