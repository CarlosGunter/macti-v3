import type { InstitutesType } from "../../shared/config/institutes";
import { keycloakConfigs } from "../../shared/config/kcConfig";
import { getAuthClient } from "./auth-client";

interface SignOutFederatedSessionParams {
  institute: InstitutesType;
  redirectPath?: string;
}

export async function signOutFederatedSession({
  institute,
  redirectPath,
}: SignOutFederatedSessionParams) {
  const authClient = getAuthClient(institute);
  await authClient.signOut();

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  redirectPath = redirectPath ?? `${basePath}/${institute}`;

  const kcIssuer = keycloakConfigs[institute]?.issuer;
  if (!kcIssuer) window.location.assign(redirectPath);

  const logoutUrl = new URL(`${kcIssuer}/protocol/openid-connect/logout`);
  logoutUrl.searchParams.set(
    "post_logout_redirect_uri",
    `${window.location.origin}${redirectPath}`,
  );
  logoutUrl.searchParams.set(
    "client_id",
    process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "local-next-login",
  );

  window.location.assign(logoutUrl.toString());
}
