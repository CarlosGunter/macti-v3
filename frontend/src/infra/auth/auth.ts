/**
 * Helper para crear, migrar y gestionar la base de datos de autenticación
 * utilizando better-auth.
 *
 * - Los nombres de archivo y variable (auth) son por convención de la librería
 * - Esto permite que better-auth pueda acceder a la instancia de autenticación
 */
import { getAuthInstance } from "./auth-factory";

/**
 * Instancia de autenticación para manejar la BD de autenticación.
 * NUNCA USAR DIRECTAMENTE ESTA INSTANCIA
 *
 * @readonly Nunca se debe modificar directamente esta instancia. Para obtener una nueva instancia, usar ./auth-factory.ts.
 * @description Instancia de autenticación para el instituto "principal". Se exporta por conveniencia, pero se recomienda usar getAuthInstance para obtener instancias específicas de cada instituto.
 * @see getAuthInstance(institute) para obtener instancias específicas de cada instituto.
 */
export const auth = getAuthInstance(
  "principal",
  "postgres",
  "http://localhost:3000/api/proxy/principal",
);
