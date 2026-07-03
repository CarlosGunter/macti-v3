"use server";

import { cookies } from "next/headers";
import z from "zod";
import { type InstitutesType, institutes } from "@/shared/config/institutes";
import {
  type TeacherCourseRequestAutenticatedPayload,
  teacherCourseRequestAutenticatedSchema,
} from "../schemas/courseRequestAutenticatedSchema";
import { createCourseRequestAutenticated } from "../services/createCourseRequestAutenticated";

interface CreateCourseRequestAutenticatedActionResult {
  success: boolean;
  data: Record<string, unknown> | TeacherCourseRequestAutenticatedPayload | null;
  errors: Partial<
    Record<
      keyof TeacherCourseRequestAutenticatedPayload | "general",
      { errors: string[] }
    >
  >;
}

export async function createCourseRequestAutenticatedAction(
  institute: InstitutesType,
  _prevState: unknown,
  formData: FormData,
): Promise<CreateCourseRequestAutenticatedActionResult> {
  const getData: Record<string, unknown> = Object.fromEntries(formData.entries());
  getData.groups = formData.getAll("groups");

  if (!(institute in institutes)) {
    return {
      success: false,
      data: getData,
      errors: {
        general: {
          errors: ["El instituto no es válido."],
        },
      },
    };
  }

  const validation = teacherCourseRequestAutenticatedSchema.safeParse(getData);
  if (!validation.success) {
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

  const courseRequestResult = await createCourseRequestAutenticated({
    institute,
    userRole: "teacher",
    courseRequestData: validation.data,
    headers: await getCookieHeaders(),
  });

  console.log({ courseRequestResult });

  if (!courseRequestResult.success) {
    return {
      success: false,
      data: validation.data,
      errors: {
        general: {
          errors: [
            courseRequestResult.error ||
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

async function getCookieHeaders() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }: { name: string; value: string }) => `${name}=${value}`)
    .join("; ");

  return cookieHeader ? { cookie: cookieHeader } : undefined;
}
