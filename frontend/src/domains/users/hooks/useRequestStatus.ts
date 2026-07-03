import { useState, useTransition } from "react";
import { updateRequestStatus } from "../services/updateAccountStatus";
import type { UpdateRequestStatusPayload } from "../types";

interface UpdateRequestStatusHandler extends UpdateRequestStatusPayload {
  onSuccess: () => void;
}

export function useRequestStatus() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const updateStatus = ({
    institute,
    request_id,
    newStatus,
    role,
    onSuccess,
  }: UpdateRequestStatusHandler) => {
    setError(null);

    startTransition(async () => {
      const result = await updateRequestStatus({
        institute,
        request_id,
        newStatus,
        role,
      });

      if (!result) {
        setError("Error al actualizar el estado del usuario");
        return;
      }

      setError(null);
      onSuccess();
    });
  };

  return { isPending, updateStatus, error };
}
