"use server";

import z from "zod";
import {
  type AccountRequestPayload,
  accountRequestSchema,
} from "../schemas/accountRequestSchema";
import { createAccountRequest } from "../services/createAccountRequest";

interface AccountRequestActionResult {
  success: boolean;
  data: Record<string, unknown> | AccountRequestPayload | null;
  errors: Partial<Record<keyof AccountRequestPayload | "general", { errors: string[] }>>;
}

/**
 * Action para solicitar una cuenta de estudiante
 * @param _prevState estado previo
 * @param formData datos del formulario
 * @returns objeto con el resultado de la acción
 */
export async function accountRequestAction(
  _prevState: unknown,
  formData: FormData,
): Promise<AccountRequestActionResult> {
  const getData: Record<string, unknown> = Object.fromEntries(formData.entries());

  const validation = accountRequestSchema.safeParse(getData);
  if (!validation.success) {
    return {
      success: false,
      errors: z.treeifyError(validation.error).properties || {},
      data: getData,
    };
  }

  const accountRequestResult = await createAccountRequest(validation.data);
  if (!accountRequestResult.success) {
    return {
      success: false,
      data: validation.data,
      errors: {
        general: {
          errors: [
            accountRequestResult.error?.message ||
              "Hubo un error al enviar la solicitud. Inténtalo de nuevo más tarde.",
          ],
        },
      },
    };
  }

  return {
    success: true,
    data: validation.data,
    errors: {},
  };
}
