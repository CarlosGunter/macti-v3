import z from "zod";
import { createPaginatedResponseSchema } from "@/shared/schemas/paginationSchema";

/**
 * Esquema Zod para validar un curso individual del catálogo público de Moodle.
 */
export const courseItemSchema = z.object({
  id: z.number().int(),
  shortname: z.string(),
  fullname: z.string(),
  displayname: z.string(),
  summary: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value ?? ""),
  courseimage: z
    .union([z.url(), z.literal("")])
    .nullable()
    .optional()
    .transform((value) => (value ? value : null)),
});

/**
 * Esquema Zod para la respuesta paginada del endpoint `GET /courses/`.
 */
export const listCoursesSchema = createPaginatedResponseSchema(courseItemSchema);

/**
 * Tipo inferido para un curso del catálogo.
 */
export type CourseItem = z.infer<typeof courseItemSchema>;

/**
 * Tipo inferido para la respuesta paginada de cursos del catálogo.
 */
export type PaginatedCoursesResponse = z.infer<typeof listCoursesSchema>;

/**
 * Alias de compatibilidad tipado para listados paginados de cursos.
 */
export type ListCoursesProps = PaginatedCoursesResponse;
