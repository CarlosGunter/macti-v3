import { processFetch } from "@/shared/utils/process-fetch";
import type { AccountRequestPayload } from "../schemas/accountRequestSchema";

/**
 * @param userRequestData datos del usuario que solicita la cuenta
 * @returns resultado del servicio
 */
export async function createAccountRequest(userRequestData: AccountRequestPayload) {
  const accountRequestPromise = fetch(
    `${process.env.K8S_API_URL}/register/request-account/student`,
    {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userRequestData),
    },
  );

  const [error, getAccountRequests] = await processFetch(accountRequestPromise);
  if (error) return { success: false, error: getAccountRequests };

  return { success: true, error: null };
}
