import { processFetch } from "@/shared/utils/process-fetch";
import { fetchAccountInfoResponseSchema } from "../schemas/createAccountSchema";

export async function fetchAccountInfo(token: string) {
  const verifyTokenPromise = fetch(
    `${process.env.K8S_API_URL}/register/user-info-by-token?token=${token}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  const [error, userData] = await processFetch(verifyTokenPromise);
  if (error) return undefined;

  const parsedUserData = fetchAccountInfoResponseSchema.safeParse(userData);
  if (!parsedUserData.success) return undefined;

  return parsedUserData.data;
}
