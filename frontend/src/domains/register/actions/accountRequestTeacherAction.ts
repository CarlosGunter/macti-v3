"use server";

import z from "zod";
import {
  type AccountRequestTeacherPayload,
  accountRequestTeacherSchema,
} from "../schemas/accountRequestTeacherSchema";
import { createAccountRequestTeacher } from "../services/createAccountRequestTeacher";

interface AccountRequestTeacherActionResult {
  success: boolean;
  data: Record<string, unknown> | AccountRequestTeacherPayload | null;
  errors: Partial<
    Record<keyof AccountRequestTeacherPayload | "general", { errors: string[] }>
  >;
}

export async function accountRequestTeacherAction(
  _prevState: unknown,
  formData: FormData,
): Promise<AccountRequestTeacherActionResult> {
  const getData: Record<string, unknown> = Object.fromEntries(formData.entries());
  getData.groups = formData.getAll("groups");

  const validation = accountRequestTeacherSchema.safeParse(getData);
  if (!validation.success) {
    // Zod retorna los errores de los items del array por separado, los juntamos aquí
    const tree = z.treeifyError(validation.error).properties || {};
    if (tree.groups && Array.isArray(tree.groups.items)) {
      const childErrors = tree.groups.items.flatMap((item) => item?.errors || []);
      tree.groups.errors = [...(tree.groups.errors || []), ...childErrors];
      delete tree.groups.items;
    }

    return {
      success: false,
      errors: tree,
      data: getData,
    };
  }

  const accountRequestResult = await createAccountRequestTeacher(validation.data);
  if (!accountRequestResult.success) {
    return {
      success: false,
      data: validation.data,
      errors: {
        general: {
          errors: [
            accountRequestResult.error?.message ||
              "Error al enviar la solicitud de cuenta. Inténtalo de nuevo más tarde.",
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
