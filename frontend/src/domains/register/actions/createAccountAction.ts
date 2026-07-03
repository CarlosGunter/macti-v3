"use server";

import z from "zod";
import {
  type CreateAccountPayload,
  createAccountSchema,
} from "../schemas/createAccountSchema";
import { CreateAccount } from "../services/createAccount";

interface CreateAccountActionResult {
  success: boolean;
  data: Record<string, unknown> | CreateAccountPayload | null;
  errors: Partial<
    Record<
      keyof CreateAccountPayload | "general" | "confirm_password",
      { errors: string[] }
    >
  >;
}

/**
 * Action para crear una cuenta de usuario
 * @param _prevState estado previo
 * @param formData datos del formulario
 * @returns objeto con el resultado de la acción
 */
export async function createAccountAction(
  _prevState: unknown,
  formData: FormData,
): Promise<CreateAccountActionResult> {
  const getData: Record<string, unknown> = Object.fromEntries(formData.entries());

  const password = formData.get("new_password")?.toString();
  const confirmPassword = formData.get("confirm_password")?.toString();
  if (password !== confirmPassword) {
    return {
      success: false,
      data: getData,
      errors: {
        confirm_password: {
          errors: ["Las contraseñas no coinciden."],
        },
      },
    };
  }

  const validation = createAccountSchema.safeParse(getData);
  if (!validation.success) {
    return {
      success: false,
      errors: z.treeifyError(validation.error).properties || {},
      data: getData,
    };
  }

  const accountCreation = await CreateAccount(validation.data);
  if (!accountCreation) {
    return {
      success: false,
      data: validation.data,
      errors: {
        general: {
          errors: ["Error al crear la cuenta. Inténtalo de nuevo más tarde."],
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
