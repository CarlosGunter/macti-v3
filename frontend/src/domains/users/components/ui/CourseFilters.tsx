"use client";

import { Label } from "@/shared/shadcn/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/shadcn/components/ui/select";
import { STATUS_BADGE_LABELS, USER_STATUSES } from "../../constants";
import type { UserStatus } from "../../types";

/**
 * Propiedades del componente CourseFilters.
 */
interface CourseFiltersProps {
  /** Estado de solicitud seleccionado para filtrar, o null si se muestran todos. */
  statusFilter: UserStatus | null;
  /** Función para actualizar el filtro de estado seleccionado. */
  setStatusFilter: (status: UserStatus | null) => void;
}

/**
 * Componente para filtrar solicitudes de cursos por su estado.
 * Utiliza componentes accesibles de shadcn/ui (Label, Select).
 *
 * @param props - Propiedades con el estado actual del filtro y su función modificadora.
 * @returns Elemento con controles de filtrado por estado.
 */
export function CourseFilters({ statusFilter, setStatusFilter }: CourseFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-2">
      <Label htmlFor="status-filter" className="text-sm font-medium">
        Filtrar por estado:
      </Label>
      <Select
        value={statusFilter ?? "all"}
        onValueChange={(value) => {
          setStatusFilter(value === "all" ? null : (value as UserStatus));
        }}
      >
        <SelectTrigger id="status-filter" className="py-2 h-10">
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">Todos</SelectItem>
            {Object.values(USER_STATUSES).map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_BADGE_LABELS[status]}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
