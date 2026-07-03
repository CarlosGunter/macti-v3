import z from "zod";

export const enrolledCoursesSchema = z.array(
  z.object({
    id: z.number().int(),
    shortname: z.string(),
    fullname: z.string(),
    displayname: z.string(),
    summary: z.string().nullable(),
    courseimage: z.url().nullable(),
    role: z.array(z.string()),
  }),
);
