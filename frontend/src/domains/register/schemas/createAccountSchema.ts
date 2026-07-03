import z from "zod";

export const createAccountSchema = z.object({
  user_id: z.coerce
    .number()
    .int("El ID debe ser un número entero.")
    .min(0, "El ID debe tener al menos 7 dígitos.")
    .max(99999999, "El ID no puede tener más de 8 dígitos."),
  new_password: z.string().min(1, "La contraseña es requerida."),
  token: z.uuidv4("El token no es válido."),
});
export type CreateAccountPayload = z.infer<typeof createAccountSchema>;

export const fetchAccountInfoResponseSchema = z.object({
  id: z.number().int(),
  email: z.email(),
  name: z.string(),
  last_name: z.string(),
  role: z.string(),
  institute: z.string(),
  course_request: z.union([
    z.object({
      id: z.number().int(),
      status: z.string(),
      moodle_course_id: z.number().int(),
      course_full_name: z.null(),
      groups: z.null(),
    }),
    z.object({
      id: z.number().int(),
      status: z.string(),
      moodle_course_id: z.null(),
      course_full_name: z.string(),
      groups: z.array(z.string()),
    }),
  ]),
});
export type FetchAccountInfoResponse = z.infer<typeof fetchAccountInfoResponseSchema>;
