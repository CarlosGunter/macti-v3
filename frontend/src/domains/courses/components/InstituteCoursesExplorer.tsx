"use client";

import { useRef } from "react";
import Banner from "@/shared/components/feedback/Banner";
import { Anchor } from "@/shared/components/ui/Anchor";
import Button from "@/shared/components/ui/Button";
import { PaginationControls } from "@/shared/components/ui/PaginationControls";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { type InstitutesType, institutes } from "@/shared/config/institutes";
import { useDebouncedSearch } from "@/shared/hooks/useDebouncedSearch";
import { DEFAULT_PAGE_LIMIT } from "@/shared/schemas/paginationSchema";
import { cn } from "@/shared/shadcn/lib/utils";
import { useInstituteCourses } from "../hooks/useInstituteCourses";
import type { PaginatedCoursesResponse } from "../schemas/listCoursesSchema";
import CourseCard from "./ui/CourseCard";
import RequestJoinCourseButton from "./ui/RequestJoinCourseButton";

/**
 * Propiedades del componente {@link InstituteCoursesExplorer}.
 */
interface InstituteCoursesExplorerProps {
  /** Identificador del instituto cuyos cursos se exploran. */
  institute: InstitutesType;
  /** Primera página de cursos precargada desde el servidor (SSR). */
  initialData?: PaginatedCoursesResponse;
  /** Indica si existe una sesión activa para mostrar el botón de solicitud de inscripción. */
  isAuthenticated: boolean;
}

/**
 * Explorador interactivo del catálogo público de cursos de un instituto.
 *
 * Integra búsqueda con debounce (`useDebouncedSearch`), consultas paginadas
 * mediante `useInstituteCourses`, preservación de foco del buscador durante
 * estados de carga y controles de paginación responsivos.
 *
 * @param props Propiedades del componente {@link InstituteCoursesExplorerProps}.
 * @returns Vista interactiva con buscador, grilla de cursos y paginación.
 */
export default function InstituteCoursesExplorer({
  institute,
  initialData,
  isAuthenticated,
}: InstituteCoursesExplorerProps) {
  const currentInstitute = institutes[institute];
  const listTopRef = useRef<HTMLDivElement>(null);
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
    data: coursesData,
    isLoading,
    isFetching,
    isPlaceholderData,
    error,
  } = useInstituteCourses({
    institute,
    search: debouncedSearch,
    page,
    limit,
    initialData,
  });

  const courses = coursesData?.items ?? [];
  const isSearching = isDebouncing || isFetching;

  return (
    <div ref={listTopRef} className="grid gap-6 w-full scroll-mt-6">
      <div className="w-full bg-secondary p-4 sm:p-6 rounded-xl shadow-xl">
        <SearchInput
          value={search}
          onChange={setSearch}
          onClear={resetSearch}
          placeholder="Buscar curso por nombre o clave..."
          ariaLabel="Buscar cursos del instituto"
          isLoading={isSearching}
          className="max-w-sm"
        />
      </div>

      {isLoading && !coursesData ? (
        <Banner message="Cargando cursos..." />
      ) : error && !coursesData ? (
        <Banner message="Error al cargar los cursos del instituto." isError />
      ) : courses.length === 0 ? (
        <div className="text-center p-6 space-y-3">
          <p className="text-foreground/70">
            {debouncedSearch
              ? `No se encontraron cursos que coincidan con "${debouncedSearch}".`
              : "No hay cursos disponibles en este instituto."}
          </p>
          {debouncedSearch && (
            <Button variant="secondary" onClick={resetSearch}>
              Limpiar búsqueda
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 w-full">
          <div
            className={cn(
              "mx-auto max-w-6xl md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full transition-opacity duration-200",
              isPlaceholderData && "opacity-60",
            )}
          >
            {courses.map((course) => (
              <CourseCard
                key={`course-${course.id}`}
                courseId={course.id}
                title={course.displayname || course.fullname}
                description={course.summary}
              >
                {isAuthenticated && (
                  <RequestJoinCourseButton institute={institute} courseId={course.id} />
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
            ))}
          </div>

          {coursesData && (
            <PaginationControls
              page={coursesData.page}
              totalPages={coursesData.total_pages}
              total={coursesData.total}
              limit={coursesData.limit}
              onPageChange={setPage}
              scrollTargetRef={listTopRef}
              isLoading={isFetching}
              itemLabel="cursos"
            />
          )}
        </div>
      )}
    </div>
  );
}
