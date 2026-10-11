import { toNextJsHandler } from "better-auth/next-js";
import { headers as NextHeaders } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance } from "@/infra/auth/auth-factory";
import type { InstitutesType } from "@/shared/config/institutes";
import { getInstituteUrl } from "@/shared/utils/institute-url";
import { tryCatch } from "@/shared/utils/try-catch";

interface RequestParams {
  params: Promise<{
    institute: InstitutesType;
    path?: string[];
  }>;
}

type AuthInstance = ReturnType<typeof getAuthInstance>;

/**
 * Maneja todas las solicitudes HTTP del endpoint proxy dinámico por instituto.
 *
 * 1. Resuelve la instancia de autenticación según el instituto.
 * 2. Intenta delegar primero en rutas internas de Better Auth con control de errores.
 * 3. Obtiene la sesión y, si existe, el access token de Keycloak de manera segura.
 * 4. Si no hay sesión, inicia el flujo de login con Better Auth.
 * 5. Si ocurre algún error en los handlers de Better Auth, redirige a `/[institute]`.
 * 6. Construye el endpoint final y reenvía la petición a la API externa.
 *
 * @param req Solicitud entrante de Next.js.
 * @param context Contexto de ruta con parámetros dinámicos.
 * @returns Respuesta HTTP proveniente de Better Auth, redirección por error o de la API externa proxificada.
 */
async function proxyHandler(req: NextRequest, { params }: RequestParams) {
  const { institute, path } = await params;
  const instituteRedirectUrl = new URL(getInstituteUrl(institute));

  try {
    const auth = getAuthInstance(institute);
    const betterAuthResponse = await tryHandleBetterAuthRoute(
      req,
      auth,
      instituteRedirectUrl,
    );
    if (betterAuthResponse) {
      return betterAuthResponse;
    }

    const session = await getSessionWithAccessToken(auth);
    if (!session) {
      const redirectUrl = await handleBetterAuthLogin(req, auth, institute);
      if (redirectUrl) return NextResponse.redirect(redirectUrl);

      return NextResponse.redirect(instituteRedirectUrl);
    }

    const targetPath = getTargetPath(path);
    const resolvedApiEndpoint = buildResolvedApiEndpoint(req, targetPath);

    return await proxyToApi(req, resolvedApiEndpoint, session?.session?.keycloakToken);
  } catch (error) {
    console.error(`[proxyHandler] Error procesando solicitud para ${institute}:`, error);
    return NextResponse.redirect(instituteRedirectUrl);
  }
}

/**
 * Intenta procesar la solicitud con los handlers de Better Auth según el método HTTP.
 *
 * Si el handler existe y responde distinto de 404, se devuelve esa respuesta para
 * cortar el flujo del proxy. Si ocurre una excepción o Better Auth responde con error
 * de servidor (status >= 500), se redirige a la página principal del instituto.
 * Si no existe handler o devuelve 404, se retorna `null` para continuar con el proxy a la API.
 *
 * @param req Solicitud HTTP entrante.
 * @param auth Instancia de autenticación configurada para el instituto.
 * @param instituteRedirectUrl URL absoluta de redirección al instituto en caso de error.
 * @returns Respuesta de Better Auth, redirección por error o `null` cuando no aplica.
 */
async function tryHandleBetterAuthRoute(
  req: NextRequest,
  auth: AuthInstance,
  instituteRedirectUrl: URL,
) {
  // Reconstruimos la URL completa con el base path y query params correctos
  // Next.js no pasa la URL con el base path.
  const urlWithPath = new URL(
    `${process.env.NEXT_PUBLIC_APP_URL}${req.nextUrl.pathname}${req.nextUrl.search}`,
  );
  const reqToHandle = new NextRequest(urlWithPath, {
    method: req.method,
    headers: req.headers,
    body: req.method !== "GET" && req.body ? req.clone().body : undefined,
    duplex: "half",
  });

  const betterAuthHandlers = toNextJsHandler(auth);
  const betterAuthHandler =
    betterAuthHandlers[reqToHandle.method as keyof typeof betterAuthHandlers];

  if (!betterAuthHandler) {
    return null;
  }

  try {
    const betterAuthResponse = await betterAuthHandler(reqToHandle);

    if (betterAuthResponse.status === 404) {
      return null;
    }

    if (betterAuthResponse.status >= 500) {
      console.error(
        `[tryHandleBetterAuthRoute] Error de servidor en Better Auth (${betterAuthResponse.status}). Redirigiendo a ${instituteRedirectUrl.pathname}`,
      );
      return NextResponse.redirect(instituteRedirectUrl);
    }

    return betterAuthResponse;
  } catch (error) {
    console.error(
      "[tryHandleBetterAuthRoute] Error ejecutando handler de Better Auth:",
      error,
    );
    return NextResponse.redirect(instituteRedirectUrl);
  }
}

/**
 * Obtiene la sesión actual y adjunta el access token de Keycloak en `session`.
 * Captura posibles excepciones durante la consulta de sesión, obtención de token o cierre de sesión.
 *
 * @param auth Instancia de autenticación configurada para el instituto.
 * @returns Datos de sesión enriquecidos con token o `null` si no hay sesión activa o si ocurre un error.
 */
