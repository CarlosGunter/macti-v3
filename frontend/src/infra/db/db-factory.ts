import { initPostgres } from "./postgres/postgres";
import { initSQLite } from "./sqlite/sqlite";

const mapDb = {
  sqlite: initSQLite,
  postgres: initPostgres,
};

type DbProvider = keyof typeof mapDb;

export const getDbInstance = (dbProvider: string | null = null) => {
  const DATABASE_PROVIDER =
    (dbProvider as DbProvider) || (process.env.DATABASE_PROVIDER as DbProvider);

  if (!DATABASE_PROVIDER || !(DATABASE_PROVIDER in mapDb)) {
    throw new Error(
      `Solo se admiten los siguientes proveedores de base de datos: ${Object.keys(mapDb).join(", ")}. Proveedor recibido: ${DATABASE_PROVIDER}`,
    );
  }

  const initDb = mapDb[DATABASE_PROVIDER];

  return initDb();
};
