import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth, keycloak } from "better-auth/plugins";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { getInstituteUrl } from "@/shared/utils/institute-url";
import type { InstitutesType } from "../../shared/config/institutes";
import { keycloakConfigs } from "../../shared/config/kcConfig";
import { getDbInstance } from "../db/db-factory";

const SESSION_IDLE_TIMEOUT_SECONDS = 24 * 60 * 60; // 24 horas
const SESSION_REFRESH_WINDOW_SECONDS = 15 * 60; // 15 minutos

const isBuildPhase = process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;

/**
 * Obtiene o inicializa la instancia de Better Auth para un instituto específico.
 *
 * Configura la base de datos, prefijo de cookies, duración de sesiones,
 * proveedor Keycloak y el manejador global de errores (`onAPIError`)
 * para redirigir a `/[institute]` si ocurre algún error.
 *
 * @param institute Identificador del instituto.
 * @param dbProvider Proveedor opcional de base de datos.
 * @param baseUrl URL base opcional para las rutas de autenticación.
 * @returns Instancia configurada de Better Auth.
 */
export const getAuthInstance = (
  institute: InstitutesType,
  dbProvider: string | null = null,
  baseUrl: string | null = null,
) => {
  // Durante la fase de build, devolvemos una instancia genérica
  if (isBuildPhase) {
    return genericAuthInstance;
  }

  const keycloakConfig = keycloakConfigs[institute];
  const errorRedirectUrl = getInstituteUrl(institute);

  return betterAuth({
    database: getDbInstance(dbProvider),
    baseURL: baseUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/proxy/${institute}`,
    onAPIError: {
      errorURL: errorRedirectUrl,
      onError: (error) => {
        console.error(`[BetterAuth Error - ${institute}]:`, error);
      },
    },
    advanced: {
      cookiePrefix: `auth-${institute}`,
    },
    session: {
      // Coincide con la ventana de tiempo de espera inactivo de Keycloak.
      expiresIn: SESSION_IDLE_TIMEOUT_SECONDS,
      // Actualiza la sesión con la frecuencia para mantenerse activa durante el uso.
      updateAge: SESSION_REFRESH_WINDOW_SECONDS,
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["keycloak"],
      },
    },
    plugins: [
      genericOAuth({
        config: [
          keycloak({
            clientId: keycloakConfig?.clientId ?? "",
            clientSecret: keycloakConfig?.clientSecret ?? "",
            issuer: keycloakConfig?.issuer ?? "",
          }),
        ],
      }),
      nextCookies(),
    ],
  });
};

const genericAuthInstance = betterAuth({
  plugins: [
    genericOAuth({
      config: [],
    }),
    nextCookies(),
  ],
});
