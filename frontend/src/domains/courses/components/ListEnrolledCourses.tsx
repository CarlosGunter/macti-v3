"use client";

import { useEffect, useRef } from "react";
import Banner from "@/shared/components/feedback/Banner";
import { Anchor } from "@/shared/components/ui/Anchor";
import Button from "@/shared/components/ui/Button";
import { PaginationControls } from "@/shared/components/ui/PaginationControls";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { type InstitutesType, institutes } from "@/shared/config/institutes";
import { privilegeRoles, rolesMap } from "@/shared/config/rolesMap";
import { useDebouncedSearch } from "@/shared/hooks/useDebouncedSearch";
import { DEFAULT_PAGE_LIMIT } from "@/shared/schemas/paginationSchema";
import { cn } from "@/shared/shadcn/lib/utils";
import { usePrivilegeStore } from "@/shared/stores/privilegeStore";
import { useEnrolledCourses } from "../hooks/useEnrolledCourses";
import CourseCard from "./ui/CourseCard";

interface ListEnrolledCoursesProps {
  institute: InstitutesType;
  isAdmin?: boolean;
}

/**
 * Componente que renderiza la lista paginada y filtrable de cursos en los que el
 * usuario está inscrito.
 *
 * Muestra el buscador con debounce, las tarjetas de cursos con accesos directos a
 * Moodle y Jupyter, controles de paginación y el botón de gestión de solicitudes si
 * el usuario es docente del curso o cuenta con rol de administrador.
 *
 * @param props Identificador del instituto y bandera de privilegios de administrador.
 */
export default function ListEnrolledCourses({
  institute,
  isAdmin = false,
}: ListEnrolledCoursesProps) {
  const currentInstitute = institutes[institute];
  const listTopRef = useRef<HTMLDivElement>(null);
  const addRoles = usePrivilegeStore((state) => state.addRoles);
  const {
    search,
    debouncedSearch,
    page,
    limit,
    isDebouncing,
    setSearch,
    setPage,
    resetSearch,
  } = useDebouncedSearch({ limit: DEFAULT_PAGE_LIMIT });

  const {
    data: enrolledCourses,
    isLoading: isEnrolledCoursesLoading,
    isFetching,
    isPlaceholderData,
    error,
  } = useEnrolledCourses({
    institute,
    search: debouncedSearch,
    page,
    limit,
  });

  useEffect(() => {
    if (isAdmin) {
      addRoles([rolesMap.manager]);
    } else {
      const currentRoles = usePrivilegeStore.getState().roles;
      if (currentRoles.includes(rolesMap.manager)) {
        const filteredRoles = currentRoles.filter((r) => r !== rolesMap.manager);
        usePrivilegeStore.getState().setRoles(filteredRoles);
      }
    }
  }, [isAdmin, addRoles]);

  const courses = enrolledCourses?.items ?? [];
  const isSearching = isDebouncing || isFetching;

  return (
    <div ref={listTopRef} className="grid gap-6 w-full scroll-mt-6">
      <div className="w-full max-w-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          onClear={resetSearch}
          placeholder="Buscar en mis cursos..."
          ariaLabel="Buscar cursos inscritos"
          isLoading={isSearching}
        />
      </div>

      {isEnrolledCoursesLoading && !enrolledCourses ? (
        <Banner message="Cargando cursos inscritos..." />
      ) : error && !enrolledCourses ? (
        <Banner message="Error al cargar los cursos inscritos." isError />
      ) : courses.length === 0 ? (
        <div className="space-y-3">
          <Banner
            message={
              debouncedSearch
                ? `No se encontraron cursos inscritos que coincidan con "${debouncedSearch}".`
                : "No hay cursos inscritos."
            }
          />
          {debouncedSearch && (
            <Button variant="secondary" onClick={resetSearch}>
              Limpiar búsqueda
            </Button>
          )}
        </div>
      ) : (
        <>
          <article
            className={cn(
              "mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full transition-opacity duration-200",
              isPlaceholderData && "opacity-60",
            )}
          >
            {courses.map((course) => {
              const isCourseTeacher = course.role.some((r) =>
                privilegeRoles.high.includes(r),
              );
              const canManageRequests = isAdmin || isCourseTeacher;

              return (
                <CourseCard
                  courseId={course.id}
                  key={course.id}
                  title={course.displayname}
                  description={course.summary}
                  progress={course.progress}
                >
                  {canManageRequests && (
                    <Anchor
                      variant="secondary"
                      href={`./${course.id}/solicitudes`}
                      aria-label="Solicitudes de usuarios que queran inscribirse en el curso"
                    >
                      Solicitudes
                    </Anchor>
                  )}
                  <Anchor
                    href={`${currentInstitute.moodle}/course/view.php?id=${course.id}`}
                    variant="bordered"
                    external
                  >
                    Moodle
                  </Anchor>
                  <Anchor href={currentInstitute.jupyter} variant="bordered" external>
                    Jupyter
                  </Anchor>
                </CourseCard>
              );
            })}
          </article>

          {enrolledCourses && (
            <PaginationControls
              page={enrolledCourses.page}
              totalPages={enrolledCourses.total_pages}
              total={enrolledCourses.total}
              limit={enrolledCourses.limit}
              onPageChange={setPage}
              scrollTargetRef={listTopRef}
              isLoading={isFetching}
              itemLabel="cursos"
            />
          )}
        </>
      )}
    </div>
  );
}
