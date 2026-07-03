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
    // <section className="relative isolate w-full max-w-2xl rounded-3xl border border-white/5 bg-gradient-to-b from-white/10 via-black/70 to-black p-8 text-white shadow-[0_30px_60px_rgba(0,0,0,0.45)]">
    <section className="relative isolate w-full max-w-2xl rounded-3xl py-4">
      {/* <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-40 blur-3xl"
      >
        <div className="h-full w-full bg-[radial-gradient(circle_at_top,var(--tw-gradient-from),transparent_60%)] from-gray-500" />
      </div> */}

      <div className="flex gap-4 items-center md:gap-6">
        <div className="flex size-18 items-center justify-center rounded-2xl border border-gray-400 bg-gray-200 dark:border-white/20 dark:bg-white/10 text-2xl font-semibold uppercase md:size-20">
          {initials}
        </div>

        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.35em] text-foreground/70">Perfil</p>
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
            {displayName}
          </h1>
          <p className="text-sm text-foreground/70">{email}</p>
        </div>

        {/* <span
          className={`inline-flex items-center gap-2 self-start rounded-full border px-4 py-1 text-sm ${
            isVerified
              ? "border-emerald-400/30 text-emerald-300"
              : "border-amber-400/30 text-amber-200"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${isVerified ? "bg-emerald-300" : "bg-amber-300"}`}
          />
          {isVerified ? "Verificado" : "Requiere acción"}
        </span> */}
      </div>
    </section>
  );
}
