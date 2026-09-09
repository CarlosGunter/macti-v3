import { tryCatch } from "./try-catch";

/**
 * Resultado exitoso de una petición procesada por `processFetch`.
 * Tupla con formato `[error: false, data: unknown]`.
 */
export type Success = [error: false, data: unknown];

/**
 * Resultado fallido de una petición procesada por `processFetch`.
 * Tupla con formato `[error: true, data: errorPayload]`.
 * - `undefined`: Error a nivel de red, conexión rechazada o timeout.
 * - `null`: Error al deserializar la respuesta (el cuerpo no es JSON válido).
 * - `{ error_code?, message? }`: Error retornado por el servidor con status HTTP no 2xx.
 */
export type Failure = [
  error: true,
  data: null | undefined | { error_code?: string; message?: string },
];

/**
 * Unión discriminada para el resultado de `processFetch`.
 */
export type FetchResult = Success | Failure;

/**
 * Orquestador especializado para peticiones `fetch` que gestiona de manera transparente
 * los 3 niveles de falla posibles en JavaScript:
 * 1. Fallas de red / transporte (conexión rechazada, DNS, timeout). Retorna `[true, undefined]`.
 * 2. Fallas de deserialización (JSON inválido o cuerpo no compatible). Retorna `[true, null]`.
 * 3. Fallas a nivel HTTP (`!response.ok`, ej. 400, 404, 500). Retorna `[true, errorPayload]`.
 *
 * En caso de éxito (HTTP 2xx y JSON válido), retorna `[false, data]`.
 *
 * @param fetchPromise Promesa devuelta por la llamada nativa a `fetch(...)`.
 * @returns Tupla `[error, data]` fácilmente destructurable.
 *
 * @example
 * ```ts
 * const [error, data] = await processFetch(
 *   fetch("/api/courses", { method: "GET" })
 * );
 *
 * if (error) {
 *   console.error("Error al obtener cursos:", data);
 *   return;
 * }
 *
 * console.log("Cursos obtenidos:", data);
 * ```
 */
export async function processFetch(
  fetchPromise: Promise<Response>,
): Promise<FetchResult> {
  const fetchResponse = await tryCatch(fetchPromise);
  if (fetchResponse.error) {
    return [true, undefined];
  }

  const fetchData = await tryCatch(fetchResponse.data.json());
  if (fetchData.error) return [true, null];
  if (!fetchResponse.data.ok) {
    return [true, fetchData.data];
  }

  return [false, fetchData.data];
}
