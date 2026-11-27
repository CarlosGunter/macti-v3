import z from "zod";

/**
 * Página inicial por defecto para consultas paginadas.
 */
export const DEFAULT_PAGE = 1;

/**
 * Cantidad máxima de elementos por página por defecto.
 */
export const DEFAULT_PAGE_LIMIT = 9;

/**
 * Parámetros estándar de búsqueda y paginación enviados a los endpoints del backend.
 */
export interface PaginatedSearchParams {
  /** Término de búsqueda opcional para filtrar resultados en el servidor. */
  search?: string;
  /** Número de página solicitada (indexada desde 1). */
  page?: number;
  /** Cantidad máxima de elementos por página. */
  limit?: number;
}

/**
 * Estructura genérica de respuesta paginada devuelta por el backend de MACTI.
 */
export interface PaginatedResponse<T> {
  /** Lista de elementos correspondientes a la página actual. */
  items: T[];
  /** Cantidad total de registros que coinciden con la consulta. */
  total: number;
  /** Número de la página actual (indexada desde 1). */
  page: number;
  /** Cantidad de elementos solicitados por página. */
  limit: number;
  /** Total de páginas disponibles (`0` cuando `total` es `0`). */
  total_pages: number;
}

/**
 * Fábrica de esquemas Zod para validar respuestas paginadas del backend.
 *
 * Reutilizable para cualquier dominio que consuma el contrato estándar
 * `PaginatedResponse[T]` de FastAPI.
 *
 * @param itemSchema Esquema Zod individual para cada elemento del arreglo `items`.
 * @returns Esquema Zod objeto con `items`, `total`, `page`, `limit` y `total_pages`.
 */
export function createPaginatedResponseSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total_pages: z.number().int().min(0),
  });
}

/**
 * Construye una respuesta paginada vacía tipada para valores de respaldo iniciales.
 *
 * @param page Número de página actual (por defecto `DEFAULT_PAGE`).
 * @param limit Límite por página (por defecto `DEFAULT_PAGE_LIMIT`).
 * @returns Objeto {@link PaginatedResponse} sin elementos.
 */
export function createEmptyPaginatedResponse<T>(
  page = DEFAULT_PAGE,
  limit = DEFAULT_PAGE_LIMIT,
): PaginatedResponse<T> {
  return {
    items: [],
    total: 0,
    page,
    limit,
    total_pages: 0,
  };
}
