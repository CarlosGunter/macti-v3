import { headers } from "next/headers";
import { getAuthInstance } from "@/infra/auth/auth-factory";
import type { InstitutesType } from "@/shared/config/institutes";
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from "@/shared/schemas/paginationSchema";
import { fetchCoursesServer } from "../services/fetchCoursesServer";
import InstituteCoursesExplorer from "./InstituteCoursesExplorer";

interface ListInstituteCoursesProps {
  institute: InstitutesType;
}

/**
 * Componente de servidor que precarga la primera página de cursos de un instituto
 * y verifica si el usuario cuenta con sesión activa para hidratar el explorador
 * interactivo {@link InstituteCoursesExplorer}.
 *
 * @param props Propiedades con el identificador del instituto.
 */
export default async function ListInstituteCourses({
  institute,
}: ListInstituteCoursesProps) {
  const [initialCourses, session] = await Promise.all([
    fetchCoursesServer({
      institute,
      page: DEFAULT_PAGE,
      limit: DEFAULT_PAGE_LIMIT,
    }),
    getAuthInstance(institute).api.getSession({
      headers: await headers(),
    }),
  ]);

  return (
    <InstituteCoursesExplorer
      institute={institute}
      initialData={initialCourses}
      isAuthenticated={Boolean(session)}
    />
  );
}
