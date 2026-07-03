import { STATUS_BADGE_LABELS, USER_STATUSES } from "../../constants";
import type { UserStatus } from "../../types";

interface CourseFiltersProps {
  statusFilter: UserStatus | null;
  setStatusFilter: (status: UserStatus | null) => void;
}

export function CourseFilters({ statusFilter, setStatusFilter }: CourseFiltersProps) {
  return (
    <div className="flex items-center justify-end gap-2 h-full">
      <label htmlFor="status-filter" className="text-sm font-medium self-center">
        Filtrar por estado:
      </label>
      <select
        id="status-filter"
        value={statusFilter || ""}
        onChange={(e) => setStatusFilter((e.target.value as UserStatus) || null)}
        className="mt-1 rounded-md border border-border bg-secondary px-2 py-1 text-sm text-secondary-foreground focus:border focus:border-primary focus:outline-none"
      >
        <option value="">Todos</option>
        {Object.values(USER_STATUSES).map((status) => (
          <option key={status} value={status}>
            {STATUS_BADGE_LABELS[status]}
          </option>
        ))}
      </select>
    </div>
  );
}
