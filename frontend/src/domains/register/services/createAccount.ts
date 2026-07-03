import { processFetch } from "@/shared/utils/process-fetch";
import type { CreateAccountPayload } from "../schemas/createAccountSchema";

export async function CreateAccount(accountCreationData: CreateAccountPayload) {
  const createAccountPromise = fetch(
    `${process.env.K8S_API_URL}/register/create-account`,
    {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(accountCreationData),
    },
  );

  const [error, createAccountResponse] = await processFetch(createAccountPromise);
  if (error) return undefined;

  return createAccountResponse;
}
