import { processFetch } from "@/shared/utils/process-fetch";
import type { AccountRequestTeacherPayload } from "../schemas/accountRequestTeacherSchema";

export async function createAccountRequestTeacher(
  userRequestData: AccountRequestTeacherPayload,
) {
  const accountRequestPromise = fetch(
    `${process.env.K8S_API_URL}/register/request-account/teacher`,
    {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userRequestData),
    },
  );

  const [error, accountRequestResult] = await processFetch(accountRequestPromise);
  if (error) return { success: false, error: accountRequestResult };

  return { success: true, error: null };
}
