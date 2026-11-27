import z from "zod";
import { USER_ROLES, USER_STATUSES } from "@/domains/users/constants";
import { createPaginatedResponseSchema } from "@/shared/schemas/paginationSchema";

/**
 * Esquema Zod para validar una solicitud de cuenta de docente en
 * `GET /register/list-account-requests/teachers`.
 */
export const courseRequestTeacherItemSchema = z.object({
  user: z.object({
    id: z.number().int(),
    name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.email(),
    role: z.enum([...Object.values(USER_ROLES), "admin"]).nullable(),
    institute: z.string().min(1),
  }),
  courses: z.object({
    id: z.number().int(),
    course_full_name: z.string().min(1),
    groups: z.array(z.string().min(1)),
    status: z.enum(Object.values(USER_STATUSES)),
  }),
});

/**
 * Esquema Zod para la respuesta paginada del endpoint
 * `GET /register/list-account-requests/teachers`.
 */
export const courseRequestsTeachersSchema = createPaginatedResponseSchema(
  courseRequestTeacherItemSchema,
);

/**
 * Tipo inferido para una solicitud individual de cuenta de docente.
 */
export type CourseRequestTeacher = z.infer<typeof courseRequestTeacherItemSchema>;

/**
 * Tipo inferido para la respuesta paginada de solicitudes de cuenta de docentes.
 */
export type PaginatedCourseRequestsTeachersResponse = z.infer<
  typeof courseRequestsTeachersSchema
>;
