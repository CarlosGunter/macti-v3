import z from "zod";

export const listCoursesSchema = z.array(
  z.object({
    id: z.int(),
    shortname: z.string(),
    fullname: z.string(),
    displayname: z.string(),
    summary: z.string(),
    courseimage: z.url().nullable(),
  }),
);

export interface ListCoursesProps extends z.infer<typeof listCoursesSchema> {}
