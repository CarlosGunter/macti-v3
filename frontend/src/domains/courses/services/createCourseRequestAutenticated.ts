import type { InstitutesType } from "@/shared/config/institutes";
import { processFetch } from "@/shared/utils/process-fetch";
import type {
  StudentCourseRequestAutenticatedPayload,
  TeacherCourseRequestAutenticatedPayload,
} from "../schemas/courseRequestAutenticatedSchema";

interface CreateCourseRequestAutenticatedProps {
  institute: InstitutesType;
  userRole: "student" | "teacher";
  courseRequestData:
    | StudentCourseRequestAutenticatedPayload
    | TeacherCourseRequestAutenticatedPayload;
  headers?: HeadersInit;
}

export async function createCourseRequestAutenticated({
  institute,
  userRole,
  courseRequestData,
  headers,
}: CreateCourseRequestAutenticatedProps) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const queryParams = new URLSearchParams({ institute });

  const courseRequestAutenticatedPromise = fetch(
    `${basePath}/api/proxy/${institute}/register/request-account/${userRole}/authenticated?${queryParams.toString()}`,
    {
      method: "POST",
      cache: "no-store",
      headers: headers,
      body: JSON.stringify(courseRequestData),
    },
  );

  const [error, courseRequestResult] = await processFetch(
    courseRequestAutenticatedPromise,
  );
  if (error)
    return {
      success: false,
      error:
        courseRequestResult?.message ||
        "Error al enviar la solicitud. Inténtalo de nuevo más tarde.",
    };

  return { success: true, error: null };
}
