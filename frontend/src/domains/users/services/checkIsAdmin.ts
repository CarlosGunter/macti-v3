import { rolesMap } from "@/shared/config/rolesMap";
import { usePrivilegeStore } from "@/shared/stores/privilegeStore";
import { processFetch } from "@/shared/utils/process-fetch";
import {
  type IsAdminResponse,
  isAdminResponseSchema,
} from "../schemas/isAdminResponseSchema";

export interface CheckIsAdminServerParams {
  institute: string;
  accessToken: string;
}

/**
 * Consulta el endpoint /users/is-admin de la API de backend (FastAPI) desde el servidor (BFF / route handlers).
 *
 * @param params Parámetros requeridos: identificador del instituto y Bearer token del usuario.
 * @returns Objeto IsAdminResponse validado o undefined si ocurre un error de red, parsing o autorización.
 */
export async function checkIsAdminServer({
  institute,
  accessToken,
}: CheckIsAdminServerParams): Promise<IsAdminResponse | undefined> {
  const queryParams = new URLSearchParams({ institute });

  const responsePromise = fetch(
    `${process.env.K8S_API_URL}/users/is-admin?${queryParams.toString()}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const [error, responseData] = await processFetch(responsePromise);
  if (error) {
    return undefined;
  }

  const parsed = isAdminResponseSchema.safeParse(responseData);
  if (!parsed.success) {
    return undefined;
  }

  return parsed.data;
}

/**
 * Consulta el endpoint /users/is-admin del backend para el usuario actual y sincroniza
 * el resultado en el almacén global de privilegios (usePrivilegeStore).
 *
 * @param institute Identificador del instituto al que pertenece la sesión.
 * @param accessToken Token de acceso Bearer (Keycloak) del usuario autenticado.
 * @returns true si el usuario es administrador, false en caso contrario.
 */
export async function checkAndStoreAdminPrivilege(
  institute: string,
  accessToken: string,
): Promise<boolean> {
  try {
    const adminResponse = await checkIsAdminServer({
      institute,
      accessToken,
    });

    if (adminResponse?.is_admin) {
      usePrivilegeStore.getState().setRole(rolesMap.manager);
      return true;
    }

    usePrivilegeStore.getState().reset();
    return false;
  } catch (error) {
    console.error(
      `[checkAndStoreAdminPrivilege] Error al verificar permisos de administrador para ${institute}:`,
      error,
    );
    usePrivilegeStore.getState().reset();
    return false;
  }
}

export interface CheckIsAdminClientParams {
  institute: string;
}

/**
 * Consulta el endpoint /users/is-admin a través del proxy BFF desde el cliente o componentes en frontend.
 *
 * @param params Parámetros requeridos: identificador del instituto.
 * @returns Objeto IsAdminResponse validado o undefined si ocurre un error.
 */
export async function checkIsAdminClient({
  institute,
}: CheckIsAdminClientParams): Promise<IsAdminResponse | undefined> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const queryParams = new URLSearchParams({ institute });

  const responsePromise = fetch(
    `${basePath}/api/proxy/${institute}/users/is-admin?${queryParams.toString()}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const [error, responseData] = await processFetch(responsePromise);
  if (error) {
    return undefined;
  }

  const parsed = isAdminResponseSchema.safeParse(responseData);
  if (!parsed.success) {
    return undefined;
  }

  return parsed.data;
}
