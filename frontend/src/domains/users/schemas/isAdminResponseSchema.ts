import { z } from "zod";

/**
 * Esquema de respuesta para la verificación de privilegios de administrador.
 * Compatible con la respuesta del endpoint /users/is-admin de FastAPI.
 */
export const isAdminResponseSchema = z.object({
  is_admin: z.boolean(),
});

export type IsAdminResponse = z.infer<typeof isAdminResponseSchema>;
