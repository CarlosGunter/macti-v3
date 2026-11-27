"use client";

import { useEffect, useState } from "react";

/**
 * Retardo por defecto (en milisegundos) aplicado al debounce de búsquedas.
 */
export const DEFAULT_DEBOUNCE_DELAY_MS = 400;

/**
 * Hook genérico para diferir la actualización de un valor hasta que transcurra
 * un intervalo sin cambios.
 *
 * Útil para evitar peticiones HTTP excesivas al escribir en campos de búsqueda
 * o aplicar filtros reactivos en cualquier dominio.
 *
 * @param value Valor reactivo que se desea estabilizar.
 * @param delay Tiempo de espera en milisegundos (por defecto `400`).
 * @returns Último valor estabilizado tras cumplirse el retardo.
 */
export function useDebounce<T>(value: T, delay: number = DEFAULT_DEBOUNCE_DELAY_MS): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
