"use client";

import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/shared/shadcn/lib/utils";

/**
 * Propiedades del componente {@link SearchInput}.
 */
interface SearchInputProps {
  /** Valor actual del campo de búsqueda. */
  value: string;
  /** Manejador invocado cuando cambia el texto de búsqueda. */
  onChange: (value: string) => void;
  /** Texto indicativo mostrado cuando el input está vacío. */
  placeholder?: string;
  /** Etiqueta accesible (`aria-label`) para lectores de pantalla. */
  ariaLabel?: string;
  /** Muestra un indicador de carga giratorio en lugar del botón limpiar. */
  isLoading?: boolean;
  /** Manejador opcional ejecutado al presionar el botón de limpiar. */
  onClear?: () => void;
  /** Deshabilita la edición del campo. */
  disabled?: boolean;
  /** Identificador HTML opcional para asociar con etiquetas `<label>`. */
  id?: string;
  /** Clases CSS adicionales para el contenedor externo. */
  className?: string;
}

/**
 * Campo de búsqueda reutilizable con soporte visual para estado de carga
 * y limpieza rápida del texto ingresado.
 *
 * @param props Propiedades del componente {@link SearchInputProps}.
 * @returns Elemento JSX con el input de búsqueda estilizado.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  ariaLabel = "Buscar",
  isLoading = false,
  onClear,
  disabled = false,
  id,
  className,
}: SearchInputProps) {
  const handleClear = () => {
    if (onClear) {
      onClear();
      return;
    }
    onChange("");
  };

  return (
    <div className={cn("relative w-full", className)}>
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-4 h-4 text-slate-500" aria-hidden="true" />
      </span>

      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        disabled={disabled}
        className="w-full pl-9 pr-9 py-2 bg-[#eff9e6] text-xs sm:text-sm font-semibold rounded-lg text-slate-700 placeholder-slate-500 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
      />

      <span className="absolute inset-y-0 right-0 flex items-center pr-2.5">
        {isLoading ? (
          <Loader2
            className="w-4 h-4 text-slate-500 animate-spin"
            aria-label="Buscando..."
          />
        ) : (
          value.length > 0 &&
          !disabled && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Limpiar búsqueda"
              className="p-0.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )
        )}
      </span>
    </div>
  );
}
