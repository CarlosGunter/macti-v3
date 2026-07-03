import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { getAuthInstance } from "@/infra/auth/auth-factory";

type AuthInstance = ReturnType<typeof getAuthInstance>;

export async function proxy(request: NextRequest) {
  const institute = getInstituteFromPath(request.nextUrl.pathname);
  if (!institute) return NextResponse.next();

  const auth = getAuthInstance(institute);
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) return NextResponse.next();

  const result = await handleBetterAuthLogin(request, auth);

  if (result?.url) {
    return NextResponse.redirect(result.url);
  }

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return NextResponse.redirect(new URL(`${basePath}/${institute}`, request.url));
}

async function handleBetterAuthLogin(request: NextRequest, auth: AuthInstance) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const callbackURL = `${basePath}${request.nextUrl.pathname}${request.nextUrl.search}`;

  const result = await auth.api.signInSocial({
    body: {
      provider: "keycloak",
      disableRedirect: true,
      callbackURL: callbackURL,
    },
    headers: await headers(),
  });

  return result;
}

function getInstituteFromPath(pathname: string) {
  const [institute] = pathname.split("/").filter(Boolean);
  return institute;
}

export const config = {
  matcher: ["/:institute/perfil", "/:institute/:courseId/solicitudes"],
};
