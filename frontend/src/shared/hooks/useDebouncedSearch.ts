"use client";

import { useCallback, useState } from "react";
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from "@/shared/schemas/paginationSchema";
import { DEFAULT_DEBOUNCE_DELAY_MS, useDebounce } from "./useDebounce";

/**
 * Opciones de configuración para el hook {@link useDebouncedSearch}.
 */
export interface UseDebouncedSearchOptions {
  /** Texto inicial del campo de búsqueda. */
  initialSearch?: string;
  /** Número de página inicial (por defecto `1`). */
  initialPage?: number;
  /** Cantidad de elementos por página (por defecto `10`). */
  limit?: number;
  /** Retardo del debounce en milisegundos (por defecto `400`). */
  delay?: number;
}

/**
 * Contrato de estado y acciones retornado por {@link useDebouncedSearch}.
 */
export interface UseDebouncedSearchReturn {
  /** Valor inmediato controlado para enlazar al input de búsqueda. */
  search: string;
  /** Valor estabilizado y recortado (`.trim()`) listo para enviarse en la query al backend. */
  debouncedSearch: string;
  /** Página actual sincronizada con el término de búsqueda estabilizado. */
  page: number;
  /** Límite de elementos por página configurado. */
  limit: number;
  /** Indica si el usuario cambió el texto y aún no vence el temporizador del debounce. */
  isDebouncing: boolean;
  /** Actualiza el término de búsqueda. */
  setSearch: (nextValue: string) => void;
  /** Cambia la página activa dentro de la búsqueda estabilizada actual. */
  setPage: (nextPage: number) => void;
  /** Limpia el término de búsqueda y reinicia la página a `1`. */
  resetSearch: () => void;
}

/**
 * Hook de alto nivel para coordinar búsqueda con debounce y paginación en cualquier
 * listado conectado al backend.
 *
 * Sincroniza la versión de la búsqueda estabilizada con la página seleccionada para
 * reiniciar automáticamente a la página `1` cuando cambia el término de búsqueda,
 * evitando peticiones intermedias duplicadas.
 *
 * @param options Opciones iniciales de búsqueda, paginación y retardo.
 * @returns Estado controlado, término debounced, página activa y manejadores.
 */
export function useDebouncedSearch({
  initialSearch = "",
  initialPage = DEFAULT_PAGE,
  limit = DEFAULT_PAGE_LIMIT,
  delay = DEFAULT_DEBOUNCE_DELAY_MS,
}: UseDebouncedSearchOptions = {}): UseDebouncedSearchReturn {
  const [inputState, setInputState] = useState({
    search: initialSearch,
    version: 0,
  });

  const debouncedInput = useDebounce(inputState, delay);
  const debouncedSearch = debouncedInput.search.trim();

  const [pageState, setPageState] = useState({
    version: 0,
    page: Math.max(DEFAULT_PAGE, initialPage),
  });

  const page =
    pageState.version === debouncedInput.version ? pageState.page : DEFAULT_PAGE;

  const setSearch = useCallback((nextValue: string) => {
    setInputState((prev) => {
      if (prev.search === nextValue) return prev;
      const trimmedChanged = prev.search.trim() !== nextValue.trim();
      return {
        search: nextValue,
        version: trimmedChanged ? prev.version + 1 : prev.version,
      };
    });
  }, []);

  const setPage = useCallback(
    (nextPage: number) => {
      setPageState({
        version: debouncedInput.version,
        page: Math.max(DEFAULT_PAGE, nextPage),
      });
    },
    [debouncedInput.version],
  );

  const resetSearch = useCallback(() => {
    setInputState((prev) => {
      if (prev.search === "") return prev;
      const trimmedChanged = prev.search.trim() !== "";
      return {
        search: "",
        version: trimmedChanged ? prev.version + 1 : prev.version,
      };
    });
    setPageState({
      version: debouncedInput.version,
      page: DEFAULT_PAGE,
    });
  }, [debouncedInput.version]);

  const isDebouncing = inputState.search.trim() !== debouncedSearch;

  return {
    search: inputState.search,
    debouncedSearch,
    page,
    limit,
    isDebouncing,
    setSearch,
    setPage,
    resetSearch,
  };
}
