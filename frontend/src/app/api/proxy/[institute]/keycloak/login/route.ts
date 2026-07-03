import { NextResponse } from "next/server";
import { getAuthInstance } from "@/infra/auth/auth-factory";
import type { InstitutesType } from "@/shared/config/institutes";

interface KeycloakRouteProps {
  params: Promise<{
    institute: InstitutesType;
  }>;
}

const AUTH_ENDPOINT_PATH = "sign-in/oauth2";
const PROVIDER_ID = "keycloak";

export async function GET(req: Request, { params }: KeycloakRouteProps) {
  const { institute } = await params;

  const url = new URL(req.url);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const callbackURL =
    url.searchParams.get("callbackURL") ?? `${basePath}/${institute}/perfil`;

  const auth = getAuthInstance(institute);
  const action = new URL(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/proxy/${institute}/${AUTH_ENDPOINT_PATH}`,
  );

  const loginRequest = new Request(action, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: url.origin,
      cookie: req.headers.get("cookie") ?? "",
    },
    body: JSON.stringify({
      providerId: PROVIDER_ID,
      callbackURL,
    }),
  });

  const response = await auth.handler(loginRequest);

  if (!response.ok) {
    const errorBody = await response.text();
    return NextResponse.json(
      {
        error: "Error al iniciar sesión con Keycloak",
        details: errorBody,
      },
      { status: response.status },
    );
  }

  const responseData = (await response.json()) as {
    url?: string;
    redirect?: boolean;
  };

  if (!responseData.url) {
    return NextResponse.json(
      { error: "Better Auth no devolvió una URL de redirección" },
      { status: 500 },
    );
  }

  const redirectResponse = NextResponse.redirect(responseData.url);
  const setCookies =
    (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.() ??
    [];

  for (const setCookie of setCookies) {
    redirectResponse.headers.append("set-cookie", setCookie);
  }

  return redirectResponse;
}
