import z from "zod";
import { USER_STATUSES } from "@/domains/users/constants";
import { createPaginatedResponseSchema } from "@/shared/schemas/paginationSchema";

/**
 * Esquema Zod para validar una solicitud de cuenta de alumno en
 * `GET /register/list-account-requests/students`.
 */
export const courseRequestStudentItemSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.email(),
  status: z.enum(Object.values(USER_STATUSES)),
});

/**
 * Esquema Zod para la respuesta paginada del endpoint
 * `GET /register/list-account-requests/students`.
 */
export const courseRequestsStudentsSchema = createPaginatedResponseSchema(
  courseRequestStudentItemSchema,
);

/**
 * Tipo inferido para una solicitud individual de cuenta de estudiante.
 */
export type CourseRequestStudent = z.infer<typeof courseRequestStudentItemSchema>;

/**
 * Tipo inferido para la respuesta paginada de solicitudes de cuenta de estudiantes.
 */
export type PaginatedCourseRequestsStudentsResponse = z.infer<
  typeof courseRequestsStudentsSchema
>;
