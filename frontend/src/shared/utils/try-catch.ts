/**
 * Representa el resultado exitoso de una operación asíncrona envuelta en `tryCatch`.
 * @template T Tipo de los datos devueltos en caso de éxito.
 */
interface Success<T> {
  data: T;
  error: null;
}

/**
 * Representa el resultado fallido de una operación asíncrona envuelta en `tryCatch`.
 * @template E Tipo del error capturado.
 */
interface Failure<E> {
  data: null;
  error: E;
}

/**
 * Unión discriminada que representa el resultado seguro de una promesa (Success o Failure).
 * @template T Tipo de datos en caso de éxito.
 * @template E Tipo de error en caso de fallo (por defecto `Error`).
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Envuelve una promesa para capturar excepciones sin necesidad de bloques try/catch imperativos,
 * retornando un objeto discriminado `{ data, error }`.
 *
 * @template T Tipo de dato devuelto por la promesa resuelta.
 * @template E Tipo de la excepción capturada en caso de rechazo.
 * @param promise Promesa asíncrona a ejecutar.
 * @returns Objeto con `data` y `error: null` en éxito, o `data: null` y `error` en fallo.
 *
 * @example
 * ```ts
 * const { data, error } = await tryCatch(fetchUserData());
 * if (error) {
 *   console.error("Falló la petición:", error);
 *   return;
 * }
 * console.log("Datos obtenidos:", data);
 * ```
 */
export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}

