"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useId } from "react";
import Button from "@/shared/components/ui/Button";
import { STATUS_BTN_LABELS, USER_STATUSES } from "../../constants";
import { useRequestStatus } from "../../hooks/useRequestStatus";
import type { InternalRoleType, UserStatus } from "../../types";

type AllowedAction = {
  status: UserStatus;
  variant: "recommended" | "danger" | "default";
};

const ALLOWED_TRANSITIONS: Record<UserStatus, AllowedAction[]> = {
  [USER_STATUSES.PENDING]: [
    { status: USER_STATUSES.APPROVED, variant: "recommended" },
    { status: USER_STATUSES.REJECTED, variant: "danger" },
  ],
  [USER_STATUSES.APPROVED]: [{ status: USER_STATUSES.REJECTED, variant: "danger" }],
  [USER_STATUSES.REJECTED]: [
    { status: USER_STATUSES.PENDING, variant: "default" },
    { status: USER_STATUSES.APPROVED, variant: "recommended" },
  ],
  [USER_STATUSES.ENROLLED]: [{ status: USER_STATUSES.REJECTED, variant: "danger" }],
};

interface CourseRequestStatusActionsProps {
  institute: string;
  requestId: number;
  currentStatus: UserStatus;
  role: InternalRoleType;
  queryKey: readonly [string, ...unknown[]];
  title?: string;
}

export default function CourseRequestStatusActions({
  institute,
  requestId,
  currentStatus,
  role,
  queryKey,
  title = "Acciones",
}: CourseRequestStatusActionsProps) {
  const queryClient = useQueryClient();
  const { isPending, updateStatus, error } = useRequestStatus();
  const actionsId = useId();

  const actions = ALLOWED_TRANSITIONS[currentStatus];

  const invalidateRequests = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return (
    <section aria-labelledby={actionsId} className="grid gap-2">
      <h4
        id={actionsId}
        className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-card-foreground/45"
      >
        {title}
      </h4>

      <ul
        className="flex flex-wrap gap-2"
        aria-label="Acciones disponibles para la solicitud"
      >
        {actions.map(({ status, variant }) => (
          <li key={status}>
            <Button
              onClick={() => {
                updateStatus({
                  institute,
                  request_id: requestId,
                  newStatus: status,
                  role,
                  onSuccess: invalidateRequests,
                });
              }}
              isLoading={isPending}
              variant={variant}
            >
              {STATUS_BTN_LABELS[status]}
            </Button>
          </li>
        ))}
      </ul>

      {error && <p className="px-1 text-xs text-red-700 dark:text-red-300">{error}</p>}

      {isPending && (
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-card-foreground/45">
          Actualizando...
        </p>
      )}
    </section>
  );
}
