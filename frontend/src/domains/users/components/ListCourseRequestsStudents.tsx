"use client";

import { notFound } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Banner from "@/shared/components/feedback/Banner";
import { PaginationControls } from "@/shared/components/ui/PaginationControls";
import { DEFAULT_PAGE } from "@/shared/schemas/paginationSchema";
import { cn } from "@/shared/shadcn/lib/utils";
import { ACCOUNT_REQUESTS_PAGE_LIMIT } from "../constants";
import { useCourseRequestsStudents } from "../hooks/useCourseRequestsStudents";
import { useFilterStore } from "../stores/filterStore";
import { CourseFilters } from "./ui/CourseFilters";
import { NoCourseRequestBanner } from "./ui/NoCourseRequestBanner";
import StudentCourseRequestCard from "./ui/StudentCourseRequestCard";

/**
 * Propiedades del componente {@link ListCourseRequestsStudent}.
 */
interface ListCourseRequestStudentProps {
  /** Identificador del curso en Moodle. */
  course_id: string;
  /** Identificador del instituto actual. */
  institute: string;
}

/**
 * Listado paginado y filtrable por estado de las solicitudes de inscripción de
 * estudiantes para un curso específico.
 *
 * Reinicia automáticamente la página a `1` cuando cambia el filtro de estado,
 * el curso o el instituto, y ajusta la página activa si tras aprobar o rechazar
 * solicitudes la página actual queda fuera de rango.
 *
 * @param props Identificador del curso y del instituto.
 * @returns Vista interactiva con filtros de estado, tarjetas de solicitud y paginación.
 */
export default function ListCourseRequestsStudent({
  course_id,
  institute,
}: ListCourseRequestStudentProps) {
  const { statusFilter, setStatusFilter } = useFilterStore();
  const listTopRef = useRef<HTMLElement>(null);

  const filterKey = `${institute}:${course_id}:${statusFilter ?? "all"}`;
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
  } = useCourseRequestsStudents({
    courseId: course_id,
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

  if (!institute) notFound();

  const requests = requestsData?.items ?? [];

  return (
    <section ref={listTopRef} className="grid gap-4 scroll-mt-6">
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
              <StudentCourseRequestCard
                key={request.id}
                request={request}
                institute={institute}
                courseId={course_id}
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
