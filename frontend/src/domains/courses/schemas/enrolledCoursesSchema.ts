import z from "zod";
import { createPaginatedResponseSchema } from "@/shared/schemas/paginationSchema";

/**
 * Esquema Zod para validar un curso inscrito por el usuario en `GET /courses/enrolled`.
 */
export const enrolledCourseItemSchema = z.object({
  id: z.number().int(),
  shortname: z.string(),
  fullname: z.string(),
  displayname: z.string(),
  summary: z.string().nullable().optional().default(null),
  courseimage: z
    .union([z.url(), z.literal("")])
    .nullable()
    .optional()
    .transform((value) => (value ? value : null)),
  role: z
    .array(z.string())
    .nullable()
    .optional()
    .transform((value) => value ?? []),
  progress: z.number().nullable().optional().default(null),
  completed: z
    .number()
    .int()
    .nullable()
    .optional()
    .transform((value) => value === 1),
  startdate: z.number().int().nullable().optional().default(null),
  enddate: z.number().int().nullable().optional().default(null),
});

/**
 * Esquema Zod para la respuesta paginada del endpoint `GET /courses/enrolled`.
 */
export const enrolledCoursesSchema = createPaginatedResponseSchema(
  enrolledCourseItemSchema,
);

/**
 * Tipo inferido para un curso en el que el usuario está inscrito.
 */
export type EnrolledCourseItem = z.infer<typeof enrolledCourseItemSchema>;

/**
 * Tipo inferido para la respuesta paginada de cursos inscritos.
 */
export type PaginatedEnrolledCoursesResponse = z.infer<typeof enrolledCoursesSchema>;
