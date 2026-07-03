import { processFetch } from "@/shared/utils/process-fetch";
import {
  type CourseRequestsTeachersProps,
  courseRequestsTeachersSchema,
} from "../schemas/courseRequestsTeachersSchema";
import type { CourseRequestsTeachersPayload } from "../types";

export async function fetchCourseRequestsTeachers({
  institute,
  status,
}: CourseRequestsTeachersPayload): Promise<CourseRequestsTeachersProps> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  const queryParams = new URLSearchParams({
    institute,
  });
  if (status) {
    queryParams.append("status", status);
  }

  const listRequestPromise = fetch(
    `${basePath}/api/proxy/${institute}/register/list-account-requests/teachers?${queryParams.toString()}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const [error, listRequests] = await processFetch(listRequestPromise);
  if (error) return [];

  const parsedListRequests = courseRequestsTeachersSchema.safeParse(listRequests);
  if (!parsedListRequests.success) return [];

  return parsedListRequests.data;
}
