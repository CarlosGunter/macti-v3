import { Pool } from "pg";

export const initPostgres = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Se requiere la variable de entorno DATABASE_URL para conectar a la base de datos.",
    );
  }

  return new Pool({
    connectionString: connectionString,
  });
};
