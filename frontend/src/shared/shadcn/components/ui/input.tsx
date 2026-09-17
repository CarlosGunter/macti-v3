import type * as React from "react";

import { cn } from "@/shared/shadcn/lib/utils";

/**
 * Componente Input de formulario basado en shadcn/ui.
 * Renderiza un campo de entrada accesible con fondo blanco por defecto y estilos de validación.
 *
 * @param props - Propiedades estándar de un elemento input HTML.
 * @returns Elemento input estilizado.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input bg-white dark:bg-white text-gray-900 placeholder:text-gray-400 flex w-full min-w-0 rounded-2xl border px-4 py-3.5 text-base shadow-xs outline-none transition-all file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus:outline-none focus:ring-2 focus:ring-[#013b75] focus:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#013b75] focus-visible:border-transparent",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
