import { z } from "zod";

export const accountRequestTeacherSchema = z.object({
  institute: z.string().min(1, "La facultad es requerida."),
  name: z.string().min(1, "El nombre es requerido."),
  last_name: z.string().min(1, "El apellido es requerido."),
  email: z.email("El correo electrónico no es válido."),
  course_full_name: z.string().min(1, "El curso es requerido."),
  groups: z
    .array(z.string().min(1, "El nombre del grupo no puede estar vacío."))
    .min(1, "Al menos un grupo es requerido."),
});

export type AccountRequestTeacherPayload = z.infer<typeof accountRequestTeacherSchema>;
