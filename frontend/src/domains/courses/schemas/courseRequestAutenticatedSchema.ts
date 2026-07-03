import { z } from "zod";

export const studentCourseRequestAutenticatedSchema = z.object({
  course_id: z
    .number()
    .int("El ID del curso debe ser un número entero.")
    .min(1, "El ID del curso debe ser un número positivo."),
});

export const teacherCourseRequestAutenticatedSchema = z.object({
  course_full_name: z.string().min(1, "El nombre completo del curso es requerido."),
  groups: z
    .array(z.string().min(1, "El nombre del grupo es requerido."))
    .min(1, "Debe haber al menos un grupo."),
});

export type StudentCourseRequestAutenticatedPayload = z.infer<
  typeof studentCourseRequestAutenticatedSchema
>;
export type TeacherCourseRequestAutenticatedPayload = z.infer<
  typeof teacherCourseRequestAutenticatedSchema
>;
