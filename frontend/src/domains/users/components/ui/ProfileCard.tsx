import { headers } from "next/headers";
import { getAuthInstance } from "@/infra/auth/auth-factory";
import type { InstitutesType } from "@/shared/config/institutes";

interface ProfileCardProps {
  institute: InstitutesType;
}

export async function ProfileCard({ institute }: ProfileCardProps) {
  const auth = getAuthInstance(institute);
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userInfo = session?.user;

  const identifier = userInfo?.name || "Usuario pendiente";
  const displayName = userInfo?.name || identifier || "Usuario sin nombre";
  const email = userInfo?.email || "Correo no disponible";
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((fragment: string) => fragment[0]?.toUpperCase() || "")
      .join("") || "NA";

  return (
    <section className="relative isolate w-full rounded-3xl">
      <div className="flex flex-col gap-4 items-center justify-center mx-auto w-fit md:gap-6 md:flex-row md:mx-0">
        <div className="flex size-24 items-center justify-center rounded-4xl bg-background-avatar text-foreground-avatar uppercase sm:size-28 text-5xl font-extrabold shadow-sm select-none">
          {initials}
        </div>

        <div className="flex-1 text-center md:text-left">
          <p className="text-4xl font-extrabold text-slate-950 tracking-tight">Perfil</p>
          <h1 className="text-xl font-bold">{displayName}</h1>
          <p className="font-medium">{email}</p>
        </div>
      </div>
    </section>
  );
}
