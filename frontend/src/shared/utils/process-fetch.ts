import { tryCatch } from "./try-catch";

type Success = [error: false, data: unknown];
type Failure = [
  error: true,
  data: null | undefined | { error_code?: string; message?: string },
];
type FetchResult = Success | Failure;

/**
 * Helper para hacer fetch y manejar errores
 * @param fetchPromise promesa del fetch
 * @returns tupla con error y datos
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
