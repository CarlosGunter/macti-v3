"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { type RefObject, useEffect, useRef } from "react";
import { cn } from "@/shared/shadcn/lib/utils";

/**
 * Propiedades del componente {@link PaginationControls}.
 */
interface PaginationControlsProps {
  /** Página activa actual (indexada desde 1). */
  page: number;
  /** Cantidad total de páginas disponibles. */
  totalPages: number;
  /** Cantidad total de elementos encontrados. */
  total: number;
  /** Cantidad máxima de elementos mostrados por página. */
  limit: number;
  /** Manejador invocado al seleccionar una nueva página. */
  onPageChange: (page: number) => void;
  /** Referencia opcional al inicio de la lista para desplazar la vista al cambiar de página. */
  scrollTargetRef?: RefObject<HTMLElement | null>;
  /** Indica si existe una petición en curso para deshabilitar interacciones. */
  isLoading?: boolean;
  /** Etiqueta descriptiva en plural de los elementos paginados (ej. `"cursos"`). */
  itemLabel?: string;
}

/**
 * Construye una secuencia compacta de números de página y separadores `"ellipsis"`
 * para evitar renderizar decenas de botones en catálogos grandes.
 *
 * @param currentPage Página activa actual.
 * @param totalPages Cantidad total de páginas.
 * @returns Arreglo ordenado de números de página y marcadores de elipsis.
 */
function buildPageTokens(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis-left" | "ellipsis-right"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const tokens: Array<number | "ellipsis-left" | "ellipsis-right"> = [1];
  const windowStart = Math.max(2, currentPage - 1);
  const windowEnd = Math.min(totalPages - 1, currentPage + 1);

  if (windowStart > 2) {
    tokens.push("ellipsis-left");
  }

  for (let current = windowStart; current <= windowEnd; current++) {
    tokens.push(current);
  }

  if (windowEnd < totalPages - 1) {
    tokens.push("ellipsis-right");
  }

  tokens.push(totalPages);
  return tokens;
}

/**
 * Controles reutilizables de paginación responsivos ("Mobile First") con resumen
 * de rango mostrado y navegación por número de página.
 *
 * @param props Propiedades del componente {@link PaginationControlsProps}.
 * @returns Barra de paginación o `null` si no existen registros (`total === 0`).
 */
export function PaginationControls({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  scrollTargetRef,
  isLoading = false,
  itemLabel = "resultados",
}: PaginationControlsProps) {
  const prevPageRef = useRef(page);

  useEffect(() => {
    if (prevPageRef.current === page) return;
    prevPageRef.current = page;

    const target = scrollTargetRef?.current;
    if (!target) return;

    const frameId = window.requestAnimationFrame(() => {
      const scrollMarginTop =
        Number.parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
      const targetY = Math.max(
        0,
        target.getBoundingClientRect().top + window.scrollY - scrollMarginTop,
      );

      if (window.scrollY > targetY) {
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        window.scrollTo({
          top: targetY,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [page, scrollTargetRef]);

  if (total === 0) {
    return null;
  }

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  const pageTokens = buildPageTokens(page, totalPages);

  return (
    <nav
      aria-label={`Paginación de ${itemLabel}`}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-300/70 w-full"
    >
      <p className="text-xs sm:text-sm font-medium text-foreground/80 text-center sm:text-left">
        Mostrando <span className="font-bold text-foreground">{startItem}</span>–
        <span className="font-bold text-foreground">{endItem}</span> de{" "}
        <span className="font-bold text-foreground">{total}</span> {itemLabel}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            aria-label="Página anterior"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 bg-card text-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <span className="px-3 py-1.5 text-xs font-semibold text-foreground sm:hidden">
            Página {page} de {totalPages}
          </span>

          <div className="hidden sm:flex items-center gap-1">
            {pageTokens.map((token) =>
              typeof token === "string" ? (
                <span
                  key={token}
                  aria-hidden="true"
                  className="px-2 py-1 text-sm font-semibold text-foreground/60 select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={token}
                  type="button"
                  onClick={() => onPageChange(token)}
                  disabled={isLoading || token === page}
                  aria-label={`Ir a página ${token}`}
                  aria-current={token === page ? "page" : undefined}
                  className={cn(
                    "min-w-8 px-2.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border transition-colors cursor-pointer disabled:cursor-default",
                    token === page
                      ? "bg-secondary text-secondary-foreground border-secondary shadow-sm"
                      : "bg-card text-foreground border-slate-300 hover:bg-secondary/10",
                  )}
                >
                  {token}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            aria-label="Página siguiente"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 bg-card text-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </nav>
  );
}
