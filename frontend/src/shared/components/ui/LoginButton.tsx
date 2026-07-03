"use client";

import { getAuthClient } from "@/infra/auth/auth-client";
import Button from "./Button";

export function LoginButton({ institute }: { institute: string }) {
  return (
    <Button
      type="button"
      onClick={async () => {
        const authClient = getAuthClient(institute);
        await authClient.signIn.oauth2({
          providerId: "keycloak",
          callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/${institute}/perfil`,
        });
      }}
    >
      Iniciar sesión
    </Button>
  );
}
