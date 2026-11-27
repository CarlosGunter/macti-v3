"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Banner from "@/shared/components/feedback/Banner";
import { PaginationControls } from "@/shared/components/ui/PaginationControls";
import { DEFAULT_PAGE } from "@/shared/schemas/paginationSchema";
import { cn } from "@/shared/shadcn/lib/utils";
import { ACCOUNT_REQUESTS_PAGE_LIMIT } from "../constants";
import { useCourseRequestsTeachers } from "../hooks/useCourseRequestsTeachers";
import { useFilterStore } from "../stores/filterStore";
import { CourseFilters } from "./ui/CourseFilters";
import { NoCourseRequestBanner } from "./ui/NoCourseRequestBanner";
import TeacherCourseRequestCard from "./ui/TeacherCourseRequestCard";

/**
 * Propiedades del componente {@link ListCourseRequestsTeachers}.
 */
interface ListCourseRequestsTeachersProps {
  /** Identificador del instituto cuyas solicitudes docentes se consultan. */
  institute: string;
}

/**
 * Listado paginado y filtrable por estado de las solicitudes de cursos realizadas
 * por docentes en un instituto.
 *
 * Reinicia automáticamente la página a `1` cuando cambia el filtro de estado o el
 * instituto, y ajusta la página activa si tras aprobar o rechazar solicitudes la
 * página actual queda fuera de rango.
 *
 * @param props Propiedades con el identificador del instituto.
 * @returns Vista interactiva con encabezado, filtros de estado, tarjetas y paginación.
 */
export default function ListCourseRequestsTeachers({
  institute,
}: ListCourseRequestsTeachersProps) {
  const { statusFilter, setStatusFilter } = useFilterStore();
  const listTopRef = useRef<HTMLElement>(null);

  const filterKey = `${institute}:${statusFilter ?? "all"}`;
  const [pageState, setPageState] = useState({
    filterKey,
    page: DEFAULT_PAGE,
  });

  const page = pageState.filterKey === filterKey ? pageState.page : DEFAULT_PAGE;

  const setPage = useCallback(
    (nextPage: number) => {
      setPageState({
        filterKey,
        page: Math.max(DEFAULT_PAGE, nextPage),
      });
    },
    [filterKey],
  );

  const {
    data: requestsData,
    isLoading,
    isFetching,
    isPlaceholderData,
    error,
  } = useCourseRequestsTeachers({
    institute,
    status: statusFilter,
    page,
    limit: ACCOUNT_REQUESTS_PAGE_LIMIT,
  });

  useEffect(() => {
    if (
      !isPlaceholderData &&
      requestsData &&
      requestsData.total_pages > 0 &&
      page > requestsData.total_pages
    ) {
      setPage(requestsData.total_pages);
    }
  }, [isPlaceholderData, requestsData, page, setPage]);

  const requests = requestsData?.items ?? [];

  return (
    <section ref={listTopRef} className="grid gap-4 mx-auto w-full max-w-6xl scroll-mt-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Solicitudes de Cursos</h2>
        <p className="text-foreground/70">
          Aquí puedes ver todas las solicitudes de cursos que los docentes han realizado.
        </p>
      </div>

      <CourseFilters statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

      {isLoading && !requestsData ? (
        <Banner message="Cargando solicitudes..." />
      ) : error && !requestsData ? (
        <Banner message="Ocurrió un error al cargar las solicitudes" isError />
      ) : requests.length === 0 ? (
        <NoCourseRequestBanner />
      ) : (
        <>
          <div
            className={cn(
              "grid gap-4 transition-opacity duration-200",
              isPlaceholderData && "opacity-60",
            )}
          >
            {requests.map((request) => (
              <TeacherCourseRequestCard
                key={`${request.user.id}-${request.courses.id}`}
                request={request}
              />
            ))}
          </div>

          {requestsData && (
            <PaginationControls
              page={requestsData.page}
              totalPages={requestsData.total_pages}
              total={requestsData.total}
              limit={requestsData.limit}
              onPageChange={setPage}
              scrollTargetRef={listTopRef}
              isLoading={isFetching}
              itemLabel="solicitudes"
            />
          )}
        </>
      )}
    </section>
  );
}
