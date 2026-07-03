import { processFetch } from "@/shared/utils/process-fetch";
import {
  type CourseRequestsStudentsProps,
  courseRequestsStudentsSchema,
} from "../schemas/courseRequestsStudentsSchema";
import type { CourseRequestsStudentsPayload } from "../types";

export async function fetchCourseRequestsStudents({
  course_id,
  institute,
  status,
}: CourseRequestsStudentsPayload): Promise<CourseRequestsStudentsProps> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  const queryParams = new URLSearchParams({
    course_id: parseInt(course_id, 10).toString(),
    institute,
  });
  if (status) {
    queryParams.append("status", status);
  }

  const listCourseRequestPromise = fetch(
    `${basePath}/api/proxy/${institute}/register/list-account-requests/students?${queryParams.toString()}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const [error, listCourseRequests] = await processFetch(listCourseRequestPromise);
  if (error) return [];

  const parsedListCourseRequests =
    courseRequestsStudentsSchema.safeParse(listCourseRequests);
  if (!parsedListCourseRequests.success) return [];

  return parsedListCourseRequests.data;
}
