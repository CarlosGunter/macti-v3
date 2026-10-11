import { genericOAuthClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { getInstituteUrl } from "@/shared/utils/institute-url";

const isBuildPhase = process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;

/**
 * Crea una instancia de cliente de autenticación de Better Auth para el instituto indicado.
 *
 * Configura el interceptor de errores en `fetchOptions` para registrar fallos
 * y redirigir a `/[institute]` si ocurre un error del servidor (status >= 500).
 *
 * @param institute Identificador del instituto.
 * @returns Instancia configurada de cliente de autenticación.
 */
const createInstituteAuthClient = (institute: string) => {
  return createAuthClient({
    baseURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/proxy/${institute}`,
    fetchOptions: {
      onError: async (context) => {
        console.error(`[BetterAuth Client Error - ${institute}]:`, context.error);
        if (typeof window !== "undefined" && (context.response?.status ?? 500) >= 500) {
          window.location.assign(getInstituteUrl(institute));
        }
      },
    },
    plugins: [genericOAuthClient()],
  });
};

type AuthClient = ReturnType<typeof createInstituteAuthClient>;

const authClientCache = new Map<string, AuthClient>();

/**
 * Obtiene o crea de forma cacheada el cliente de Better Auth para un instituto específico.
 *
 * @param institute Identificador del instituto.
 * @returns Instancia de cliente de autenticación.
 */
export const getAuthClient = (institute: string) => {
  if (isBuildPhase) {
    return createAuthClient({
      plugins: [genericOAuthClient()],
    });
  }

  const cachedClient = authClientCache.get(institute);

  if (cachedClient) {
    return cachedClient;
  }

  const client = createInstituteAuthClient(institute);

  authClientCache.set(institute, client);
  return client;
};
