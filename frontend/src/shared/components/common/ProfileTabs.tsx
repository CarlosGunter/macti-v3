import { headers } from "next/headers";
import Link from "next/link";
import CreateCourseRequestAutenticatedDialog from "@/domains/courses/components/CreateCourseRequestAutenticatedDialog";
import ListEnrolledCourses from "@/domains/courses/components/ListEnrolledCourses";
import ListCourseRequestsTeachers from "@/domains/users/components/ListCourseRequestsTeachers";
import { checkAndStoreAdminPrivilege } from "@/domains/users/services/checkIsAdmin";
import { getAuthInstance } from "@/infra/auth/auth-factory";
import type { InstitutesType } from "@/shared/config/institutes";
import { selectIsAdmin, usePrivilegeStore } from "@/shared/stores/privilegeStore";
import { tryCatch } from "@/shared/utils/try-catch";

const ProfileTabsMap = {
  EnrolledCourses: "cursos",
  RequestsCourses: "solicitudes",
} as const;
type ProfileTabsType = (typeof ProfileTabsMap)[keyof typeof ProfileTabsMap];

interface ProfileTabsProps {
  institute: InstitutesType;
  activeTab: string | undefined;
}

/**
 * Componente de servidor que gestiona las pestañas de navegación en el perfil del usuario.
 *
 * Sincroniza en el servidor el estado de administrador consultando checkAndStoreAdminPrivilege
 * con el token de sesión de Keycloak mediante el utilitario `tryCatch`, y restringe la pestaña
 * de solicitudes únicamente a administradores.
 *
 * @param props - Identificador del instituto y la pestaña activa seleccionada.
 */
export default async function ProfileTabs({ institute, activeTab }: ProfileTabsProps) {
  const auth = getAuthInstance(institute);
  const incomingHeaders = await headers();

  const tokenResult = await tryCatch(
    auth.api.getAccessToken({
      headers: incomingHeaders,
      body: { providerId: "keycloak" },
    }),
  );

  const accessToken = tokenResult.data?.accessToken;
  if (accessToken) {
    await tryCatch(checkAndStoreAdminPrivilege(institute, accessToken));
  }

  const isAdmin = selectIsAdmin(usePrivilegeStore.getState());

  let effectiveTab = activeTab;
  if (!isAdmin && effectiveTab === ProfileTabsMap.RequestsCourses) {
    effectiveTab = ProfileTabsMap.EnrolledCourses;
  }
  if (!Object.values(ProfileTabsMap).includes(effectiveTab as ProfileTabsType)) {
    effectiveTab = ProfileTabsMap.EnrolledCourses;
  }

  return (
    <div className="grid gap-4">
      {/* Horizontal Menu */}
      <div className="flex border-b border-gray-400">
        <Link
          href={`?tab=${ProfileTabsMap.EnrolledCourses}`}
          className={`px-6 py-3 font-semibold text-sm transition-colors ${
            effectiveTab === ProfileTabsMap.EnrolledCourses
              ? "border-b-2 border-accent text-black"
              : "text-gray-500 hover:text-foreground hover:border-b hover:border-gray-500"
          }`}
        >
          Mis cursos
        </Link>
        {isAdmin && (
          <Link
            href={`?tab=${ProfileTabsMap.RequestsCourses}`}
            className={`px-6 py-3 font-semibold text-sm transition-colors ${
              effectiveTab === ProfileTabsMap.RequestsCourses
                ? "border-b-2 border-accent text-black"
                : "text-gray-500 hover:text-foreground hover:border-b hover:border-gray-500"
            }`}
          >
            Solicitudes de cursos
          </Link>
        )}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {effectiveTab === ProfileTabsMap.EnrolledCourses && (
          <div className="grid gap-4 max-w-6xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Cursos Inscritos</h2>
              <p className="text-foreground/70">
                Aquí puedes ver todos los cursos en los que estás inscrito.
              </p>
            </div>

            <ListEnrolledCourses institute={institute} isAdmin={isAdmin} />

            <CreateCourseRequestAutenticatedDialog institute={institute} />
          </div>
        )}
        {isAdmin && effectiveTab === ProfileTabsMap.RequestsCourses && (
          <ListCourseRequestsTeachers institute={institute} />
        )}
      </div>
    </div>
  );
}
