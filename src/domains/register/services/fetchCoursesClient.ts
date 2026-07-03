import { processFetch } from "@/shared/utils/process-fetch";
import { listCoursesSchema } from "../schemas/listCoursesSchema";

interface ListCoursesPayload {
  institute: string;
}

export async function fetchCoursesClient({ institute }: ListCoursesPayload) {
  const queryParams = new URLSearchParams({ institute });

  const listCoursesPromise = fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/courses/?${queryParams.toString()}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  const [error, listCourses] = await processFetch(listCoursesPromise);
  if (error) return undefined;

  const parsedListCourses = listCoursesSchema.safeParse(listCourses);
  if (!parsedListCourses.success) return undefined;

  return parsedListCourses.data;
}