async function getSessionWithAccessToken(auth: AuthInstance) {
  try {
    const incomingHeaders = await NextHeaders();
    const sessionData = await auth.api
      .getSession({ headers: incomingHeaders })
      .catch((err) => {
        console.error("[getSessionWithAccessToken] Error obteniendo sesión:", err);
        return null;
      });

    if (!sessionData?.session) {
      return null;
    }

    const keycloakAccessToken = await auth.api
      .getAccessToken({
        headers: incomingHeaders,
        body: { providerId: "keycloak" },
      })
      .then((tokens) => tokens.accessToken)
      .catch((err) => {
        console.error(
          "[getSessionWithAccessToken] Error obteniendo access token de Keycloak:",
          err,
        );
        return undefined;
      });

    if (!keycloakAccessToken) {
      await auth.api.signOut({ headers: incomingHeaders }).catch((err) => {
        console.error(
          "[getSessionWithAccessToken] Error cerrando sesión sin token válido:",
          err,
        );
      });
      return null;
    }

    type SessionWithKCToken = typeof sessionData & {
      session: { keycloakToken?: string };
    };
    const sessionDataWithKCToken: SessionWithKCToken = sessionData as SessionWithKCToken;
    sessionDataWithKCToken.session.keycloakToken = keycloakAccessToken;

    return sessionDataWithKCToken;
  } catch (error) {
    console.error(
      "[getSessionWithAccessToken] Error inesperado en verificación de sesión:",
      error,
    );
    return null;
  }
}

/**
 * Inicia el proceso de inicio de sesión social con Better Auth para el instituto.
 *
 * Configura la URL de retorno y la URL de redirección en caso de error hacia `/[institute]`.
 *
 * @param req Solicitud HTTP entrante.
 * @param auth Instancia de autenticación configurada para el instituto.
 * @param institute Identificador del instituto para construir la URL de retorno de error.
 * @returns URL de redirección hacia el proveedor social o `undefined` si ocurre un fallo.
 */
async function handleBetterAuthLogin(
  req: NextRequest,
  auth: AuthInstance,
  institute: InstitutesType,
) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const callbackURL = `${basePath}${req.nextUrl.pathname}${req.nextUrl.search}`;
  const errorCallbackURL = getInstituteUrl(institute);

  try {
    const result = await auth.api.signInSocial({
      body: {
        provider: "keycloak",
        disableRedirect: true,
        callbackURL: callbackURL,
        errorCallbackURL: errorCallbackURL,
      },
      headers: await NextHeaders(),
    });

    return result?.url;
  } catch (error) {
    console.error(
      `[handleBetterAuthLogin] Error iniciando sesión social para ${institute}:`,
      error,
    );
    return undefined;
  }
}

/**
 * Convierte los segmentos dinámicos de la ruta en un path único separado por '/'.
 *
 * @param path Segmentos capturados por la ruta catch-all.
 * @returns Path concatenado o cadena vacía si no hay segmentos.
 */
function getTargetPath(path?: string[]) {
  return path?.join("/") || "";
}

/**
 * Construye la URL final del endpoint de API combinando base URL, path y query string.
 *
 * @param req Solicitud original para reutilizar sus query params.
 * @param targetPath Path relativo de destino a partir de la ruta dinámica.
 * @returns URL completa del endpoint a consultar.
 */
function buildResolvedApiEndpoint(req: NextRequest, targetPath: string) {
  const searchParams = req.nextUrl.searchParams.toString();

  return `${process.env.K8S_API_URL}/${targetPath}${searchParams ? `?${searchParams}` : ""}`;
}

/**
 * Construye los headers de salida para la petición proxificada.
 *
 * @param token Access token opcional para autorización Bearer.
 * @returns Objeto de headers listo para `fetch`.
 */
function buildRequestHeaders(token?: string) {
  const requestHeaders: Record<string, string> = { "Content-Type": "application/json" };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  return requestHeaders;
}

/**
 * Reenvía la solicitud a la API externa y normaliza los errores de red/parsing.
 *
 * @param req Solicitud original para reutilizar método y cuerpo.
 * @param endpoint URL final a la que se hará proxy.
 * @param token Access token opcional para autenticar contra la API.
 * @returns Respuesta JSON con el mismo status de la API o errores controlados (500).
 */
async function proxyToApi(req: NextRequest, endpoint: string, token?: string) {
  const requestPromise = fetch(endpoint, {
    method: req.method,
    headers: buildRequestHeaders(token),
    body: req.method !== "GET" ? await req.text() : undefined,
  });

  const response = await tryCatch(requestPromise);
  if (response.error) {
    return NextResponse.json(
      { error: "Error al obtener datos de la API" },
      { status: 500 },
    );
  }

  const responseData = await tryCatch(response.data.json());
  if (responseData.error) {
    return NextResponse.json(
      { error: "Error al analizar la respuesta de la API" },
      { status: 500 },
    );
  }

  return NextResponse.json(responseData.data, { status: response.data.status });
}

export {
  proxyHandler as POST,
  proxyHandler as GET,
  proxyHandler as PUT,
  proxyHandler as DELETE,
  proxyHandler as PATCH,
  proxyHandler as OPTIONS,
};
