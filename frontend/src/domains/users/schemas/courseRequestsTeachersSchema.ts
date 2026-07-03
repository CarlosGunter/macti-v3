import z from "zod";
import { USER_ROLES, USER_STATUSES } from "@/domains/users/constants";

export const courseRequestsTeachersSchema = z.array(
  z.object({
    user: z.object({
      id: z.int(),
      name: z.string().min(1),
      last_name: z.string().min(1),
      email: z.email(),
      role: z.enum(Object.values(USER_ROLES)).nullable(),
      institute: z.string().min(1),
    }),
    courses: z.object({
      id: z.number(),
      course_full_name: z.string().min(1),
      groups: z.array(z.string().min(1)),
      status: z.enum(Object.values(USER_STATUSES)),
    }),
  }),
);

export interface CourseRequestsTeachersProps
  extends z.infer<typeof courseRequestsTeachersSchema> {}
