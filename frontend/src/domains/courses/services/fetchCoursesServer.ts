import { processFetch } from "@/shared/utils/process-fetch";
import { listCoursesSchema } from "../schemas/listCoursesSchema";

interface FetchCoursesServerPayload {
  institute: string;
  ids?: number[];
}

export async function fetchCoursesServer({ institute, ids }: FetchCoursesServerPayload) {
  const queryParams = new URLSearchParams({ institute });
  if (ids && Array.isArray(ids)) {
    ids.forEach((id) => {
      queryParams.append("ids", String(id));
    });
  }

  const listCoursesPromise = fetch(
    `${process.env.K8S_API_URL}/courses?${queryParams.toString()}`,
    {
      method: "GET",
      next: { revalidate: 300 },
      headers: { "Content-Type": "application/json" },
    },
  );

  const [error, listCourses] = await processFetch(listCoursesPromise);
  if (error) return undefined;

  const parsedListCourses = listCoursesSchema.safeParse(listCourses);
  if (!parsedListCourses.success) return undefined;

  return parsedListCourses.data;
}
