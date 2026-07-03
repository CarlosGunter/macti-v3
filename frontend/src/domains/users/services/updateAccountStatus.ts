import { processFetch } from "@/shared/utils/process-fetch";
import type { UpdateRequestStatusPayload } from "../types";

export async function updateRequestStatus({
  institute,
  request_id,
  newStatus,
  role,
}: UpdateRequestStatusPayload) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  const submitNewStatusPromise = fetch(
    `${basePath}/api/proxy/${institute}/register/update-request-status/${role}?institute=${institute}`,
    {
      method: "PATCH",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id, new_status: newStatus }),
    },
  );

  const [error, response] = await processFetch(submitNewStatusPromise);
  if (error) return undefined;

  return response;
}
